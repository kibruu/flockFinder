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

    const existingOffer = await db.carpoolOffer.findUnique({
      where: { id: `carpool-${id}-${session.id}` },
      select: { id: true, bookings: { where: { status: "CONFIRMED" }, select: { id: true } } },
    });

    if (existingOffer && seats < existingOffer.bookings.length) {
      return NextResponse.json(
        { error: `Total seats cannot be less than ${existingOffer.bookings.length} confirmed booking(s)` },
        { status: 400 }
      );
    }

    let carpool;
    if (existingOffer) {
      carpool = await db.carpoolOffer.update({
        where: { id: existingOffer.id },
        data: {
          originArea,
          departureTime: new Date(departureTime),
          totalSeats: seats,
          availableSeats: seats - existingOffer.bookings.length,
          notes: notes || null,
          updatedAt: new Date(),
        },
        include: {
          driver: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
          bookings: { include: { passenger: { select: { id: true, name: true, avatarUrl: true } } } },
        },
      });
    } else {
      carpool = await db.carpoolOffer.create({
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
      await db.tripRsvp.update({
        where: { tripId_userId: { tripId: id, userId: session.id } },
        data: { role: "DRIVER" },
      });
    }

    return NextResponse.json({ carpool });
  } catch (error) {
    console.error("Carpool creation error:", error);
    return NextResponse.json({ error: "Failed to create carpool" }, { status: 500 });
  }
}