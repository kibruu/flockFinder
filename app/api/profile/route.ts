import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await loadProfile(session.id);
    return NextResponse.json(profile);
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

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
      }
      updateData.bio = bio.trim();
    }

    if (city !== undefined) {
      if (typeof city !== "string") {
        return NextResponse.json({ error: "Invalid city" }, { status: 400 });
      }
      updateData.city = city.trim();
    }

    if (vehicleModel !== undefined) {
      if (typeof vehicleModel !== "string") {
        return NextResponse.json({ error: "Invalid vehicle model" }, { status: 400 });
      }
      updateData.vehicleModel = vehicleModel.trim();
    }

    if (vehicleSeats !== undefined) {
      const seats = parseInt(String(vehicleSeats), 10);
      if (isNaN(seats) || seats < 0 || seats > 8) {
        return NextResponse.json({ error: "Vehicle seats must be 0-8" }, { status: 400 });
      }
      updateData.vehicleSeats = seats;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
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