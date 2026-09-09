import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { releasePassengerBooking } from "../shared";
import { finalizeExpiredTrips } from "@/lib/trip-status";

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

    await finalizeExpiredTrips();

    try {
      const offer = await db.$transaction(async (tx) => {
        const trip = await tx.trip.findUnique({ where: { id }, select: { id: true, status: true } });
        if (!trip || trip.status !== "UPCOMING") {
          throw new Error("trip-not-upcoming");
        }

        const target = await tx.carpoolOffer.findUnique({
          where: { id: offerId },
          select: { id: true, tripId: true, driverId: true },
        });
        if (!target || target.tripId !== id) {
          throw new Error("offer-not-found");
        }
        if (target.driverId !== session.id) {
          throw new Error("not-driver");
        }
        if (target.driverId === passengerId) {
          throw new Error("release-driver");
        }

        const booking = await tx.carpoolBooking.findUnique({
          where: { offerId_passengerId: { offerId, passengerId } },
        });
        if (!booking || booking.status !== "CONFIRMED") {
          throw new Error("booking-not-found");
        }

        await releasePassengerBooking(tx, booking.id, offerId);

        return tx.carpoolOffer.findUnique({
          where: { id: offerId },
          include: {
            driver: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
            bookings: {
              include: { passenger: { select: { id: true, name: true, avatarUrl: true } } },
              where: { status: "CONFIRMED" },
            },
          },
        });
      });

      if (!offer) {
        return NextResponse.json({ error: "Carpool offer not found" }, { status: 404 });
      }

      return NextResponse.json({ offer });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "trip-not-upcoming") {
        return NextResponse.json({ error: "Trip not found or not upcoming" }, { status: 404 });
      }
      if (message === "offer-not-found") {
        return NextResponse.json({ error: "Carpool offer not found" }, { status: 404 });
      }
      if (message === "not-driver") {
        return NextResponse.json({ error: "Only the driver can release a passenger" }, { status: 403 });
      }
      if (message === "release-driver") {
        return NextResponse.json({ error: "Cannot release the driver's own seat" }, { status: 400 });
      }
      if (message === "booking-not-found") {
        return NextResponse.json({ error: "Passenger booking not found" }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Carpool release error:", error);
    return NextResponse.json({ error: "Failed to release passenger" }, { status: 500 });
  }
}