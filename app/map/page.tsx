import { Metadata } from "next";
import { MapView } from "@/components/MapViewClient";
import { db } from "@/lib/db";
import { getSession, parseStringArray } from "@/lib/auth";
import { loadRecentSightings } from "@/lib/sightings";
import { finalizeExpiredTrips } from "@/lib/trip-status";
import type { Hotspot, Trip } from "@/components/MapView";

type SearchParams = { [key: string]: string | string[] | undefined };

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

async function getTrips(): Promise<Trip[]> {
  await finalizeExpiredTrips();
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

  const allSpeciesIds = new Set<string>();
  trips.forEach((t) => parseStringArray(t.targetSpecies).forEach((id) => allSpeciesIds.add(id)));
  const speciesMap = new Map<string, string>();
  if (allSpeciesIds.size > 0) {
    const species = await db.species.findMany({
      where: { id: { in: Array.from(allSpeciesIds) } },
      select: { id: true, commonName: true },
    });
    species.forEach((s) => speciesMap.set(s.id, s.commonName));
  }

  return trips.map((t: typeof trips[0]) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    date: t.date.toISOString(),
    meetingTime: t.meetingTime.toISOString(),
    meetingPoint: t.meetingPoint,
    targetSpecies: parseStringArray(t.targetSpecies)
      .map((id) => speciesMap.get(id))
      .filter((name): name is string => Boolean(name)),
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

export default async function MapPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const focusHotspotId = typeof params.hotspot === "string" ? params.hotspot : null;
  const currentUserId = await getCurrentUserId();
  const [hotspots, sightings, trips] = await Promise.all([
    getHotspots(),
    loadRecentSightings(currentUserId),
    getTrips(),
  ]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-sandstone dark:bg-forest">
      <MapView
        hotspots={hotspots}
        sightings={sightings}
        trips={trips}
        focusHotspotId={focusHotspotId}
      />
    </div>
  );
}