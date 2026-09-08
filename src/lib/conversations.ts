import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 500;

export type ConversationSummary = {
  user: { id: string; name: string; avatarUrl: string | null } | null;
  lastMessage: { content: string; createdAt: string };
  unreadCount: number;
};

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const [row] = await db.$queryRaw<Array<{ peers: number }>>`
    SELECT COUNT(DISTINCT CASE WHEN "senderId" = ${userId} THEN "recipientId" ELSE "senderId" END) AS peers
    FROM "ChatMessage"
    WHERE ("senderId" = ${userId} AND "recipientId" IS NOT NULL)
       OR ("recipientId" = ${userId} AND "senderId" IS NOT NULL)
  `;
  const peerCount = Number(row?.peers ?? 0);
  if (peerCount === 0) return [];

  const lastByPeer = new Map<string, { content: string; createdAt: Date }>();
  let cursor: { id: string; createdAt: Date } | null = null;

  const baseOR: Prisma.ChatMessageWhereInput[] = [
    { senderId: userId, recipientId: { not: null } },
    { recipientId: userId },
  ];

  while (lastByPeer.size < peerCount) {
    const where: Prisma.ChatMessageWhereInput = cursor
      ? {
          AND: [
            { OR: baseOR },
            {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : { OR: baseOR };

    const page = await db.chatMessage.findMany({
      where,
      select: { id: true, content: true, createdAt: true, senderId: true, recipientId: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE,
    });
    if (page.length === 0) break;

    for (const message of page) {
      const peerId = message.senderId === userId ? message.recipientId : message.senderId;
      if (!peerId) continue;
      if (!lastByPeer.has(peerId)) {
        lastByPeer.set(peerId, { content: message.content, createdAt: message.createdAt });
      }
    }

    cursor = { id: page[page.length - 1].id, createdAt: page[page.length - 1].createdAt };
  }

  const peerIds = [...lastByPeer.keys()];
  const [peers, conversations] = await Promise.all([
    db.user.findMany({
      where: { id: { in: peerIds } },
      select: { id: true, name: true, avatarUrl: true },
    }),
    db.conversation.findMany({
      where: { userId, peerId: { in: peerIds } },
      select: { peerId: true, lastReadAt: true },
    }),
  ]);
  const peerById = new Map(peers.map((peer) => [peer.id, peer]));
  const lastReadByPeer = new Map(conversations.map((c) => [c.peerId, c.lastReadAt]));

  const results = await Promise.all(
    [...lastByPeer.entries()].map(async ([peerId, last]) => {
      const lastReadAt = lastReadByPeer.get(peerId);
      let unreadCount = 0;
      if (lastReadAt) {
        unreadCount = await db.chatMessage.count({
          where: {
            senderId: peerId,
            recipientId: userId,
            deletedAt: null,
            createdAt: { gt: lastReadAt },
          },
        });
      } else {
        unreadCount = await db.chatMessage.count({
          where: {
            senderId: peerId,
            recipientId: userId,
            deletedAt: null,
          },
        });
      }
      return {
        user: peerById.get(peerId) ?? null,
        lastMessage: { content: last.content, createdAt: last.createdAt.toISOString() },
        unreadCount,
      };
    })
  );

  return results.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );
}