import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
    const { role } = await request.json();

    if (!role || !["SELF_DRIVE", "PASSENGER", "DRIVER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Use SELF_DRIVE, PASSENGER, or DRIVER." }, { status: 400 });
    }

    const trip = await db.trip.findUnique({
      where: { id },
      select: { id: true, status: true, maxParticipants: true, _count: { select: { rsvps: true } } },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.status !== "UPCOMING") {
      return NextResponse.json({ error: "Cannot RSVP to a non-upcoming trip" }, { status: 400 });
    }

    const existing = await db.tripRsvp.findUnique({
      where: { tripId_userId: { tripId: id, userId: session.id } },
    });

    if (!existing && trip.maxParticipants && trip._count.rsvps >= trip.maxParticipants) {
      return NextResponse.json({ error: "Trip is full" }, { status: 400 });
    }

    const rsvp = await db.tripRsvp.upsert({
      where: { tripId_userId: { tripId: id, userId: session.id } },
      update: { role },
      create: { tripId: id, userId: session.id, role },
    });

    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 });
  }
}