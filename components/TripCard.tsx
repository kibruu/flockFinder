"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
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

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-sage/20 dark:border-sage/600 p-4 bg-sandstone dark:bg-forest shadow-sm hover:border-sage/40 dark:hover:border-sage/400 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{trip.title}</h3>
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
    </Link>
  );
}