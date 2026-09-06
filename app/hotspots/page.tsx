import type { Metadata } from "next";
import Link from "next/link";
import { Bird, MapPin, CalendarDays, Trees } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hotspots — FlockFinder",
  description: "Discover premier birding hotspots with habitat, amenities, and recent activity.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

const HABITAT_STYLES: Record<string, string> = {
  Wetland: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  Forest: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Coast: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Mountain: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

export default async function HotspotsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const habitat = typeof params.habitat === "string" ? params.habitat : "";

  const where = habitat ? { habitatType: habitat } : {};
  const [hotspots, habitats] = await Promise.all([
    db.hotspot.findMany({
      where,
      include: { _count: { select: { sightings: true, trips: true } } },
      orderBy: { name: "asc" },
    }),
    db.hotspot.findMany({ distinct: ["habitatType"], select: { habitatType: true }, orderBy: { habitatType: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-forest dark:text-sandstone">Hotspot Directory</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {hotspots.length} premier birding locations
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Habitat</span>
          <Link
            href="/hotspots"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !habitat
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
            }`}
          >
            All
          </Link>
          {habitats.map(({ habitatType: value }) => (
            <Link
              key={value}
              href={value === habitat ? "/hotspots" : `/hotspots?habitat=${encodeURIComponent(value)}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                habitat === value
                  ? "bg-teal-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
              }`}
            >
              {value}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotspots.map((h) => (
            <Link
              key={h.id}
              href={`/hotspots/${h.id}`}
              className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-44 overflow-hidden">
                {h.coverImage ? (
                  <img src={h.coverImage} alt={h.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage/40 via-teal/20 to-amber/30">
                    <Bird className="h-14 w-14 text-teal-600/60" />
                  </div>
                )}
                <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${HABITAT_STYLES[h.habitatType] ?? "bg-gray-200 text-gray-700"}`}>
                  <Trees className="h-3 w-3" />
                  {h.habitatType}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {h.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {h.locationName}
                </p>
                {h.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{h.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {h._count.trips} upcoming trip{h._count.trips === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bird className="h-3.5 w-3.5" />
                    {h._count.sightings} sighting{h._count.sightings === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hotspots.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
            <Bird className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No hotspots in this habitat yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}