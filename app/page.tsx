import Link from "next/link";
import { Bird, CalendarDays, Car, Compass, PlusCircle, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { TripCard } from "@/components/TripCard";
import type { TripListItem } from "@/types/trip";

export const metadata = {
  title: "FlockFinder — Meetup + Strava for Birders",
  description: "Join the flock. Schedule outings, coordinate carpools, and log sightings with fellow birders.",
};

type HomeStats = {
  speciesSeenToday: number;
  upcomingTrips: number;
  openCarpoolSeats: number;
};

async function getStats(): Promise<HomeStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [speciesSeenToday, upcomingTrips, openSeats] = await Promise.all([
    db.sighting.groupBy({
      by: ["speciesId"],
      where: { spottedAt: { gte: startOfToday } },
    }),
    db.trip.count({ where: { status: "UPCOMING", date: { gte: new Date() } } }),
    db.carpoolOffer.aggregate({
      _sum: { availableSeats: true },
      where: { trip: { status: "UPCOMING", date: { gte: new Date() } } },
    }),
  ]);

  return {
    speciesSeenToday: speciesSeenToday.length,
    upcomingTrips,
    openCarpoolSeats: openSeats._sum.availableSeats ?? 0,
  };
}

async function getUpcomingTrips(): Promise<TripListItem[]> {
  const trips = await db.trip.findMany({
    where: { status: "UPCOMING", date: { gte: new Date() } },
    include: {
      host: { select: { id: true, name: true, avatarUrl: true } },
      hotspot: {
        select: {
          id: true,
          name: true,
          locationName: true,
          latitude: true,
          longitude: true,
          coverImage: true,
        },
      },
      _count: { select: { rsvps: true, carpoolOffers: true } },
    },
    orderBy: { date: "asc" },
    take: 6,
  });

  const allSpeciesIds = new Set<string>();
  const tripsWithIds = trips.map((trip) => {
    let ids: string[] = [];
    try {
      const parsed: unknown = JSON.parse(trip.targetSpecies || "[]");
      ids = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      ids = [];
    }
    ids.forEach((id) => allSpeciesIds.add(id));
    return { ...trip, _ids: ids };
  });

  const speciesMap = new Map<string, { id: string; commonName: string; imageUrl: string | null }>();
  if (allSpeciesIds.size > 0) {
    const allSpecies = await db.species.findMany({
      where: { id: { in: Array.from(allSpeciesIds) } },
      select: { id: true, commonName: true, imageUrl: true },
    });
    allSpecies.forEach((s) => speciesMap.set(s.id, s));
  }

  return tripsWithIds.map((trip) => ({
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
}

type TickerItem = {
  id: string;
  spottedAt: string;
  species: { commonName: string; imageUrl: string | null };
  user: { name: string };
  hotspot: { name: string };
};

async function getTicker(): Promise<TickerItem[]> {
  const sightings = await db.sighting.findMany({
    orderBy: { spottedAt: "desc" },
    take: 6,
    select: {
      id: true,
      spottedAt: true,
      species: { select: { commonName: true, imageUrl: true } },
      user: { select: { name: true } },
      hotspot: { select: { name: true } },
    },
  });
  return sightings.map((s) => ({
    id: s.id,
    spottedAt: s.spottedAt.toISOString(),
    species: s.species,
    user: s.user,
    hotspot: s.hotspot,
  }));
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default async function HomePage() {
  const [stats, trips, ticker] = await Promise.all([getStats(), getUpcomingTrips(), getTicker()]);

  const statCards = [
    { label: "Species seen today", value: stats.speciesSeenToday, icon: Bird },
    { label: "Upcoming expeditions", value: stats.upcomingTrips, icon: CalendarDays },
    { label: "Open carpool seats", value: stats.openCarpoolSeats, icon: Car },
  ];

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <section className="bg-gradient-to-br from-forest via-teal/85 to-sage/70 dark:from-gray-950 dark:via-forest dark:to-teal/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-sandstone sm:text-5xl">
              Join the Flock
            </h1>
            <p className="mt-4 text-lg text-sandstone/85">
              FlockFinder is the &ldquo;Meetup + Strava for Birders.&rdquo; Schedule expeditions,
              coordinate carpools, and log sightings with your community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trips"
                className="inline-flex items-center gap-2 rounded-xl bg-sandstone px-5 py-3 text-sm font-semibold text-forest shadow-lg transition-colors hover:bg-white"
              >
                <CalendarDays className="h-4 w-4" />
                Browse Expeditions
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-sandstone/40 px-5 py-3 text-sm font-semibold text-sandstone transition-colors hover:bg-sandstone/10"
              >
                <Compass className="h-4 w-4" />
                Explore the Field Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-600/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/trips"
            className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors hover:border-teal-500/50"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span className="font-medium text-gray-900 dark:text-white">Host an Outing</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/trips?hasOpenSeats=true"
            className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors hover:border-teal-500/50"
          >
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span className="font-medium text-gray-900 dark:text-white">Find a Ride</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/map"
            className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors hover:border-teal-500/50"
          >
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span className="font-medium text-gray-900 dark:text-white">Explore the Field Map</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-forest dark:text-sandstone">Upcoming Expeditions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Adventures on the horizon</p>
          </div>
          <Link href="/trips" className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {trips.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No upcoming expeditions yet — be the first to host one!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-forest dark:text-sandstone">Live Sighting Ticker</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Latest birds spotted by members</p>
        </div>
        {ticker.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No sightings logged yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {ticker.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage/20">
                    {item.species.imageUrl ? (
                      <img src={item.species.imageUrl} alt={item.species.commonName} className="h-full w-full object-cover" />
                    ) : (
                      <Bird className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.species.commonName}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.user.name} at {item.hotspot.name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{timeLabel(item.spottedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}