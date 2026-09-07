import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public catalog route (ticket #8 extension): powers the Field Companion
// species autocomplete from any screen. No authz — species data is public.
export async function GET() {
  try {
    const species = await db.species.findMany({
      select: {
        id: true,
        commonName: true,
        scientificName: true,
        category: true,
        imageUrl: true,
      },
      orderBy: { commonName: "asc" },
    });
    return NextResponse.json({ species });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}