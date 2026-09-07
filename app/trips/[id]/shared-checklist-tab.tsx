"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Circle, Loader2, Bird, Users } from "lucide-react";
import type { ChecklistEntry } from "@/lib/sightings";
import { useLiveChecklist } from "@/hooks/useLiveChecklist";
import { useFieldCompanion } from "@/components/FieldCompanion/launcher";
import { formatRelativeTime } from "@/lib/time";

export function SharedChecklistTab({
  tripId,
  hotspotId,
  hotspotName,
  currentUserId,
  targetSpecies,
}: {
  tripId: string;
  hotspotId: string;
  hotspotName: string;
  currentUserId: string;
  targetSpecies: { id: string }[];
}) {
  const { openCompanion } = useFieldCompanion();
  const { entries, loading, upsertEntry } = useLiveChecklist(
    `/api/trips/${tripId}/checklist`,
    true
  );
  const [verifyingSpeciesId, setVerifyingSpeciesId] = useState<string | null>(null);

  const handleSawItToo = async (entry: ChecklistEntry) => {
    if (verifyingSpeciesId) return;
    setVerifyingSpeciesId(entry.speciesId);
    try {
      const res = await fetch(`/api/trips/${tripId}/checklist/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId: entry.speciesId }),
      });
      const data = res.ok ? await res.json() : null;
      if (res.ok && data?.entry) {
        upsertEntry(data.entry as ChecklistEntry);
      } else {
        alert(data?.error || "Could not verify sighting");
      }
    } catch {
      alert("Network error");
    } finally {
      setVerifyingSpeciesId(null);
    }
  };

  const handleLogSighting = () => {
    openCompanion({
      tripId,
      hotspotId,
      hotspotName,
      targetSpeciesIds: targetSpecies.map((s) => s.id),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bird className="h-5 w-5 text-teal-600" />
            Shared Field Checklist
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Live: first spotted, total counts, and who&apos;s seen each species.
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

      {loading && entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Loader2 className="h-8 w-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading checklist…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Bird className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sightings logged yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Be the first to log a sighting on this expedition.
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
          {entries.map((entry) => (
            <div
              key={entry.speciesId}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start gap-3">
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={entry.commonName}
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
                    {entry.currentUserVerified && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> You&apos;ve seen it
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">{entry.scientificName}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {entry.verifierCount} birder{entry.verifierCount === 1 ? "" : "s"} · count {entry.totalCount}
                    </span>
                    <span>
                      First: {entry.firstSpottedBy.name} · {formatRelativeTime(entry.firstSpottedAt)}
                    </span>
                  </div>
                </div>
                {entry.currentUserVerified ? (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" /> Seen it
                  </span>
                ) : (
                  <button
                    onClick={() => handleSawItToo(entry)}
                    disabled={verifyingSpeciesId !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors disabled:opacity-60"
                    type="button"
                  >
                    {verifyingSpeciesId === entry.speciesId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    Saw it too!
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}