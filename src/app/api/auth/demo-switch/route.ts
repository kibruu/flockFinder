import { NextRequest, NextResponse } from "next/server";
import { switchDemoUser, getDemoUsers } from "@/lib/auth";

export async function POST(request: NextRequest) {
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