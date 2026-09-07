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
    const { offerId, passengerId } = await request.json();

    if (!offerId || !passengerId) {
      return NextResponse.json({ error: "Offer ID and passenger ID required" }, { status: 400 });
    }

    const offer = await db.carpoolOffer.findUnique({
      where: { id: offerId },
      select: { id: true, tripId: true, driverId: true },
    });

    if (!offer || offer.tripId !== id) {
      return NextResponse.json({ error: "Carpool offer not found" }, { status: 404 });
    }

    if (offer.driverId !== session.id) {
      return NextResponse.json({ error: "Only the driver can release a passenger" }, { status: 403 });
    }

    if (offer.driverId === passengerId) {
      return NextResponse.json({ error: "Cannot release the driver's own seat" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!trip || trip.status !== "UPCOMING") {
      return NextResponse.json({ error: "Trip not found or not upcoming" }, { status: 404 });
    }

    const booking = await db.carpoolBooking.findUnique({
      where: { offerId_passengerId: { offerId, passengerId } },
    });

    if (!booking || booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Passenger booking not found" }, { status: 404 });
    }

    await db.$transaction([
      db.carpoolBooking.delete({ where: { id: booking.id } }),
      db.carpoolOffer.update({
        where: { id: offerId },
        data: { availableSeats: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Carpool release error:", error);
    return NextResponse.json({ error: "Failed to release passenger" }, { status: 500 });
  }
}