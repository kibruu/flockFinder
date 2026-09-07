import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  createSighting,
  loadRecentSightings,
  normalizeNotes,
} from "@/lib/sightings";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const tripId = searchParams.get("tripId") ?? undefined;
    const hotspotId = searchParams.get("hotspotId") ?? undefined;
    const speciesId = searchParams.get("speciesId") ?? undefined;

    const sightings = await loadRecentSightings(session?.id, { tripId, hotspotId, speciesId });
    return NextResponse.json(
      { sightings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const speciesId = typeof body?.speciesId === "string" ? body.speciesId : "";
    const hotspotId = typeof body?.hotspotId === "string" ? body.hotspotId : "";
    const tripId = typeof body?.tripId === "string" && body.tripId.length > 0 ? body.tripId : null;
    const count = typeof body?.count === "number" ? Math.floor(body.count) : NaN;
    const notes = normalizeNotes(body?.notes);
    const photoUrl = typeof body?.photoUrl === "string" && body.photoUrl.trim().length > 0 ? body.photoUrl.trim() : null;

    if (!speciesId) {
      return NextResponse.json({ error: "Species is required" }, { status: 400 });
    }
    if (!hotspotId) {
      return NextResponse.json({ error: "Hotspot is required" }, { status: 400 });
    }
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      return NextResponse.json({ error: "Count must be between 1 and 1000" }, { status: 400 });
    }

    if (photoUrl && !isValidPhotoUrl(photoUrl)) {
      return NextResponse.json({ error: "Photo URL is invalid" }, { status: 400 });
    }

    const [species, hotspot] = await Promise.all([
      db.species.findUnique({ where: { id: speciesId }, select: { id: true } }),
      db.hotspot.findUnique({ where: { id: hotspotId }, select: { id: true } }),
    ]);

    if (!species) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }
    if (!hotspot) {
      return NextResponse.json({ error: "Hotspot not found" }, { status: 404 });
    }

    const latitude = typeof body?.latitude === "number" ? body.latitude : NaN;
    const longitude = typeof body?.longitude === "number" ? body.longitude : NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
    }

    if (tripId) {
      const trip = await db.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          status: true,
          hotspotId: true,
          rsvps: { where: { userId: session.id }, select: { id: true } },
        },
      });
      if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      if (trip.status === "CANCELLED") {
        return NextResponse.json({ error: "Trip is cancelled; sightings are disabled" }, { status: 400 });
      }
      if (trip.rsvps.length === 0) {
        return NextResponse.json({ error: "You must be an attendee to log a sighting on a trip" }, { status: 403 });
      }
      if (trip.hotspotId !== hotspotId) {
        return NextResponse.json({ error: "Hotspot does not match the trip location" }, { status: 400 });
      }
    }

    const result = await createSighting(
      {
        userId: session.id,
        speciesId,
        hotspotId,
        tripId,
        count,
        notes,
        photoUrl,
        latitude,
        longitude,
      },
      session.id
    );

    return NextResponse.json(
      {
        sighting: result.sighting,
        isNewToLifeList: result.isNewToLifeList,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function isValidPhotoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}