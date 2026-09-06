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

    const trip = await db.trip.findUnique({
      where: { id },
      select: { id: true, hostId: true, status: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.hostId !== session.id) {
      return NextResponse.json({ error: "Only the host can cancel the trip" }, { status: 403 });
    }

    if (trip.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip already cancelled" }, { status: 400 });
    }

    await db.trip.update({
      where: { id },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });

    await db.carpoolBooking.updateMany({
      where: {
        offer: { tripId: id },
        status: "CONFIRMED",
      },
      data: { status: "CANCELLED" },
    });

    await db.carpoolOffer.updateMany({
      where: { tripId: id },
      data: { availableSeats: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trip cancellation error:", error);
    return NextResponse.json({ error: "Failed to cancel trip" }, { status: 500 });
  }
}