"use client";

import { format } from "date-fns";

interface LocalDateProps {
  dateString: string;
  formatStr?: string;
  fallback?: string;
}

export function LocalDate({ dateString, formatStr = "PPpp", fallback = "Invalid date" }: LocalDateProps) {
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
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return fallback;
  }
}