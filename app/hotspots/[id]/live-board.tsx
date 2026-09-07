"use client";

import { MessageThread } from "@/components/MessageThread";

export function LiveBoard({
  hotspotId,
  currentUserId,
}: {
  hotspotId: string;
  currentUserId: string | null;
}) {
  return (
    <MessageThread
      url={`/api/hotspots/${hotspotId}/board`}
      currentUserId={currentUserId}
      heightClass="h-[360px]"
      placeholder="Report sightings, coordinate meetups, ask questions..."
    />
  );
}