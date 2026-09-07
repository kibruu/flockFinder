import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTripChecklist } from "@/lib/sightings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [trip, rsvp] = await Promise.all([
      db.trip.findUnique({ where: { id }, select: { id: true } }),
      db.tripRsvp.findUnique({
        where: { tripId_userId: { tripId: id, userId: session.id } },
        select: { id: true },
      }),
    ]);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (!rsvp) {
      return NextResponse.json({ error: "You must be an attendee to view the shared checklist" }, { status: 403 });
    }

    const entries = await getTripChecklist(id, session.id);
    return NextResponse.json(
      { entries },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}