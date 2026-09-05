# FlockFinder: UI & Screen Architecture Specification (UI_SPECIFICATION.md)

## Design System: "Forest & Field"

- **Primary Colors**:
  - `Forest Deep`: `#1B3B2B` (Headings, primary buttons, brand accents)
  - `Forest Mid / Sage`: `#3D6B52` (Secondary buttons, active tab indicators, nature badges)
  - `Sandstone Neutral`: `#F7F5F0` (Light mode background), `#1A2421` (Dark mode surface)
  - `Amber Gold`: `#D97706` (Open carpool seat badges, rare species alerts, target birds)
  - `Sky Blue`: `#0284C7` (Map pins, water/wetland habitat tags)
- **Typography**: Clean, highly readable sans-serif (`Inter` or `Plus Jakarta Sans`) with generous line-height for mobile field use.
- **Iconography**: Lucide icons (`Compass`, `Car`, `Feather`, `MapPin`, `Users`, `MessageSquare`, `Plus`, `CheckCircle2`, `Volume2`).

---

## Global Navigation & App Shell

- **Desktop Top Navigation**:
  - Left: FlockFinder Logo + Brand (`Feather` icon in forest green).
  - Center: Main navigation links:
    - **Expeditions & Carpools**
    - **Interactive Map**
    - **Bird Guide**
    - **Messages**
  - Right:
    - Quick "Host Outing" button
    - Field Companion quick-action button
    - Demo Persona Switcher (Elena 👑, Marcus 🚗, Maya 🎒)
    - User Profile Avatar & Theme toggle

- **Mobile Bottom Bar (Field-Optimized)**:
  - 5 touch targets: `Expeditions`, `Map`, `[+] Field Logger` (prominent center button), `Species`, `Profile`.

---

## Screen-by-Screen Breakdown

### 1. Home / Community Dashboard (`/`)
- **Hero Section**: "Join the Flock" — welcome message with dynamic community stats: total species seen today, active upcoming expeditions, open carpool seats.
- **Upcoming Expeditions Carousel**: Fast cards displaying date, destination hotspot, target birds, and seat status (`"2 seats left from North Metro"`).
- **Live Sighting Ticker**: Real-time ticker showing the latest birds spotted by members across regional hotspots.
- **Quick Action Triggers**:
  - `Host an Outing`
  - `Find a Ride`
  - `Log Field Sighting`

### 2. Expeditions & Carpools (`/trips`)
- **Filter Bar**:
  - Date filter (Today, This Weekend, All Upcoming).
  - Hotspot dropdown.
  - Checkbox: *"Only show trips with available carpool seats"*.
  - Search by target species.
- **Trip Card Layout**:
  - Hotspot thumbnail & title.
  - Date & Meeting Time pill.
  - Target species badges with miniature bird photos.
  - Host avatar and attendee count.
  - **Carpool Status Banner**:
    - Green: `"🚗 3 seats available from Downtown"`
    - Yellow: `"🚗 Full"`
    - Gray: `"No carpool offered yet — Offer a ride!"`

### 3. Expedition Detail & Coordination Page (`/trips/[id]`)
- **Header**: Expedition title, Host profile, Hotspot location link, Meeting time & exact rendezvous instructions.
- **Target Species Strip**: Bird cards showing the primary species the group hopes to observe, with link to sound/field guide.
- **Two Main Functional Panels**:
  - **Panel A: Carpool Ride Board**:
    - Cards for each Driver offering seats:
      - Driver name, car model, departure neighborhood (e.g. *"Pickup at Park St Station at 5:45 AM"*).
      - Visual seat capacity bar (e.g. 3 of 4 seats claimed).
      - Roster of confirmed passengers.
      - Dynamic Action:
        - If seats open & user has no ride: **`[ Claim Seat ]`**
        - If user already claimed: **`[ Cancel My Seat ]`** (with confirmation)
        - If user is a driver: **`[ + Offer Carpool Ride ]`**
  - **Panel B: Expedition Tabs**:
    - **Tab 1: Trip Chat**: Real-time group messaging for carpoolers and attendees.
    - **Tab 2: Shared Field Checklist**: Live group sighting tally for the day. Shows every bird logged by attendees during the trip, with a **`[ Saw it too! ]`** button that increments personal Life Lists.
    - **Tab 3: Attendees Roster**: List of all RSVPs with driver/passenger indicators.

### 4. Interactive Map & Hotspot Explorer (`/map`)
- Full-screen Leaflet container with responsive floating overlay cards.
- **Layers**:
  - 🟢 Hotspot Markers: Click to see habitat, recent species count, and upcoming trips.
  - 🟡 Active Expedition Pins: Click to jump directly to trip RSVP and carpools.
  - 🔵 Recent Sightings (last 48h): Pins with photo and time spotted.
- **Sidebar drawer**: Collapsible list of hotspots with filter by habitat (Wetland, Forest, Coast, Mountain).

### 5. Bird Guide & Species Directory (`/species`)
- Search bar (by common name or scientific name).
- Habitat & Rarity filter pills (Common, Seasonal, Rare).
- Species Card:
  - High-res photo & conservation tag.
  - Common & scientific name.
  - Audio play button for bird song/call.
  - Personal indicator: **`[✓ In Your Life List]`** or **`[+ Add Sighting]`**.

### 6. Birder Profile & Personal Life List (`/profile`)
- Profile Header: Avatar, Name, Bio, Home City, Vehicle Details (e.g., *"Subaru Outback - 4 passenger seats"*).
- **Life List Milestone Counter**: Big counter (e.g. `42 Species Spotted`).
- **Filterable Life List Grid**: All species seen by this user, with date first spotted and link to observation photos.
- **Trips Attended & Hosted**: History of completed outings.
- **Badges**: *"Early Bird"*, *"Trail Driver"*, *"Century Club"*, *"Rare Finder"*.

### 7. Smart Field Companion (Quick Logger Drawer)
- Slides in smoothly from bottom on mobile (or modal on desktop) when clicking the `[+]` button.
- **Step 1**: Quick autocomplete species search (or tap from "Target species today").
- **Step 2**: Count stepper (`- 1 +`).
- **Step 3**: Optional photo URL or upload and brief field notes.
- **One-Click Submit**:
  - Immediately logs sighting.
  - Updates personal Life List.
  - If currently attending an active expedition, automatically adds to the **Shared Trip Checklist** and notifies fellow trip members!
