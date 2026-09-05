import { Metadata } from "next";
import { MapView } from "@/components/MapViewClient";
import { db } from "@/lib/db";
import { getSession, parseStringArray } from "@/lib/auth";
import type { Hotspot, Sighting, Trip } from "@/components/MapView";

async function getHotspots(): Promise<Hotspot[]> {
  return db.hotspot.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      locationName: true,
      latitude: true,
      longitude: true,
      habitatType: true,
      amenities: true,
      coverImage: true,
    },
    orderBy: { name: "asc" },
  });
}

async function getSightings(currentUserId?: string): Promise<Sighting[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sightings = await db.sighting.findMany({
    where: {
      spottedAt: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      speciesId: true,
      userId: true,
      hotspotId: true,
      count: true,
      notes: true,
      latitude: true,
      longitude: true,
      spottedAt: true,
      species: {
        select: {
          commonName: true,
          scientificName: true,
          category: true,
          imageUrl: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
      hotspot: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { spottedAt: "desc" },
    take: 500,
  });

  return sightings.map((s) => ({
    id: s.id,
    speciesId: s.speciesId,
    speciesName: s.species.commonName,
    speciesScientificName: s.species.scientificName,
    speciesCategory: s.species.category,
    speciesImageUrl: s.species.imageUrl,
    userId: s.userId,
    userName: s.user.name,
    isCurrentUser: s.userId === currentUserId,
    hotspotId: s.hotspotId,
    hotspotName: s.hotspot.name,
    count: s.count,
    notes: s.notes,
    latitude: s.latitude,
    longitude: s.longitude,
    spottedAt: s.spottedAt.toISOString(),
  }));
}

async function getTrips(): Promise<Trip[]> {
  const trips = await db.trip.findMany({
    where: {
      status: "UPCOMING",
    },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      meetingTime: true,
      meetingPoint: true,
      targetSpecies: true,
      maxParticipants: true,
      status: true,
      hotspotId: true,
      hostId: true,
      hotspot: {
        select: {
          name: true,
          latitude: true,
          longitude: true,
        },
      },
      host: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  return trips.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    date: t.date.toISOString(),
    meetingTime: t.meetingTime.toISOString(),
    meetingPoint: t.meetingPoint,
    targetSpecies: parseStringArray(t.targetSpecies),
    maxParticipants: t.maxParticipants,
    status: t.status,
    hotspotId: t.hotspotId,
    hotspotName: t.hotspot.name,
    hotspotLatitude: t.hotspot.latitude,
    hotspotLongitude: t.hotspot.longitude,
    hostName: t.host.name,
  }));
}

async function getCurrentUserId() {
  const session = await getSession();
  return session?.id;
}

export const metadata: Metadata = {
  title: "Interactive Map — FlockFinder",
  description: "Explore birding hotspots, recent sightings, and upcoming expeditions on an interactive map.",
};

export default async function MapPage() {
  const currentUserId = await getCurrentUserId();
  const [hotspots, sightings, trips] = await Promise.all([
    getHotspots(),
    getSightings(currentUserId),
    getTrips(),
  ]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-sandstone dark:bg-forest">
      <MapView
        hotspots={hotspots}
        sightings={sightings}
        trips={trips}
        currentUserId={currentUserId}
      />
    </div>
  );
}