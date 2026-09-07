"use client";

import { useCallback, useEffect, useState } from "react";

export type PendingSightingPayload = {
  speciesId: string;
  hotspotId: string;
  tripId?: string | null;
  count: number;
  notes?: string | null;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
};

export type PendingSighting = {
  localId: string;
  payload: PendingSightingPayload;
  queuedAt: string;
};

const QUEUE_PREFIX = "flockfinder_pending_sightings_";
const FLUSH_RETRY_MS = 5000;

function readQueue(userId: string): PendingSighting[] {
  try {
    const raw = localStorage.getItem(QUEUE_PREFIX + userId);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingSighting[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(userId: string, queue: PendingSighting[]) {
  try {
    localStorage.setItem(QUEUE_PREFIX + userId, JSON.stringify(queue));
  } catch {
    // storage unavailable; sighting is still shown in memory during this session
  }
}

export function useOfflineSightingQueue(userId: string | null) {
  const [pending, setPending] = useState<PendingSighting[]>([]);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    if (!userId) {
      setPending([]);
      return;
    }
    setPending(readQueue(userId));

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    let flushing = false;

    const doFlush = async () => {
      if (flushing || !active) return;
      flushing = true;
      try {
        const queue = readQueue(userId);
        if (queue.length === 0) {
          setPending([]);
          return;
        }

        const remaining: PendingSighting[] = [];
        for (const item of queue) {
          if (!active) return;
          try {
            const res = await fetch("/api/sightings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.payload),
            });
            const data = res.ok ? await res.json() : null;
            if (res.ok && data && typeof data.sighting?.id === "string") {
              continue;
            }
            // Non-retryable (validation) -> drop; transient/network -> keep & retry
            if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              continue;
            }
            remaining.push(item);
          } catch {
            remaining.push(item);
          }
        }

        if (active) {
          writeQueue(userId, remaining);
          setPending(remaining);
        }
      } finally {
        flushing = false;
      }
    };

    const timer = setInterval(() => {
      if (active && navigator.onLine) doFlush();
    }, FLUSH_RETRY_MS);

    if (navigator.onLine) doFlush();
    window.addEventListener("online", doFlush);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("online", doFlush);
    };
  }, [userId]);

  const enqueue = useCallback(
    (payload: PendingSightingPayload): PendingSighting => {
      const localId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: PendingSighting = {
        localId,
        payload,
        queuedAt: new Date().toISOString(),
      };
      // Only persist if a user is attached (signed-in).
      const userIdForQueue = userId;
      if (userIdForQueue) {
        const queue = [...readQueue(userIdForQueue), item];
        writeQueue(userIdForQueue, queue);
        setPending(queue);
      } else {
        setPending((prev) => [...prev, item]);
      }
      if (navigator.onLine) {
        window.dispatchEvent(new Event("online")); // triggers an immediate flush attempt
      }
      return item;
    },
    [userId]
  );

  const clear = useCallback(() => {
    if (userId) writeQueue(userId, []);
    setPending([]);
  }, [userId]);

  return { pending, pendingCount: pending.length, online, enqueue, clear };
}