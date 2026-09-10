"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Bird } from "lucide-react";
import { LocalDate } from "@/components/LocalDate";

const POLL_INTERVAL_MS = 20000;

type TickerItem = {
  id: string;
  spottedAt: string;
  species: { commonName: string; imageUrl: string | null };
  user: { name: string };
  hotspot: { name: string };
};

export function LiveTicker({ initial }: { initial: TickerItem[] }) {
  const [items, setItems] = useState<TickerItem[]>(initial);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = async () => {
      if (!active || document.hidden) return;
      try {
        const res = await fetch("/api/sightings/latest", { cache: "no-store" });
        if (active && res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sightings)) {
            setItems(data.sightings as TickerItem[]);
          }
        }
      } catch {
        // transient errors are ignored; the next tick retries
      } finally {
        if (active) timer = setTimeout(refresh, POLL_INTERVAL_MS);
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) refresh();
    };

    refresh();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No sightings logged yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sage/20">
              {item.species.imageUrl ? (
                <Image
                  src={item.species.imageUrl}
                  alt={item.species.commonName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Bird className="h-5 w-5 text-teal-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {item.species.commonName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {item.user.name} at {item.hotspot.name}
              </p>
            </div>
            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
              <LocalDate dateString={item.spottedAt} formatStr="MMM d, h:mm a" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}