## Problem Statement

Birders need to plan and coordinate group birding outings. Currently they can browse hotspots and species, but there's no way to schedule a trip with a destination, target species, meeting time, and manage participant RSVPs. The trip creation flow needs to handle destination selection (from hotspots), target species selection (from species catalog), date/time scheduling, max participants, and RSVPs with roles (host, driver, passenger, self-drive).

## Solution

Build a complete expedition planning system: a "Create Trip" form with hotspot picker, species selector, date/time picker, and participant limit; a trips listing page with filters (upcoming/past, hotspot, target species); a trip detail page showing carpool board, attendee roster, target species, and trip chat; and RSVP/carpool management endpoints.

## User Stories

1. As a Birder (Host), I want to create a new birding expedition by selecting a hotspot from the catalog, so that participants know where we're going.
2. As a Birder (Host), I want to select target species from the species catalog, so that participants know what birds we're targeting.
3. As a Birder (Host), I want to set a date, meeting time, and meeting point, so that everyone knows when and where to gather.
4. As a Birder (Host), I want to set a maximum participant count, so that the trip doesn't get overcrowded.
5. As a Birder (Participant), I want to browse upcoming trips with filters (date range, hotspot, target species), so that I can find trips that match my interests.
6. As a Birder (Participant), I want to RSVP to a trip with my role (self-drive, passenger, driver), so that the host knows my transportation plans.
7. As a Birder (Driver), I want to offer a carpool with pickup location, departure time, and seat count, so that passengers can book seats.
8. As a Birder (Passenger), I want to book a seat in a carpool, so that I get a ride to the hotspot.
9. As a Birder (Host), I want to see a roster of all attendees with their roles, so that I can manage the trip.
10. As a Birder (Participant), I want to see target species with photos on the trip detail page, so that I know what to look for.
11. As a Birder (Host), I want to cancel a trip, so that participants are notified (ADR 0005).
12. As a Birder (Passenger), I want to cancel my carpool seat, so that the seat becomes available for others.

## Implementation Decisions

### Database Schema (already exists from Ticket 01)
- `Trip`: id, title, description, hostId, hotspotId, date, meetingTime, meetingPoint, targetSpecies (JSON string of species IDs), maxParticipants, status (UPCOMING/COMPLETED/CANCELLED), createdAt, updatedAt
- `TripRsvp`: id, tripId, userId, role (HOST/DRIVER/PASSENGER/SELF_DRIVE), createdAt
- `CarpoolOffer`: id, tripId, driverId, originArea, departureTime, totalSeats, availableSeats, notes, createdAt, updatedAt
- `CarpoolBooking`: id, offerId, passengerId, status (CONFIRMED/CANCELLED), createdAt

### API Routes
- `GET /api/trips` — list trips with filters (status, hotspotId, dateFrom, dateTo, speciesId), pagination
- `POST /api/trips` — create trip (auth required, host = current user)
- `GET /api/trips/[id]` — trip detail with carpools, RSVPs, target species, chat messages
- `POST /api/trips/[id]/rsvp` — RSVP to trip (role: SELF_DRIVE, PASSENGER, DRIVER)
- `POST /api/trips/[id]/carpools` — create carpool offer (auth required, driver = current user)
- `POST /api/trips/[id]/carpools/book` — book seat in carpool (instant claiming per ADR 0001)
- `POST /api/trips/[id]/carpools/cancel` — cancel seat booking
- `POST /api/trips/[id]/cancel` — cancel trip (host only, per ADR 0005)

### UI Components
- `TripCard.tsx` — trip summary card: hotspot, date, target species badges, available carpool seats, RSVP button
- `TripDetailView.tsx` — full trip view: host info, meeting schedule, carpool board (drivers, pickup areas, seat counters, "Claim Seat"), attendee roster, target species with photos, trip group chat
- `TripForm.tsx` — create/edit trip: hotspot autocomplete, species multi-select, date/time pickers, max participants
- `TripsPage.tsx` — listing with filters (upcoming/past, hotspot, species, date range), "Create Trip" button
- `CarpoolBoard.tsx` — list of carpool offers with seat counters, "Offer Ride" / "Claim Seat" actions

### Pages
- `/trips` — browse/filter trips, "Create Trip" button
- `/trips/new` — create trip form (auth required)
- `/trips/[id]` — trip detail view

### Date Filter Options (from Ticket 04 learnings)
- Only support "Last 7 days", "Last 30 days" (matches API data retention)
- No "All time" or "90 days" options

### Theme Integration
- Use CSS variables (`--color-forest`, `--color-sage`, `--color-amber`) for consistent styling
- Dark/light mode support throughout

## Testing Decisions

### Automated Verification
1. `pnpm run build` — TypeScript build passes
2. `pnpm exec prisma db seed` — seed data includes trips with carpools and RSVPs
3. API contract tests:
   - `POST /api/trips` creates trip with all fields
   - `GET /api/trips` returns filtered results
   - `POST /api/trips/[id]/rsvp` creates RSVP with correct role
   - `POST /api/trips/[id]/carpools` creates carpool offer
   - `POST /api/trips/[id]/carpools/book` books seat, decrements availableSeats
   - `POST /api/trips/[id]/carpools/cancel` restores availableSeats

### Manual Verification
1. Create trip as Elena (Host) — select hotspot, 3 target species, date/time, max 10
2. RSVP as Marcus (Driver) — offer carpool with 3 seats from Philadelphia
3. RSVP as Maya (Passenger) — book seat in Marcus's carpool
4. Verify trip detail shows: carpool board with 2/3 seats, roster with roles
5. Verify target species badges show photos
6. Test filters on `/trips` page (upcoming, hotspot, species)
7. Verify dark/light theme on all trip pages
8. Verify mobile responsive layout

### Prior Art
- Ticket 01: Prisma schema, seed data
- Ticket 02: 66 species, 15 hotspots seeded
- Ticket 03: Auth, session management, demo switcher
- Ticket 04: MapView, dynamic import pattern, filter components

## Out of Scope
- Real-time chat during trip (Ticket 07)
- Field Companion sighting logging during trip (Ticket 08)
- Trip cancellation email notifications (phase 2)
- Waitlist for full trips (phase 2)
- Recurring trips (phase 2)
- Trip templates (phase 2)

## Further Notes
- ADR 0001: Instant carpool seat claiming — first come, first served, no hold
- ADR 0005: Trip cancellation lifecycle — host can cancel, participants notified, carpool seats released
- The trip detail page reuses `ChatBox.tsx` for trip group chat (Ticket 07)
- Carpool seat booking uses instant claiming (no pending state)
- Trip status transitions: UPCOMING → COMPLETED (auto after date) or CANCELLED (host action)
- Target species stored as JSON array of species IDs for flexible querying