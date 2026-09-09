"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChecklistEntry } from "@/lib/sightings";

const POLL_INTERVAL_MS = 4000;

// Unlike message threads (append-only, so messages.ts uses an `after` cursor),
// the checklist is a server-aggregated view. Each poll starts from the trip's
// full checklist, so we cleanly replace the whole list rather than merge diffs.
export function useLiveChecklist(url: string, enabled: boolean) {
  const [entries, setEntries] = useState<ChecklistEntry[]>([]);
  const [loading, setLoading] = useState(enabled);
  // Bumped by local mutations so an in-flight poll response that predates a
  // local "Saw it too!" upsert is discarded instead of clobbering it.
  const revisionRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let polling = false;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async (showLoader = false) => {
      if (!active || polling || document.hidden) return;
      if (showLoader) setLoading(true);
      polling = true;
      controller = new AbortController();
      const startedRevision = revisionRef.current;
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          if (revisionRef.current !== startedRevision) return;
          setEntries(Array.isArray(data.entries) ? data.entries : []);
          setLoading(false);
        }
      } catch {
        // transient poll errors are ignored; the next tick retries
      } finally {
        polling = false;
        if (active && !document.hidden) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) poll();
    };

    poll(true);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      controller?.abort();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [url, enabled]);

  // Upsert a single refreshed entry (e.g. right after "Saw it too!") in place.
  const upsertEntry = useCallback((entry: ChecklistEntry) => {
    revisionRef.current += 1;
    setEntries((prev) => {
      const exists = prev.some((e) => e.speciesId === entry.speciesId);
      if (exists) {
        return prev.map((e) => (e.speciesId === entry.speciesId ? entry : e));
      }
      return [entry, ...prev];
    });
  }, []);

  // Remove a single entry (e.g. right after the current user undoes a verification
  // and no other attendee has seen the species).
  const removeEntry = useCallback((speciesId: string) => {
    revisionRef.current += 1;
    setEntries((prev) => prev.filter((e) => e.speciesId !== speciesId));
  }, []);

  return { entries, loading, upsertEntry, removeEntry };
}