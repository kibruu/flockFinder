"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, Loader2, Bird, Users, Plus, Minus, Search } from "lucide-react";
import type { ChecklistEntry } from "@/lib/sightings";
import { useLiveChecklist } from "@/hooks/useLiveChecklist";
import { useFieldCompanion } from "@/components/FieldCompanion/launcher";
import { formatRelativeTime } from "@/lib/time";

type SortMode = "first" | "alpha" | "most";

export function SharedChecklistTab({
  tripId,
  hotspotId,
  hotspotName,
  targetSpecies,
}: {
  tripId: string;
  hotspotId: string;
  hotspotName: string;
  targetSpecies: { id: string }[];
}) {
  const { openCompanion } = useFieldCompanion();
  const { entries, loading, upsertEntry, removeEntry } = useLiveChecklist(
    `/api/trips/${tripId}/checklist`,
    true
  );
  const [pendingSpeciesId, setPendingSpeciesId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("first");
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  const postEntry = async (
    action: "increment" | "decrement" | "remove",
    speciesId: string,
    count?: number
  ) => {
    if (pendingSpeciesId) return;
    setPendingSpeciesId(speciesId);
    try {
      const res = await fetch(`/api/trips/${tripId}/checklist/entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId, action, count }),
      });
      const data = res.ok ? await res.json() : null;
      if (res.ok && data) {
        if (data.entry) {
          upsertEntry(data.entry as ChecklistEntry);
          if (action === "increment") {
            setBanner(
              `+1 ${data.entry.commonName}. You've seen ${data.entry.myCount}; the group has seen ${data.entry.totalCount} birds total.`
            );
          }
          if (action === "decrement") {
            setBanner(
              `-1 ${data.entry.commonName}. You've seen ${data.entry.myCount}; the group has seen ${data.entry.totalCount} birds total.`
            );
          }
        } else {
          removeEntry(speciesId);
        }
        if (action === "remove") {
          const name = entries.find((e) => e.speciesId === speciesId)?.commonName ?? "That species";
          setBanner(`${name} removed from your confirmed sightings.`);
        }
      } else {
        alert(data?.error || "Could not update checklist");
      }
    } catch {
      alert("Network error");
    } finally {
      setPendingSpeciesId(null);
    }
  };

  const handleSawItToo = async (entry: ChecklistEntry) => {
    if (pendingSpeciesId) return;
    setPendingSpeciesId(entry.speciesId);
    try {
      const res = await fetch(`/api/trips/${tripId}/checklist/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId: entry.speciesId }),
      });
      const data = res.ok ? await res.json() : null;
      if (res.ok && data?.entry) {
        upsertEntry(data.entry as ChecklistEntry);
        setBanner(
          `Done — ${data.entry.commonName} added to your confirmed sightings. Tap "Seen it" to undo.`
        );
      } else {
        alert(data?.error || "Could not verify sighting");
      }
    } catch {
      alert("Network error");
    } finally {
      setPendingSpeciesId(null);
    }
  };

  const handleAddOne = (entry: ChecklistEntry) => postEntry("increment", entry.speciesId, 1);

  const handleMinusOne = (entry: ChecklistEntry) => postEntry("decrement", entry.speciesId, 1);

  const handleRemove = (entry: ChecklistEntry) => {
    if (!confirm(`Remove "${entry.commonName}" from your confirmed sightings?`)) return;
    postEntry("remove", entry.speciesId);
  };

  const handleLogSighting = () => {
    openCompanion({
      tripId,
      hotspotId,
      hotspotName,
      targetSpeciesIds: targetSpecies.map((s) => s.id),
    });
  };

  const query = search.trim().toLowerCase();
  const visible = entries
    .filter(
      (e) =>
        !query ||
        e.commonName.toLowerCase().includes(query) ||
        e.scientificName.toLowerCase().includes(query)
    )
    .sort((a, b) => {
      if (sortMode === "alpha") return a.commonName.localeCompare(b.commonName);
      if (sortMode === "most") {
        return b.totalCount - a.totalCount || a.commonName.localeCompare(b.commonName);
      }
      return b.firstSpottedAt.localeCompare(a.firstSpottedAt);
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bird className="h-5 w-5 text-teal-600" />
            Trip Sightings Log
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Live: first seen by, total birds, and who&apos;s confirmed each species.
          </p>
        </div>
        <button
          onClick={handleLogSighting}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
          type="button"
        >
          + Log Sighting
        </button>
      </div>

      {banner && (
        <div
          role="status"
          className="flex items-start gap-2 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-medium"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {loading && entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Loader2 className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading sightings…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Bird className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sightings logged yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Be the first to log a sighting on this expedition. Target species appear here once one is logged.
          </p>
          <button
            onClick={handleLogSighting}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
            type="button"
          >
            + Log Sighting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search species…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sort sightings"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="first">First spotted</option>
              <option value="alpha">Alphabetical</option>
              <option value="most">Most birds</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
              No species match &ldquo;{search}&rdquo;.
            </div>
          ) : (
            visible.map((entry) => (
              <div
                key={entry.speciesId}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start gap-3">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.commonName}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Bird className="h-6 w-6 text-teal-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{entry.commonName}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">{entry.scientificName}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Seen by {entry.verifierCount} birder{entry.verifierCount === 1 ? "" : "s"},{" "}
                        {entry.totalCount} bird{entry.totalCount === 1 ? "" : "s"} total
                      </span>
                      <span>
                        First seen by {entry.firstSpottedBy.name} · {formatRelativeTime(entry.firstSpottedAt)}
                      </span>
                    </div>
                  </div>
                  {entry.currentUserVerified ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRemove(entry)}
                        disabled={pendingSpeciesId !== null}
                        title="Tap to undo — removes this from your confirmed sightings"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-60"
                        type="button"
                      >
                        {pendingSpeciesId === entry.speciesId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Seen it
                      </button>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">You&apos;ve seen:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.myCount}
                        </span>
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => handleMinusOne(entry)}
                            disabled={pendingSpeciesId !== null || entry.myCount <= 1}
                            aria-label={`Count one fewer ${entry.commonName} than you said`}
                            title="-1 : you saw one fewer of these"
                            className="flex items-center gap-0.5 px-1.5 h-6 rounded text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            <Minus className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">1</span>
                          </button>
                          <button
                            onClick={() => handleAddOne(entry)}
                            disabled={pendingSpeciesId !== null}
                            aria-label={`Count one more ${entry.commonName}`}
                            title="+1 : you saw one more of these"
                            className="flex items-center gap-0.5 px-1.5 h-6 rounded text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">1</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSawItToo(entry)}
                      disabled={pendingSpeciesId !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors disabled:opacity-60"
                      type="button"
                    >
                      {pendingSpeciesId === entry.speciesId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Saw it too!
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}