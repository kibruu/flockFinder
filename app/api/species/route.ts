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
    const category = searchParams.get("category");
    const rarity = searchParams.get("rarity");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (rarity) {
      where.rarity = rarity;
    }

    if (search) {
      where.OR = [
        { commonName: { contains: search, mode: "insensitive" } },
        { scientificName: { contains: search, mode: "insensitive" } },
      ];
    }

    const species = await db.species.findMany({
      where,
      orderBy: { commonName: "asc" },
    });

    return NextResponse.json({ species });
  } catch (error) {
    console.error("Species list error:", error);
    return NextResponse.json({ error: "Failed to fetch species" }, { status: 500 });
  }
}
