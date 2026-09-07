# 08: Smart Field Companion & Shared Checklist — Spec

## Problem Statement

Birders on-site at an expedition currently have no fast way to record an observation. There is no quick 1-tap sighting logger, no way to check a sighting against your personal Life List, and no shared view of what the group has collectively seen that day. When a birder spots a bird in poor cellular coverage, they risk losing the observation entirely. Trip leaders and attendees cannot see the group's running tally of the day's finds in one place.

## Solution

Add a mobile-first **Smart Field Companion** bottom drawer (accessible from any screen via a floating action button) for 1-tap sighting logging: autocomplete species search, a count stepper, notes, and photo URL, all backed by an offline-first queue (ADR 0004). Logged sightings automatically increment the birder's personal Life List when the species is new to them. On an active expedition, an attendee's log also populates a **live Shared Trip Checklist** — a per-trip tally of every species the group logged that day, with a 1-click **"Saw it too!"** verification that records the verifier's own observation (ADR 0002), thereby bumping only their own Life List.

During an active expedition for which the user is an attendee, the Field Companion surfaces the trip's target species as quick picks and shows the day's collective find on the trip detail page.

## User Stories

1. As a Birder in the field, I want to open a quick logger drawer from any screen, so that I can record an observation without interrupting my birding.
2. As a Birder, I want to tap/type to autocomplete-search the species catalog, so that I can find the bird I just saw in seconds.
3. As a Birder, I want a count stepper that defaults to 1, so that I can log how many individuals I observed.
4. As a Birder, I want to add optional field notes, so that I can remember details like behavior or plumage.
5. As a Birder, I want to attach an optional photo URL, so that I can link visual evidence of the observation.
6. As a Birder, I want a one-click submit, so that my sighting is recorded immediately without extra steps.
7. As a Birder, I want my new species to automatically be added to my personal Life List when I log it, so that my profile reflects my verified finds.
8. As a Birder, I want a confirmation on submit ("Added to your Life List!") when the species is new to me, so that I know my list grew.
9. As a Birder, I want to know when a logged species is already on my Life List, so that I don't double-count it in my head.
10. As a Birder, I want my life list counter to go up the moment I log, even before a network round-trip, so that I get instant feedback in the field.
11. As a Birder, I want to log a sighting even when offline, so that a drop in connectivity in a nature reserve never loses my observation.
12. As a Birder, I want offline sightings to show a "Pending Sync" indicator, so that I understand they have not reached the server yet.
13. As a Birder, I want queued sightings to sync automatically when connectivity is restored, so that I do not have to retry manually.
14. As an Expedition Member, I want to see a live Shared Trip Checklist of every species the group has logged today, so that I can see our collective haul.
15. As an Expedition Member, I want the checklist to show who first spotted each species and when, so that I can credit the finder.
16. As an Expedition Member, I want to see the group sighting immediately on my screen when another attendee logs it, so that the tally stays live for everyone.
17. As an Expedition Member, I want a one-click "Saw it too!" button on a checklist entry, so that I can record that I also observed that species.
18. As an Expedition Member, I want "Saw it too!" to add the species to my own Life List, so that my personal list stays accurate without inflating anyone else's.
19. As an Expedition Member, I want to see which checklist entries I have already verified, so that I do not verify them twice.
20. As an Expedition Member, I want "Saw it too!" to work when I have connectivity, and to tell me clearly when it could not be recorded, so that I never silently miss verifying a species in bad coverage.
21. As a Trip Host, I want the shared checklist to persist for the trip, so that a late-joining attendee can see the day's findings.
22. As a Trip Host, I want the checklist to be read-only to confirmed attendees, so that only group members see our shared observations.
23. As a Birder, I want to log a sighting with a location (hotspot/coordinates), so that it appears correctly on the interactive map.
24. As a Birder, I want my logged observation to appear as a pin on the map, so that the community sees what's being found.
25. As a non-member Birder viewing a hotspot, I want public recent sightings to remain visible, so that non-attendees can still see field activity.
26. As a guest or non-attendee, I want the trip checklist to be hidden from me, so that expedition findings stay private to the group.

## Implementation Decisions

