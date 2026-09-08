# Spec: Multi-Channel Messaging (Ticket #7)

*Updated 2026-09-08 (PR #23): DM message editing/soft-delete, read receipts + unread badges, and a composer emoji picker shipped after ticket #7. The affected sections below are amended in place.*

## Problem Statement

Expedition coordination relies on out-of-band WhatsApp/Facebook threads: attendees confirm meeting details in one place, drivers coordinate pickups in another, and field reports never reach the people on-site. Members have no way to message each other directly for ride or species inquiries. The community's coordination chaos (per the product vision) persists because there is no in-app communication channel.

## Solution

Signed-in Binders get three real-time, in-app communication channels, updated by lightweight client-side polling (per ADR 0003: no external push infrastructure in the MVP):

1. **Trip Group Chat** — a dedicated chat tab inside each Expedition (`/trips/[id]`) open to the trip's confirmed attendees, drivers, and host.
2. **Hotspot Live Board** — a real-time field-report board on each Hotspot page (`/hotspots/[id]`) where any signed-in Birder in the field can post sightings and alerts.
3. **1-on-1 Direct Messages** — private threads between any two Birders, with a conversation list at `/messages` and a thread at `/messages/[userId]`.

Every message input shows the sender's avatar, name, and a relative timestamp. Messages appear on screen within a few seconds of being posted, without a page reload.

## User Stories

**Trip Group Chat**
1. As a Trip Attendee, I want to open a dedicated chat tab on the Expedition page, so that I can coordinate meeting details and weather updates with my group in one place.
2. As a Trip Attendee, I want my message to appear to everyone in the trip chat within seconds of submitting, so that the conversation feels live.
3. As a Trip Driver, I want passengers to see my pickup-coordination messages in the trip chat, so that we can align on timing without individual texts.
4. As the Trip Host, I want to post announcements (meeting point changes, delays) in the trip chat, so that all attendees see the same authoritative update.
5. As a Birder who has not RSVP'd to the trip, I want the chat tab to be read-only/absent, so that I cannot read or post in a private trip conversation.
6. As a Trip Attendee, I want each message to show the sender's avatar, name, and how long ago it was sent, so that I can tell who is talking and how fresh the message is.
7. As a Trip Attendee, I want to send a message with the Enter key, so that posting feels fast on desktop.
8. As a Trip Attendee, I want the chat to auto-scroll to the newest message when I open it and when new messages arrive, so that I can read the current thread without scrolling.
9. As a Trip Attendee, I want the message input at the bottom of the chat, so that it is thumb-friendly on mobile.
10. As a Trip Attendee, I want to see the newest ~50 messages when I open the chat and only newly-posted messages on subsequent polls, so that the thread loads fast and stays current.
11. As a Trip Attendee, I want to send extra context alongside URL-style or species text safely (rendered as plain text, never executed), so that chat content cannot harm other members' browsers.

**Hotspot Live Board**
12. As any Birder in the field, I want to post a real-time sighting alert on the hotspot's live board, so that people currently on-site can look out for rare birds.
13. As a Birder browsing a hotspot, I want to read the live board even before signing in, so that field reports are publicly discoverable.
14. As a signed-out visitor, I want posting to require an account, so that anonymous spam cannot pollute the board.
15. As a Birder at the hotspot, I want new board messages to appear within seconds via polling, so that I can respond to a sighting while it matters.
16. As a Birder, I want board messages to show the poster's avatar, name, and relative time, so that I can judge credibility and freshness.
17. As a Birder, I want the board to show the newest ~50 reports, so that the on-site feed stays scannable.

**1-on-1 Direct Messages**
18. As a Birder, I want to open a direct conversation with another member, so that I can ask about a ride share or a species ID privately.
19. As a Birder, I want a conversation list showing all people I've messaged with the last message and relative time, so that I can resume threads quickly.
20. As a Birder, I want to open a thread from an Expedition attendee's row, so that I can reach a driver or co-attendee in one click.
21. As a Birder, I want only myself and the other participant to read a DM thread, so that my communication stays private.
22. As a Birder, I want to be blocked from messaging myself, so that no state can be built around a self-thread.
23. As a Birder, I want to be blocked from messaging a nonexistent member, so that conversations always reference a real person.
24. As a Birder, I want new messages in a thread to appear within seconds via polling, so that quick exchanges feel synchronous.
25. As a Birder, I want each DM message to show the sender's avatar, name (for received messages), and relative timestamp, so that the thread reads clearly.

## Implementation Decisions

Realtime mechanism: **client-side polling** (no SSE/WebSocket/push infra), per ADR 0003's MVP boundary. Poll interval defaults to 4000ms, paused while the browser tab is hidden. Polling uses an `after=<messageId>` cursor so each poll returns only messages newer than the last one seen.

Data model: the existing `ChatMessage` model is the single record for all three channels. The three destination columns are mutually exclusive — `tripId`, `hotspotId`, or `recipientId` — enforced in the route handlers (Prisma cannot express partial uniqueness). Add the following indexes: `(@@index([tripId, createdAt]))`, `(@@index([hotspotId, createdAt]))`, `(@@index([senderId, createdAt]))`, `(@@index([recipientId, createdAt]))`. Message `content` is trimmed, must be non-empty, and is capped at 2000 characters. Messages are mutable — a DM sender may edit their own message (`PATCH` sets `content` + `editedAt`) or soft-delete it (`DELETE` sets `content` to `""` + `deletedAt`); deleted messages are never hard-deleted and persist as tombstones visible to both sides. Trip chat stays readable to members regardless of trip status, and posting is disallowed once the trip's status is `CANCELLED`. The 1-on-1 conversation list is still derived from messages where the current user is sender or recipient. Read tracking adds two auxiliary tables: `Conversation` (per-direction user/peer record with `lastReadAt`, `@@unique([userId, peerId])`) and `MessageRead` (`@@unique([messageId, userId])`). `Conversation` rows are upserted when a DM is first sent; `lastReadAt` and `MessageRead` rows are written by the read-receipt endpoint.

Seam (the single place behavior is tested): the message **API route handlers**, mirroring the ticket #6 carpool capstone. All invariants — channel authorization, content validation, cursor semantics, sender!=recipient, participant-only reads — live behind these handlers; the client is thin view state fed by polling.

### API contract

Authorized using the existing session helper. Guard order consistent with ADR 0006 and the carpool routes: session → body validation → resource existence (404) → authorization (403) → write.

**Trip Group Chat**
- `POST /api/trips/[id]/chat` — body `{ content }`. Requires session; sender must have a `TripRsvp` on the trip (confirmed attendee, driver, or host — any role); trip must not be `CANCELLED`. Returns the created message (server-authoritative).
- `GET /api/trips/[id]/chat?after=<messageId>` — requires session + trip membership. Without `after`, returns the newest 50 messages ascending; with `after`, returns messages with `id` greater than the cursor ascending. Messages include sender `{ id, name, avatarUrl }`.

**Hotspot Live Board**
- `POST /api/hotspots/[id]/board` — body `{ content }`. Requires session (any signed-in Birder). Returns the created message.
- `GET /api/hotspots/[id]/board?after=<messageId>` — public read; no session required. Same cursor semantics: newest 50 ascending, or newer-than-cursor. Messages include sender `{ id, name, avatarUrl }`.

**1-on-1 Direct Messages**
- `GET /api/messages` — requires session. Returns the current user's conversations, each with the other participant `{ id, name, avatarUrl }`, last message `{ content, createdAt }`, and `unreadCount` (the peer's non-soft-deleted messages newer than `Conversation.lastReadAt`; all peer messages if there is no read anchor), ordered by most recent.
- `GET /api/messages/[userId]?after=<messageId>` — requires session; the current user must be the sender or recipient of every returned message. Same cursor semantics. Soft-deleted tombstones (empty `content`, non-null `deletedAt`) are returned normally — reads never filter them out, so a deleted message stays visible to both participants. Messages include sender `{ id, name, avatarUrl }`.
- `POST /api/messages/[userId]` — body `{ content }`. Requires session; target user must exist; `[userId]` must differ from the session user. Returns the created message with sender.
- `PATCH /api/messages/[userId]` — body `{ messageId, content }`. Requires session; only the message sender may edit (403 otherwise); the message must belong to this conversation (400) and must not already be soft-deleted (400 `Message is deleted`). Returns the updated message with `editedAt`.
- `DELETE /api/messages/[userId]` — body `{ messageId }`. Requires session; sender-only (403); belongs-to-conversation check (400). Soft-deletes: sets `content` to `""` and stamps `deletedAt`. Returns `{ success: true }` — no hard delete.
- `POST /api/messages/[userId]/read` — requires session. Marks the peer's non-deleted messages as read (inserts `MessageRead` rows) and bumps `Conversation.lastReadAt`. Returns `{ success: true, markedCount }`.

