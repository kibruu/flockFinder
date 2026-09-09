import { db } from "@/lib/db";

export async function finalizeExpiredTrips(): Promise<number> {
  const result = await db.trip.updateMany({
    where: { status: "UPCOMING", meetingTime: { lt: new Date() } },
    data: { status: "COMPLETED" },
  });
  return result.count;
}