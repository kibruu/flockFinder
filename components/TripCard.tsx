"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users, MapPin, Car } from "lucide-react";
import { LocalDateOnly, LocalTimeOnly } from "@/components/LocalDate";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    date: string;
    meetingTime: string;
    meetingPoint: string;
    maxParticipants: number | null;
    rsvpCount?: number | null;
    carpoolCount?: number | null;
    openSeats?: number | null;
    targetSpecies?: { id: string; commonName: string; imageUrl: string | null }[];
    hotspot?: { id: string; name: string; locationName: string } | null;
    host: { id: string; name: string; avatarUrl: string | null } | null;
  };
}

export function TripCard({ trip }: TripCardProps) {
  const capacity =
    trip.rsvpCount != null
      ? `${trip.rsvpCount} / ${trip.maxParticipants ?? "\u221E"}`
      : trip.maxParticipants != null
        ? `${trip.maxParticipants} max`
        : "No limit";

  const targetSpecies = trip.targetSpecies ?? [];

  let seatsLabel: string | null = null;
  let seatsClass = "";
  if (trip.carpoolCount !== undefined) {
    if (trip.openSeats != null && trip.openSeats > 0) {
      seatsLabel = `${trip.openSeats} open seat${trip.openSeats === 1 ? "" : "s"}`;
      seatsClass = "text-teal";
    } else if (trip.openSeats != null) {
      seatsLabel = "Full";
      seatsClass = "text-amber";
    } else if (trip.carpoolCount === 0) {
      seatsLabel = "No carpool offered yet";
      seatsClass = "text-forest-mid dark:text-sandstone/50";
    } else {
      seatsLabel = `${trip.carpoolCount} carpool${trip.carpoolCount === 1 ? "" : "s"} offered`;
      seatsClass = "text-teal";
    }
  }

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-sage/20 p-4 bg-sandstone dark:bg-forest-deep shadow-sm hover:border-sage/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-forest-deep dark:text-sandstone">{trip.title}</h3>
          <p className="mt-1 text-sm text-forest/60 dark:text-sandstone/60">
            <LocalDateOnly dateString={trip.date} />
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-forest/50 dark:text-sandstone/50">
            <Clock className="h-3.5 w-3.5" />
            Meet <LocalTimeOnly dateString={trip.meetingTime} />
            {trip.meetingPoint && ` at ${trip.meetingPoint}`}
          </p>
        </div>
        <div className="text-right text-sm text-forest/50 dark:text-sandstone/50">
          <p className="flex items-center justify-end gap-1" title={trip.maxParticipants != null ? `Capacity: ${trip.maxParticipants}` : "No participant limit"}>
            <Users className="h-4 w-4" />
            {capacity}
          </p>
          {trip.host && <p className="mt-1">Hosted by {trip.host.name}</p>}
        </div>
      </div>

      {trip.hotspot && (
        <p className="mt-3 flex items-center gap-1 text-xs text-forest/60 dark:text-sandstone/60">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {trip.hotspot.name}
          {trip.hotspot.locationName ? ` — ${trip.hotspot.locationName}` : ""}
        </p>
      )}

      {targetSpecies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {targetSpecies.slice(0, 4).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage/10 px-2 py-0.5 text-xs text-forest-deep dark:text-sandstone"
            >
              {s.imageUrl ? (
                <Image
                  src={s.imageUrl}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : null}
              {s.commonName}
            </span>
          ))}
          {targetSpecies.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs text-forest-mid dark:text-sandstone/50">
              +{targetSpecies.length - 4} more
            </span>
          )}
        </div>
      )}

      {seatsLabel && (
        <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${seatsClass}`}>
          <Car className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {seatsLabel}
        </p>
      )}
    </Link>
  );
}