"use client";

import { useSyncExternalStore } from "react";
import { format } from "date-fns";

const emptySubscribe = () => () => {};

// Date formatting depends on the local timezone, which differs between the
// server (SSR prerender) and the user's browser. useSyncExternalStore renders
// the server snapshot (false) during SSR/hydration and the client snapshot
// (true) after mount, avoiding hydration mismatches and wrong dates.
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface LocalDateProps {
  dateString: string;
  formatStr?: string;
  fallback?: string;
}

export function LocalDate({ dateString, formatStr = "PPpp", fallback = "Invalid date" }: LocalDateProps) {
  const mounted = useMounted();
  if (!mounted) return null;
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return fallback;
  }
}

interface LocalDateOnlyProps {
  dateString: string;
  formatStr?: string;
  fallback?: string;
}

export function LocalDateOnly({ dateString, formatStr = "EEEE, MMMM d, yyyy", fallback = "Invalid date" }: LocalDateOnlyProps) {
  const mounted = useMounted();
  if (!mounted) return null;
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return fallback;
  }
}

interface LocalTimeOnlyProps {
  dateString: string;
  formatStr?: string;
  fallback?: string;
}

export function LocalTimeOnly({ dateString, formatStr = "h:mm a", fallback = "Invalid time" }: LocalTimeOnlyProps) {
  const mounted = useMounted();
  if (!mounted) return null;
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return fallback;
  }
}