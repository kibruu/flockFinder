## Problem Statement

Birders need a full-screen interactive map to explore birding hotspots, discover recent sightings in their area, and view planned expedition destinations. Without a map, users cannot visually assess proximity to hotspots, plan trips based on geographic clustering, or see real-time bird activity. The map must work on mobile (field use) and desktop, support custom birding-themed markers, show detailed popups on click, and allow filtering by layer (hotspots, sightings, expeditions).

## Solution

Build a client-side Leaflet + OpenStreetMap component (`MapView`) embedded in a new `/map` page. The map displays three toggleable layers: **Hotspots** (15+ seeded locations with custom markers), **Recent Sightings** (from the `Sighting` table, last 30 days), and **Upcoming Expeditions** (from `Trip` table, status=UPCOMING). Each marker shows a popup with context-appropriate details. Filter controls let users toggle layers, filter by species/habitat/date, and center on their location (with permission).

## User Stories

1. As a Birder planning a trip, I want to see all hotspots on a map with custom bird markers, so that I can visually identify clusters and choose a destination near me.
2. As a Birder browsing the map, I want to click a hotspot marker and see its name, habitat, amenities, and a link to view details, so that I can decide whether to visit.
3. As a Birder in the field, I want to see recent sightings (last 30 days) as radar pins on the map, so that I know what birds are currently active nearby.
4. As a Birder, I want to click a sighting pin and see the species, count, observer, date, and hotspot name, so that I can verify the observation.
5. As a Trip Host, I want upcoming expeditions to appear on the map with distinct markers, so that attendees can see the meeting location and hotspot visually.
6. As a Birder on mobile, I want the map to fill the screen with touch-friendly controls, so that I can use it in the field without a desktop.
7. As a Birder, I want to toggle layers (hotspots / sightings / expeditions) on/off, so that I can reduce clutter and focus on what I need.
8. As a Birder, I want to filter sightings by species, habitat, or date range, so that I can find specific birds I'm targeting.
9. As a Birder, I want to click "Center on Me" and have the map geolocate my position, so that I can see what's around me instantly.
10. As a Birder, I want the map to respect dark/light theme with appropriate tile layers, so that it's readable in all lighting conditions.

## Implementation Decisions

### Map Component Architecture
- **Single seam**: `MapView.tsx` client component (SSR-safe via `use client` + dynamic import or `next/dynamic` with `ssr: false`).
- **No new API routes needed** — consumes existing data:
  - Hotspots: `GET /api/hotspots` (already planned in Ticket 05, but seed data exists)
  - Sightings: `GET /api/sightings` (planned Ticket 05, seed data exists)
  - Trips: `GET /api/trips` (planned Ticket 05, seed data exists)
- **Fallback**: If APIs not yet built, fetch directly from Prisma via server actions or inline data in page (SSG/SSR) then hydrate.

### Leaflet Integration
- **Packages**: `leaflet`, `@types/leaflet` (already in deps).
- **CSS**: Import `leaflet/dist/leaflet.css` in component or globals.
- **SSR fix**: Leaflet uses `window` — use `next/dynamic(() => import('./MapView'), { ssr: false })` in `/map/page.tsx`.
- **Tile layers**: 
  - Light: OpenStreetMap standard
  - Dark: CartoDB Dark Matter (or OSM dark variant) — switch based on theme context.
- **Markers**: Custom SVGs via `L.divIcon` with bird emoji/icons (🦅 hotspot, 📍 sighting, 🚩 expedition). Color-coded by layer.

### Data Flow
1. `/map/page.tsx` (Server Component) fetches initial data for all three layers via Prisma (or API routes when ready) and passes as props to `MapView`.
2. `MapView` initializes Leaflet map on mount, adds tile layer, creates marker layers (FeatureGroups) for each data type.
3. Popups: 
   - Hotspot: name, habitat, amenities, "View Details" link → `/hotspots/[id]`
   - Sighting: species, count, observer name, date, hotspot link
   - Expedition: title, date, target species preview, "Join Trip" link → `/trips/[id]`
4. Filter controls (client-side): checkboxes for layer visibility, select for species/habitat, date picker for sightings.

### Theme Integration
- Listen to `document.documentElement.classList.contains('dark')` or React context for theme.
- Swap tile layer URL on theme change (CartoDB Dark vs OSM Standard).
- Marker icons use CSS variables (`--color-forest`, `--color-sage`, `--color-amber`) for consistency.

### Performance
- **Clustering**: Use `leaflet.markercluster` (new dep) for sightings layer when >50 points.
- **Viewport filtering**: Only render markers within current bounds (Leaflet handles this).
- **Debounced filters**: 300ms debounce on filter changes.

## Testing Decisions

### Automated Verification
1. **TypeScript Build**: `pnpm run build` — zero errors.
2. **Component renders**: `MapView` mounts without SSR errors (dynamic import verified).
3. **Data fetching**: Page loads with 15 hotspots, 90+ sightings, 5 trips from seed.

### Manual Verification (per Implementation Plan §5)
1. Navigate map — pan/zoom smooth on desktop and mobile.
2. Click hotspot marker → popup shows correct data, link navigates to hotspot detail (when built).
3. Click sighting pin → popup shows species, count, observer, date, hotspot.
4. Click expedition marker → popup shows title, date, targets, link to trip.
5. Toggle layers — markers appear/disappear instantly.
6. Filter sightings by species — only matching pins remain.
7. "Center on Me" — requests geolocation, pans to user position.
8. Dark/light theme toggle — tile layer and markers update correctly.
9. Responsive — mobile drawer doesn't overlap map, touch gestures work.

### Prior Art
- Ticket 01: Prisma schema + seed (Hotspot, Sighting, Trip models exist with GPS coordinates).
- Ticket 02: 15 hotspots, 90 sightings, 5 trips seeded with accurate lat/long.
- Ticket 03: Theme context, Navbar, client component patterns established.

## Out of Scope

- Real-time sighting updates via WebSockets/SSE (Phase 2).
- GPX/KML export of routes (Phase 2).
- Offline map tiles / PWA caching (ADR 0004 covers offline *sightings*, not map tiles).
- Routing/directions to hotspots (external links to Google/Apple Maps sufficient for MVP).
- Heatmap layer for sighting density (Phase 2).
- Clustering for hotspots (only 15, not needed).

## Further Notes

- **ADR 0004 (Offline Queue)**: Sightings logged offline via Field Companion (Ticket 08) will sync and appear on map after connectivity restored — no map changes needed.
- **API readiness**: If `/api/hotspots`, `/api/sightings`, `/api/trips` aren't built by Ticket 05, page can use server-side Prisma calls (SSG) for initial render, then client-side SWR fetch for filters.
- **Accessibility**: Map keyboard navigation (arrow keys pan, Enter opens popup), ARIA labels on filter controls, sufficient color contrast for markers in both themes.
- **Mobile-first**: Touch gestures (pinch zoom, drag) work natively via Leaflet. Filter panel collapses into bottom sheet on mobile.