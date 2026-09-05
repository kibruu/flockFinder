# FlockFinder: Goals & Scope (GOALS_AND_SCOPE.md)

## Product Vision

**FlockFinder** is the *"Meetup + Strava for Birders"* — a social community platform that transforms bird watching from an isolated or logistically fragmented activity into an accessible, collaborative experience. It seamlessly unites field trip scheduling, carpool coordination to remote birding sanctuaries, multi-channel messaging, and real-time on-site sighting collaboration.

---

## The Core Problem

1. **Accessibility Gap**: Many of the best birding hotspots (wetlands, estuaries, migratory passes) require personal vehicles and are inaccessible to urban or carless nature enthusiasts.
2. **Coordination Chaos**: Birding clubs currently coordinate via disjointed WhatsApp/Facebook groups, email threads, and spreadsheets, leading to stranded ride requests, unclear meeting times, and lost sighting updates.
3. **Data Isolation**: Existing scientific databases (like eBird) capture formal checklists but lack social outings, carpooling, or live expedition chat.

---

## MVP vs. Phase 2 Scope Boundaries

### Strict MVP Scope (In-Scope)

| Feature Area | MVP Deliverable |
| :--- | :--- |
| **Outing Lifecycle** | Create, schedule, filter, and RSVP to birding expeditions with target species and meeting locations. |
| **Carpool Coordination** | Drivers offer seats with departure neighborhood and times; attendees claim seats with 1 click; live available-seat counter; cancellation handling. |
| **Field Companion** | Touch-friendly mobile drawer for on-site logging: 1-tap species picker, count stepper, photo link, notes, and live Shared Trip Checklist with "Saw it too!" verification. |
| **Communications** | Multi-channel chat: Dedicated Trip Group Chat, on-site Hotspot Live alert boards, and 1-on-1 direct messages. |
| **Mapping & Hotspots** | Interactive Leaflet/OpenStreetMap with custom pins for Hotspots, active Expeditions with open seats, and recent Sighting pins. |
| **Catalog & Profiles** | Pre-loaded database of common/rare bird species (with photos, calls, and habitat info) and top hotspots. User profiles with personal Life Lists and vehicle specs. |
| **Authentication** | Standard email/password registration & login, plus instant 1-click demo persona switcher for testing. |

### Phase 2 (Out of Scope for MVP)

- **Real-money Payment Processing**: Fare splitting for gas/tolls (MVP uses voluntary member cost-sharing).
- **Native App Store Binaries**: iOS/Android IPA/APK submissions (MVP focuses on high-quality responsive Web App with PWA installability).
- **Automated ML Audio/Visual Species ID**: Machine learning models for automatic bird sound/photo identification (MVP uses curated reference photos, audio clips, and trait filters).
- **Push Notification Infrastructure**: External APNS/FCM servers (MVP uses reactive in-app live polling and badges).
- **eBird Bi-directional API Sync**: Syncing directly to Cornell accounts (MVP provides local checklist exports).

---

## Success Criteria for the MVP

1. A host can create an expedition with target species in under 60 seconds.
2. A driver can publish 3 available seats, and another birder can claim a seat with a single click.
3. Expedition attendees can coordinate pickup in the trip chat and, upon arriving at the site, log sightings into a shared checklist that updates all attendees' screens.
