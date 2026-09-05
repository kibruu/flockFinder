# FlockFinder: User Stories & Personas (USER_STORIES.md)

## Core Personas

### 1. Elena Rostova — The Outing Host / Trip Leader
- **Background**: Experienced naturalist, frequent bird club volunteer.
- **Goals**: Wants to schedule dawn walks, identify target species (e.g. *Belted Kingfisher*, *Peregrine Falcon*), guide new birders, and maintain group communication.
- **Pain Point**: Spends hours messaging individuals on WhatsApp to confirm who is showing up and who needs rides.

### 2. Marcus Vance — The Driver / Carpool Provider
- **Background**: Dedicated birder with an SUV (4 passenger seats) based in the city.
- **Goals**: Wants to travel to remote sanctuaries (e.g. coastal wetlands 40 miles away) without driving alone, help fellow birders, and split gas expenses.
- **Pain Point**: Anxious about last-minute passenger dropouts and cumbersome phone coordination while driving.

### 3. Maya Chen — The Beginner / Carless Birder
- **Background**: University student with a growing passion for birds, but has no car.
- **Goals**: Wants to find accessible weekend outings, secure reliable transportation, learn from veteran birders, and build her personal Life List.
- **Pain Point**: Can rarely visit premier bird sanctuaries located outside public transit lines.

---

## Key User Stories & Acceptance Criteria

### Epics & Stories

#### Epic 1: Expedition Planning & Discovery
- **US-1.1 (Host creates Outing)**:
  - *As an Outing Host*, I want to create a new expedition by selecting a Hotspot, date, meeting time, meeting point description, and target bird species, *so that* other birders can discover and RSVP to the trip.
  - **Acceptance Criteria**:
    - Can search existing hotspots or pick one from the map.
    - Can select one or more target species from the bird catalog.
    - Specifies maximum group size (or unlimited).
    - Automatically becomes the trip Host with an initial RSVP.

- **US-1.2 (Birder browses Outings)**:
  - *As a Birder*, I want to filter upcoming expeditions by date, location, and whether open carpool seats are available, *so that* I can quickly find a trip I can attend.
  - **Acceptance Criteria**:
    - Cards clearly show Hotspot name, date/time, host avatar, target bird badges, and available carpool seats count.
    - Instant filter by "Has Open Carpool Seats".

#### Epic 2: Carpool Ride Sharing
- **US-2.1 (Driver offers Carpool)**:
  - *As a Driver*, I want to list my vehicle, departure neighborhood, departure time, and number of available seats on an expedition page, *so that* attendees can ride with me.
  - **Acceptance Criteria**:
    - Form captures: origin neighborhood/metro station, departure time, total available seats, notes (e.g. "Space for backpacks, no pets").
    - Appears immediately on the trip's Carpool Board with a "Seats Available: X of Y" badge.

- **US-2.2 (Passenger claims a Seat)**:
  - *As a Carless Birder (Maya)*, I want to reserve an open seat in a carpool with a single click, *so that* I have confirmed transportation.
  - **Acceptance Criteria**:
    - Clicking "Claim Seat" immediately decrements available seats by 1 and adds the user to the passenger list.
    - Prevents double-booking if the user already has a seat in another carpool for this trip.
    - When all seats are filled, the card shows "Full" and disables claiming.

- **US-2.3 (Cancelling a Seat)**:
  - *As a Passenger or Driver*, I can cancel a reservation or manage the ride, *so that* freed-up seats become available to others immediately.
  - **Acceptance Criteria**:
    - Passenger clicking "Cancel Reservation" instantly increments available seats by 1.

#### Epic 3: Communication & Coordination
- **US-3.1 (Trip Group Chat)**:
  - *As an Expedition Attendee*, I want to send messages in the trip's dedicated chat room, *so that* we can coordinate meeting details, binoculars sharing, and weather updates.
  - **Acceptance Criteria**:
    - Only confirmed attendees/drivers of the expedition can view and post.
    - Messages display sender avatar, name, and relative timestamp.

- **US-3.2 (Hotspot Live Alert Board)**:
  - *As any Birder in the field*, I want to post real-time sightings on a hotspot's live board, *so that* people currently on-site can look out for rare birds.

#### Epic 4: On-Site Field Companion & Life List
- **US-4.1 (1-Tap Sighting Logger)**:
  - *As a Birder in the field*, I want to open the quick logger, choose a species, enter count and notes, and submit, *so that* my observation is recorded without interrupting my birding.
  - **Acceptance Criteria**:
    - Autocomplete species search from the catalog.
    - Stepper for count (defaults to 1).
    - Automatically updates the birder's personal Life List if it's a new species.

- **US-4.2 (Collaborative Trip Checklist)**:
  - *As an Expedition Member*, I want to view all birds spotted by my group during today's trip, *so that* I can see our collective haul and tap "Saw it too!" to add any species I also observed to my personal Life List.
  - **Acceptance Criteria**:
    - Live list of all species logged by attendees for this trip.
    - Shows who first spotted it and at what time.
    - "Saw it too!" button that updates the user's personal Life List with 1 click.
