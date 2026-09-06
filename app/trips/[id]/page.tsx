import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripDetailPane } from "./trip-detail-pane";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { TripDetail } from "@/types/trip";

type Props = { params: Promise<{ id: string }> };

async function getTrip(id: string, currentUserId: string): Promise<TripDetail | null> {
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

  if (!trip) return null;

  const speciesIds: string[] = JSON.parse(trip.targetSpecies || "[]");
  const speciesDetails =
    speciesIds.length > 0
      ? await db.species.findMany({
          where: { id: { in: speciesIds } },
          select: { id: true, commonName: true, scientificName: true, imageUrl: true, category: true, rarity: true },
        })
      : [];

  const userRsvp = trip.rsvps.find((r) => r.userId === currentUserId);
  const userCarpoolBooking = trip.carpoolOffers
    .flatMap((o) => o.bookings)
    .find((b) => b.passengerId === currentUserId);
  const userCarpoolOffer = trip.carpoolOffers.find((o) => o.driverId === currentUserId);

  return {
    id: trip.id,
    title: trip.title,
    description: trip.description,
    date: trip.date.toISOString(),
    meetingTime: trip.meetingTime.toISOString(),
    meetingPoint: trip.meetingPoint,
    targetSpecies: speciesIds.map((sid) => {
      const sp = speciesDetails.find((s) => s.id === sid);
      return sp ?? { id: sid, commonName: sid, scientificName: "", imageUrl: null, category: "", rarity: "" };
    }),
    maxParticipants: trip.maxParticipants,
    status: trip.status,
    host: trip.host,
    hotspot: trip.hotspot,
    rsvps: trip.rsvps.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    carpoolOffers: trip.carpoolOffers.map((o) => ({
      id: o.id,
      driverId: o.driverId,
      originArea: o.originArea,
      departureTime: o.departureTime.toISOString(),
      totalSeats: o.totalSeats,
      availableSeats: o.availableSeats,
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      driver: o.driver,
      bookings: o.bookings.map((b) => ({
        id: b.id,
        passengerId: b.passengerId,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        passenger: b.passenger,
      })),
    })),
    currentUser: {
      id: currentUserId,
      rsvp: userRsvp ? { role: userRsvp.role, createdAt: userRsvp.createdAt.toISOString() } : null,
      carpoolBooking: userCarpoolBooking
        ? { offerId: userCarpoolBooking.offerId, status: userCarpoolBooking.status, createdAt: userCarpoolBooking.createdAt.toISOString() }
        : null,
      carpoolOffer: userCarpoolOffer
        ? { id: userCarpoolOffer.id, availableSeats: userCarpoolOffer.availableSeats }
        : null,
    },
  };
}

export const metadata: Metadata = {
  title: "Expedition — FlockFinder",
  description: "Expedition details, host info, target birds, attendees, and carpool offers.",
};

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }
  const trip = await getTrip(id, session.id);
  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <TripDetailPane initialTrip={trip} />
    </div>
  );
}
