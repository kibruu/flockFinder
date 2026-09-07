## Problem Statement

Birders coordinating carpool to an Expedition currently have no reliable way to publish ride offers or claim seats. Rides are arranged ad-hoc and people are left stranded, unsure which Birder is driving, from where, at what time, or whether a seat is still available. The moment capacity runs out or someone's plans change, the group is out of sync.

## Solution

The Expedition page hosts a live Carpool Board. A Driver publishes a Carpool Offer (pickup area, departure time, seat count, notes); a Passenger claims a seat with one click and sees the vehicle's remaining capacity shrink instantly; the Driver can release a Passenger's Seat Reservation or edit/withdraw their offer; seats are freed and re-available the moment a reservation is cancelled. All capacity changes are first-come, first-served (ADR 0001) and are safe under concurrent claims.

## User Stories

1. As a Birder attending an Expedition as a Self-Drive participant, I want to publish a Carpool Offer with my pickup area, departure time, seat count, and notes, so that I can turn spare seats into a shared ride.
2. As a Driver, I want my Carpool Offer visible on the Expedition's Carpool Board, so that passengers can find and claim my seats.
3. As a Birder without a vehicle, I want to claim a free seat on a Carpool Offer with one click, so that I can get to the Expedition without arranging separate transport.
4. As a Passenger, I want the seat count to decrement immediately when I claim, so that I know my seat is confirmed.
5. As a Passenger, I want to cancel my Seat Reservation, so that my seat is freed for another Birder and I'm not held to a ride I can no longer take.
6. As a Passenger, I want the Claim Seat action to be unavailable when the vehicle is full, so that I'm not misled into a failed booking.
7. As a Birder, I want to see at a glance how full each vehicle is (available vs total seats as a visual capacity bar), so that I can pick the ride most likely to fit me.
8. As a Birder, I want to see who has claimed each seat on a car, so that I can coordinate with fellow passengers before departure.
9. As a Driver, I want to release a Passenger's Seat Reservation when vehicle constraints change, so that I retain control over who rides in my car (ADR 0001).
10. As a Driver, I want to edit my Carpool Offer's pickup time or seat count, so that I can adjust to changing plans without withdrawing and re-publishing.
11. As a Driver with confirmed passengers, I want to be prevented from shrinking my seat count below the number of confirmed reservations, so that I can't invalidate existing bookings.
12. As a Driver, I want to withdraw my Carpool Offer, so that my ride offer is no longer listed when I can no longer drive.
13. As a Birder, I want to be prevented from claiming a seat on my own vehicle, so that I can't accidentally fill the car with myself.
14. As a Birder, I want to be prevented from claiming a second seat across offers on the same Expedition, so that I only ever hold one Seat Reservation per trip.
15. As a Birder, I want claiming a seat to also register me as a Passenger on the Expedition, so that my attendance and my ride are consistent on one roster.
16. As an unauthenticated visitor, I want to see the Carpool Board with capacity and drivers, so that I can evaluate an Expedition before joining.
17. As a Birder, I want to claim a seat without having to reload the page, so that the experience feels instant.
18. As a Host, I want the Carpool Board to be empty-state friendly, so that the first Driver is encouraged to offer a ride.
19. As a Driver or Passenger, I want sensible error messages (e.g. "No seats available", "Already booked"), so that I understand why an action was rejected.
20. As a Birder, I want cancelled trips to cascade my Seat Reservation to a CANCELLED state rather than silently deleting it (ADR 0005), so that I can still see the ride history.

## Implementation Decisions

