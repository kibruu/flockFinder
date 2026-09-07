import type { ChatMessage } from "@prisma/client";

export const MAX_MESSAGE_LENGTH = 2000;

export type MessageSender = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type MessageRecord = {
  id: string;
  content: string;
  createdAt: string;
  sender: MessageSender;
};

export function serializeMessage(
  message: Pick<ChatMessage, "id" | "content" | "createdAt"> & { sender: MessageSender }
): MessageRecord {
  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    sender: message.sender,
  };
}

export function normalizeMessageContent(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const content = value.trim();
  if (content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return null;
  return content;
}

export function newerThan(cursor: { id: string; createdAt: Date }) {
  return [
    { createdAt: { gt: cursor.createdAt } },
    { createdAt: cursor.createdAt, id: { gt: cursor.id } },
  ];
}