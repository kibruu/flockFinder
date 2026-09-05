# 0005: Graceful Expedition Cancellation and Carpool Cascade

We decided that cancelling an Expedition marks its status as `CANCELLED` and cascades by updating all associated Carpool Bookings to `CANCELLED`, while preserving the trip page and group chat in read-only mode for 48 hours with a prominent cancellation banner. We deliberately avoid hard-deleting records to prevent confusion and allow carpoolers to coordinate alternative return or personal plans.
