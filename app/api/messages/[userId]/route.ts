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
    if (messages.length === 0) {
      const threadCount = await db.chatMessage.count({
        where: { OR: threadBetween(session.id, userId) },
      });
      if (threadCount === 0) {
        return NextResponse.json(
          { error: "You have no conversation with this user" },
          { status: 403 }
        );
      }
    }
    return NextResponse.json({ messages });
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
        sender: { select: SENDER_SELECT },
      },
    });

    return NextResponse.json({ message: serializeMessage(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}