# 0004: Local-First Queue for Offline Field Sightings

We decided to support local-first queuing for field sighting logs using browser storage (`localStorage`). When cellular connectivity drops in nature reserves or wetlands, sightings are saved locally and immediately increment the local Life List count with a "Pending Sync" badge, automatically syncing with the server once connectivity is restored. This guarantees that birders never lose an observation in remote field conditions.
