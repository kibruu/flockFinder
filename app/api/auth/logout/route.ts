import { NextRequest, NextResponse } from "next/server";
import { destroySession, clearSessionCookie } from "@/lib/auth";

function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    await destroySession();
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      // Session not found - already expired/deleted, that's fine
    } else {
      // Other database errors - don't clear cookie, return error
      return NextResponse.json({ error: "Failed to destroy session" }, { status: 500 });
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}