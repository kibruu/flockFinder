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

async function loadLatest(hotspotId: string): Promise<MessageRecord[]> {
  const rows = await db.chatMessage.findMany({
    where: { hotspotId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: SENDER_SELECT },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LATEST_LIMIT,
  });
  return rows.reverse().map(serializeMessage);
}

async function loadAfter(hotspotId: string, after: string): Promise<MessageRecord[]> {
  const cursor = await db.chatMessage.findFirst({
    where: { id: after, hotspotId },
    select: { id: true, createdAt: true },
  });
  if (!cursor) return loadLatest(hotspotId);

  const rows = await db.chatMessage.findMany({
    where: { hotspotId, OR: newerThan(cursor) },
    select: {
      id: true,
      content: true,
      createdAt: true,
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
    const { id } = await params;
    const hotspot = await db.hotspot.findUnique({ where: { id }, select: { id: true } });
    if (!hotspot) {
      return NextResponse.json({ error: "Hotspot not found" }, { status: 404 });
    }

    const after = request.nextUrl.searchParams.get("after");
    const messages = after ? await loadAfter(id, after) : await loadLatest(id);
    return NextResponse.json({ messages });
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
    const hotspot = await db.hotspot.findUnique({ where: { id }, select: { id: true } });
    if (!hotspot) {
      return NextResponse.json({ error: "Hotspot not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const content = normalizeMessageContent(body?.content);
    if (!content) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }

    const created = await db.chatMessage.create({
      data: { senderId: session.id, hotspotId: id, content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: { select: SENDER_SELECT },
      },
    });

    return NextResponse.json({ message: serializeMessage(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}