Message shape (same across channels): `{ id, content, createdAt, editedAt, deletedAt, sender: { id, name, avatarUrl } }`. `editedAt`/`deletedAt` are `null` unless set; a soft-deleted message serializes with `content` `""` and a non-null `deletedAt`.

### Client

- A small **`useLiveMessages`** hook (polling + `after` cursor + tab-visibility pause) shared by all three channels.
- A shared **message thread** presentational block (list + composer) rendered by all three channels, with a relative-time helper (`just now`, `3m`, `2h`, `yesterday`, then a short date).
- Trip Chat: a new tab in the existing Expedition detail pane, visible only to members (non-members either see no tab or a read-only prompt; spec for the agent: render the tab only when the user holds a trip RSVP).
- Hotspot Live Board: a client board section on the exiting Hotspot page; board is publicly readable, posting renders a signed-in-only composer.
- 1-on-1: a `/messages` conversation-list page and `/messages/[userId]` thread page (server component shells hosting the shared client thread, per ADR 0006), plus a "Message" link on Expedition attendee roster rows routing to the member's thread. DM-only affordances (shipped in PR #23): unread badges per conversation in the list that clear when the thread is opened (a read-receipt `POST` fires on opening a DM thread); edit/delete controls and an `(edited)` marker on the user's own messages; deleted messages render as `Message deleted`.
- Composer emoji picker (inserts into the draft; distinct from per-message emoji reactions, which remain out of scope).
- Follow the app's avatar rendering (dicebear `avatarUrl`) and the established teal/gray visual language. Message content renders as plain text only — no `dangerouslySetInnerHTML`, no markdown rendering. Composer clears only after the server confirms the message.

