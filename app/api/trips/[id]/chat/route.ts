import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  MessageRecord,
  normalizeMessageContent,
  serializeMessage,
  newerThan,
} from "@/lib/messages";

const SENDER_SELECT = { id: true, name: true, avatarUrl: true } as const;

const LATEST_LIMIT = 50;
const POLL_BATCH_LIMIT = 100;

async function loadLatest(tripId: string): Promise<MessageRecord[]> {
  const rows = await db.chatMessage.findMany({
    where: { tripId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      editedAt: true,
      deletedAt: true,
      sender: { select: SENDER_SELECT },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LATEST_LIMIT,
  });
  return rows.reverse().map(serializeMessage);
}

async function loadAfter(tripId: string, after: string): Promise<MessageRecord[]> {
  const cursor = await db.chatMessage.findFirst({
    where: { id: after, tripId },
    select: { id: true, createdAt: true },
  });
  if (!cursor) return loadLatest(tripId);

  const rows = await db.chatMessage.findMany({
    where: { tripId, OR: newerThan(cursor) },
    select: {
      id: true,
      content: true,
      createdAt: true,
      editedAt: true,
      deletedAt: true,
      sender: { select: SENDER_SELECT },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: POLL_BATCH_LIMIT,
  });
  return rows.map(serializeMessage);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [trip, rsvp] = await Promise.all([
      db.trip.findUnique({ where: { id }, select: { id: true } }),
      db.tripRsvp.findUnique({
        where: { tripId_userId: { tripId: id, userId: session.id } },
        select: { id: true },
      }),
    ]);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (!rsvp) {
      return NextResponse.json(
        { error: "You must be an attendee to view the trip chat" },
        { status: 403 }
      );
    }

    const after = request.nextUrl.searchParams.get("after");
    const messages = after ? await loadAfter(id, after) : await loadLatest(id);
    return NextResponse.json(
      { messages },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const content = normalizeMessageContent(body?.content);
    if (!content) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const rsvp = await db.tripRsvp.findUnique({
      where: { tripId_userId: { tripId: id, userId: session.id } },
      select: { id: true },
    });
    if (!rsvp) {
      return NextResponse.json({ error: "You must be an attendee to post in the trip chat" }, { status: 403 });
    }

    if (trip.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip is cancelled; posting is disabled" }, { status: 400 });
    }

    const created = await db.chatMessage.create({
      data: { senderId: session.id, tripId: id, content, messageType: "TRIP" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
        deletedAt: true,
        sender: { select: SENDER_SELECT },
      },
    });

    return NextResponse.json({ message: serializeMessage(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

const MESSAGE_SELECT = {
  id: true,
  content: true,
  createdAt: true,
  editedAt: true,
  deletedAt: true,
  sender: { select: SENDER_SELECT },
} as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const { messageId, content } = body ?? {};
    if (!messageId || !content) {
      return NextResponse.json({ error: "messageId and content required" }, { status: 400 });
    }

    const normalized = normalizeMessageContent(content);
    if (!normalized) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({ where: { id }, select: { id: true } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const message = await db.chatMessage.findFirst({
      where: { id: messageId, tripId: id },
      select: { id: true, senderId: true, deletedAt: true },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (message.deletedAt) {
      return NextResponse.json({ error: "Message is deleted" }, { status: 400 });
    }
    if (message.senderId !== session.id) {
      return NextResponse.json({ error: "Can only edit your own messages" }, { status: 403 });
    }

    const updated = await db.chatMessage.update({
      where: { id: messageId },
      data: { content: normalized, editedAt: new Date() },
      select: MESSAGE_SELECT,
    });

    return NextResponse.json({ message: serializeMessage(updated) });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const { messageId } = body ?? {};
    if (!messageId) {
      return NextResponse.json({ error: "messageId required" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({ where: { id }, select: { id: true } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const message = await db.chatMessage.findFirst({
      where: { id: messageId, tripId: id },
      select: { id: true, senderId: true },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (message.senderId !== session.id) {
      return NextResponse.json({ error: "Can only delete your own messages" }, { status: 403 });
    }

    await db.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), content: "" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}