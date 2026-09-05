# FlockFinder: Bird Watching, Expeditions & Carpool Community Web Application

Build a full-stack responsive web application that connects birders for field trips and expeditions, coordinates carpooling with pickup points and seat reservations, provides real-time multi-channel chat (trip chat, hotspot boards, and direct messages), offers an interactive hotspot & sighting map, and equips birders with a Smart Field Companion to log sightings and contribute to a shared trip checklist.

## System Architecture & Aligned Design Choices

From our design interview, all key technical and product requirements are established:
- **Project Directory**: `C:\Users\kibru\OneDrive\Skrivbord\Lexicon\flockFinder`
- **Product Scope**: Community birding platform with scheduled field outings, carpool coordination, multi-channel chat, interactive hotspot maps, and on-site field sighting logging.
- **Platform & Stack**: Next.js (App Router) + React 19 + Tailwind CSS + Lucide Icons + Leaflet/OpenStreetMap (`pnpm`).
- **Database & Persistence**: Local SQLite database with Prisma ORM for zero-configuration, relational persistence of users, trips, carpool seats, messages, sightings, and species.
- **Authentication & Accounts**: Standard Email/Password registration and login with secure sessions, accompanied by instant quick-login demo switcher buttons for easy testing. User profiles track Life Lists, vehicle info/seats, badges, and trip logs.
- **Expeditions & Carpools**: Hosts post outings (hotspot, target bird species, meeting time); drivers offer rides with pickup zones and seat limits; passengers reserve seats or RSVP as self-drivers; dedicated per-trip group chat.
- **Field Experience**: Smart Field Companion with 1-tap sighting logger (photo, count, notes), personal Life List tracker, and a live Collaborative Trip Checklist.
- **Chat Channels**: Trip Group Chat + Hotspot Live Boards (real-time field reports) + Direct 1-on-1 Birder Messaging.
- **Visual Aesthetic**: "Forest & Field" theme featuring earthy nature tones (deep forest green `#1B3B2B`, warm sage `#3D6B52`, sandstone `#F7F5F0` / `#1A2421`, amber highlights `#D97706`), clean card layouts, crisp typography, and light/dark theme support.

---

## User Review Required

> [!IMPORTANT]
> **Project Directory**: The workspace is active and located at:
> `C:\Users\kibru\OneDrive\Skrivbord\Lexicon\flockFinder`
> All code, configurations, and database files will be created directly within this repository.

> [!NOTE]
> **Package Manager**: The project uses `pnpm` (`pnpm-lock.yaml` is present). All dependency additions and scripts will use `pnpm add` and `pnpm run`.

---

## Proposed Changes

### Project Configuration & Database Layer

Install required dependencies (`@prisma/client`, `prisma`, `leaflet`, `@types/leaflet`, `lucide-react`, `bcryptjs`, `@types/bcryptjs`, `clsx`, `tailwind-merge`) into `C:\Users\kibru\OneDrive\Skrivbord\Lexicon\flockFinder`.

