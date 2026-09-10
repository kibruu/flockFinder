import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bird, MapPin, CalendarDays, Trees, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  Mountain: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Grassland: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Urban: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
};

const PAGE_SIZE = 12;

export default async function HotspotsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const habitat = typeof params.habitat === "string" ? params.habitat : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1);

  const where: { habitatType?: string; OR?: { name?: { contains: string }; locationName?: { contains: string }; description?: { contains: string } }[] } = {};
  if (habitat) where.habitatType = habitat;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { locationName: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const [hotspots, total, habitats] = await Promise.all([
    db.hotspot.findMany({
      where,
      include: { _count: { select: { sightings: true, trips: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.hotspot.count({ where }),
    db.hotspot.findMany({ distinct: ["habitatType"], select: { habitatType: true }, orderBy: { habitatType: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (habitat) sp.set("habitat", habitat);
    if (q) sp.set("q", q);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    const s = sp.toString();
    return s ? `/hotspots?${s}` : "/hotspots";
  };

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-forest dark:text-sandstone">Hotspot Directory</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {total} premier birding location{total === 1 ? "" : "s"}
          </p>
        </div>

        <form method="get" action="/hotspots" className="mb-4 flex items-center gap-2">
          {habitat && <input type="hidden" name="habitat" value={habitat} />}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name or area..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-medium rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Search
          </button>
          {q && (
            <Link href={buildHref({ q: undefined })} className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
              Clear
            </Link>
          )}
        </form>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Habitat</span>
          <Link
            href={buildHref({ habitat: undefined })}
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
              href={buildHref(value === habitat ? { habitat: undefined } : { habitat: value, page: undefined })}
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
                  <Image
                    src={h.coverImage}
                    alt={h.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {q
                ? `No hotspots match "${q}".`
                : habitat
                  ? "No hotspots in this habitat yet."
                  : "No hotspots found."}
            </p>
            {(q || habitat) && (
              <Link href="/hotspots" className="mt-4 text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
                Clear all filters
              </Link>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Hotspot pagination" className="mt-8 flex items-center justify-center gap-2">
            <Link
              href={buildHref({ page: String(currentPage - 1) })}
              aria-disabled={currentPage <= 1}
              className={`inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "hover:border-teal-500/50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={buildHref({ page: String(currentPage + 1) })}
              aria-disabled={currentPage >= totalPages}
              className={`inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:border-teal-500/50"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}