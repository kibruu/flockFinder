"use client";

import Image from "next/image";
import { Bird } from "lucide-react";
import { LocalDateOnly } from "@/components/LocalDate";

interface SightingCardProps {
  sighting: {
    id: string;
    count: number;
    spottedAt: string;
    notes: string | null;
    species: {
      id: string;
      commonName: string;
      scientificName: string;
      imageUrl: string | null;
      rarity: string;
      conservationStatus: string | null;
    };
    user: { name: string };
  };
}

export function SightingCard({ sighting }: SightingCardProps) {
  return (
    <li
      key={sighting.id}
      className="flex items-center gap-4 rounded-xl border border-sage/20 dark:border-sage/600 p-4 bg-sandstone dark:bg-forest shadow-sm"
    >
      {sighting.species.imageUrl ? (
        <Image
          src={sighting.species.imageUrl}
          alt={sighting.species.commonName}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 dark:bg-sage/30">
          <Bird className="h-6 w-6 text-teal-600 dark:text-sage" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-semibold">{sighting.species.commonName}</p>
        <p className="text-sm italic text-forest/50 dark:text-sandstone/50">{sighting.species.scientificName}</p>
        {sighting.notes && <p className="mt-1 text-sm text-forest/60 dark:text-sandstone/60">{sighting.notes}</p>}
      </div>
      <div className="text-right text-sm text-forest/50 dark:text-sandstone/50">
        <p className="font-medium text-forest/70 dark:text-sandstone/70">
          {sighting.count} {sighting.count === 1 ? "bird" : "birds"}
        </p>
        <p>by {sighting.user.name}</p>
        <p><LocalDateOnly dateString={sighting.spottedAt} formatStr="MMM d, yyyy" /></p>
      </div>
    </li>
  );
}