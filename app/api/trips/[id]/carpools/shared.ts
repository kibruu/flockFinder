import type { Prisma } from "@prisma/client";

export async function releasePassengerBooking(
  tx: Prisma.TransactionClient,
  bookingId: string,
  offerId: string
): Promise<void> {
  await tx.carpoolBooking.delete({ where: { id: bookingId } });
  await tx.carpoolOffer.update({
    where: { id: offerId },
    data: { availableSeats: { increment: 1 } },
  });
}