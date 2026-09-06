## Problem Statement

Birders need secure authentication to access personalized features: creating trips, joining carpools, logging sightings, and maintaining a personal Life List. The app also needs a frictionless way for developers and testers to switch between predefined personas (Trip Host Elena, Driver Marcus, Newbie Maya) during development and demos, without repeatedly logging in/out.

## Solution

Implement a complete authentication system with email/password registration and login, secure HttpOnly session cookies, and a 1-click demo persona switcher. Extend user profiles with birder-specific fields (Life List counter, vehicle info for carpooling, badges) and provide a profile management UI.

## User Stories

1. As a new Birder, I want to register with my name, email, and password, so that I can create a personal account and start building my Life List.
2. As a registered Birder, I want to log in with my email and password, so that I can access my personalized dashboard and trip history.
3. As a Birder, I want my session to persist across browser restarts, so that I don't have to log in every time I visit the site.
4. As a Birder, I want to log out securely, so that my session is destroyed and no one else can access my account on this device.
5. As a Developer, I want to instantly switch between demo personas (Elena, Marcus, Maya) with one click, so that I can test different user roles and permissions without manually logging in/out.
6. As a Birder, I want to view and edit my profile (name, bio, city), so that other birders can learn about me.
7. As a Birder with a vehicle, I want to specify my vehicle model and available seats, so that I can offer carpool rides to trips.
8. As a Birder, I want to see my Life List count and species details, so that I can track my birding achievements.
9. As a Birder, I want to see my badges and trip statistics (trips joined, trips hosted, total sightings), so that I feel recognized for my contributions.
9. As a Birder, I want a persistent navigation bar with dark/light theme toggle, so that I can navigate the app easily in any lighting condition.

## Implementation Decisions

### Database Schema
- Added `Session` model with `id`, `userId`, `expiresAt`, `createdAt`, and relation to `User` (cascade delete).
- `User` model already had: `name`, `email`, `passwordHash`, `avatarUrl`, `bio`, `city`, `vehicleModel`, `vehicleSeats`, `badges`, `createdAt`.
- `User.badges` stored as JSON string array (e.g., `["Trail Leader", "Early Bird"]`).
- Added `@@index([userId])` on Session for fast lookups.

### Auth Library (`src/lib/auth.ts`)
- **Password security**: bcryptjs with cost factor 12 for hashing; constant-time comparison for verification.
- **Session management**: UUID session tokens stored in database with 30-day expiry; HttpOnly, Secure (production), SameSite=Lax cookies.
- **Session cookie name**: `flockfinder_session`.
- **Demo switcher**: Predefined emails for `elena`, `marcus`, `maya`; `switchDemoUser()` creates new session and sets cookie atomically.
- **Life List counter**: `getLifeListCount(userId)` uses `groupBy` on `Sighting.speciesId` for distinct species count.
- **Cookie helpers**: `setSessionCookie()`, `clearSessionCookie()` use Next.js `cookies()` API (async in Next 15).

### API Routes
- `POST /api/auth/register` — creates user, hashes password, creates session, sets cookie, returns user session.
- `POST /api/auth/login` — verifies credentials, creates session, sets cookie, returns user session.
- `GET /api/auth/me` — reads session cookie, validates against DB, returns `UserSession` or 401.
- `POST /api/auth/demo-switch` — accepts `{ demo: "elena"|"marcus"|"maya" }`, switches session, returns new user session.
- `POST /api/auth/logout` — deletes session from DB, clears cookie.
- `GET /api/profile` — returns user profile, Life List with species details, and stats (total sightings, life list count, trips joined, trips hosted).
- `PATCH /api/profile` — updates `name`, `bio`, `city`, `vehicleModel`, `vehicleSeats` (validated 0-8).

### UI Components
- **Navbar** (`src/components/Navbar.tsx`):
  - Responsive: desktop horizontal nav + mobile hamburger drawer.
  - Links: Trips & Carpools, Field Map, Species Catalog, Hotspots, Messages.
  - Dark/light theme toggle (persists to localStorage, respects system preference).
  - User avatar menu (profile link, logout) when authenticated; Sign In/Register buttons when not.
  - Demo switcher bar: 3 persona buttons showing current user highlight; disabled during switch.
