import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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