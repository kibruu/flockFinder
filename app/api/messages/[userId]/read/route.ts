import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
      return NextResponse.json({ error: "Cannot mark own messages as read" }, { status: 400 });
    }

    // Update conversation lastReadAt to now
    await db.conversation.upsert({
      where: { userId_peerId: { userId: session.id, peerId: userId } },
      create: { userId: session.id, peerId: userId, lastReadAt: new Date() },
      update: { lastReadAt: new Date(), updatedAt: new Date() },
    });

    // Mark all unread messages from this peer as read
    const unreadMessages = await db.chatMessage.findMany({
      where: {
        senderId: userId,
        recipientId: session.id,
        deletedAt: null,
        reads: { none: { userId: session.id } },
      },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      await db.messageRead.createMany({
        data: unreadMessages.map((m) => ({ messageId: m.id, userId: session.id })),
      });
    }

    return NextResponse.json({ success: true, markedCount: unreadMessages.length });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}