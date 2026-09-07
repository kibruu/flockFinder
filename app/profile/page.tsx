import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import ProfileView from "./ProfileView";

export const metadata: Metadata = {
  title: "Your Profile — FlockFinder",
  description: "Manage your birder profile, vehicle info, badges, and life list.",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth");
  }

  const profile = await loadProfile(session.id);

  return <ProfileView user={profile.user} lifeList={profile.lifeList} stats={profile.stats} />;
}