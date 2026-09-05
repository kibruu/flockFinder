# Wayfinder Map: FlockFinder

## Destination

A fully functional full-stack web application running locally with Next.js, SQLite/Prisma, Leaflet maps, live expedition & carpool coordination, multi-channel chat, and an on-site field companion with collaborative trip checklists.

## Notes

- **Domain**: Bird watching, social expeditions, carpool coordination, field sighting logs.
- **Tech Stack**: Next.js App Router, React, Tailwind CSS, Lucide Icons, Leaflet/OpenStreetMap, SQLite with Prisma ORM.
- **Aesthetic**: Forest & Field nature theme (earthy greens, warm neutrals, amber accents, dark/light mode).
- **Domain Docs**: [CONTEXT.md](file:///C:/Users/kibru/.gemini/antigravity/brain/c026ce68-9ba5-4930-9c42-234969e7c8b5/CONTEXT.md), [ADR 0001](file:///C:/Users/kibru/.gemini/antigravity/brain/c026ce68-9ba5-4930-9c42-234969e7c8b5/docs/adr/0001-carpool-instant-booking.md), [ADR 0002](file:///C:/Users/kibru/.gemini/antigravity/brain/c026ce68-9ba5-4930-9c42-234969e7c8b5/docs/adr/0002-collaborative-sighting-confirmation.md).
- **Tracker**: Wayfinder local-markdown map and tickets.

## Decisions so far

- [ADR 0001: Instant Carpool Seat Claiming](file:///C:/Users/kibru/.gemini/antigravity/brain/c026ce68-9ba5-4930-9c42-234969e7c8b5/docs/adr/0001-carpool-instant-booking.md): Seats are claimed first-come, first-served up to vehicle limit, with driver reservation management.
- [ADR 0002: Collaborative Sighting Confirmation](file:///C:/Users/kibru/.gemini/antigravity/brain/c026ce68-9ba5-4930-9c42-234969e7c8b5/docs/adr/0002-collaborative-sighting-confirmation.md): Group sightings populate a live shared trip checklist; individual members tap "Saw it too!" to update their personal Life Lists.
- Multi-channel communication settled: Trip Group Chat + Hotspot Live Boards + Direct Birder Messages.
- Multi-layer interactive map settled: Hotspots + Upcoming Expeditions + Recent Sightings.

## Frontier (Ready to Claim)

- **[01-project-scaffolding-and-data-schema]**: Initialize Next.js app in scratch workspace, configure Tailwind CSS, and build Prisma relational schema (`User`, `Species`, `Hotspot`, `Trip`, `CarpoolOffer`, `CarpoolBooking`, `TripRsvp`, `Sighting`, `ChatMessage`).

## Blocked Tickets

- **[02-naturalist-catalog-and-seed-data]** (Blocked by 01): Pre-populate rich bird catalog (calls, photos, habitat) and regional hotspots.
- **[03-auth-and-birder-profiles]** (Blocked by 01, 02): Registration, session login, demo persona quick-switcher, and Life List counters.
- **[04-interactive-map-and-hotspot-explorer]** (Blocked by 01, 02): Leaflet map rendering hotspots, sighting pins, and expedition destinations with custom birding markers.
- **[05-expedition-planning-and-outings]** (Blocked by 01, 02, 03): Outing creator, target species selector, and participant RSVPs.
- **[06-carpool-ride-coordination]** (Blocked by 05): Ride offer posting, pickup zones, instant seat reservation claims, and live seat count tally.
- **[07-multi-channel-messaging]** (Blocked by 03, 05): Dedicated Trip Group Chat, on-site Hotspot Live alert boards, and 1-on-1 direct messages.
- **[08-field-companion-and-shared-checklist]** (Blocked by 02, 05): 1-tap on-site sighting logger, personal life list updates, and collaborative group trip checklist.

## Not yet specified (Fog of War)

- Audio spectrogram and waveform player for bird call analysis.
- Offline PWA caching for remote birding sites with low cellular reception.
- Exporting expedition checklists to eBird CSV / Darwin Core format.
- Sunrise/sunset and birding weather conditions widget on hotspot pages.

## Out of scope

- Real-money payment processing for rides (carpooling is volunteer-based ride sharing).
- Native iOS/Android App Store packages (responsive mobile web / PWA is the target).
