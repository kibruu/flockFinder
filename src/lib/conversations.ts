import { db } from "@/lib/db";

const SCAN_LIMIT = 500;

export type ConversationSummary = {
  user: { id: string; name: string; avatarUrl: string | null } | null;
  lastMessage: { content: string; createdAt: string };
};

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const messages = await db.chatMessage.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    select: {
      id: true,
      content: true,
      createdAt: true,
      senderId: true,
      recipientId: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: SCAN_LIMIT,
  });

  const lastByPeer = new Map<string, { content: string; createdAt: Date }>();
  for (const message of messages) {
    const peerId = message.senderId === userId ? message.recipientId : message.senderId;
    if (!peerId) continue;
    if (!lastByPeer.has(peerId)) {
      lastByPeer.set(peerId, { content: message.content, createdAt: message.createdAt });
    }
  }

  if (lastByPeer.size === 0) return [];

  const peers = await db.user.findMany({
    where: { id: { in: [...lastByPeer.keys()] } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const peerById = new Map(peers.map((peer) => [peer.id, peer]));

  return [...lastByPeer.entries()]
    .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime())
    .map(([peerId, last]) => ({
      user: peerById.get(peerId) ?? null,
      lastMessage: { content: last.content, createdAt: last.createdAt.toISOString() },
    }));
}