"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, Plus, Camera, Binoculars, Loader2, CheckCircle, CloudOff } from "lucide-react";
import type {
  SpeciesOption,
  HotspotOption,
  SightingSubmitResult,
} from "@/lib/sightings";

type FieldCompanionScope =
  | { tripId: string; hotspotId: string; hotspotName: string; targetSpeciesIds: string[] }
  | null;

export function FieldCompanion({
  species,
  hotspots,
  scope,
  onClose,
  onSubmit,
  submitting,
  result,
}: {
  species: SpeciesOption[];
  hotspots: HotspotOption[];
  scope: FieldCompanionScope;
  onClose: () => void;
  onSubmit: (payload: {
    speciesId: string;
    hotspotId: string;
    tripId?: string | null;
    count: number;
    notes?: string | null;
    photoUrl?: string | null;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  submitting: boolean;
  result?: SightingSubmitResult | null;
}) {
  const [query, setQuery] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [hotspotId, setHotspotId] = useState(
    scope ? scope.hotspotId : hotspots.length > 0 ? hotspots[0].id : ""
  );
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (scope) return;
    setHotspotId((current) => {
      if (current) return current;
      return hotspots.length > 0 ? hotspots[0].id : "";
    });
  }, [hotspots, scope]);

  // After a successful log, clear the draft so "Log Another" starts fresh.
  const prevResultKindRef = useRef<string | null>(null);
  useEffect(() => {
    const kind = result?.kind ?? null;
    if (prevResultKindRef.current === "success" || kind !== "success") {
      prevResultKindRef.current = kind;
      return;
    }
    prevResultKindRef.current = kind;
    setSpeciesId("");
    setQuery("");
    setCount(1);
    setNotes("");
    setPhotoUrl("");
    setHotspotId(scope ? scope.hotspotId : hotspots.length > 0 ? hotspots[0].id : "");
  }, [result, scope, hotspots]);

  const resolved = useMemo(() => {
    const chosen = species.find((s) => s.id === speciesId) ?? null;
    const hotspot = hotspots.find((h) => h.id === hotspotId) ?? null;
    return { chosen, hotspot };
  }, [species, speciesId, hotspots, hotspotId]);

  const quickPicks = useMemo(() => {
    if (!scope) return [];
    return species.filter((s) => scope.targetSpeciesIds.includes(s.id)).slice(0, 6);
  }, [species, scope]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return species
      .filter((s) => {
        if (speciesId === s.id) return false;
        return (
          s.commonName.toLowerCase().includes(q) ||
          s.scientificName.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [species, query, speciesId]);

  const pickSpecies = (id: string) => {
    setSpeciesId(id);
    setQuery("");
  };

  const hotspot = resolved.hotspot;

  const handleSubmit = async () => {
    if (!speciesId || !hotspot) return;
    await onSubmit({
      speciesId,
      hotspotId: hotspot.id,
      tripId: scope?.tripId ?? null,
      count,
      notes: notes.trim() || null,
      photoUrl: photoUrl.trim() || null,
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
    });
  };

  const canSubmit = Boolean(speciesId && hotspot) && !submitting;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Log a sighting"
    >
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Binoculars className="h-5 w-5 text-teal-600" />
            Log a Sighting
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            type="button"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {scope && (
            <div className="px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-sm text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <Binoculars className="h-4 w-4 flex-shrink-0" />
              Logging to expedition {scope.hotspotName}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Species
            </label>
            {speciesId ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeciesId("")}
                  className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  type="button"
                >
                  {resolved.chosen?.imageUrl ? (
                    <img
                      src={resolved.chosen.imageUrl}
                      alt={resolved.chosen.commonName}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-500 text-sm">
                      🦉
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-900 dark:text-white">
                      {resolved.chosen?.commonName}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 italic truncate">
                      {resolved.chosen?.scientificName}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setSpeciesId("")}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40"
                  type="button"
                  aria-label="Clear species"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search common or scientific name…"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                  {filtered.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filtered.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => pickSpecies(s.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-900/30"
                            type="button"
                          >
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.commonName} className="h-8 w-8 rounded object-cover" />
                            ) : (
                              <span className="h-8 w-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-500 text-xs">
                                🦉
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                                {s.commonName}
                              </span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400 italic truncate">
                                {s.scientificName}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {quickPicks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {quickPicks.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => pickSpecies(s.id)}
                        className="px-2.5 py-1 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                        type="button"
                      >
                        {s.commonName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Count
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                disabled={count <= 1}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                type="button"
                aria-label="Decrease count"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span
                className="min-w-[3rem] text-center text-xl font-semibold text-gray-900 dark:text-white"
                aria-live="polite"
              >
                {count}
              </span>
              <button
                onClick={() => setCount((c) => Math.min(1000, c + 1))}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                type="button"
                aria-label="Increase count"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="ml-2 text-xs text-gray-400">individuals</span>
            </div>
          </div>

          <div>
            <label htmlFor="sighting-hotspot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Hotspot
            </label>
            <select
              id="sighting-hotspot"
              value={hotspotId}
              onChange={(e) => setHotspotId(e.target.value)}
              disabled={Boolean(scope)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
            >
              {hotspots.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.locationName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sighting-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="sighting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="e.g., First-winter male, actively foraging in willows."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="sighting-photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Photo URL (optional)
            </label>
            <div className="relative">
              <Camera className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="sighting-photo"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {result && (
            <div
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                result.kind === "error"
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : result.kind === "queued"
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                    : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              }`}
              role="status"
            >
              {result.kind === "queued" ? (
                <CloudOff className="h-4 w-4 flex-shrink-0" />
              ) : result.kind === "success" ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : null}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
              type="button"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : null}
              {result?.kind === "success" ? "Log Another" : "Log Sighting"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}