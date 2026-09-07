import { db } from "./db";
import { getLifeListCount } from "./auth";

export interface LifeListSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
  imageUrl: string | null;
  sightingCount: number;
  lastSpotted: string;
  hotspotName: string;
}

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  vehicleModel: string | null;
  vehicleSeats: number | null;
  badges: string[];
  createdAt: string;
}

export interface ProfileStats {
  totalSightings: number;
  lifeListCount: number;
  tripsJoined: number;
  tripsHosted: number;
}

export interface ProfileData {
  user: ProfileUser;
  lifeList: LifeListSpecies[];
  stats: ProfileStats;
}

export async function loadProfile(userId: string): Promise<ProfileData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      bio: true,
      city: true,
      vehicleModel: true,
      vehicleSeats: true,
      badges: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [sightings, lifeListSpecies, tripsJoined, tripsHosted, lifeListCount] = await Promise.all([
    db.sighting.count({ where: { userId } }),
    db.sighting.groupBy({
      by: ["speciesId"],
      where: { userId },
      _count: { speciesId: true },
      orderBy: { _count: { speciesId: "desc" } },
      take: 100,
    }),
    db.tripRsvp.count({
      where: { userId, role: { in: ["PASSENGER", "SELF_DRIVE", "DRIVER"] } },
    }),
    db.trip.count({ where: { hostId: userId } }),
    getLifeListCount(userId),
  ]);

  const speciesIds = lifeListSpecies.map((s) => s.speciesId);
  const speciesDetails = await db.species.findMany({
    where: { id: { in: speciesIds } },
    select: {
      id: true,
      commonName: true,
      scientificName: true,
      category: true,
      imageUrl: true,
    },
  });

  const hotspotDetails = await db.sighting.findMany({
    where: { userId, speciesId: { in: speciesIds } },
    select: {
      speciesId: true,
      hotspot: { select: { name: true } },
      spottedAt: true,
    },
    orderBy: { spottedAt: "desc" },
    distinct: ["speciesId"],
  });

  const hotspotMap = new Map(hotspotDetails.map((s) => [s.speciesId, s.hotspot.name]));
  const dateMap = new Map(hotspotDetails.map((s) => [s.speciesId, s.spottedAt]));

  const lifeList: LifeListSpecies[] = lifeListSpecies.map((s) => {
    const details = speciesDetails.find((sp) => sp.id === s.speciesId);
    return {
      id: s.speciesId,
      commonName: details?.commonName || "Unknown",
      scientificName: details?.scientificName || "",
      category: details?.category || "",
      imageUrl: details?.imageUrl || null,
      sightingCount: s._count.speciesId,
      lastSpotted: dateMap.get(s.speciesId)?.toISOString() || new Date().toISOString(),
      hotspotName: hotspotMap.get(s.speciesId) || "Unknown location",
    };
  });

  return {
    user: {
      ...user,
      badges: JSON.parse(user.badges || "[]"),
      createdAt: user.createdAt.toISOString(),
    },
    lifeList,
    stats: {
      totalSightings: sightings,
      lifeListCount,
      tripsJoined,
      tripsHosted,
    },
  };
}