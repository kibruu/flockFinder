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
      select: { id: true, status: true, maxParticipants: true },
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

    try {
      const rsvp = await db.$transaction(async (tx) => {
        if (!existing && trip.maxParticipants) {
          const count = await tx.tripRsvp.count({ where: { tripId: id } });
          if (count >= trip.maxParticipants) {
            throw new Error("Trip is full");
          }
        }
        return tx.tripRsvp.upsert({
          where: { tripId_userId: { tripId: id, userId: session.id } },
          update: { role },
          create: { tripId: id, userId: session.id, role },
        });
      });

      return NextResponse.json({ rsvp });
    } catch (error) {
      if (error instanceof Error && error.message === "Trip is full") {
        return NextResponse.json({ error: "Trip is full" }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 });
  }
}