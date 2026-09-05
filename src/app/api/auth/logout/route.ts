import { NextResponse } from "next/server";
import { destroySession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await destroySession();
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}