export interface TripListItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  meetingTime: string;
  meetingPoint: string;
  targetSpecies: { id: string; commonName: string; imageUrl: string | null }[];
  maxParticipants: number | null;
  status: string;
  host: { id: string; name: string; avatarUrl: string | null } | null;
  hotspot: { id: string; name: string; locationName: string; latitude: number; longitude: number; coverImage: string | null } | null;
  rsvpCount: number;
  carpoolCount: number;
}

export interface TripDetail {
  id: string;
  title: string;
  description: string | null;
  date: string;
  meetingTime: string;
  meetingPoint: string;
  targetSpecies: { id: string; commonName: string; scientificName: string; imageUrl: string | null; category: string; rarity: string }[];
  maxParticipants: number | null;
  status: string;
  host: { id: string; name: string; avatarUrl: string | null; bio: string | null; city: string | null } | null;
  hotspot: { id: string; name: string; description: string | null; locationName: string; latitude: number; longitude: number; habitatType: string; amenities: string | null; coverImage: string | null } | null;
  rsvps: { id: string; userId: string; role: string; createdAt: string; user: { id: string; name: string; avatarUrl: string | null; vehicleModel: string | null; vehicleSeats: number | null } }[];
  carpoolOffers: { id: string; driverId: string; originArea: string; departureTime: string; totalSeats: number; availableSeats: number; notes: string | null; createdAt: string; updatedAt: string; driver: { id: string; name: string; avatarUrl: string | null; vehicleModel: string | null; vehicleSeats: number | null }; bookings: { id: string; passengerId: string; status: string; createdAt: string; passenger: { id: string; name: string; avatarUrl: string | null } }[] }[];
  currentUser: {
    id: string;
    rsvp: { role: string; createdAt: string } | null;
    carpoolBooking: { offerId: string; status: string; createdAt: string } | null;
    carpoolOffer: { id: string; availableSeats: number } | null;
  };
}
