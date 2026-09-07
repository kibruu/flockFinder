import type { Metadata } from "next";
import Link from "next/link";
import { Bird, Search, Volume2 } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Species Catalog — FlockFinder",
  description: "Browse common and rare bird species with photos, rarity, habitat, and conservation status.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

const RARITY_STYLES: Record<string, string> = {
  Common: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Uncommon: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Rare: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Accidental: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

const CONSERVATION_STYLES: Record<string, string> = {
  Endangered: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Threatened: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Vulnerable: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "Near Threatened": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function filterHref(q: string, rarity: string, category: string): string {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (rarity) sp.set("rarity", rarity);
  if (category) sp.set("category", category);
  const query = sp.toString();
  return query ? `/species?${query}` : "/species";
}

export default async function SpeciesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const rarity = typeof params.rarity === "string" ? params.rarity : "";
  const category = typeof params.category === "string" ? params.category : "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { commonName: { contains: q } },
      { scientificName: { contains: q } },
    ];
  }
  if (rarity) where.rarity = rarity;
  if (category) where.category = category;

  const [species, rarities, categories, session] = await Promise.all([
    db.species.findMany({ where, orderBy: { commonName: "asc" } }),
    db.species.findMany({ distinct: ["rarity"], select: { rarity: true } }),
    db.species.findMany({ distinct: ["category"], select: { category: true } }),
    getSession(),
  ]);

  let lifeListIds = new Set<string>();
  if (session?.id) {
    const rows = await db.sighting.findMany({
      where: { userId: session.id },
      select: { speciesId: true },
    });
    lifeListIds = new Set(rows.map((r) => r.speciesId));
  }

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-forest dark:text-sandstone">Species Catalog</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {species.length} species {q || rarity || category ? "matching your filters" : "in the FlockFinder field guide"}
          </p>
        </div>

        <form method="GET" action="/species" className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by common or scientific name…"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>

        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</span>
            <Link
              href={filterHref(q, rarity, "")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !category
                  ? "bg-teal-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
              }`}
            >
              All
            </Link>
            {categories.map(({ category: value }) => (
              <Link
                key={value}
                href={filterHref(q, rarity, value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === value
                    ? "bg-teal-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
                }`}
              >
                {value}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Rarity</span>
            <Link
              href={filterHref(q, "", category)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !rarity
                  ? "bg-teal-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
              }`}
            >
              All
            </Link>
            {rarities.map(({ rarity: value }) => (
              <Link
                key={value}
                href={filterHref(q, value, category)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  rarity === value
                    ? "bg-teal-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-500/50"
                }`}
              >
                {value}
              </Link>
            ))}
          </div>
        </div>

        {species.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
            <Bird className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No species match your search.</p>
            <Link href="/species" className="mt-2 text-sm text-teal-600 hover:underline">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {species.map((s) => (
              <div
                key={s.id}
                className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 overflow-hidden">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.commonName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sage/40 via-teal/20 to-amber/30">
                      <Bird className="h-12 w-12 text-teal-600/60" />
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_STYLES[s.rarity] ?? "bg-gray-200 text-gray-700"}`}>
                      {s.rarity}
                    </span>
                    {s.conservationStatus && (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONSERVATION_STYLES[s.conservationStatus] ?? "bg-gray-200 text-gray-700"}`}>
                        {s.conservationStatus}
                      </span>
                    )}
                  </div>
                  {lifeListIds.has(s.id) && (
                    <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/60 dark:text-green-300">
                      ✓ In your Life List
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.commonName}</h3>
                  <p className="mt-0.5 text-sm italic text-gray-500 dark:text-gray-400">{s.scientificName}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {s.habitat ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{s.habitat}</span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{s.category}</span>
                    )}
                    {s.audioUrl && (
                      <a
                        href={s.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Play ${s.commonName} call`}
                        className="inline-flex items-center gap-1 rounded-full bg-sage/20 px-2 py-1 text-xs font-medium text-forest/80 transition-colors hover:bg-sage/40 dark:bg-sage/30 dark:text-sandstone/80 dark:hover:bg-sage/50"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}