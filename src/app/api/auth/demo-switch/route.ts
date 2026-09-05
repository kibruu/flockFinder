import { NextRequest, NextResponse } from "next/server";
import { switchDemoUser, getDemoUsers } from "@/lib/auth";

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
    const { demo } = await request.json();
    const validDemos = getDemoUsers();

    if (!demo || !validDemos.includes(demo)) {
      return NextResponse.json(
        { error: `Invalid demo user. Valid options: ${validDemos.join(", ")}` },
        { status: 400 }
      );
    }

    const session = await switchDemoUser(demo);

    if (!session) {
      return NextResponse.json(
        { error: "Demo user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Demo switch error:", error);
    return NextResponse.json(
      { error: "Failed to switch demo user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ demos: getDemoUsers() });
}