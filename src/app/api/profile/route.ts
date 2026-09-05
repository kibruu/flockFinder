import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getLifeListCount } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.id },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [sightings, lifeListSpecies, tripsJoined, tripsHosted] = await Promise.all([
      db.sighting.count({ where: { userId: session.id } }),
      db.sighting.groupBy({
        by: ["speciesId"],
        where: { userId: session.id },
        _count: true,
        orderBy: { _count: { speciesId: "desc" } },
        take: 100,
      }),
      db.tripRsvp.count({
        where: { userId: session.id, role: { in: ["PASSENGER", "SELF_DRIVE", "DRIVER"] } },
      }),
      db.trip.count({ where: { hostId: session.id } }),
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
      where: { userId: session.id, speciesId: { in: speciesIds } },
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

    const lifeList = lifeListSpecies.map((s) => {
      const details = speciesDetails.find((sp) => sp.id === s.speciesId);
      return {
        id: s.speciesId,
        commonName: details?.commonName || "Unknown",
        scientificName: details?.scientificName || "",
        category: details?.category || "",
        imageUrl: details?.imageUrl || null,
        sightingCount: s._count,
        lastSpotted: dateMap.get(s.speciesId)?.toISOString() || new Date().toISOString(),
        hotspotName: hotspotMap.get(s.speciesId) || "Unknown location",
      };
    });

    return NextResponse.json({
      user: {
        ...user,
        badges: JSON.parse(user.badges || "[]"),
      },
      lifeList,
      stats: {
        totalSightings: sightings,
        lifeListCount: lifeList.length,
        tripsJoined,
        tripsHosted,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, bio, city, vehicleModel, vehicleSeats } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (vehicleModel !== undefined) updateData.vehicleModel = vehicleModel;
    if (vehicleSeats !== undefined) {
      const seats = parseInt(String(vehicleSeats), 10);
      if (!isNaN(seats) && seats >= 0 && seats <= 8) {
        updateData.vehicleSeats = seats;
      }
    }

    const user = await db.user.update({
      where: { id: session.id },
      data: updateData,
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

    return NextResponse.json({
      user: {
        ...user,
        badges: JSON.parse(user.badges || "[]"),
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}