- **Auth Page** (`src/app/auth/page.tsx`):
  - Unified login/register form toggled by `?mode=` query param.
  - Client-side validation (required fields, email format, password min 8 chars, confirm match).
  - Show/hide password toggle.
  - Demo quick-access buttons (Elena, Marcus, Maya) call `/api/auth/demo-switch`.
  - Success toast with auto-redirect to home.
- **Profile Page** (`src/app/profile/page.tsx`):
  - Tabbed interface: Overview, Life List, Vehicle, Badges.
  - Overview: editable name/bio/city, member-since date.
  - Life List: species cards with photo, scientific name, category, sighting count, last spotted date/location.
  - Vehicle: editable model + seat count (for carpool offers).
  - Badges: chip-style display from `user.badges`.
  - Stats sidebar: Life List count, total sightings, trips joined, trips hosted.
  - Edit mode toggle with Cancel/Save actions.

### Hooks (`src/hooks/useAuth.ts`)
- `useSession()` — fetches `/api/auth/me` on mount, exposes `user`, `loading`, `setUser()`.
- `useDemoSwitch()` — calls `/api/auth/demo-switch`, updates local user state, tracks `switching` state for UI feedback.
- `useAuth()` — combines both for convenience.

### Layout Integration
- Updated `app/layout.tsx` to include `<Navbar />` wrapper around `<main>`.
- Extended `globals.css` with semantic color tokens (`--color-forest`, `--color-sage`, `--color-sandstone`, `--color-amber`) used by components.

### Configuration
- `tsconfig.json` paths: `@/*` maps to both `./*` and `./src/*` for import resolution.
- `.env` uses absolute path `DATABASE_URL="file:C:/.../prisma/dev.db"` for reliable SQLite access from any working directory.

## Testing Decisions

### Automated Verification
1. **TypeScript Build**: `pnpm run build` — zero compiler errors.
2. **Database Migration & Seed**: `pnpm exec prisma db push` + `pnpm exec prisma db seed` — tables created, 3 demo users + 66 species + 15 hotspots + 5 trips + 5 carpools + 90 sightings inserted idempotently (verified 3× runs).
3. **Session CRUD**: Manual verification of register → login → me → demo-switch → logout flow.

### Manual Verification (per Implementation Plan)
1. Register new account → verify session persists on refresh.
2. Use demo switcher to toggle between Elena (Trip Host), Marcus (Driver with 3 seats), Maya (Newbie).
3. Create trip as Elena → post carpool offer as Marcus → switch to Maya → claim seat → verify seat counter decrements.
4. Post message in trip chat as Marcus → switch to Elena → verify message appears.
5. Open profile → edit name/bio/city/vehicle → save → verify persistence.
6. Verify Life List tab shows species from seeded sightings.
7. Toggle dark/light theme → verify persistence across reloads.
8. Mobile: hamburger menu opens/closes, nav links work.

### Prior Art
- Ticket 01: Prisma schema + seed pattern (idempotent upserts, progress logging).
- Ticket 02: Extended seed with 66 species, 15 hotspots, 5 trips, 90 sightings.

## Out of Scope

- OAuth / social login (Google, GitHub, etc.) — Phase 2.
- Password reset / email verification — Phase 2.
- Two-factor authentication (2FA) — Phase 2.
- Session revocation UI (view/manage active sessions) — Phase 2.
- Avatar upload (currently uses DiceBear placeholder) — Phase 2.
- Real-time session sync across tabs (broadcastChannel) — Phase 2.
- Role-based access control (RBAC) beyond demo personas — Phase 2.

## Further Notes

- The demo switcher is a developer/testing feature; in production it should be gated behind a feature flag or removed.
- Session tokens are UUIDs; consider JWT for stateless scaling if needed later.
- Life List count uses distinct `speciesId` from `Sighting`; matches eBird convention.
- Badges are free-form strings; future work could formalize badge definitions with criteria.
- Theme preference stored in localStorage; no server-side persistence yet.
- All API routes return consistent JSON shape: `{ user: UserSession }` or `{ error: string }` with appropriate HTTP status.