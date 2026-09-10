import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUnreadCount } from "@/lib/conversations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unread = await getUnreadCount(session.id);
    return NextResponse.json(
      { unread },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}