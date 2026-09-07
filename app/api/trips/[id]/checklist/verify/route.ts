import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifySighting, getTripChecklist } from "@/lib/sightings";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const speciesId = typeof body?.speciesId === "string" ? body.speciesId : "";
    if (!speciesId) {
      return NextResponse.json({ error: "Species is required" }, { status: 400 });
    }

    const [trip, rsvp, species] = await Promise.all([
      db.trip.findUnique({
        where: { id },
        select: { id: true, status: true, hotspotId: true },
      }),
      db.tripRsvp.findUnique({
        where: { tripId_userId: { tripId: id, userId: session.id } },
        select: { id: true },
      }),
      db.species.findUnique({ where: { id: speciesId }, select: { id: true } }),
    ]);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (!rsvp) {
      return NextResponse.json({ error: "You must be an attendee to verify a sighting" }, { status: 403 });
    }
    if (trip.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip is cancelled; verification is disabled" }, { status: 400 });
    }
    if (!species) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }

    const hotspot = await db.hotspot.findUnique({
      where: { id: trip.hotspotId },
      select: { id: true, latitude: true, longitude: true },
    });
    if (!hotspot) {
      return NextResponse.json({ error: "Trip hotspot not found" }, { status: 404 });
    }

    const result = await verifySighting(
      {
        userId: session.id,
        speciesId,
        hotspotId: hotspot.id,
        tripId: id,
        count: 1,
        latitude: hotspot.latitude,
        longitude: hotspot.longitude,
      },
      session.id
    );

    const checklist = await getTripChecklist(id, session.id);
    const entry = checklist.find((e) => e.speciesId === speciesId) ?? null;

    return NextResponse.json(
      {
        sighting: result.sighting,
        alreadyVerified: result.alreadyVerified,
        isNewToLifeList: result.isNewToLifeList,
        entry,
      },
      { status: result.alreadyVerified ? 200 : 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}