import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Bird, Volume2, MapPin, CheckCircle2, FolderOpen } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RarityBadge, ConservationBadge } from "@/components/species-badges";
import { SpeciesBackLink } from "@/components/species-back-link";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export const metadata: Metadata = {
  title: "Species Guide — FlockFinder",
  description: "Bird profiles with descriptions, habitat, rarity, and conservation status.",
};

export default async function SpeciesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const [species, session] = await Promise.all([
    db.species.findUnique({ where: { id } }),
    getSession(),
  ]);

  if (!species) {
    notFound();
  }

  let inLifeList = false;
  if (session?.id) {
    const sightings = await db.sighting.count({ where: { userId: session.id, speciesId: species.id } });
    inLifeList = sightings > 0;
  }

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SpeciesBackLink from={from} />

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="relative overflow-hidden">
            {species.imageUrl ? (
              <Image
                src={species.imageUrl}
                alt={species.commonName}
                width={0}
                height={0}
                sizes="(min-width: 896px) 56rem, 100vw"
                className="h-auto w-full"
                priority
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-gray-100 dark:bg-gray-800 sm:h-96">
                <Bird className="h-20 w-20 text-teal-600/60" />
              </div>
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-1">
              <RarityBadge rarity={species.rarity} />
              {species.conservationStatus && (
                <ConservationBadge status={species.conservationStatus} />
              )}
            </div>
            {inLifeList && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/60 dark:text-green-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                In your Life List
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-600/10 px-2.5 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
                <FolderOpen className="h-3.5 w-3.5" />
                {species.category}
              </span>
              {species.audioUrl && (
                <a
                  href={species.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Play ${species.commonName} call`}
                  className="inline-flex items-center gap-1 rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-forest/80 transition-colors hover:bg-sage/40 dark:bg-sage/30 dark:text-sandstone/80 dark:hover:bg-sage/50"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Play call
                </a>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-forest dark:text-sandstone">{species.commonName}</h1>
            <p className="mt-1 text-lg italic text-gray-500 dark:text-gray-400">{species.scientificName}</p>

            <div className="mt-6 flex items-start gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
              <p className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">Habitat: </span>
                {species.habitat}
              </p>
            </div>

            {species.description && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 dark:text-white">About this bird</h2>
                <p className="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">{species.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}