## Testing Decisions

A good test asserts external behavior via the API seam: HTTP status, response shape, and persisted rows — never implementation details like component internals.

- The single module under test is the message route contract (write + read per channel).
- Prior art: the ticket #6 carpool capstone, which verified its route invariants with an end-to-end API smoke script (demo-session switching, book/duplicate/release/withdraw lifecycle) plus headless-Chrome CDP checks of the rendering flow. Messaging follows the same pattern: an API smoke script covering the authorization matrix below, then a CDP pass for the three UIs.
- Test matrix (behavioral, via HTTP):
  - Trip chat: non-member cannot read (403) or post (403); each RSVP role (HOST/DRIVER/PASSENGER/SELF_DRIVE) can post and read; blank/whitespace content rejected (400); >2000 char content rejected (400); posting on a `CANCELLED` trip rejected; `after` cursor returns only newer messages; newest-50 default.
  - Hotspot board: guest read succeeds; guest post rejected (401); signed-in post succeeds; public read shape includes sender.
  - 1-on-1: read as each participant succeeds; thread read by anyone else returns the empty list (messages between the two participants are never exposed); posting to self rejected (400); posting to nonexistent user rejected (404); conversation list contains only own threads; `after` cursor semantics; blank content rejected (400). Edit/delete (PR #23): editing another user's message rejected (403); deleting another user's message rejected (403); deleting one's own soft-deletes (tombstone returned to both participants, `deletedAt` set); editing a deleted message rejected (400); editing one's own sets `editedAt`. Read receipts: `POST .../read` marks the peer's non-deleted messages and bumps `unreadCount` to 0; a guest read-receipt call is rejected (401).
- Still no automated test runner exists in the repo — noted again as a prerequisite, unchanged from ticket #6.

## Out of Scope

- Push notifications (APNS/FCM/web push), per ADR 0003.
- Typing indicators, per-message emoji reactions (a composer emoji picker shipped in PR #23), media/file/photo attachments, message search, group DMs.
- Offline queueing for messages (ADR 0004 covers sightings only).
- Pagination beyond last-50 + incremental cursor.
- Rate limiting, spam/moderation tooling, and message reporting (flagged for a follow-up).

## Further Notes

- The `ChatMessage` model already exists in the schema but has no routes or UI — this ticket wires the three channels to it. One caveat for the implementer: existing convention has no Prisma SQLite enums, so channel kind is implied by whichever destination column is set; handlers must enforce the mutual exclusion, and the DM `[userId]` route must also guarantee sender != recipient.