"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { TripCard } from "@/components/TripCard";
import { TripForm } from "@/components/TripForm";
import type { TripListItem } from "@/types/trip";

interface HotspotOption {
  id: string;
  name: string;
  locationName: string;
  habitatType: string;
}

interface SpeciesOption {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl: string | null;
  category: string;
}

export interface Filters {
  status: string;
  hotspotId: string;
  speciesId: string;
  dateFrom: string;
  dateTo: string;
  hasOpenSeats: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TripsExplorerProps {
  initialTrips: TripListItem[];
  initialPagination: Pagination;
  hotspots: HotspotOption[];
  species: SpeciesOption[];
  initialFilters: Filters;
  authenticated: boolean;
}

export function TripsExplorer({
  initialTrips,
  initialPagination,
  hotspots,
  species,
  initialFilters,
  authenticated,
}: TripsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<TripListItem[]>(initialTrips);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filterOpen, setFilterOpen] = useState(true);

  useEffect(() => {
    setTrips(initialTrips);
    setPagination(initialPagination);
    if (searchParams.get("page") === "1" || !searchParams.get("page")) {
      setPagination((p) => ({ ...p, page: 1 }));
    }
  }, [initialTrips, initialPagination, searchParams]);

  const fetchTrips = useCallback(
    async (nextFilters: Filters, nextPage: number) => {
      const params = new URLSearchParams({
        status: nextFilters.status,
        page: nextPage.toString(),
        limit: initialPagination.limit.toString(),
      });
      if (nextFilters.hotspotId) params.set("hotspotId", nextFilters.hotspotId);
      if (nextFilters.speciesId) params.set("speciesId", nextFilters.speciesId);
      if (nextFilters.dateFrom) params.set("dateFrom", nextFilters.dateFrom);
      if (nextFilters.dateTo) params.set("dateTo", nextFilters.dateTo);
      if (nextFilters.hasOpenSeats) params.set("hasOpenSeats", "true");

      const query = params.toString();
      router.replace(`/trips?${query}`);
      setLoading(true);
      try {
        const res = await fetch(`/api/trips?${query}`);
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    },
    [initialPagination.limit, router]
  );

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    fetchTrips({ ...filters, [key]: value }, 1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchTrips(filters, page);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest dark:text-sandstone">Trips & Carpools</h1>
            <p className="text-forest/60 dark:text-sandstone/60 mt-1">Browse and join birding expeditions</p>
          </div>
          {authenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-forest text-sandstone font-medium rounded-lg hover:bg-forest/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Trip
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setFilterOpen((open) => !open)}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  type="button"
                >
                  {filterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {filterOpen ? "Hide" : "Show"}
                </button>
              </div>

              <div className={filterOpen ? "space-y-4" : "hidden"}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="ALL">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hotspot</label>
                  <select
                    value={filters.hotspotId}
                    onChange={(e) => handleFilterChange("hotspotId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All hotspots</option>
                    {hotspots.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Species
                  </label>
                  <select
                    value={filters.speciesId}
                    onChange={(e) => handleFilterChange("speciesId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All species</option>
                    {species.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.commonName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasOpenSeats}
                    onChange={(e) => handleFilterChange("hasOpenSeats", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Has Open Seats</span>
                </label>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">&#x1F985;</div>
                <h3 className="text-lg font-medium text-forest dark:text-sandstone mb-2">No trips found</h3>
                <p className="text-forest/60 dark:text-sandstone/60 mb-4">
                  Try adjusting your filters or create a new trip!
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Previous
                    </button>
                    <span className="px-4 text-sm text-gray-700 dark:text-gray-300">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showCreateModal && (
        <TripForm
          hotspots={hotspots}
          species={species}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => fetchTrips(filters, 1)}
        />
      )}
    </>
  );
}
