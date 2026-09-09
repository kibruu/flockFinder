import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { bumpSightingCount, removeTripSighting, getTripChecklist } from "@/lib/sightings";

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
    const action =
      body?.action === "increment" || body?.action === "decrement" || body?.action === "remove"
        ? body.action
        : "";
    const count = Number.isInteger(body?.count) ? (body.count as number) : 1;
    if (!speciesId) {
      return NextResponse.json({ error: "Species is required" }, { status: 400 });
    }
    if (!action) {
      return NextResponse.json(
        { error: "Action must be 'increment', 'decrement' or 'remove'" },
        { status: 400 }
      );
    }

    const [trip, rsvp, species] = await Promise.all([
      db.trip.findUnique({
        where: { id },
        select: { id: true, status: true },
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
      return NextResponse.json({ error: "You must be an attendee to update the checklist" }, { status: 403 });
    }
    if (trip.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip is cancelled; checklist updates are disabled" }, { status: 400 });
    }
    if (!species) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }

    if (action !== "remove") {
      const magnitude = Math.max(1, Math.min(99, Math.abs(count)));
      const byCount = magnitude * (action === "decrement" ? -1 : 1);
      const sighting = await bumpSightingCount(
        { userId: session.id, tripId: id, speciesId },
        byCount
      );
      if (!sighting) {
        return NextResponse.json({ error: "You haven't verified this species yet" }, { status: 404 });
      }
    } else {
      const removed = await removeTripSighting({ userId: session.id, tripId: id, speciesId });
      if (!removed) {
        return NextResponse.json({ error: "Nothing to undo" }, { status: 404 });
      }
    }

    const checklist = await getTripChecklist(id, session.id);
    const entry = checklist.find((e) => e.speciesId === speciesId) ?? null;

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}