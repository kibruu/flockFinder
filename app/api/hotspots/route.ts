import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitatType = searchParams.get("habitatType");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (habitatType) {
      where.habitatType = habitatType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { locationName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const hotspots = await db.hotspot.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ hotspots });
  } catch (error) {
    console.error("Hotspots list error:", error);
    return NextResponse.json({ error: "Failed to fetch hotspots" }, { status: 500 });
  }
}
