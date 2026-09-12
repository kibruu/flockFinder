"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Binoculars, CloudOff } from "lucide-react";
import { useSession } from "@/hooks/useAuth";
import { useOfflineSightingQueue, type PendingSightingPayload } from "@/hooks/useOfflineSightingQueue";
import type {
  SpeciesOption,
  HotspotOption,
  SightingSubmitResult,
} from "@/lib/sightings";
import { FieldCompanion } from "./drawer";

export type CompanionScope = {
  tripId: string;
  hotspotId: string;
  hotspotName: string;
  targetSpeciesIds: string[];
};

type FieldCompanionApi = {
  openCompanion: (scope?: CompanionScope) => void;
};

const FieldCompanionContext = createContext<FieldCompanionApi | null>(null);

export function useFieldCompanion(): FieldCompanionApi {
  const ctx = useContext(FieldCompanionContext);
  if (!ctx) {
    throw new Error("useFieldCompanion must be used within FieldCompanionLauncher");
  }
  return ctx;
}

export function FieldCompanionLauncher({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<CompanionScope | null>(null);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [hotspots, setHotspots] = useState<HotspotOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SightingSubmitResult | null>(null);

  const { pendingCount, pending, enqueue } = useOfflineSightingQueue(user?.id ?? null);

  useEffect(() => {
    if (!open) return;
    if (species.length > 0 && hotspots.length > 0) return;
    let active = true;
    (async () => {
      try {
        const [speciesRes, hotspotsRes] = await Promise.all([
          fetch("/api/species"),
          fetch("/api/hotspots"),
        ]);
        if (!active) return;
        const speciesData = speciesRes.ok ? await speciesRes.json() : null;
        const hotspotsData = hotspotsRes.ok ? await hotspotsRes.json() : null;
        if (active) {
          setSpecies(Array.isArray(speciesData?.species) ? speciesData.species : []);
          setHotspots(Array.isArray(hotspotsData?.hotspots) ? hotspotsData.hotspots : []);
        }
      } catch {
        // catalog load was interrupted; next open retries
      }
    })();
    return () => {
      active = false;
    };
  }, [open, species.length, hotspots.length]);

  const openCompanion = useCallback((nextScope?: CompanionScope) => {
    setScope(nextScope ?? null);
    setResult(null);
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: PendingSightingPayload) => {
      setSubmitting(true);
      setResult(null);

      const attempt = await (async (): Promise<{ ok: boolean; status: number; isNewToLifeList: boolean } | null> => {
        try {
          const res = await fetch("/api/sightings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = res.ok ? await res.json() : null;
          return {
            ok: res.ok,
            status: res.status,
            isNewToLifeList: Boolean(data?.isNewToLifeList),
          };
        } catch {
          return null;
        }
      })();

      if (attempt && attempt.ok) {
        setResult({
          kind: "success",
          isNewToLifeList: attempt.isNewToLifeList,
          message: attempt.isNewToLifeList
            ? "Added to your Life List!"
            : "Already on your Life List — recorded.",
        });
        setSubmitting(false);
        return;
      }

      if (attempt && attempt.status >= 400 && attempt.status < 500) {
        setResult({
          kind: "error",
          message: "Could not log sighting. Check the details and try again.",
        });
        setSubmitting(false);
        return;
      }

      enqueue(payload);
      setResult({
        kind: "queued",
        message: "Saved offline — will sync automatically when you're back online.",
      });
      setSubmitting(false);
    },
    [enqueue]
  );

  const api = useMemo<FieldCompanionApi>(() => ({ openCompanion }), [openCompanion]);

  const pendingLabel = pending.length === 1 ? "1 sighting" : `${pending.length} sightings`;

  return (
    <FieldCompanionContext.Provider value={api}>
      {children}

      {user && (
        <>
          <button
            onClick={() => openCompanion()}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
            type="button"
            aria-label="Log a sighting"
            title="Log a sighting"
          >
            <Binoculars className="h-6 w-6" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-amber-800 text-white text-xs font-semibold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {pending.length > 0 && (
            <button
              onClick={() => openCompanion()}
              className="fixed bottom-6 right-24 z-50 px-4 py-2.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-medium shadow-lg flex items-center gap-2 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              type="button"
              title="Offline sightings waiting to sync"
            >
              <CloudOff className="h-4 w-4" />
              Pending Sync · {pendingLabel}
            </button>
          )}
        </>
      )}

      {open && user && (
        <FieldCompanion
          species={species}
          hotspots={hotspots}
          scope={scope}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
          result={result}
        />
      )}
    </FieldCompanionContext.Provider>
  );
}