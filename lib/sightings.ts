import { db } from "./db";
import type { Sighting } from "@prisma/client";

export const MAX_SIGHTING_NOTES = 2000;

export type SightingRecord = {
  id: string;
  speciesId: string;
  speciesName: string;
  speciesScientificName: string;
  speciesCategory: string;
  speciesImageUrl: string | null;
  userId: string;
  userName: string;
  isCurrentUser: boolean;
  hotspotId: string;
  hotspotName: string;
  tripId: string | null;
  count: number;
  notes: string | null;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  spottedAt: string;
};

export type ChecklistEntry = {
  speciesId: string;
  commonName: string;
  scientificName: string;
  imageUrl: string | null;
  firstSpottedBy: { id: string; name: string; avatarUrl: string | null };
  firstSpottedAt: string;
  totalCount: number;
  verifierCount: number;
  currentUserVerified: boolean;
  myCount: number;
};

export type SpeciesOption = {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl: string | null;
};

export type HotspotOption = {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
};

export type SightingSubmitResult = {
  kind: "success" | "queued" | "error";
  message: string;
  isNewToLifeList?: boolean;
};

const SIGHTING_INCLUDE = {
  species: {
    select: {
      id: true,
      commonName: true,
      scientificName: true,
      category: true,
      imageUrl: true,
    },
  },
  user: { select: { id: true, name: true } },
  hotspot: { select: { id: true, name: true } },
} as const;

export function serializeSighting(
  sighting: Sighting & {
    species: {
      id: string;
      commonName: string;
      scientificName: string;
      category: string;
      imageUrl: string | null;
    };
    user: { id: string; name: string };
    hotspot: { id: string; name: string };
  },
  currentUserId?: string
): SightingRecord {
  return {
    id: sighting.id,
    speciesId: sighting.speciesId,
    speciesName: sighting.species.commonName,
    speciesScientificName: sighting.species.scientificName,
    speciesCategory: sighting.species.category,
    speciesImageUrl: sighting.species.imageUrl,
    userId: sighting.userId,
    userName: sighting.user.name,
    isCurrentUser: sighting.userId === currentUserId,
    hotspotId: sighting.hotspotId,
    hotspotName: sighting.hotspot.name,
    tripId: sighting.tripId,
    count: sighting.count,
    notes: sighting.notes,
    photoUrl: sighting.photoUrl,
    latitude: sighting.latitude,
    longitude: sighting.longitude,
    spottedAt: sighting.spottedAt.toISOString(),
  };
}

export function normalizeNotes(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const notes = value.trim();
  if (notes.length === 0 || notes.length > MAX_SIGHTING_NOTES) return null;
  return notes;
}

export type CreateSightingInput = {
  userId: string;
  speciesId: string;
  hotspotId: string;
  tripId?: string | null;
  count?: number;
  notes?: string | null;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
};

export async function isNewToLifeList(userId: string, speciesId: string): Promise<boolean> {
  const existing = await db.sighting.findFirst({
    where: { userId, speciesId },
    select: { id: true },
  });
  return !existing;
}

export async function createSighting(
  input: CreateSightingInput,
  currentUserId?: string
): Promise<{ sighting: SightingRecord; isNewToLifeList: boolean }> {
  // Check first, then create, so a concurrent first-sighting can't both report
  // isNewToLifeList=true (a simultaneous read before either write lands).
  const isNew = await isNewToLifeList(input.userId, input.speciesId);

  const created = await db.sighting.create({
    data: {
      userId: input.userId,
      speciesId: input.speciesId,
      hotspotId: input.hotspotId,
      tripId: input.tripId ?? null,
      count: input.count ?? 1,
      notes: input.notes ?? null,
      photoUrl: input.photoUrl ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
    },
    include: SIGHTING_INCLUDE,
  });

  return { sighting: serializeSighting(created, currentUserId), isNewToLifeList: isNew };
}

export async function verifySighting(
  input: CreateSightingInput,
  currentUserId?: string
): Promise<{ sighting: SightingRecord; alreadyVerified: boolean; isNewToLifeList: boolean }> {
  const existing = await db.sighting.findFirst({
    where: {
      userId: input.userId,
      speciesId: input.speciesId,
      tripId: input.tripId ?? null,
    },
    include: SIGHTING_INCLUDE,
  });

  if (existing) {
    return {
      sighting: serializeSighting(existing, currentUserId),
      alreadyVerified: true,
      isNewToLifeList: false,
    };
  }

  const { sighting, isNewToLifeList } = await createSighting(input, currentUserId);
  return { sighting, alreadyVerified: false, isNewToLifeList };
}

