import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    if (targetSpecies !== undefined && targetSpecies !== null) {
      if (!Array.isArray(targetSpecies)) {
        return NextResponse.json({ error: "targetSpecies must be an array" }, { status: 400 });
      }
      for (const s of targetSpecies) {
        if (typeof s !== "string" || s.trim() === "") {
          return NextResponse.json({ error: "targetSpecies must contain only species IDs" }, { status: 400 });
        }
      }
    }

    let speciesIds: string[] = [];
    if (Array.isArray(targetSpecies)) {
      speciesIds = Array.from(new Set(targetSpecies as string[]));
    }

    let parsedMaxParticipants: number | null = null;
    if (maxParticipants !== undefined && maxParticipants !== null) {
      const n = Number(maxParticipants);
      if (!Number.isInteger(n) || n < 1 || n > 50) {
        return NextResponse.json({ error: "Max participants must be an integer between 1 and 50" }, { status: 400 });
      }
      parsedMaxParticipants = n;
    }

    const meetingDateTime = new Date(meetingTime);
    if (meetingDateTime <= new Date()) {
      return NextResponse.json({ error: "Meeting time must be in the future" }, { status: 400 });
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
