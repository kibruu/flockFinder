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
    const status = searchParams.get("status") || "UPCOMING";
    const hotspotId = searchParams.get("hotspotId");
    const speciesId = searchParams.get("speciesId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const hasOpenSeats = searchParams.get("hasOpenSeats") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (hotspotId) {
      where.hotspotId = hotspotId;
    }

    if (speciesId) {
      where.targetSpecies = { contains: `"${speciesId}"` };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, Date>).lte = new Date(dateTo);
    }

    if (hasOpenSeats) {
      where.carpoolOffers = { some: { availableSeats: { gt: 0 } } };
    }

    const [trips, total] = await Promise.all([
      db.trip.findMany({
        where,
        include: {
          host: { select: { id: true, name: true, avatarUrl: true } },
          hotspot: { select: { id: true, name: true, locationName: true, latitude: true, longitude: true, coverImage: true } },
          _count: { select: { rsvps: true, carpoolOffers: true } },
        },
        orderBy: { date: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.trip.count({ where }),
    ]);

    const allSpeciesIds = new Set<string>();
    const tripsParsed = trips.map((trip) => {
      let targetSpeciesIds: string[] = [];
      try {
        const parsed: unknown = JSON.parse(trip.targetSpecies || "[]");
        targetSpeciesIds = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
      } catch {
        targetSpeciesIds = [];
      }
      targetSpeciesIds.forEach((id) => allSpeciesIds.add(id));
      return { ...trip, _parsedSpeciesIds: targetSpeciesIds };
    });

    const speciesMap = new Map<string, { id: string; commonName: string; scientificName: string; imageUrl: string | null }>();
    if (allSpeciesIds.size > 0) {
      const allSpecies = await db.species.findMany({
        where: { id: { in: Array.from(allSpeciesIds) } },
        select: { id: true, commonName: true, scientificName: true, imageUrl: true },
      });
      allSpecies.forEach((s) => speciesMap.set(s.id, s));
    }

    const formattedTrips = tripsParsed.map((trip) => ({
      id: trip.id,
      title: trip.title,
      description: trip.description,
      date: trip.date.toISOString(),
      meetingTime: trip.meetingTime.toISOString(),
      meetingPoint: trip.meetingPoint,
      targetSpecies: trip._parsedSpeciesIds
        .map((id) => speciesMap.get(id))
        .filter(Boolean) as { id: string; commonName: string; scientificName: string; imageUrl: string | null }[],
      maxParticipants: trip.maxParticipants,
      status: trip.status,
      host: trip.host,
      hotspot: trip.hotspot,
      rsvpCount: trip._count.rsvps,
      carpoolCount: trip._count.carpoolOffers,
      createdAt: trip.createdAt.toISOString(),
    }));

    return NextResponse.json({
      trips: formattedTrips,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Trips list error:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, hotspotId, date, meetingTime, meetingPoint, targetSpecies, maxParticipants } = body;

    if (!title || !hotspotId || !date || !meetingTime || !meetingPoint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const speciesIds = Array.from(
      new Set(
        Array.isArray(targetSpecies) ? targetSpecies.filter((s: unknown): s is string => typeof s === "string") : []
      )
    );

    let parsedMaxParticipants: number | null = null;
    if (maxParticipants !== undefined && maxParticipants !== null) {
      const n = Number(maxParticipants);
      if (!Number.isInteger(n) || n < 1 || n > 50) {
        return NextResponse.json({ error: "Max participants must be an integer between 1 and 50" }, { status: 400 });
      }
      parsedMaxParticipants = n;
    }

    const hotspot = await db.hotspot.findUnique({ where: { id: hotspotId } });
    if (!hotspot) {
      return NextResponse.json({ error: "Hotspot not found" }, { status: 404 });
    }

    let species: { id: string; commonName: string; scientificName: string; imageUrl: string | null }[] = [];
    if (speciesIds.length > 0) {
      species = await db.species.findMany({
        where: { id: { in: speciesIds } },
        select: { id: true, commonName: true, scientificName: true, imageUrl: true },
      });
      const foundIds = new Set(species.map((s) => s.id));
      const unknownIds = speciesIds.filter((id) => !foundIds.has(id));
      if (unknownIds.length > 0) {
        return NextResponse.json({ error: `Unknown species: ${unknownIds.join(", ")}` }, { status: 400 });
      }
    }

    const trip = await db.$transaction(async (tx) => {
      const t = await tx.trip.create({
        data: {
          title,
          description: description || null,
          hostId: session.id,
          hotspotId,
          date: new Date(date),
          meetingTime: new Date(meetingTime),
          meetingPoint,
          targetSpecies: JSON.stringify(speciesIds),
          maxParticipants: parsedMaxParticipants,
          status: "UPCOMING",
        },
        include: {
          host: { select: { id: true, name: true, avatarUrl: true } },
          hotspot: { select: { id: true, name: true, locationName: true } },
        },
      });

      await tx.tripRsvp.create({
        data: { tripId: t.id, userId: session.id, role: "HOST" },
      });

      return t;
    });

    return NextResponse.json({
      id: trip.id,
      title: trip.title,
      description: trip.description,
      date: trip.date.toISOString(),
      meetingTime: trip.meetingTime.toISOString(),
      meetingPoint: trip.meetingPoint,
      targetSpecies: species,
      maxParticipants: trip.maxParticipants,
      status: trip.status,
      host: trip.host,
      hotspot: trip.hotspot,
    }, { status: 201 });
  } catch (error) {
    console.error("Trip creation error:", error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
