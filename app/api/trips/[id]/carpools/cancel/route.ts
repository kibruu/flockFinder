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

    const offer = await db.carpoolOffer.findUnique({
      where: { id: offerId },
      select: { id: true, tripId: true },
    });

    if (!offer || offer.tripId !== id) {
      return NextResponse.json({ error: "Carpool offer not found" }, { status: 404 });
    }

    const booking = await db.carpoolBooking.findUnique({
      where: { offerId_passengerId: { offerId, passengerId: session.id } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
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
    console.error("Carpool cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}