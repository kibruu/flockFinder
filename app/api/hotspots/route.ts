import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public catalog route (ticket #8 extension): powers the Field Companion
// hotspot selector from any screen. No authz — hotspot data is public.
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