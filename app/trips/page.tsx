import type { Metadata } from "next";
import { TripsExplorer } from "./trips-explorer";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { TripListItem } from "@/types/trip";

type SearchParams = { [key: string]: string | string[] | undefined };

async function getCatalog() {
  const [hotspots, species] = await Promise.all([
    db.hotspot.findMany({
      select: { id: true, name: true, locationName: true, habitatType: true },
      orderBy: { name: "asc" },
    }),
    db.species.findMany({
      select: { id: true, commonName: true, scientificName: true, imageUrl: true, category: true },
      orderBy: { commonName: "asc" },
    }),
  ]);
  return { hotspots, species };
}

async function getTrips(searchParams: SearchParams) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const hotspotId = typeof searchParams.hotspotId === "string" ? searchParams.hotspotId : undefined;
  const speciesId = typeof searchParams.speciesId === "string" ? searchParams.speciesId : undefined;
  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined;
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined;
  const hasOpenSeats = searchParams.hasOpenSeats === "true";
  const page = Math.max(1, parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10) || 1);
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (hotspotId) where.hotspotId = hotspotId;
  if (speciesId) where.targetSpecies = { contains: `"${speciesId}"` };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, Date>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, Date>).lte = new Date(dateTo);
  }
  if (hasOpenSeats) where.carpoolOffers = { some: { availableSeats: { gt: 0 } } };

  const [trips, total] = await Promise.all([
    db.trip.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, avatarUrl: true } },
        hotspot: { select: { id: true, name: true, locationName: true, latitude: true, longitude: true, coverImage: true } },
        _count: { select: { rsvps: true, carpoolOffers: true } },
      },
      orderBy: { date: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.trip.count({ where }),
  ]);

  const allSpeciesIds = new Set<string>();
  const tripsWithIds = trips.map((trip) => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(trip.targetSpecies || "[]");
    } catch {
      ids = [];
    }
    ids.forEach((id) => allSpeciesIds.add(id));
    return { ...trip, _ids: ids };
  });

  const speciesMap = new Map<string, { id: string; commonName: string; scientificName: string; imageUrl: string | null }>();
  if (allSpeciesIds.size > 0) {
    const allSpecies = await db.species.findMany({
      where: { id: { in: Array.from(allSpeciesIds) } },
      select: { id: true, commonName: true, scientificName: true, imageUrl: true },
    });
    allSpecies.forEach((s) => speciesMap.set(s.id, s));
  }

  const formatted: TripListItem[] = tripsWithIds.map((trip) => ({
    id: trip.id,
    title: trip.title,
    description: trip.description,
    date: trip.date.toISOString(),
    meetingTime: trip.meetingTime.toISOString(),
    meetingPoint: trip.meetingPoint,
    targetSpecies: trip._ids
      .map((id) => speciesMap.get(id))
      .filter(Boolean) as { id: string; commonName: string; imageUrl: string | null }[],
    maxParticipants: trip.maxParticipants,
    status: trip.status,
    host: trip.host,
    hotspot: trip.hotspot,
    rsvpCount: trip._count.rsvps,
    carpoolCount: trip._count.carpoolOffers,
  }));

  return {
    trips: formatted,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const metadata: Metadata = {
  title: "Trips & Carpools — FlockFinder",
  description: "Browse and join birding expeditions, or create your own.",
};

export default async function TripsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const session = await getSession();
  const [data, catalog] = await Promise.all([getTrips(params), getCatalog()]);

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <TripsExplorer
        initialTrips={data.trips}
        initialPagination={data.pagination}
        hotspots={catalog.hotspots}
        species={catalog.species}
        initialFilters={{
          status: typeof params.status === "string" ? params.status : "UPCOMING",
          hotspotId: typeof params.hotspotId === "string" ? params.hotspotId : "",
          speciesId: typeof params.speciesId === "string" ? params.speciesId : "",
          dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : "",
          dateTo: typeof params.dateTo === "string" ? params.dateTo : "",
          hasOpenSeats: params.hasOpenSeats === "true",
        }}
        authenticated={!!session}
      />
    </div>
  );
}
