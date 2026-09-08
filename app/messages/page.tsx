import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Inbox, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getConversations } from "@/lib/conversations";
import { formatRelativeTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Messages — FlockFinder",
  description: "Direct messages with fellow birders.",
};

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth");
  }

  const conversations = (await getConversations(session.id)).filter((c) => c.user !== null);

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest text-forest dark:text-sandstone">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1 text-sm font-medium text-forest/60 dark:text-sandstone/60 hover:text-forest dark:hover:text-sandstone"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>

        <h1 className="mt-4 text-2xl font-bold flex items-center gap-2">
          <Inbox className="h-6 w-6 text-teal-600 dark:text-sage" />
          Messages
        </h1>

        {conversations.length === 0 ? (
          <p className="mt-8 rounded-xl border border-sage/20 dark:border-sage/600 p-8 text-center text-forest/50 dark:text-sandstone/50">
            No conversations yet. Message a fellow attendee from a trip&apos;s Attendees tab.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.user!.id}>
                <Link
                  href={`/messages/${conversation.user!.id}`}
                  className="flex items-center gap-3 rounded-xl border border-sage/20 dark:border-sage/600 p-3 bg-sandstone dark:bg-forest shadow-sm hover:border-sage/40 dark:hover:border-sage/400 transition-colors"
                >
                  {conversation.user!.avatarUrl ? (
                    <img
                      src={conversation.user!.avatarUrl}
                      alt={conversation.user!.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/20 dark:bg-sage/30">
                      <Users className="h-5 w-5 text-teal-600 dark:text-sage" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{conversation.user!.name}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 text-sandstone text-xs font-medium px-1.5">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-forest/60 dark:text-sandstone/60">
                      {conversation.lastMessage.content.trim() || "Deleted message"}
                    </p>
                  </div>
                  <span className="text-xs text-forest/40 dark:text-sandstone/40">
                    {formatRelativeTime(conversation.lastMessage.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}