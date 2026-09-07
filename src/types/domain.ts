export const TRIP_STATUSES = ["UPCOMING", "COMPLETED", "CANCELLED"] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const TRIP_RSVP_ROLES = ["HOST", "DRIVER", "SELF_DRIVE", "PASSENGER"] as const;
export type TripRsvpRole = (typeof TRIP_RSVP_ROLES)[number];

export function isTripStatus(value: unknown): value is TripStatus {
  return typeof value === "string" && (TRIP_STATUSES as readonly string[]).includes(value);
}

export function isTripRsvpRole(value: unknown): value is TripRsvpRole {
  return typeof value === "string" && (TRIP_RSVP_ROLES as readonly string[]).includes(value);
}

export function parseTripStatus(value: string | undefined, fallback: TripStatus): TripStatus {
  return isTripStatus(value) ? value : fallback;
}

export function parseTripRsvpRole(value: string | undefined): TripRsvpRole | null {
  return isTripRsvpRole(value) ? value : null;
}