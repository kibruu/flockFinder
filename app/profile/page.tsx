"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, User, Car, Award, Eye, MapPin, Feather, Settings, LogOut, ChevronRight, Camera, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useSession } from "@/hooks/useAuth";

interface LifeListSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
  imageUrl: string | null;
  sightingCount: number;
  lastSpotted: string;
  hotspotName: string;
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    vehicleModel: string | null;
    vehicleSeats: number | null;
    badges: string[];
    createdAt: string;
  };
  lifeList: LifeListSpecies[];
  stats: {
    totalSightings: number;
    lifeListCount: number;
    tripsJoined: number;
    tripsHosted: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lifelist" | "vehicle" | "badges">("overview");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    city: "",
    vehicleModel: "",
    vehicleSeats: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && editing) {
      setEditData({
        name: user.name,
        bio: user.bio || "",
        city: user.city || "",
        vehicleModel: user.vehicleModel || "",
        vehicleSeats: String(user.vehicleSeats || ""),
      });
    }
  }, [user, editing]);

  const fetchProfile = async () => {
    setProfileError(null);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        setProfileError("Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfileError("Network error");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        fetchProfile();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Network error");
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.push("/");
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-sandstone dark:bg-forest flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 text-amber mx-auto mb-4 animate-spin" />
          <p className="text-forest/60 dark:text-sandstone/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profileData && !profileError) {
    return null;
  }

  if (!profileData) {
    return null;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "lifelist", label: "Life List", icon: Feather },
    { id: "vehicle", label: "Vehicle", icon: Car },
    { id: "badges", label: "Badges", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-sandstone dark:bg-forest">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest dark:text-sandstone">Your Profile</h1>
            <p className="text-forest/60 dark:text-sandstone/60">Manage your birder profile and track your life list</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 rounded-lg text-forest/60 hover:bg-sage/20 dark:hover:bg-sage/800 transition-colors"
              aria-label="Go back to home"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-forest/60 hover:bg-sage/20 dark:hover:bg-sage/800 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {profileError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-red-700 dark:text-red-300">{profileError}</p>
            <button
              onClick={fetchProfile}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-6 sticky top-24">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover border-4 border-sage/30 dark:border-sage/600"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-sage/20 dark:bg-sage/700 flex items-center justify-center border-4 border-sage/30 dark:border-sage/600">
                      <User className="h-12 w-12 text-forest/40 dark:text-sandstone/40" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-forest dark:text-sandstone">{user.name}</h2>
                <p className="text-sm text-forest/60 dark:text-sandstone/60">{user.email}</p>
                {user.city && (
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-forest/60 dark:text-sandstone/60">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.city}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-amber">
                  <Award className="h-3.5 w-3.5" />
                  <span>{profileData.user.badges.length} badges</span>
                </div>
              </div>

              <div className="mt-6 border-t border-sage/20 dark:border-sage/600 pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-forest dark:text-sandstone">{profileData.stats.lifeListCount}</p>
                    <p className="text-xs text-forest/60 dark:text-sandstone/60">Life List</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest dark:text-sandstone">{profileData.stats.totalSightings}</p>
                    <p className="text-xs text-forest/60 dark:text-sandstone/60">Total Sightings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest dark:text-sandstone">{profileData.stats.tripsJoined}</p>
                    <p className="text-xs text-forest/60 dark:text-sandstone/60">Trips Joined</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest dark:text-sandstone">{profileData.stats.tripsHosted}</p>
                    <p className="text-xs text-forest/60 dark:text-sandstone/60">Trips Hosted</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    editing
                      ? "bg-sage/20 text-forest hover:bg-sage/30"
                      : "bg-forest text-sandstone hover:bg-forest/90"
                  }`}
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
                {editing && (
                  <button
                    onClick={handleSave}
                    className="w-full py-2 px-4 rounded-lg bg-amber text-forest font-medium hover:bg-amber/90 transition-colors"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-forest text-sandstone"
                      : "bg-sage/20 text-forest/70 hover:bg-sage/30 dark:bg-sage/30 dark:text-sandstone/70 dark:hover:bg-sage/40"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-6">
                <h3 className="text-lg font-semibold text-forest dark:text-sandstone mb-4">About</h3>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">Full Name</label>
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-sage/30 dark:border-sage/600 bg-sandstone dark:bg-forest text-forest dark:text-sandstone focus:outline-none focus:ring-2 focus:ring-sage/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-sage/30 dark:border-sage/600 bg-sandstone dark:bg-forest text-forest dark:text-sandstone focus:outline-none focus:ring-2 focus:ring-sage/50"
                        placeholder="Tell us about your birding journey..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">City</label>
                      <input
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-sage/30 dark:border-sage/600 bg-sandstone dark:bg-forest text-forest dark:text-sandstone focus:outline-none focus:ring-2 focus:ring-sage/50"
                        placeholder="Cape May, NJ"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.bio ? (
                      <p className="text-forest/80 dark:text-sandstone/80 leading-relaxed">{user.bio}</p>
                    ) : (
                      <p className="text-forest/40 dark:text-sandstone/40 italic">No bio yet. Click Edit Profile to add one.</p>
                    )}
                    {user.city && (
                      <p className="flex items-center gap-2 text-forest/70 dark:text-sandstone/70">
                        <MapPin className="h-4 w-4" />
                        <span>Based in {user.city}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-forest/70 dark:text-sandstone/70">
                      <Settings className="h-4 w-4" />
                      <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "vehicle" && (
              <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-6">
                <h3 className="text-lg font-semibold text-forest dark:text-sandstone mb-4">Vehicle Info (for Carpooling)</h3>
                {editing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">Vehicle Model</label>
                      <input
                        value={editData.vehicleModel}
                        onChange={(e) => setEditData({ ...editData, vehicleModel: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-sage/30 dark:border-sage/600 bg-sandstone dark:bg-forest text-forest dark:text-sandstone focus:outline-none focus:ring-2 focus:ring-sage/50"
                        placeholder="Subaru Outback"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-forest/80 dark:text-sandstone/80 mb-1">Available Seats</label>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        value={editData.vehicleSeats}
                        onChange={(e) => setEditData({ ...editData, vehicleSeats: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-sage/30 dark:border-sage/600 bg-sandstone dark:bg-forest text-forest dark:text-sandstone focus:outline-none focus:ring-2 focus:ring-sage/50"
                        placeholder="3"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-forest/50 dark:text-sandstone/50">Vehicle</p>
                      <p className="text-forest/80 dark:text-sandstone/80 font-medium">{user.vehicleModel || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-forest/50 dark:text-sandstone/50">Available Seats</p>
                      <p className="text-forest/80 dark:text-sandstone/80 font-medium">{user.vehicleSeats ? `${user.vehicleSeats} seats` : "Not set"}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-6">
                <h3 className="text-lg font-semibold text-forest dark:text-sandstone mb-4">Badges & Achievements</h3>
                {profileData.user.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profileData.user.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/100 dark:bg-amber/900/30 text-amber/800 dark:text-amber/200 text-sm font-medium"
                      >
                        <Award className="h-3.5 w-3.5" />
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-forest/40 dark:text-sandstone/40 italic">No badges yet. Join trips and log sightings to earn them!</p>
                )}
              </div>
            )}

            {activeTab === "lifelist" && (
              <div className="bg-sandstone dark:bg-forest rounded-2xl border border-sage/20 dark:border-sage/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-forest dark:text-sandstone">Life List</h3>
                  <span className="text-sm text-forest/60 dark:text-sandstone/60">
                    {profileData.lifeList.length} species
                  </span>
                </div>
                {profileData.lifeList.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {profileData.lifeList.map((species) => (
                      <div
                        key={species.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-sage/100 dark:bg-sage/800/50 hover:bg-sage/200 dark:hover:bg-sage/800 transition-colors"
                      >
                        {species.imageUrl ? (
                          <img
                            src={species.imageUrl}
                            alt={species.commonName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-sage/20 dark:bg-sage/700 flex items-center justify-center">
                            <Feather className="h-6 w-6 text-forest/40 dark:text-sandstone/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-forest dark:text-sandstone truncate">{species.commonName}</p>
                          <p className="text-sm text-forest/50 dark:text-sandstone/50 italic">{species.scientificName}</p>
                          <p className="text-xs text-forest/40 dark:text-sandstone/40">
                            {species.category} • {species.sightingCount} sighting(s) • Last seen at {species.hotspotName}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber/100 dark:bg-amber/900/30 text-amber/800 dark:text-amber/200">
                          {new Date(species.lastSpotted).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Feather className="h-12 w-12 text-forest/30 dark:text-sandstone/30 mx-auto mb-4" />
                    <p className="text-forest/60 dark:text-sandstone/60">Your life list is empty</p>
                    <p className="text-sm text-forest/40 dark:text-sandstone/40 mt-1">Start logging sightings on trips to build your list!</p>
                    <Link
                      href="/trips"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-forest text-sandstone rounded-lg font-medium hover:bg-forest/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Browse Trips
                    </Link>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}