export async function bumpSightingCount(
  input: { userId: string; tripId: string; speciesId: string },
  byCount: number
): Promise<SightingRecord | null> {
  const existing = await db.sighting.findFirst({
    where: { userId: input.userId, tripId: input.tripId, speciesId: input.speciesId },
    include: SIGHTING_INCLUDE,
  });
  if (!existing) return null;
  const updated = await db.sighting.update({
    where: { id: existing.id },
    data: { count: Math.max(1, existing.count + byCount) },
    include: SIGHTING_INCLUDE,
  });
  return serializeSighting(updated, input.userId);
}

export async function removeTripSighting(
  input: { userId: string; tripId: string; speciesId: string }
): Promise<boolean> {
  const existing = await db.sighting.findFirst({
    where: { userId: input.userId, tripId: input.tripId, speciesId: input.speciesId },
    select: { id: true },
  });
  if (!existing) return false;
  await db.sighting.delete({ where: { id: existing.id } });
  return true;
}

export async function getTripChecklist(
  tripId: string,
  currentUserId: string
): Promise<ChecklistEntry[]> {
  const rows = await db.sighting.findMany({
    where: { tripId },
    select: {
      speciesId: true,
      count: true,
      spottedAt: true,
      userId: true,
      species: {
        select: {
          id: true,
          commonName: true,
          scientificName: true,
          imageUrl: true,
        },
      },
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { spottedAt: "asc" },
  });

  const bySpecies = new Map<
    string,
    {
      commonName: string;
      scientificName: string;
      imageUrl: string | null;
      firstSpotted: {
        id: string;
        name: string;
        avatarUrl: string | null;
        spottedAt: Date;
      } | null;
      totalCount: number;
      verifierIds: Set<string>;
      userCounts: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const entry = bySpecies.get(row.speciesId) ?? {
      commonName: row.species.commonName,
      scientificName: row.species.scientificName,
      imageUrl: row.species.imageUrl,
      firstSpotted: null,
      totalCount: 0,
      verifierIds: new Set<string>(),
      userCounts: new Map<string, number>(),
    };
    if (!entry.firstSpotted || row.spottedAt < entry.firstSpotted.spottedAt) {
      entry.firstSpotted = {
        id: row.user.id,
        name: row.user.name,
        avatarUrl: row.user.avatarUrl,
        spottedAt: row.spottedAt,
      };
    }
    entry.totalCount += row.count;
    entry.verifierIds.add(row.userId);
    entry.userCounts.set(row.userId, (entry.userCounts.get(row.userId) ?? 0) + row.count);
    bySpecies.set(row.speciesId, entry);
  }

  return Array.from(bySpecies.entries())
    .map(([speciesId, entry]) => ({
      speciesId,
      commonName: entry.commonName,
      scientificName: entry.scientificName,
      imageUrl: entry.imageUrl,
      firstSpottedBy: {
        id: entry.firstSpotted?.id ?? "",
        name: entry.firstSpotted?.name ?? "Unknown",
        avatarUrl: entry.firstSpotted?.avatarUrl ?? null,
      },
      firstSpottedAt: entry.firstSpotted?.spottedAt.toISOString() ?? new Date().toISOString(),
      totalCount: entry.totalCount,
      verifierCount: entry.verifierIds.size,
      currentUserVerified: entry.verifierIds.has(currentUserId),
      myCount: entry.userCounts.get(currentUserId) ?? 0,
    }))
    .sort((a, b) => b.firstSpottedAt.localeCompare(a.firstSpottedAt));
}

export async function loadRecentSightings(
  currentUserId?: string,
  filters?: { tripId?: string; hotspotId?: string; speciesId?: string }
): Promise<SightingRecord[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const where: Record<string, unknown> = { spottedAt: { gte: thirtyDaysAgo } };
  if (filters?.tripId) where.tripId = filters.tripId;
  if (filters?.hotspotId) where.hotspotId = filters.hotspotId;
  if (filters?.speciesId) where.speciesId = filters.speciesId;

  const rows = await db.sighting.findMany({
    where,
    include: SIGHTING_INCLUDE,
    orderBy: { spottedAt: "desc" },
    take: 500,
  });

  return rows.map((row) => serializeSighting(row, currentUserId));
}