#### [MODIFY] [package.json](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/package.json)
- Add runtime dependencies: `@prisma/client`, `leaflet`, `lucide-react`, `bcryptjs`, `clsx`, `tailwind-merge`.
- Add dev dependencies: `prisma`, `@types/leaflet`, `@types/bcryptjs`.
- Add seed script: `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

#### [NEW] [prisma/schema.prisma](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/prisma/schema.prisma)
- SQLite schema defining models:
  - `User`: id, name, email, passwordHash, avatarUrl, bio, vehicleModel, vehicleSeats, city, badges, createdAt.
  - `Species`: id, commonName, scientificName, category, description, habitat, imageUrl, audioUrl, rarity, conservationStatus.
  - `Hotspot`: id, name, description, locationName, latitude, longitude, habitatType, amenities, coverImage.
  - `Trip`: id, title, description, hostId, hotspotId, date, meetingTime, meetingPoint, targetSpecies, maxParticipants, status (UPCOMING, COMPLETED, CANCELLED).
  - `CarpoolOffer`: id, tripId, driverId, originArea, departureTime, totalSeats, availableSeats, notes.
  - `CarpoolBooking`: id, offerId, passengerId, status (CONFIRMED, CANCELLED).
  - `TripRsvp`: id, tripId, userId, role (HOST, DRIVER, PASSENGER, SELF_DRIVE).
  - `Sighting`: id, userId, speciesId, hotspotId, tripId (optional), count, notes, photoUrl, latitude, longitude, spottedAt.
  - `ChatMessage`: id, senderId, tripId (optional), hotspotId (optional), recipientId (optional), content, createdAt.

#### [NEW] [prisma/seed.ts](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/prisma/seed.ts)
- Seeds initial users (Trip Leader Elena, Driver Marcus, Birding Newbie Maya), species catalog (Bald Eagle, Cedar Waxwing, Belted Kingfisher, Great Blue Heron, Pileated Woodpecker, Painted Bunting, Peregrine Falcon), top hotspots (Cape May Wetland Reserve, Central Park Ramble, Point Pelee Marshlands, Olympic Coastal Sanctuary), active upcoming trips with carpool seats, and sample sightings.

---

### Backend API Routes & Core Services

#### [NEW] [src/lib/db.ts](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/lib/db.ts)
- Global singleton Prisma client instance.

#### [NEW] [src/lib/auth.ts](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/lib/auth.ts)
- Password hashing, session cookie management, and user authentication helpers with quick-switch demo login.

#### [NEW] [src/app/api/auth/*](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/api/auth)
- `/api/auth/register`: Create new user account.
- `/api/auth/login`: Authenticate with email & password.
- `/api/auth/me`: Current session user details.
- `/api/auth/demo-switch`: 1-click switch between demo accounts for testing (Elena, Marcus, Maya).

#### [NEW] [src/app/api/trips/*](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/api/trips)
- `GET /api/trips`: List upcoming outings with carpool status and target species.
- `POST /api/trips`: Create an outing with date, hotspot, and targets.
- `GET /api/trips/[id]`: Detailed trip view (carpools, attendees, shared checklist, chat).
- `POST /api/trips/[id]/rsvp`: RSVP to a trip (self-drive or seeking carpool).
- `POST /api/trips/[id]/carpools`: Offer carpool ride (seats, pickup point).
- `POST /api/trips/[id]/carpools/book`: Reserve a seat in a carpool (instant claiming per ADR 0001).
- `POST /api/trips/[id]/carpools/cancel`: Cancel seat reservation.

#### [NEW] [src/app/api/sightings/*](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/api/sightings)
- `GET /api/sightings`: Recent sightings feed with filters by hotspot, species, or trip.
- `POST /api/sightings`: Log a new sighting (1-tap logger from field companion).

#### [NEW] [src/app/api/chat/*](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/api/chat)
- `GET /api/chat?tripId=...` / `GET /api/chat?hotspotId=...` / `GET /api/chat?recipientId=...`: Fetch messages.
- `POST /api/chat`: Send message to trip room, hotspot live board, or direct user.

#### [NEW] [src/app/api/hotspots/* & /api/species/*](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/api)
- Query hotspots and species directory with search and filter parameters.

---

### User Interface & Feature Components

#### [NEW] [src/components/Navbar.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/Navbar.tsx)
- Navigation bar with active page links (Trips & Carpools, Field Map, Species Catalog, Messages), User profile menu, Dark/Light mode toggle, and quick demo-switcher badge.

#### [NEW] [src/components/MapView.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/MapView.tsx)
- Dynamic client-only Leaflet map displaying hotspots, recent sightings pins, and planned trip destinations with custom birding markers and filter controls.

#### [NEW] [src/components/TripCard.tsx & TripDetailView.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components)
- Outing overview card showing hotspot, date, target birds, and available carpool seats.
- Outing detail view:
  - Host details and meeting schedule.
  - Carpool ride board: list of drivers, pickup neighborhoods, seat counters, and "Claim Seat" button.
  - Roster of attendees.
  - Target species badges with photos.
  - Dedicated Trip Group Chat box.

#### [NEW] [src/components/FieldCompanionModal.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/FieldCompanionModal.tsx)
- The on-site field tool:
  - 1-tap quick logger: select species, increment count, add quick observation notes, photo link.
  - Instant Life-List confirmation ("Added to your Life List!").
  - Shared Trip Checklist: live tally showing what members of this expedition have logged today with "Saw it too!" 1-click confirmation (ADR 0002).
  - Offline queue in localStorage with automatic sync (ADR 0004).

#### [NEW] [src/components/ChatBox.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/ChatBox.tsx)
- Reusable messaging component used for:
  - Trip group coordination (carpool meeting times, gear sharing)
  - Hotspot live sighting alert board (what's being seen right now)
  - 1-on-1 direct messages

#### [NEW] [src/components/SpeciesCatalog.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/SpeciesCatalog.tsx)
- Searchable species gallery with habitat filters, rarity tags, audio sound preview, and "Seen in your Life List" indicator.

#### [NEW] [src/components/UserProfileView.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/components/UserProfileView.tsx)
- Birder profile displaying personal Life List counter, vehicle information (make/model, available seats for carpooling), outings attended/hosted, and achievement badges.

---

### Pages & Routes

#### [MODIFY] [src/app/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/page.tsx)
- Landing & Community Dashboard: Hero banner, upcoming expeditions with open carpool seats, live sighting ticker, and quick action buttons ("Host a Trip", "Log Field Sighting", "Explore Hotspots").

#### [NEW] [src/app/trips/page.tsx & /trips/[id]/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/trips)
- Browse and filter outings, create new trip, and detailed trip coordinator with carpool seats, trip chat, and collaborative field checklist.

#### [NEW] [src/app/map/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/map/page.tsx)
- Full-screen interactive map with hotspots, recent sightings, and outing locations.

#### [NEW] [src/app/species/page.tsx & /hotspots/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app)
- Species field guide & Hotspot discovery directories.

#### [NEW] [src/app/messages/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app/messages/page.tsx)
- Dedicated multi-channel communications center: switch between Trip Chats, Hotspot Live Boards, and Direct Messages.

#### [NEW] [src/app/profile/page.tsx & /auth/page.tsx](file:///C:/Users/kibru/OneDrive/Skrivbord/Lexicon/flockFinder/src/app)
- Authentication (Login/Register) and User Birder Profile with Life List management.

---

## Verification Plan

### Automated Verification
1. **TypeScript Build Check**:
   - Run `pnpm run build` in `C:\Users\kibru\OneDrive\Skrivbord\Lexicon\flockFinder` to verify 0 compiler errors or syntax issues.
2. **Database Migration & Seeding**:
   - Run `pnpm exec prisma db push` and `pnpm exec prisma db seed` to ensure database tables and relationships are created and pre-populated without errors.

### Manual Verification
1. **User Authentication & Demo Switcher**:
   - Register a new account and verify session persistence.
   - Use the demo switcher to toggle between Elena (Trip Host), Marcus (Driver with 3 seats), and Maya (Newbie).
2. **Trip & Carpool Lifecycle**:
   - Create a new trip targeting specific bird species at Cape May.
   - Post a carpool offer with 3 seats from "Downtown Station".
   - Switch user to Maya and claim a seat; verify the available seat counter decrements to 2 and passenger appears.
3. **Trip Group Chat**:
   - Post a message in the trip chat as Marcus ("I have room for binoculars in the trunk"); switch user to verify the message appears.
4. **Smart Field Companion & Shared Checklist**:
   - Open Field Companion modal, log a sighting of "Belted Kingfisher" with count = 2.
   - Verify that:
     a) The species is marked on the user's personal Life List.
     b) Sighting appears on the collaborative Trip Checklist for all attendees.
     c) The sighting pin displays on the interactive map.
5. **Interactive Map & Hotspot Exploration**:
   - Navigate the Leaflet map, click hotspot markers and sighting pins, inspect popups.
6. **Responsive Layout & Theme**:
   - Verify mobile drawer and desktop top navigation.
   - Toggle dark/light theme to verify "Forest & Field" color palettes.
