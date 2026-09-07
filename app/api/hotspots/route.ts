import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const hotspots = await db.hotspot.findMany({
      select: {
        id: true,
        name: true,
        locationName: true,
        latitude: true,
        longitude: true,
        habitatType: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ hotspots });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}