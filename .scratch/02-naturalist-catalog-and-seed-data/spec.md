## Problem Statement

The current seed data (Ticket 01) includes only 7 bird species and 4 hotspots — a minimal demo set. Birders need a rich, searchable catalog covering regional species with photos, audio calls, habitat details, rarity indicators, and conservation status. Similarly, hotspots need expanded coverage across major birding regions with amenities, habitat types, and seasonal highlights. Without a comprehensive catalog, the Species Directory (`/species`) and Hotspot Explorer (`/hotspots`) pages will be empty shells, and expedition creators won't have realistic target species to select.

## Solution

Expand the Prisma seed script to populate a comprehensive naturalist catalog: 50+ North American bird species across major families (warblers, raptors, waterfowl, shorebirds, songbirds, woodpeckers) with high-quality photo URLs, audio call URLs, detailed descriptions, habitat preferences, rarity tiers (Common/Uncommon/Rare/Accidental), and conservation status. Add 15+ hotspots across key birding regions (Northeast, Southeast, Midwest, West, Canada) with GPS coordinates, habitat classifications, amenity details, seasonal peak migration notes, and cover images. Ensure seed data is idempotent and can be re-run safely.

## User Stories

1. As a Birder browsing the Species Catalog, I want to search and filter 50+ species by common name, scientific name, category, habitat, and rarity, so that I can identify birds I've seen or want to see.
2. As a Birder viewing a Species detail card, I want to see a high-resolution photo, play the bird's song/call, read a detailed description, and see its habitat and conservation status, so that I can learn to identify it in the field.
3. As a Trip Host creating an Expedition, I want to select target species from a realistic, regionally appropriate catalog, so that my outing attracts the right birders.
4. As a Birder exploring the Hotspot Directory, I want to browse 15+ hotspots across North America with maps, habitat types, amenities, and seasonal highlights, so that I can plan trips to productive locations.
5. As a Birder viewing a Hotspot detail page, I want to see recent sightings at that location, upcoming expeditions, and a map with exact coordinates, so that I can decide whether to visit.
6. As a Beginner Birder (Maya persona), I want the catalog to highlight "Common" species with clear photos and audio, so that I can build confidence identifying backyard birds.
7. As an Experienced Birder (Elena persona), I want to filter for "Rare" and "Accidental" species and see conservation status, so that I can target life-list additions.
8. As a Developer, I want the seed script to be idempotent (safe to re-run) using upsert on unique constraints, so that database resets during development don't create duplicates.
9. As a Developer, I want species and hotspot data to include realistic GPS coordinates and region tags, so that the Interactive Map (Ticket 04) can display them accurately.

## Implementation Decisions

- **Data Source**: Curated static seed data in `prisma/seed.mjs` (no external API dependency for MVP). Species list based on eBird/Clements taxonomy for North America.
- **Species Count**: Target 50+ species across these categories: Raptors (6), Waterfowl (6), Shorebirds (6), Warblers (8), Songbirds (10), Woodpeckers (4), Waders (4), Gulls/Terns (3), Other (3).
- **Species Fields**: All existing fields populated — `commonName` (unique), `scientificName`, `category`, `description` (2-3 sentences), `habitat` (specific), `imageUrl` (placeholder CDN URLs), `audioUrl` (placeholder CDN URLs), `rarity` (Common/Uncommon/Rare/Accidental), `conservationStatus` (IUCN categories).
- **Hotspot Count**: Target 15+ hotspots across regions: Northeast (4), Southeast (3), Midwest (2), West (3), Canada (3).
- **Hotspot Fields**: All existing fields populated — `name` (unique), `description` (birding significance), `locationName`, `latitude`/`longitude` (accurate), `habitatType` (Wetland/Forest/Coast/Grassland/Mountain/Urban), `amenities` (detailed), `coverImage` (placeholder CDN URLs).
- **Idempotency**: Use `upsert` with `where: { commonName }` for Species and `where: { name }` for Hotspot. All other models use existing unique constraints.
- **Regional Grouping**: Add a `region` field to Hotspot seed data (not in schema — used only for seed organization). Species get a `region` array property in seed for filtering logic.
- **Photo/Audio URLs**: Use consistent placeholder pattern: `https://cdn.birdphotoworld.com/{slug}.jpg` and `https://cdn.birdphotoworld.com/{slug}-call.mp3` where slug = lowercase common name with hyphens.
- **Rarity Tiers**: Common (backyard/abundant), Uncommon (regular but localized), Rare (annual but scarce), Accidental (vagrant, <5 records/year).
- **Conservation Status**: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered (IUCN).
- **Schema Changes**: None required — existing schema supports all fields. Future ADR may add `region` to Hotspot model.

## Testing Decisions

- **Philosophy**: Verify seed data completeness and correctness via automated queries. No UI tests yet (pages not built).
- **Automated Verification**:
  1. `pnpm exec prisma db push` — schema applies cleanly
  2. `pnpm exec prisma db seed` — runs without errors
  3. Query validation script: Verify Species count ≥ 50, Hotspot count ≥ 15, all required fields non-null, rarity distribution reasonable (Common > Uncommon > Rare > Accidental), all image/audio URLs follow pattern
  4. `pnpm run build` — TypeScript compilation passes
- **Manual Verification**:
  1. Prisma Studio: Inspect Species and Hotspot tables for data quality
  2. Spot-check 5 species: photo URL accessible, audio URL accessible, description > 50 chars
  3. Spot-check 3 hotspots: coordinates valid, amenities detailed, cover image accessible
  4. Verify idempotency: run seed twice, confirm no duplicates
- **Prior Art**: Ticket 01 seed verification pattern (3 users, 7 species, 4 hotspots). This extends the same approach.

## Out of Scope

- Building the Species Catalog UI (`/species` page) — Ticket 04/05
- Building the Hotspot Explorer UI (`/hotspots` page) — Ticket 04
- eBird API integration for live taxonomy sync — Phase 2
- ML-based species identification from photos/audio — Phase 2
- User-contributed photos/audio — Phase 2
- Seasonal abundance charts per hotspot — Phase 2
- Hotspot `region` field in database schema (seed-only for now)

## Further Notes

- This ticket unblocks Ticket 04 (Interactive Map) and Ticket 05 (Expedition Planning) which need rich species/hotspot data.
- The 50+ species target ensures the Species Catalog has enough breadth for filtering demos.
- Hotspot GPS coordinates must be accurate for Leaflet map rendering in Ticket 04.
- Seed script should log progress every 10 species/hotspots for visibility.
- Consider adding a `scripts/verify-seed.mjs` for automated validation in CI.
- After this ticket, the database will have a production-grade reference catalog for development.