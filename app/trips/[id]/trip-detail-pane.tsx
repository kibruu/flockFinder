"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Bird,
  Flag,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import type { TripDetail } from "@/types/trip";

interface TripDetailPaneProps {
  initialTrip: TripDetail;
}

export function TripDetailPane({ initialTrip }: TripDetailPaneProps) {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(initialTrip);
  const [activeTab, setActiveTab] = useState<"details" | "carpools" | "attendees">("details");
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);

  const handleRSVP = async (role: "SELF_DRIVE" | "PASSENGER") => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trips/${params.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrip((prev) =>
          prev
            ? {
                ...prev,
                rsvps: [
                  ...prev.rsvps,
                  { ...data.rsvp, user: { id: prev.currentUser.id, name: "You", avatarUrl: null, vehicleModel: null, vehicleSeats: null } },
                ],
                currentUser: {
                  ...prev.currentUser,
                  rsvp: { role, createdAt: new Date().toISOString() },
                },
              }
            : null
        );
        if (role === "PASSENGER") setActiveTab("carpools");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to RSVP");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleCarpoolCreate = async (data: { originArea: string; departureTime: string; totalSeats: number; notes: string }) => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trips/${params.id}/carpools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setTrip((prev) =>
          prev
            ? {
                ...prev,
                carpoolOffers: [...prev.carpoolOffers, result.carpool],
                currentUser: {
                  ...prev.currentUser,
                  rsvp: prev.currentUser.rsvp || { role: "DRIVER", createdAt: new Date().toISOString() },
                  carpoolOffer: { id: result.carpool.id, availableSeats: result.carpool.availableSeats },
                },
              }
            : null
        );
        setShowCarpoolModal(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create carpool");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleCarpoolBook = async (offerId: string) => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trips/${params.id}/carpools/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      if (res.ok) {
        setTrip((prev) =>
          prev
            ? {
                ...prev,
                carpoolOffers: prev.carpoolOffers.map((o) =>
                  o.id === offerId
                    ? {
                        ...o,
                        availableSeats: o.availableSeats - 1,
                        bookings: [
                          ...o.bookings,
                          {
                            id: `booking-${prev.currentUser.id}`,
                            passengerId: prev.currentUser.id,
                            status: "CONFIRMED",
                            createdAt: new Date().toISOString(),
                            passenger: { id: prev.currentUser.id, name: "You", avatarUrl: null },
                          },
                        ],
                      }
                    : o
                ),
                currentUser: {
                  ...prev.currentUser,
                  rsvp: prev.currentUser.rsvp || { role: "PASSENGER", createdAt: new Date().toISOString() },
                  carpoolBooking: { offerId, status: "CONFIRMED", createdAt: new Date().toISOString() },
                },
              }
            : null
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to book seat");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleCarpoolCancel = async (offerId: string) => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trips/${params.id}/carpools/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      if (res.ok) {
        setTrip((prev) =>
          prev
            ? {
                ...prev,
                carpoolOffers: prev.carpoolOffers.map((o) =>
                  o.id === offerId
                    ? {
                        ...o,
                        availableSeats: o.availableSeats + 1,
                        bookings: o.bookings.filter((b) => b.passengerId !== prev.currentUser.id),
                      }
                    : o
                ),
                currentUser: { ...prev.currentUser, carpoolBooking: null },
              }
            : null
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cancel booking");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleTripCancel = async () => {
    if (!trip || !confirm("Are you sure you want to cancel this trip? All carpool bookings will be released.")) return;
    try {
      const res = await fetch(`/api/trips/${params.id}/cancel`, { method: "POST" });
      if (res.ok) {
        setTrip((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cancel trip");
      }
    } catch {
      alert("Network error");
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-sandstone dark:bg-forest flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-forest dark:text-sandstone mb-2">Expedition Not Found</h1>
          <p className="text-forest/60 dark:text-sandstone/60 mb-6">Unable to load expedition details</p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-sandstone rounded-lg font-medium hover:bg-forest/90 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(trip.date);
  const meetingTime = new Date(trip.meetingTime);
  const isHost = trip.host?.id === trip.currentUser.id;
  const userRole = trip.currentUser.rsvp?.role;
  const canOfferCarpool = (userRole === "DRIVER" || userRole === "SELF_DRIVE" || userRole === "HOST") && !trip.currentUser.carpoolOffer;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-forest/60 hover:text-forest dark:text-sandstone/60 dark:hover:text-sandstone mb-2 text-sm font-medium"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Back to Trips
          </Link>
          <h1 className="text-3xl font-bold text-forest dark:text-sandstone">{trip.title}</h1>
          {trip.description && (
            <p className="text-forest/60 dark:text-sandstone/60 mt-1 max-w-xl">{trip.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              trip.status === "UPCOMING"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : trip.status === "COMPLETED"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {trip.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
            <div className="text-center mb-6">
              {trip.hotspot?.coverImage ? (
                <img
                  src={trip.hotspot.coverImage}
                  alt={trip.hotspot.name}
                  className="w-full h-48 rounded-xl object-cover mb-4"
                />
              ) : (
                <div className="w-full h-48 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                  <Bird className="h-16 w-16 text-teal-400" />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{trip.hotspot?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{trip.hotspot?.locationName}</p>
              <p className="mt-2 text-sm text-teal-600 dark:text-teal-400 font-medium">{trip.hotspot?.habitatType}</p>
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{trip.rsvps.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Attendees</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{trip.carpoolOffers.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Carpools</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{meetingTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{trip.meetingPoint}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {trip.rsvps.length}/{trip.maxParticipants || "\u221E"} participants
                  </span>
                </div>
              </div>

              {trip.host && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                    Hosted by
                  </p>
                  <div className="flex items-center gap-2">
                    {trip.host.avatarUrl ? (
                      <img src={trip.host.avatarUrl} alt={trip.host.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Users className="h-4 w-4 text-teal-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.host.name}</p>
                      {trip.host.city && <p className="text-xs text-gray-500 dark:text-gray-400">{trip.host.city}</p>}
                    </div>
                  </div>
                  {trip.host.bio && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{trip.host.bio}</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2">
                {trip.status === "UPCOMING" && !userRole && (
                  <>
                    <button
                      onClick={() => handleRSVP("SELF_DRIVE")}
                      className="w-full py-2.5 px-4 rounded-lg bg-forest text-sandstone font-medium hover:bg-forest/90 transition-colors"
                      type="button"
                    >
                      Join as Self-Drive
                    </button>
                    <button
                      onClick={() => handleRSVP("PASSENGER")}
                      className="w-full py-2.5 px-4 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                      type="button"
                    >
                      Seeking Carpool
                    </button>
                  </>
                )}
                {trip.status === "UPCOMING" && canOfferCarpool && (
                  <button
                    onClick={() => setShowCarpoolModal(true)}
                    className="w-full py-2.5 px-4 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
                    type="button"
                  >
                    Offer a Carpool
                  </button>
                )}
                {trip.status === "UPCOMING" &&
                  userRole === "PASSENGER" &&
                  !trip.currentUser.carpoolBooking &&
                  trip.carpoolOffers.some((o) => o.availableSeats > 0) && (
                    <button
                      onClick={() => setActiveTab("carpools")}
                      className="w-full py-2.5 px-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
                      type="button"
                    >
                      Book Carpool Seat
                    </button>
                  )}
                {trip.status === "UPCOMING" && isHost && (
                  <button
                    onClick={handleTripCancel}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    type="button"
                  >
                    Cancel Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            {([
              { id: "details", label: "Details", icon: Flag },
              { id: "carpools", label: "Carpools", icon: Car },
              { id: "attendees", label: "Attendees", icon: Users },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-forest text-sandstone"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                type="button"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="space-y-6">
              {trip.targetSpecies.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bird className="h-5 w-5 text-teal-600" />
                    Target Birds
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {trip.targetSpecies.map((species) => (
                      <div
                        key={species.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        {species.imageUrl ? (
                          <img
                            src={species.imageUrl}
                            alt={species.commonName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                            <Bird className="h-6 w-6 text-teal-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{species.commonName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">{species.scientificName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hotspot Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.hotspot?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{trip.hotspot?.locationName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bird className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Habitat: {trip.hotspot?.habitatType}
                      </p>
                    </div>
                  </div>
                  {trip.hotspot?.amenities && (
                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Amenities</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{trip.hotspot.amenities}</p>
                      </div>
                    </div>
                  )}
                  {trip.hotspot?.description && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {trip.hotspot.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "carpools" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carpool Offers</h3>
                {canOfferCarpool && (
                  <button
                    onClick={() => setShowCarpoolModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
                    type="button"
                  >
                    + Offer Carpool
                  </button>
                )}
              </div>

              {trip.carpoolOffers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No carpools yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Be the first to offer a ride!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trip.carpoolOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{offer.driver.name}</h4>
                            <span className="px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full">
                              Driver
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" /> {offer.originArea}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />{" "}
                              {new Date(offer.departureTime).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {offer.notes && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{offer.notes}</p>
                          )}
                          {offer.bookings.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {offer.bookings.map((b) => (
                                <span
                                  key={b.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                                >
                                  <Users className="h-3 w-3" />
                                  {b.passenger.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-center px-4 py-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                              {offer.availableSeats}
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400">
                              / {offer.totalSeats} seats
                            </p>
                          </div>
                          {offer.driverId === trip.currentUser.id ? (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Your carpool</span>
                          ) : trip.currentUser.carpoolBooking?.offerId === offer.id ? (
                            <button
                              onClick={() => handleCarpoolCancel(offer.id)}
                              className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                              type="button"
                            >
                              Cancel Booking
                            </button>
                          ) : offer.availableSeats > 0 ? (
                            <button
                              onClick={() => handleCarpoolBook(offer.id)}
                              className="px-4 py-2 bg-forest text-sandstone rounded-lg hover:bg-forest/90 text-sm font-medium"
                              type="button"
                            >
                              Claim Seat
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg text-sm font-medium">
                              Full
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "attendees" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Attendees ({trip.rsvps.length})
              </h3>
              <div className="space-y-3">
                {trip.rsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    {rsvp.user.avatarUrl ? (
                      <img
                        src={rsvp.user.avatarUrl}
                        alt={rsvp.user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Users className="h-5 w-5 text-teal-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {rsvp.user.name}
                        {rsvp.userId === trip.currentUser.id && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rsvp.user.vehicleModel || "No vehicle listed"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rsvp.role === "HOST"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : rsvp.role === "DRIVER"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                            : rsvp.role === "PASSENGER"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {rsvp.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showCarpoolModal && (
        <CarpoolModal
          onClose={() => setShowCarpoolModal(false)}
          onSubmit={handleCarpoolCreate}
        />
      )}
    </div>
  );
}

function CarpoolModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { originArea: string; departureTime: string; totalSeats: number; notes: string }) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      await onSubmit({
        originArea: form.get("originArea") as string,
        departureTime: form.get("departureTime") as string,
        totalSeats: parseInt(form.get("totalSeats") as string),
        notes: (form.get("notes") as string) || "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Offer Carpool</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pickup Area</label>
            <input
              name="originArea"
              type="text"
              required
              placeholder="e.g., Philadelphia - 30th Street Station"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Departure Time
              </label>
              <input
                name="departureTime"
                type="datetime-local"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Seats</label>
              <input
                name="totalSeats"
                type="number"
                min="1"
                max="8"
                required
                defaultValue="3"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Space for scopes. Leaving at 3 AM."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : null}
              Create Carpool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
