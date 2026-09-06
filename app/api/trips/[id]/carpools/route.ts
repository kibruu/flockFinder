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
    const { originArea, departureTime, totalSeats, notes } = await request.json();

    if (!originArea || !departureTime || !totalSeats) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!trip || trip.status !== "UPCOMING") {
      return NextResponse.json({ error: "Trip not found or not upcoming" }, { status: 404 });
    }

    const existingRsvp = await db.tripRsvp.findUnique({
      where: { tripId_userId: { tripId: id, userId: session.id } },
    });
    if (!existingRsvp || !["DRIVER", "SELF_DRIVE", "HOST"].includes(existingRsvp.role)) {
      return NextResponse.json({ error: "RSVP as Self-Drive to offer a carpool" }, { status: 403 });
    }

    const seats = parseInt(String(totalSeats), 10);
    if (isNaN(seats) || seats < 1 || seats > 8) {
      return NextResponse.json({ error: "Total seats must be 1-8" }, { status: 400 });
    }

    let carpool;
    try {
      carpool = await db.$transaction(async (tx) => {
        const existingOffer = await tx.carpoolOffer.findUnique({
          where: { id: `carpool-${id}-${session.id}` },
          select: { id: true, bookings: { where: { status: "CONFIRMED" }, select: { id: true } } },
        });

        let updated;
        if (existingOffer) {
          const confirmedBookings = existingOffer.bookings.length;
          if (seats < confirmedBookings) {
            throw new Error("seats-below-bookings");
          }
          updated = await tx.carpoolOffer.update({
            where: { id: existingOffer.id },
            data: {
              originArea,
              departureTime: new Date(departureTime),
              totalSeats: seats,
              availableSeats: seats - confirmedBookings,
              notes: notes || null,
              updatedAt: new Date(),
            },
            include: {
              driver: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
              bookings: { include: { passenger: { select: { id: true, name: true, avatarUrl: true } } } },
            },
          });
        } else {
          updated = await tx.carpoolOffer.create({
            data: {
              id: `carpool-${id}-${session.id}`,
              tripId: id,
              driverId: session.id,
              originArea,
              departureTime: new Date(departureTime),
              totalSeats: seats,
              availableSeats: seats,
              notes: notes || null,
            },
            include: {
              driver: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
              bookings: { include: { passenger: { select: { id: true, name: true, avatarUrl: true } } } },
            },
          });
        }

        if (existingRsvp.role === "SELF_DRIVE") {
          await tx.tripRsvp.update({
            where: { tripId_userId: { tripId: id, userId: session.id } },
            data: { role: "DRIVER" },
          });
        }

        return updated;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "seats-below-bookings") {
        const offer = await db.carpoolOffer.findUnique({
          where: { id: `carpool-${id}-${session.id}` },
          select: { bookings: { where: { status: "CONFIRMED" }, select: { id: true } } },
        });
        const confirmedBookings = offer?.bookings.length ?? 0;
        return NextResponse.json(
          { error: `Total seats cannot be less than ${confirmedBookings} confirmed booking(s)` },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ carpool });
  } catch (error) {
    console.error("Carpool creation error:", error);
    return NextResponse.json({ error: "Failed to create carpool" }, { status: 500 });
  }
}