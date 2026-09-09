import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MessageThread } from "@/components/MessageThread";

type Props = { params: Promise<{ userId: string }> };

export const metadata: Metadata = {
  title: "Direct Message — FlockFinder",
  description: "Direct message with a fellow birder.",
};

export default async function MessageThreadPage({ params }: Props) {
  const { userId } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/auth");
  }
  if (userId === session.id) {
    redirect("/messages");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, avatarUrl: true },
  });
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest text-forest dark:text-sandstone">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 text-sm font-medium text-forest/60 dark:text-sandstone/60 hover:text-forest dark:hover:text-sandstone"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to messages
        </Link>

        <div className="mt-4 flex items-center gap-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 dark:bg-sage/30">
              <Users className="h-6 w-6 text-teal-600 dark:text-sage" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-forest/60 dark:text-sandstone/60">Direct message</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-sage/20 dark:border-sage/600 p-4 bg-sandstone/60 dark:bg-forest shadow-sm">
          <MessageThread
            url={`/api/messages/${user.id}`}
            currentUserId={session.id}
            heightClass="h-[420px]"
          />
        </div>
      </main>
    </div>
  );
}