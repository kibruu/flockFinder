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
    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!trip || trip.status !== "UPCOMING") {
      return NextResponse.json({ error: "Trip not found or not upcoming" }, { status: 404 });
    }

    const offer = await db.carpoolOffer.findUnique({ where: { id: offerId } });
    if (!offer || offer.tripId !== id) {
      return NextResponse.json({ error: "Carpool offer not found" }, { status: 404 });
    }

    if (offer.driverId === session.id) {
      return NextResponse.json({ error: "Cannot book your own carpool" }, { status: 400 });
    }

    if (offer.availableSeats <= 0) {
      return NextResponse.json({ error: "No seats available" }, { status: 400 });
    }

    const existing = await db.carpoolBooking.findUnique({
      where: { offerId_passengerId: { offerId, passengerId: session.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already booked" }, { status: 400 });
    }

    await db.tripRsvp.upsert({
      where: { tripId_userId: { tripId: id, userId: session.id } },
      update: { role: "PASSENGER" },
      create: { tripId: id, userId: session.id, role: "PASSENGER" },
    });

    await db.carpoolBooking.create({
      data: { offerId, passengerId: session.id, status: "CONFIRMED" },
    });

    await db.carpoolOffer.update({
      where: { id: offerId },
      data: { availableSeats: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Carpool booking error:", error);
    return NextResponse.json({ error: "Failed to book seat" }, { status: 500 });
  }
}