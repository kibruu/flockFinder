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

function threadBetween(me: string, peer: string) {
  return [
    { senderId: me, recipientId: peer },
    { senderId: peer, recipientId: me },
  ];
}

async function loadLatest(me: string, peerId: string): Promise<MessageRecord[]> {
  const rows = await db.chatMessage.findMany({
    where: { OR: threadBetween(me, peerId) },
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

async function loadAfter(me: string, peerId: string, after: string): Promise<MessageRecord[]> {
  const cursor = await db.chatMessage.findFirst({
    where: { id: after, OR: threadBetween(me, peerId) },
    select: { id: true, createdAt: true },
  });
  if (!cursor) return loadLatest(me, peerId);

  const rows = await db.chatMessage.findMany({
    where: {
      OR: newerThan(cursor).flatMap((branch) =>
        threadBetween(me, peerId).map((direction) => ({ ...direction, ...branch }))
      ),
    },
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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const peer = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!peer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const after = request.nextUrl.searchParams.get("after");
    const messages = after
      ? await loadAfter(session.id, userId, after)
      : await loadLatest(session.id, userId);
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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    if (userId === session.id) {
      return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
    }

    const peer = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!peer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const content = normalizeMessageContent(body?.content);
    if (!content) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }

    const created = await db.chatMessage.create({
      data: { senderId: session.id, recipientId: userId, content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
        deletedAt: true,
        sender: { select: SENDER_SELECT },
      },
    });

    // Ensure conversation exists for both users
    await db.conversation.upsert({
      where: { userId_peerId: { userId: session.id, peerId: userId } },
      create: { userId: session.id, peerId: userId },
      update: { updatedAt: new Date() },
    });
    await db.conversation.upsert({
      where: { userId_peerId: { userId, peerId: session.id } },
      create: { userId, peerId: session.id },
      update: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: serializeMessage(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json().catch(() => null);
    const { messageId, content } = body ?? {};
    if (!messageId || !content) {
      return NextResponse.json({ error: "messageId and content required" }, { status: 400 });
    }

    const normalized = normalizeMessageContent(content);
    if (!normalized) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }

    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, recipientId: true, deletedAt: true },
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
    if (message.recipientId !== userId) {
      return NextResponse.json({ error: "Message not in this conversation" }, { status: 400 });
    }

    const updated = await db.chatMessage.update({
      where: { id: messageId },
      data: { content: normalized, editedAt: new Date() },
      select: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
        deletedAt: true,
        sender: { select: SENDER_SELECT },
      },
    });

    return NextResponse.json({ message: serializeMessage(updated) });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json().catch(() => null);
    const { messageId } = body ?? {};
    if (!messageId) {
      return NextResponse.json({ error: "messageId required" }, { status: 400 });
    }

    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, recipientId: true, deletedAt: true },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (message.senderId !== session.id) {
      return NextResponse.json({ error: "Can only delete your own messages" }, { status: 403 });
    }
    if (message.recipientId !== userId) {
      return NextResponse.json({ error: "Message not in this conversation" }, { status: 400 });
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