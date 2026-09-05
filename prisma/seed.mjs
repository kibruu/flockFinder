import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  const elena = await prisma.user.upsert({
    where: { email: "elena@flockfinder.app" },
    update: {},
    create: {
      name: "Elena Rostova",
      email: "elena@flockfinder.app",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
      bio: "Experienced naturalist and frequent bird club volunteer. Love leading dawn walks to spot Belted Kingfishers and Peregrine Falcons.",
      vehicleModel: "Subaru Outback",
      vehicleSeats: 4,
      city: "Cape May, NJ",
      badges: JSON.stringify(["Trail Leader", "Early Bird", "Century Club"]),
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: "marcus@flockfinder.app" },
    update: {},
    create: {
      name: "Marcus Vance",
      email: "marcus@flockfinder.app",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
      bio: "Dedicated birder with an SUV. Happy to drive fellow birders to remote sanctuaries and split gas.",
      vehicleModel: "Toyota 4Runner",
      vehicleSeats: 4,
      city: "Philadelphia, PA",
      badges: JSON.stringify(["Trail Driver", "Road Warrior"]),
    },
  });

  const maya = await prisma.user.upsert({
    where: { email: "maya@flockfinder.app" },
    update: {},
    create: {
      name: "Maya Chen",
      email: "maya@flockfinder.app",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
      bio: "University student with a growing passion for birds. No car, but eager to learn and build my Life List!",
      city: "New York, NY",
      badges: JSON.stringify(["Newcomer"]),
    },
  });

  console.log("✅ Created demo users");

  const speciesData = [
    {
      commonName: "Bald Eagle",
      scientificName: "Haliaeetus leucocephalus",
      category: "Raptor",
      description: "Iconic raptor with white head and tail, found near large bodies of water.",
      habitat: "Coastal areas, lakes, rivers",
      imageUrl: "https://cdn.birdphotoworld.com/bald-eagle.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/bald-eagle-call.mp3",
      rarity: "Uncommon",
      conservationStatus: "Least Concern",
    },
    {
      commonName: "Cedar Waxwing",
      scientificName: "Bombycilla cedrorum",
      category: "Songbird",
      description: "Sleek, crested bird with waxy red tips on wing feathers. Travels in flocks.",
      habitat: "Woodlands, orchards, suburban areas",
      imageUrl: "https://cdn.birdphotoworld.com/cedar-waxwing.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/cedar-waxwing-call.mp3",
      rarity: "Common",
      conservationStatus: "Least Concern",
    },
    {
      commonName: "Belted Kingfisher",
      scientificName: "Megaceryle alcyon",
      category: "Kingfisher",
      description: "Stocky, crested bird with a rattling call. Hovers over water before diving for fish.",
      habitat: "Rivers, lakes, estuaries, coastal waters",
      imageUrl: "https://cdn.birdphotoworld.com/belted-kingfisher.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/belted-kingfisher-call.mp3",
      rarity: "Common",
      conservationStatus: "Least Concern",
    },
    {
      commonName: "Great Blue Heron",
      scientificName: "Ardea herodias",
      category: "Wader",
      description: "Large, stately heron with blue-gray plumage. Stalks prey in shallow water.",
      habitat: "Marshes, swamps, shorelines, tidal flats",
      imageUrl: "https://cdn.birdphotoworld.com/great-blue-heron.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/great-blue-heron-call.mp3",
      rarity: "Common",
      conservationStatus: "Least Concern",
    },
    {
      commonName: "Pileated Woodpecker",
      scientificName: "Dryocopus pileatus",
      category: "Woodpecker",
      description: "Largest woodpecker in North America. Creates rectangular holes in dead trees.",
      habitat: "Mature forests with large trees",
      imageUrl: "https://cdn.birdphotoworld.com/pileated-woodpecker.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/pileated-woodpecker-call.mp3",
      rarity: "Uncommon",
      conservationStatus: "Least Concern",
    },
    {
      commonName: "Painted Bunting",
      scientificName: "Passerina ciris",
      category: "Songbird",
      description: "Male is a rainbow of colors — blue head, red underparts, green back. A true gem.",
      habitat: "Brushy areas, woodland edges, thickets",
      imageUrl: "https://cdn.birdphotoworld.com/painted-bunting.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/painted-bunting-call.mp3",
      rarity: "Rare",
      conservationStatus: "Near Threatened",
    },
    {
      commonName: "Peregrine Falcon",
      scientificName: "Falco peregrinus",
      category: "Raptor",
      description: "Fastest animal on earth — dives at 200+ mph. Nests on cliffs and tall buildings.",
      habitat: "Cliffs, cities, coastlines",
      imageUrl: "https://cdn.birdphotoworld.com/peregrine-falcon.jpg",
      audioUrl: "https://cdn.birdphotoworld.com/peregrine-falcon-call.mp3",
      rarity: "Uncommon",
      conservationStatus: "Least Concern",
    },
  ];

  for (const s of speciesData) {
    await prisma.species.upsert({
      where: { commonName: s.commonName },
      update: {},
      create: s,
    });
  }
  console.log("✅ Created species catalog");

  const hotspotsData = [
    {
      name: "Cape May Wetland Reserve",
      description: "World-renowned migration hotspot. Spring and fall bring massive numbers of warblers, raptors, and shorebirds.",
      locationName: "Cape May Point, NJ",
      latitude: 38.9333,
      longitude: -74.9667,
      habitatType: "Wetland",
      amenities: "Boardwalks, observation towers, visitor center, restrooms",
      coverImage: "https://cdn.birdphotoworld.com/cape-may.jpg",
    },
    {
      name: "Central Park Ramble",
      description: "Urban oasis in Manhattan. 230+ species recorded. Best during spring migration for warblers, tanagers, and flycatchers.",
      locationName: "Manhattan, NY",
      latitude: 40.7829,
      longitude: -73.9654,
      habitatType: "Forest",
      amenities: "Walking paths, benches, nearby cafes, restrooms",
      coverImage: "https://cdn.birdphotoworld.com/central-park.jpg",
    },
    {
      name: "Point Pelee Marshlands",
      description: "Southernmost point of mainland Canada. Famous for spring migration 'fallout' events. Warblers, vireos, flycatchers in abundance.",
      locationName: "Leamington, ON, Canada",
      latitude: 41.9167,
      longitude: -82.5167,
      habitatType: "Wetland",
      amenities: "Visitor center, shuttle to tip, boardwalks, restrooms",
      coverImage: "https://cdn.birdphotoworld.com/point-pelee.jpg",
    },
    {
      name: "Olympic Coastal Sanctuary",
      description: "Rugged Pacific coastline with seabird colonies, tide pools, and old-growth forest. Pelagic species, puffins, murres.",
      locationName: "Forks, WA",
      latitude: 47.9542,
      longitude: -124.3847,
      habitatType: "Coast",
      amenities: "Trailheads, campgrounds, visitor center, tide pools",
      coverImage: "https://cdn.birdphotoworld.com/olympic-coast.jpg",
    },
  ];

  const hotspots = [];
  for (const h of hotspotsData) {
    const hotspot = await prisma.hotspot.upsert({
      where: { name: h.name },
      update: {},
      create: h,
    });
    hotspots.push(hotspot);
  }
  console.log("✅ Created hotspots");

  const capeMay = hotspots.find(h => h.name === "Cape May Wetland Reserve");
  const centralPark = hotspots.find(h => h.name === "Central Park Ramble");
  const pointPelee = hotspots.find(h => h.name === "Point Pelee Marshlands");
  const olympic = hotspots.find(h => h.name === "Olympic Coastal Sanctuary");

  const trip1 = await prisma.trip.upsert({
    where: { id: "trip-1" },
    update: {},
    create: {
      id: "trip-1",
      title: "Cape May Spring Migration Spectacular",
      description: "Join us for a dawn-to-dusk birding marathon at the legendary Cape May. Target: 20+ warbler species, raptors, shorebirds. Meet at the Hawkwatch Platform at 6:00 AM.",
      hostId: elena.id,
      hotspotId: capeMay.id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Hawkwatch Platform, Cape May Point State Park",
      targetSpecies: JSON.stringify(["Bald Eagle", "Peregrine Falcon", "Belted Kingfisher", "Cedar Waxwing"]),
      maxParticipants: 12,
      status: "UPCOMING",
    },
  });

  const trip2 = await prisma.trip.upsert({
    where: { id: "trip-2" },
    update: {},
    create: {
      id: "trip-2",
      title: "Central Park Warbler Walk",
      description: "Leisurely morning walk through the Ramble during peak spring migration. Perfect for beginners! Target: 15+ warbler species, Scarlet Tanager, Wood Thrush.",
      hostId: elena.id,
      hotspotId: centralPark.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
      meetingPoint: "Belvedere Castle, Central Park",
      targetSpecies: JSON.stringify(["Cedar Waxwing", "Belted Kingfisher"]),
      maxParticipants: 8,
      status: "UPCOMING",
    },
  });

  const trip3 = await prisma.trip.upsert({
    where: { id: "trip-3" },
    update: {},
    create: {
      id: "trip-3",
      title: "Point Pelee Fallout Expedition",
      description: "Multi-day trip to witness the legendary spring migration fallout. Early mornings at the tip, afternoons exploring trails. Target: 25+ warbler species.",
      hostId: elena.id,
      hotspotId: pointPelee.id,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      meetingPoint: "Point Pelee National Park Visitor Center",
      targetSpecies: JSON.stringify(["Cedar Waxwing", "Painted Bunting", "Pileated Woodpecker"]),
      maxParticipants: 10,
      status: "UPCOMING",
    },
  });

  console.log("✅ Created trips");

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-1" },
    update: {},
    create: {
      id: "carpool-1",
      tripId: trip1.id,
      driverId: marcus.id,
      originArea: "Philadelphia, PA — 30th Street Station",
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 2,
      notes: "Space for backpacks and scopes. Leaving promptly at 3:00 AM.",
    },
  });

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-2" },
    update: {},
    create: {
      id: "carpool-2",
      tripId: trip2.id,
      driverId: marcus.id,
      originArea: "North Philadelphia — Broad Street Line",
      departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 3,
      notes: "Easy subway access. Coffee on me!",
    },
  });

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-3" },
    update: {},
    create: {
      id: "carpool-3",
      tripId: trip3.id,
      driverId: marcus.id,
      originArea: "Detroit, MI — Downtown",
      departureTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 3,
      notes: "Long drive — leaving at 2:00 AM. Overnight stay included.",
    },
  });

  console.log("✅ Created carpool offers");

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip1.id, userId: elena.id } },
    update: {},
    create: { tripId: trip1.id, userId: elena.id, role: "HOST" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip1.id, userId: marcus.id } },
    update: {},
    create: { tripId: trip1.id, userId: marcus.id, role: "DRIVER" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip2.id, userId: elena.id } },
    update: {},
    create: { tripId: trip2.id, userId: elena.id, role: "HOST" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip2.id, userId: marcus.id } },
    update: {},
    create: { tripId: trip2.id, userId: marcus.id, role: "DRIVER" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip3.id, userId: elena.id } },
    update: {},
    create: { tripId: trip3.id, userId: elena.id, role: "HOST" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip3.id, userId: marcus.id } },
    update: {},
    create: { tripId: trip3.id, userId: marcus.id, role: "DRIVER" },
  });

  console.log("✅ Created trip RSVPs");

  const baldEagle = await prisma.species.findUnique({ where: { commonName: "Bald Eagle" } });
  const kingfisher = await prisma.species.findUnique({ where: { commonName: "Belted Kingfisher" } });
  const cedarWaxwing = await prisma.species.findUnique({ where: { commonName: "Cedar Waxwing" } });
  const heron = await prisma.species.findUnique({ where: { commonName: "Great Blue Heron" } });
  const peregrine = await prisma.species.findUnique({ where: { commonName: "Peregrine Falcon" } });

  for (const s of [
      {
        userId: elena.id,
        speciesId: baldEagle.id,
        hotspotId: capeMay.id,
        tripId: trip1.id,
        count: 3,
        notes: "Two adults and one juvenile soaring over the meadow",
        latitude: 38.9350,
        longitude: -74.9680,
        spottedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: marcus.id,
        speciesId: kingfisher.id,
        hotspotId: capeMay.id,
        tripId: trip1.id,
        count: 1,
        notes: "Male perched on dead snag over pond",
        latitude: 38.9320,
        longitude: -74.9650,
        spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: elena.id,
        speciesId: cedarWaxwing.id,
        hotspotId: centralPark.id,
        count: 12,
        notes: "Flock feeding on serviceberries near the Lake",
        latitude: 40.7810,
        longitude: -73.9680,
        spottedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: marcus.id,
        speciesId: heron.id,
        hotspotId: olympic.id,
        count: 2,
        notes: "Pair nesting in rookery",
        latitude: 47.9500,
        longitude: -124.3800,
        spottedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: maya.id,
        speciesId: peregrine.id,
        hotspotId: pointPelee.id,
        count: 1,
        notes: "Stooping on shorebirds at the tip!",
        latitude: 41.9150,
        longitude: -82.5150,
        spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]) {
      await prisma.sighting.create({ data: s }).catch(() => {});
    }

  console.log("✅ Created sample sightings");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });