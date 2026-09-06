"use client";

import { MapPin, Calendar, Users, Car, Bird, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { TripListItem } from "@/types/trip";

interface TripCardProps {
  trip: TripListItem;
}

export function TripCard({ trip }: TripCardProps) {
  const date = new Date(trip.date);
  const meetingTime = new Date(trip.meetingTime);

  const dateLabel = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeLabel = meetingTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-teal-500/50 transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {trip.title}
            </h3>
            {trip.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{trip.description}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              trip.status === "UPCOMING"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : trip.status === "COMPLETED"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {trip.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{trip.hotspot?.locationName || trip.hotspot?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {dateLabel} &middot; {timeLabel}
            </span>
          </div>
        </div>

        {trip.targetSpecies && trip.targetSpecies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trip.targetSpecies.slice(0, 4).map((species) => (
              <span
                key={species.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full"
              >
                <Bird className="h-3 w-3" />
                {species.commonName}
              </span>
            ))}
            {trip.targetSpecies.length > 4 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                +{trip.targetSpecies.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {trip.rsvpCount}/{trip.maxParticipants || "\u221E"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{trip.carpoolCount} ride{trip.carpoolCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
