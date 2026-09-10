import { db } from "@/lib/db";

export type ConversationSummary = {
  user: { id: string; name: string; avatarUrl: string | null } | null;
  lastMessage: { content: string; createdAt: string };
  unreadCount: number;
};

type LastMessageRow = { peerId: string; content: string; createdAt: string };
type UnreadRow = { peerId: string; unread: number };

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const [conversations, lastRows, unreadRows] = await Promise.all([
    db.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        peerId: true,
        peer: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    db.$queryRaw<LastMessageRow[]>`
      WITH "thread" AS (
        SELECT c."peerId" AS "peerId",
               m."content" AS "content",
               m."createdAt" AS "createdAt",
               m."id" AS "id",
               ROW_NUMBER() OVER (
                 PARTITION BY c."peerId" ORDER BY m."createdAt" DESC, m."id" DESC
               ) AS "rn"
        FROM "Conversation" c
        LEFT JOIN "ChatMessage" m
          ON (m."senderId" = ${userId} AND m."recipientId" = c."peerId")
          OR (m."senderId" = c."peerId" AND m."recipientId" = ${userId})
        WHERE c."userId" = ${userId}
      )
      SELECT "peerId", "content", "createdAt" FROM "thread" WHERE "rn" = 1
    `,
    db.$queryRaw<UnreadRow[]>`
      SELECT m."senderId" AS "peerId", COUNT(*) AS "unread"
      FROM "ChatMessage" m
      JOIN "Conversation" cv
        ON cv."userId" = ${userId} AND cv."peerId" = m."senderId"
      WHERE m."recipientId" = ${userId}
        AND m."deletedAt" IS NULL
        AND (cv."lastReadAt" IS NULL OR m."createdAt" > cv."lastReadAt")
      GROUP BY m."senderId"
    `,
  ]);

  const lastByPeer = new Map(lastRows.map((r) => [r.peerId, r]));
  const unreadByPeer = new Map(unreadRows.map((r) => [r.peerId, Number(r.unread)]));

  const results: ConversationSummary[] = [];
  for (const conversation of conversations) {
    const last = lastByPeer.get(conversation.peerId);
    if (!last) continue;
    results.push({
      user: {
        id: conversation.peer.id,
        name: conversation.peer.name,
        avatarUrl: conversation.peer.avatarUrl,
      },
      lastMessage: {
        content: last.content,
        createdAt: new Date(last.createdAt).toISOString(),
      },
      unreadCount: unreadByPeer.get(conversation.peerId) ?? 0,
    });
  }

  return results.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db.$queryRaw<Array<{ unread: number }>>`
    SELECT COUNT(*) AS "unread"
    FROM "ChatMessage" m
    JOIN "Conversation" cv
      ON cv."userId" = ${userId} AND cv."peerId" = m."senderId"
    WHERE m."recipientId" = ${userId}
      AND m."deletedAt" IS NULL
      AND (cv."lastReadAt" IS NULL OR m."createdAt" > cv."lastReadAt")
  `;
  return Number(row?.unread ?? 0);
}