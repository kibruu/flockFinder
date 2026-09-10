"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 30000;

export function useUnreadCount(enabled: boolean): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = async () => {
      if (!active) return;
      try {
        const res = await fetch("/api/messages/unread", { cache: "no-store" });
        if (active && res.ok) {
          const data = await res.json();
          setUnread(typeof data.unread === "number" ? data.unread : 0);
        }
      } catch {
        // transient errors are ignored; the next tick retries
      } finally {
        if (active) timer = setTimeout(refresh, POLL_INTERVAL_MS);
      }
    };

    const onFocus = () => refresh();

    refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refresh();
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);

  return unread;
}