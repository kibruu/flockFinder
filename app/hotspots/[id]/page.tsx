import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bird, Calendar, Clock, MapPin, Navigation, Users } from "lucide-react";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

type HotspotDetail = {
  id: string;
  name: string;
  description: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  habitatType: string;
  amenities: string | null;
  coverImage: string | null;
  trips: {
    id: string;
    title: string;
    date: string;
    meetingTime: string;
    meetingPoint: string;
    status: string;
    maxParticipants: number | null;
    host: { id: string; name: string; avatarUrl: string | null };
  }[];
  sightings: {
    id: string;
    count: number;
    spottedAt: string;
    notes: string | null;
    species: {
      id: string;
      commonName: string;
      scientificName: string;
      imageUrl: string | null;
      rarity: string;
      conservationStatus: string | null;
    };
    user: { name: string };
  }[];
  recentSightingCount: number;
  distinctSpeciesCount: number;
};

async function getHotspotDetail(id: string): Promise<HotspotDetail | null> {
  const hotspot = await db.hotspot.findUnique({
    where: { id },
    include: {
      trips: {
        include: {
          host: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { date: "asc" },
      },
      sightings: {
        include: {
          species: {
            select: {
              id: true,
              commonName: true,
              scientificName: true,
              imageUrl: true,
              rarity: true,
              conservationStatus: true,
            },
          },
          user: { select: { name: true } },
        },
        orderBy: { spottedAt: "desc" },
        take: 100,
      },
    },
  });

  if (!hotspot) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const upcomingTrips = hotspot.trips.filter((t) => t.status === "UPCOMING");
  const recentSightings = hotspot.sightings.filter((s) => s.spottedAt >= thirtyDaysAgo);

  const [recentSightingCount, speciesGroups] = await Promise.all([
    db.sighting.count({
      where: { hotspotId: hotspot.id, spottedAt: { gte: thirtyDaysAgo } },
    }),
    db.sighting.groupBy({
      by: ["speciesId"],
      where: { hotspotId: hotspot.id, spottedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    id: hotspot.id,
    name: hotspot.name,
    description: hotspot.description,
    locationName: hotspot.locationName,
    latitude: hotspot.latitude,
    longitude: hotspot.longitude,
    habitatType: hotspot.habitatType,
    amenities: hotspot.amenities,
    coverImage: hotspot.coverImage,
    trips: upcomingTrips.map((t) => ({
      id: t.id,
      title: t.title,
      date: t.date.toISOString(),
      meetingTime: t.meetingTime.toISOString(),
      meetingPoint: t.meetingPoint,
      status: t.status,
      maxParticipants: t.maxParticipants,
      host: t.host,
    })),
    sightings: recentSightings.map((s) => ({
      id: s.id,
      count: s.count,
      spottedAt: s.spottedAt.toISOString(),
      notes: s.notes,
      species: s.species,
      user: s.user,
    })),
    recentSightingCount,
    distinctSpeciesCount: speciesGroups.length,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hotspot = await db.hotspot.findUnique({
    where: { id },
    select: { name: true, locationName: true, description: true },
  });
  if (!hotspot) {
    return { title: "Hotspot — FlockFinder" };
  }
  return {
    title: `${hotspot.name} — FlockFinder`,
    description: hotspot.description ?? `${hotspot.name} in ${hotspot.locationName} — a birding hotspot on FlockFinder.`,
  };
}

export default async function HotspotDetailPage({ params }: Props) {
  const { id } = await params;
  const hotspot = await getHotspotDetail(id);
  if (!hotspot) {
    notFound();
  }

  const amenities = hotspot.amenities ? hotspot.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest text-forest dark:text-sandstone">
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/map"
          className="inline-flex items-center gap-1 text-sm font-medium text-forest/60 dark:text-sandstone/60 hover:text-forest dark:hover:text-sandstone"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to map
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl border border-sage/20 dark:border-sage/600 shadow-lg">
          {hotspot.coverImage ? (
            <img
              src={hotspot.coverImage}
              alt={hotspot.name}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="h-56 w-full bg-gradient-to-br from-sage/40 via-teal/20 to-amber/30 dark:from-forest dark:via-teal/10 dark:to-amber/20 flex items-center justify-center">
              <Bird className="h-16 w-16 text-teal-600/60" />
            </div>
          )}
          <div className="p-6 bg-sandstone dark:bg-forest">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-sage/20 dark:bg-sage/30 px-3 py-1 text-xs font-medium text-forest/80 dark:text-sandstone/80">
                  {hotspot.habitatType}
                </span>
                <h1 className="mt-3 text-3xl font-bold">{hotspot.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-forest/60 dark:text-sandstone/60">
                  <MapPin className="h-4 w-4" />
                  {hotspot.locationName}
                </p>
              </div>
              <div className="text-right text-sm text-forest/50 dark:text-sandstone/50">
                <p className="flex items-center justify-end gap-1">
                  <Navigation className="h-4 w-4" />
                  {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${hotspot.latitude}&mlon=${hotspot.longitude}#map=15/${hotspot.latitude}/${hotspot.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-teal-600 dark:text-sage"
                >
                  Open in OpenStreetMap
                </a>
              </div>
            </div>

            {hotspot.description && (
              <p className="mt-4 leading-relaxed text-forest/80 dark:text-sandstone/70">{hotspot.description}</p>
            )}

            {amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-sage/30 dark:border-sage/600 px-3 py-1 text-xs text-forest/70 dark:text-sandstone/70"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-sage/20 dark:border-sage/600 pt-5 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-sage">{hotspot.trips.length}</p>
                <p className="text-xs text-forest/50 dark:text-sandstone/50">Upcoming expeditions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-sage">{hotspot.recentSightingCount}</p>
                <p className="text-xs text-forest/50 dark:text-sandstone/50">Sightings (30 days)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-sage">{hotspot.distinctSpeciesCount}</p>
                <p className="text-xs text-forest/50 dark:text-sandstone/50">Species spotted</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="h-5 w-5 text-teal-600 dark:text-sage" />
            Upcoming expeditions
          </h2>
          {hotspot.trips.length === 0 ? (
            <p className="mt-3 text-forest/50 dark:text-sandstone/50">No upcoming expeditions scheduled at this hotspot.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {hotspot.trips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="block rounded-xl border border-sage/20 dark:border-sage/600 p-4 bg-sandstone dark:bg-forest shadow-sm hover:border-sage/40 dark:hover:border-sage/400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{trip.title}</h3>
                        <p className="mt-1 text-sm text-forest/60 dark:text-sandstone/60">
                          {new Date(trip.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-forest/50 dark:text-sandstone/50">
                          <Clock className="h-3.5 w-3.5" />
                          Meet {new Date(trip.meetingTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                          {trip.meetingPoint && ` at ${trip.meetingPoint}`}
                        </p>
                      </div>
                      <div className="text-right text-sm text-forest/50 dark:text-sandstone/50">
                        <p className="flex items-center justify-end gap-1">
                          <Users className="h-4 w-4" />
                          {trip.maxParticipants}
                        </p>
                        {trip.host && <p className="mt-1">Hosted by {trip.host.name}</p>}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 pb-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bird className="h-5 w-5 text-teal-600 dark:text-sage" />
            Recent sightings
          </h2>
          {hotspot.sightings.length === 0 ? (
            <p className="mt-3 text-forest/50 dark:text-sandstone/50">No sightings reported in the last 30 days.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {hotspot.sightings.map((sighting) => (
                <li
                  key={sighting.id}
                  className="flex items-center gap-4 rounded-xl border border-sage/20 dark:border-sage/600 p-4 bg-sandstone dark:bg-forest shadow-sm"
                >
                  {sighting.species.imageUrl ? (
                    <img
                      src={sighting.species.imageUrl}
                      alt={sighting.species.commonName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 dark:bg-sage/30">
                      <Bird className="h-6 w-6 text-teal-600 dark:text-sage" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{sighting.species.commonName}</p>
                    <p className="text-sm italic text-forest/50 dark:text-sandstone/50">{sighting.species.scientificName}</p>
                    {sighting.notes && <p className="mt-1 text-sm text-forest/60 dark:text-sandstone/60">{sighting.notes}</p>}
                  </div>
                  <div className="text-right text-sm text-forest/50 dark:text-sandstone/50">
                    <p className="font-medium text-forest/70 dark:text-sandstone/70">
                      {sighting.count} {sighting.count === 1 ? "bird" : "birds"}
                    </p>
                    <p>by {sighting.user.name}</p>
                    <p>{new Date(sighting.spottedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}