- **Seam (single place behavior is tested):** the **sightings API route handlers**, consistent with the carpool (#6) and messaging (#7) capstones. All invariants — session requirement, species/count/location validation, trip-attendee restriction for the shared checklist, and the "Saw it too!" verify semantics — live behind these handlers. The client (Field Companion drawer, checklist UI, offline queue) is thin view state fed by these handlers.
- **Data model:** reuse the existing `Sighting` model — no new tables. The `tripId` column (already present, nullable) links a sighting to a trip; where `tripId` is set the sighting contributes to that trip's Shared Checklist. The personal Life List is already derived from `Sighting.userId` via the existing profile life-list query, so a normal sighting create automatically bumps Life List on first sighting of a species (no separate bookkeeping).
- **"Saw it too!" (ADR 0002):** creating an entry on a trip checklist does **not** auto-increment any attendee's Life List. Verification = the verifying attendee creates their **own** `Sighting` for that species, tagged with the same `tripId` and the current hotspot; this bumps only the verifier's Life List and adds to the checklist's verified tally. The checklist aggregates: for each species, the first attendee who logged it (finder name + time) and how many attendees have also verified it. A user who already has a sighting for that species on the trip already "verified" it and the button is suppressed for them.
- **Schema addition:** an index on `Sighting(tripId, spottedAt)` to keep the live checklist/filter queries fast; the existing species/hotspot/user associations remain.
- **API surface:**
  - `POST /api/sightings` — create a sighting. Requires a session. Body: `{ speciesId, count (default 1), notes?, photoUrl?, hotspotId?, latitude, longitude, tripId? }`. Validates species existence (404 if unknown), count >= 1, and that `tripId` refers to an existing trip where the user is a confirmed attendee (rsvp exists) and the trip is not `CANCELLED` (403/400). Returns the created sighting plus `isNewToLifeList` (whether this species is the user's first).
  - `GET /api/sightings` — recent sightings feed for the map, with optional `tripId`/`hotspotId`/`speciesId` filters (supersedes the current map's inline query, keeping one source of truth).
  - `GET /api/trips/[id]/checklist` — the Shared Trip Checklist for a trip. Requires the caller to be a confirmed attendee of the trip (403 otherwise, 404 if the trip is missing). Returns a live view: for each distinct species logged on the trip, `{ species, firstSpottedBy, firstSpottedAt, count, verifierCount, currentUserVerified }`, ordered by most recent first.
  - `POST /api/trips/[id]/checklist/verify` — the "Saw it too!" action. Body: `{ speciesId }`. Requires the caller to be a confirmed attendee of an active (non-cancelled) trip. Creates the caller's own `Sighting` for that species on the trip and hotspot, memoized so calling twice is safe (idempotent: a prior verify for that species + trip is a no-op that returns the existing verification).
- **Offline queue (ADR 0004):** the Field Companion's create flow writes the sighting to a `localStorage` queue first and optimistically updates the Life List view with a "Pending Sync" badge. When the app detects connectivity (online `window` event, polled), the queue flushes each pending sighting in order to `POST /api/sightings`; on success the badge clears; on failure it retries next flush. The queue is per-sender and survives reloads.
- **Field Companion UI:** a bottom drawer (mobile-first) / modal (desktop) opened from a floating action button rendered on logged-in screens and from the trip detail page. Steps: (1) autocomplete species search (reusing the species catalog list that already feeds forms) with the active trip's target species surfaced as quick picks; (2) count stepper defaulting to 1; (3) notes + photo URL; (4) one-click submit. On submit the sighting is enqueued (or POSTed when online) and a confirmation shows whether the species was "Added to your Life List!".
- **Trip detail integration:** the trip detail page gains the **Shared Field Checklist** as a tab (alongside Details / Carpools / Attendees / Trip Chat / and the attendee-only Trip Chat), shown only to confirmed attendees, backed by `GET /api/trips/[id]/checklist` with live polling (reusing the same `after`-less refresh interval and visibility-pause approach established for messaging). The host and any attendee sees live group sightings with the "Saw it too!" button.
- The map keeps showing public recent sightings; its data source is moved behind `GET /api/sightings` so a field-companion log appears on the map immediately (or on next poll).

## Testing Decisions

- **What makes a good test:** only external behavior through route handlers — never implementation details like which Prisma call is used. Assert HTTP status codes and the returned JSON in terms a user sees (e.g. "Life List grew", "checklist shows 2 verifiers", "non-attendee rejected").
- **Modules tested:** the sightings and checklist route handlers via API smoke scripts, exactly like the carpool (`carpool-smoke.ps1`) and messaging (`chat-smoke.ps1`) prior art. The Field Companion drawer and checklist tab are exercised with the headless-Chrome CDP harness (`cdp-*.js`) that already drives the app for #6 and #7.
- **Authorization matrix to assert:**
  - Create sighting: guest → 401; unknown species → 404; unknown hotspot → 404; count < 1 → 400; attending a cancelled trip when logging with `tripId` → 400; logging on a trip the user is not attending → 403; valid log as an attendee → 201 and `isNewToLifeList` true on first sighting of a species.
  - Checklist read: guest → 401; non-attendee → 403; missing trip → 404; attendee → 200 with grouped species, finder identity, timestamps, and verifier counts.
  - Verify: guest → 401; non-attendee → 403; cancelled trip → 400; unknown species → 404; first verify → 201 and the responder's Life List grows; duplicate verify → idempotent (no extra Life List entry, verifierCount unchanged); verify on a species the user already logged on that trip → no-op.
  - Offline queue: POST a sighting while the network is blocked, assert it is stored in `localStorage` with a "Pending Sync" badge and the local Life List view increments; restore connectivity, assert it auto-syncs and the badge clears.
- **Life List growth** is asserted by comparing the user's derived life-list count (via the existing life-list logic, same as the profile page) before/after a first sighting vs. a repeat sighting.

## Out of Scope

- Real photo upload/storage — only an optional photo URL string is in scope (the MVP has no blob/file storage).
- eBird / Darwin Core checklist export (see ADR 0003 and WAYFINDER_MAP deferred items).
- Automated bird-call/photo recognition (ML is Phase 2 per ADR 0003).
- Cross-device offline sync or conflict resolution beyond a simple queue; no offline support for the checklist read or verify beyond queued creation.
- Badges/achievements computation beyond the existing derived Life List counter.
- Hotspot "live alert" notifications or push notifications (ADR 0003: in-app live polling only, no push infrastructure).
- Native mobile packaging.

## Further Notes

- The Field Companion and checklist reuse the established session/auth, route-handler, and client-polling patterns from tickets #6 and #7, so this is the third capstone in the same family and should follow the same branch → PR → CodeRabbit + `/code-review` → user-merge loop.
- Life List is purely derived state (no table); the "verify" and "create" actions both reduce to inserting `Sighting` rows, so the invariants are all expressible in the single sightings/checklist handler seam.
- The offline queue is client-only state (localStorage) and its behavior is verified via CDP plus a locally blocked network, mirroring how connectivity drops are simulated.
- Docstrings: none added (no established repo convention) — follow the existing capstone files.
