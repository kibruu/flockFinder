import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sightings = await db.sighting.findMany({
      orderBy: { spottedAt: "desc" },
      take: 6,
      select: {
        id: true,
        spottedAt: true,
        species: { select: { commonName: true, imageUrl: true } },
        user: { select: { name: true } },
        hotspot: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        sightings: sightings.map((s) => ({
          id: s.id,
          spottedAt: s.spottedAt.toISOString(),
          species: s.species,
          user: s.user,
          hotspot: s.hotspot,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}