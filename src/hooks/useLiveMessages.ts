"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageRecord } from "@/lib/messages";

const POLL_INTERVAL_MS = 4000;

export function useLiveMessages(url: string, enabled: boolean) {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const lastIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setMessages([]);
    lastIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async (useCursor: boolean) => {
      if (!active) return;
      if (document.hidden) return;

      try {
        const query = useCursor && lastIdRef.current
          ? `?after=${encodeURIComponent(lastIdRef.current)}`
          : "";
        const res = await fetch(`${url}${query}`);
        if (res.ok) {
          const data = await res.json();
          const fresh: MessageRecord[] = Array.isArray(data.messages) ? data.messages : [];
          if (fresh.length > 0) {
            setMessages((prev) => {
              const merged = new Map(prev.map((m) => [m.id, m] as const));
              for (const m of fresh) {
                if (!merged.has(m.id)) merged.set(m.id, m);
              }
              return [...merged.values()];
            });
            lastIdRef.current = fresh[fresh.length - 1].id;
          }
        }
      } catch {
        // transient poll errors are ignored; the next tick retries
      }

      if (active && !document.hidden) {
        timer = setTimeout(() => poll(true), POLL_INTERVAL_MS);
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) poll(true);
    };

    reset();
    poll(false);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [url, enabled, reset]);

  const append = useCallback((message: MessageRecord) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    lastIdRef.current = message.id;
  }, []);

  return { messages, append };
}