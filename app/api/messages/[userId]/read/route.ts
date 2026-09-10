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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}