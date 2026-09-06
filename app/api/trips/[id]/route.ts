import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await db.trip.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true, bio: true, city: true } },
        hotspot: true,
        carpoolOffers: {
          include: {
            driver: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
            bookings: {
              include: {
                passenger: { select: { id: true, name: true, avatarUrl: true } },
              },
              where: { status: "CONFIRMED" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        rsvps: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, vehicleModel: true, vehicleSeats: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const speciesIds: string[] = JSON.parse(trip.targetSpecies || "[]");
    const speciesDetails =
      speciesIds.length > 0
        ? await db.species.findMany({
            where: { id: { in: speciesIds } },
            select: { id: true, commonName: true, scientificName: true, imageUrl: true, category: true, rarity: true },
          })
        : [];

    const userRsvp = trip.rsvps.find((r) => r.userId === session.id);
    const userCarpoolBooking = trip.carpoolOffers
      .flatMap((o) => o.bookings)
      .find((b) => b.passengerId === session.id);
    const userCarpoolOffer = trip.carpoolOffers.find((o) => o.driverId === session.id);

    return NextResponse.json({
      trip: {
        ...trip,
        targetSpecies: speciesIds.map((sid) => {
          const sp = speciesDetails.find((s) => s.id === sid);
          return sp ?? { id: sid, commonName: sid, scientificName: "", imageUrl: null, category: "", rarity: "" };
        }),
        currentUser: {
          id: session.id,
          rsvp: userRsvp
            ? { role: userRsvp.role, createdAt: userRsvp.createdAt.toISOString() }
            : null,
          carpoolBooking: userCarpoolBooking
            ? { offerId: userCarpoolBooking.offerId, status: userCarpoolBooking.status, createdAt: userCarpoolBooking.createdAt.toISOString() }
            : null,
          carpoolOffer: userCarpoolOffer
            ? { id: userCarpoolOffer.id, availableSeats: userCarpoolOffer.availableSeats }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Trip detail error:", error);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}