- **Data model (existing, retained).** `CarpoolOffer` (Expedition, Driver, `originArea`, `departureTime`, `totalSeats`, `availableSeats`, `notes`) and `CarpoolBooking` (Offer, Passenger, `status` defaulting to `CONFIRMED`) with a database-level unique constraint on `(offerId, passengerId)`. This constraint is the last line of defense against double-booking.
- **Capacity invariant.** `availableSeats` must never go negative and `totalSeats` must never drop below the count of confirmed bookings. All capacity writes happen in a single transaction using a conditional update (`availableSeats > 0` decrement), so concurrent claims cannot oversell a vehicle.
- **Expedition state gate.** Carpool Offer create/edit, claim, and cancel actions are only available while the Expedition is `UPCOMING`.
- **Role contract (from `TripRsvpRole`).** Only a Birder who holds a `DRIVER`, `SELF_DRIVE`, or `HOST` role on the Expedition may publish an offer. Publishing auto-promotes `SELF_DRIVE` to `DRIVER`. Claiming a seat upserts the claimer's rsvp to `PASSENGER` (subject to the Expedition's `maxParticipants`). Cancelling a seat leaves the rsvp in place, since the Birder may still attend.
- **Offer identity is one-per-driver per Expedition** (deterministic key), reused on edit; this keeps the board stable and makes the "your carpool" state unambiguous.
- **Capacity bar.** Derived purely from `availableSeats`/`totalSeats` in the client render layer; no new data needed. Must include the numeric `N / M seats` readout for accessibility and colour-blind users (never colour-only). Confirmed-passenger chips render from each offer's bookings.
- **Driver passenger management (new, per ADR 0001).** Driver may release a specific Passenger's reservation; the seat is freed immediately (booking removed). All passenger-release UI sits on the Driver's own offer cards only.
- **Offer editing and withdrawal (new).** Driver may edit pickup area/time/seats/notes. Seat-count edits are clamped to `>= confirmed bookings`. Withdrawing an offer removes it from the board only after confirmed bookings are released; the Driver's rsvp returns to `SELF_DRIVE` on withdrawal.
- **Trip cancellation cascade (ADR 0005).** When an Expedition is cancelled, all associated `CarpoolBooking`s transition to `CANCELLED` (soft), rather than being deleted by the user-cancel path. This was the decision in ADR 0005 and supersedes any hard-delete behaviour in earlier user-cancel code.
- **API contract.** One surface under the Expedition's resource: create/edit offer, claim seat, cancel own seat, driver-release passenger, withdraw offer. Each route returns the updated board shape (offers + confirmed bookings) or a user-readable error. Errors of note: "No seats available", "Already booked", "Cannot book your own carpool", "Trip is full", "Trip not found or not upcoming".
- **Client rendering.** Server component loads the board (per ADR 0006); the interactive leaf component mutates via the API and updates local board state from the response. Empty state promotes the first offer.

## Testing Decisions

- **What makes a good test:** exercise only external behaviour — claiming decrements capacity, cancelling increments it, a second claim is rejected, a full vehicle is rejected, a driver cannot shrink below confirmed bookings, own-carpool claims are rejected, and CANCELLED trips reject all carpool actions. Assert on effects (seat counts, booked passengers, HTTP status/error strings), never on internal functions.
- **Single preferred seam: the Expedition carpool API routes.** All business invariants (capacity, double-booking, own-carpool, role gate, trip-status gate) live behind these handlers, making them the one seam that can cover the whole ruleset. The capacity-bar rendering is a presentation concern covered by the highest seam possible above it (a component-level render against a fixed board fixture) or, failing that, exempt from automated testing.
- **Modules under test:** the carpool offer/claim/cancel/release route handlers; the expedition page's board rendering for empty, partial, and full states.
- **Prior art:** none yet — the repo has no test runner or test suite today. Establishing the first harness (a minimal runner that can talk to the Prisma layer for the route seam) is a prerequisite for this work and should be decided before implementation begins.

## Out of Scope

- Payment or fare splitting (deferred by ADR 0003).
- Manual driver approval of ride requests (rejected by ADR 0001; booking is instant).
- Pickup routing, multi-stop Route planning, or geolocation for carpools.
- Driver/message integration wiring ChatMessage content onto the board.
- Seat reservations across multiple Expeditions or a global ride marketplace.
- Offline booking queueing (ADR 0004 is a sighting concern, not carpool).

## Further Notes

- The tracer-bullet implementation already covers the board, claim, and user cancel; this spec finalises best-practice gaps: visual capacity bar, driver passenger management, offer edit/withdraw, and the ADR 0005 soft-cancel cascade on Expedition cancellation.
- Seat counts are capped at 8 (typical passenger vehicle); the offer flow should state the allowed range up front.
- Concurrency hygiene: rely on the DB unique constraint plus conditional capacity writes; never check-then-write seat availability outside a transaction.