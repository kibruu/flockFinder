import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getConversations(session.id);
    return NextResponse.json(
      { conversations },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}