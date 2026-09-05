## Problem Statement

The FlockFinder codebase currently exists only as a baseline Next.js scaffold with no database, no domain models, and no project infrastructure. We need to establish the foundational layer: a configured Next.js 16 project with Tailwind CSS v4, a Prisma ORM schema modeling all core domain entities (Birder, Hotspot, Expedition, Carpool Offer, Seat Reservation, Sighting, Shared Trip Checklist), and a seeded SQLite database with demo personas and reference data. Without this foundation, no feature work can begin.

## Solution

Initialize the project with all required dependencies, configure Tailwind v4 with the "Forest & Field" design tokens, define a complete Prisma schema for the domain, create a seed script that populates the database with the three canonical personas (Elena — Trip Leader, Marcus — Driver, Maya — Beginner), a catalog of bird species, regional hotspots, and sample expeditions with carpool seats. Verify the setup with TypeScript build, database migration, and seed execution.

## User Stories

1. As a developer, I want a fully configured Next.js 16 project with Tailwind v4 and TypeScript, so that I can start building features immediately without configuration overhead.
2. As a developer, I want a Prisma schema that models all core domain entities (User, Species, Hotspot, Trip, CarpoolOffer, CarpoolBooking, TripRsvp, Sighting, ChatMessage) with correct relations, so that the database layer accurately reflects the domain model in CONTEXT.md.
3. As a developer, I want a seed script that creates the three demo personas (Elena, Marcus, Maya) with their vehicles, a species catalog (Bald Eagle, Cedar Waxwing, Belted Kingfisher, Great Blue Heron, Pileated Woodpecker, Painted Bunting, Peregrine Falcon), four hotspots (Cape May Wetland Reserve, Central Park Ramble, Point Pelee Marshlands, Olympic Coastal Sanctuary), and active upcoming trips with carpool seats, so that I can manually verify the full data model and demo the application immediately.
4. As a developer, I want the "Forest & Field" design tokens (Forest Deep #1B3B2B, Sage #3D6B52, Sandstone #F7F5F0/#1A2421, Amber Gold #D97706, Sky Blue #0284C7) configured as CSS variables in globals.css and mapped to Tailwind utilities, so that all subsequent UI components consume consistent design tokens.
5. As a developer, I want Inter and Plus Jakarta Sans fonts loaded via next/font and exposed as CSS variables, so that typography matches the UI_SPECIFICATION.md.
6. As a developer, I want a singleton Prisma client in src/lib/db.ts, so that all server components and API routes share a single database connection.
7. As a developer, I want pnpm scripts for prisma db push, prisma db seed, and build verification, so that the setup can be validated in CI and locally with one command.

## Implementation Decisions

- **Package Manager**: pnpm (per package.json and pnpm-workspace.yaml)
- **Framework**: Next.js 16.3.4 with App Router, React 19.2.8
- **Styling**: Tailwind CSS v4 with @theme inline for design token mapping
- **Database**: SQLite with Prisma ORM (zero-config, file-based, ideal for local development)
- **Schema Location**: prisma/schema.prisma at repo root
- **Seed Location**: prisma/seed.ts at repo root, executed via `prisma db seed`
- **Prisma Client**: Singleton pattern in src/lib/db.ts to prevent multiple instances in development
- **Design Tokens**: Defined as CSS variables in :root and @media (prefers-color-scheme: dark) in app/globals.css, mapped to Tailwind via @theme inline
- **Fonts**: Inter (sans) and Plus Jakarta Sans (display) via next/font/google with CSS variable exports
- **Dependencies to Add**:
  - Runtime: @prisma/client, leaflet, lucide-react, bcryptjs, clsx, tailwind-merge
  - Dev: prisma, @types/leaflet, @types/bcryptjs, ts-node (for seed script)
- **Prisma Models** (per IMPLEMENTATION_PLAN.md):
  - User: id, name, email, passwordHash, avatarUrl, bio, vehicleModel, vehicleSeats, city, badges, createdAt
  - Species: id, commonName, scientificName, category, description, habitat, imageUrl, audioUrl, rarity, conservationStatus
  - Hotspot: id, name, description, locationName, latitude, longitude, habitatType, amenities, coverImage
  - Trip: id, title, description, hostId, hotspotId, date, meetingTime, meetingPoint, targetSpecies, maxParticipants, status (UPCOMING, COMPLETED, CANCELLED)
  - CarpoolOffer: id, tripId, driverId, originArea, departureTime, totalSeats, availableSeats, notes
  - CarpoolBooking: id, offerId, passengerId, status (CONFIRMED, CANCELLED)
  - TripRsvp: id, tripId, userId, role (HOST, DRIVER, PASSENGER, SELF_DRIVE)
  - Sighting: id, userId, speciesId, hotspotId, tripId (optional), count, notes, photoUrl, latitude, longitude, spottedAt
  - ChatMessage: id, senderId, tripId (optional), hotspotId (optional), recipientId (optional), content, createdAt
- **Relations**: User 1-n Trip (host), User 1-n CarpoolOffer (driver), User 1-n CarpoolBooking (passenger), User 1-n TripRsvp, User 1-n Sighting, User 1-n ChatMessage (sender), Trip 1-n CarpoolOffer, Trip 1-n TripRsvp, Trip 1-n ChatMessage, Trip 1-n Sighting, CarpoolOffer 1-n CarpoolBooking, Hotspot 1-n Trip, Hotspot 1-n Sighting, Species 1-n Sighting
- **ADR Compliance**: Schema supports ADR 0001 (instant carpool seat claiming via availableSeats counter), ADR 0002 (collaborative sighting confirmation via Sighting linked to Trip), ADR 0004 (offline queue via localStorage — schema unchanged), ADR 0005 (Trip status enum), ADR 0006 (RSC by default — schema unchanged)

## Testing Decisions

- **Philosophy**: Test external behavior only — database operations, seed data integrity, build success. No unit tests for configuration files.
- **Automated Verification**:
  1. `pnpm run build` — TypeScript compilation succeeds with zero errors
  2. `pnpm exec prisma db push` — Schema applies to SQLite without errors
  3. `pnpm exec prisma db seed` — Seed script executes, creates all demo data without errors
  4. Verify seeded data via Prisma Studio or query: 3 users, 7 species, 4 hotspots, at least 2 trips with carpool offers
- **Manual Verification**:
  1. Run `pnpm dev` and confirm the app loads at localhost:3000
  2. Open Prisma Studio (`pnpm exec prisma studio`) and inspect all tables for seeded data
  3. Verify design tokens render correctly by checking CSS variables in browser dev tools
  4. Verify fonts load (Inter, Plus Jakarta Sans) in browser dev tools
- **Prior Art**: None — this is the first code in the repository. Future tickets will follow patterns established here.

## Out of Scope

- Any API routes (auth, trips, sightings, chat, hotspots, species) — covered in subsequent tickets
- Any UI components (Navbar, MapView, TripCard, FieldCompanionModal, ChatBox, SpeciesCatalog, UserProfileView) — covered in subsequent tickets
- Any pages beyond the default app/page.tsx scaffold — covered in subsequent tickets
- Authentication implementation (register, login, session, demo switcher) — Ticket 03
- Leaflet map integration — Ticket 04
- Real-time chat infrastructure — Ticket 07
- Offline queue / PWA — Phase 2 (ADR 0004 mentions localStorage queue but implementation is later)

## Further Notes

- This ticket is the **unblocker for all other tickets** (see WAYFINDER_MAP.md dependency graph).
- The Prisma schema is the single source of truth for the domain model. Subsequent tickets must not diverge from it without an ADR.
- Design tokens in globals.css must match UI_SPECIFICATION.md exactly. Any changes require updating both.
- The seed data should be idempotent (safe to re-run) using upsert where appropriate.
- The demo personas (Elena, Marcus, Maya) correspond to the three core personas in USER_STORIES.md and must have the correct vehicle/seat data for carpool testing.
- After this ticket, the database is ready for API route development (Tickets 03, 05, 06, 07, 08).