import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Generates a URL-friendly slug from a name.
 * @param {string} name - The name to slugify
 * @returns {string} The slugified name
 */
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Main seed function - populates the database with initial data.
 * Idempotent: safe to run multiple times.
 * @returns {Promise<void>}
 */
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
    { commonName: "Bald Eagle", scientificName: "Haliaeetus leucocephalus", category: "Raptor", description: "Iconic raptor with white head and tail, found near large bodies of water. National bird of the USA.", habitat: "Coastal areas, lakes, rivers", imageUrl: "https://cdn.birdphotoworld.com/bald-eagle.jpg", audioUrl: "https://cdn.birdphotoworld.com/bald-eagle-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Cedar Waxwing", scientificName: "Bombycilla cedrorum", category: "Songbird", description: "Sleek, crested bird with waxy red tips on wing feathers. Travels in flocks, feeding on berries.", habitat: "Woodlands, orchards, suburban areas", imageUrl: "https://cdn.birdphotoworld.com/cedar-waxwing.jpg", audioUrl: "https://cdn.birdphotoworld.com/cedar-waxwing-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Belted Kingfisher", scientificName: "Megaceryle alcyon", category: "Kingfisher", description: "Stocky, crested bird with a rattling call. Hovers over water before diving for fish.", habitat: "Rivers, lakes, estuaries, coastal waters", imageUrl: "https://cdn.birdphotoworld.com/belted-kingfisher.jpg", audioUrl: "https://cdn.birdphotoworld.com/belted-kingfisher-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Great Blue Heron", scientificName: "Ardea herodias", category: "Wader", description: "Large, stately heron with blue-gray plumage. Stalks prey in shallow water with lightning-fast strikes.", habitat: "Marshes, swamps, shorelines, tidal flats", imageUrl: "https://cdn.birdphotoworld.com/great-blue-heron.jpg", audioUrl: "https://cdn.birdphotoworld.com/great-blue-heron-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Pileated Woodpecker", scientificName: "Dryocopus pileatus", category: "Woodpecker", description: "Largest woodpecker in North America. Creates rectangular holes in dead trees searching for carpenter ants.", habitat: "Mature forests with large trees", imageUrl: "https://cdn.birdphotoworld.com/pileated-woodpecker.jpg", audioUrl: "https://cdn.birdphotoworld.com/pileated-woodpecker-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Painted Bunting", scientificName: "Passerina ciris", category: "Songbird", description: "Male is a rainbow of colors — blue head, red underparts, green back. A true gem of the southern brushlands.", habitat: "Brushy areas, woodland edges, thickets", imageUrl: "https://cdn.birdphotoworld.com/painted-bunting.jpg", audioUrl: "https://cdn.birdphotoworld.com/painted-bunting-call.mp3", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Peregrine Falcon", scientificName: "Falco peregrinus", category: "Raptor", description: "Fastest animal on earth — dives at 200+ mph. Nests on cliffs and tall buildings.", habitat: "Cliffs, cities, coastlines", imageUrl: "https://cdn.birdphotoworld.com/peregrine-falcon.jpg", audioUrl: "https://cdn.birdphotoworld.com/peregrine-falcon-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Red-tailed Hawk", scientificName: "Buteo jamaicensis", category: "Raptor", description: "Most common buteo in North America. Soars on broad wings, often perched on roadside poles.", habitat: "Open country, woodlands, cities", imageUrl: "https://cdn.birdphotoworld.com/red-tailed-hawk.jpg", audioUrl: "https://cdn.birdphotoworld.com/red-tailed-hawk-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Cooper's Hawk", scientificName: "Accipiter cooperii", category: "Raptor", description: "Agile forest hawk that hunts birds at feeders. Long tail, short rounded wings for maneuvering through trees.", habitat: "Woodlands, suburban areas", imageUrl: "https://cdn.birdphotoworld.com/coopers-hawk.jpg", audioUrl: "https://cdn.birdphotoworld.com/coopers-hawk-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Sharp-shinned Hawk", scientificName: "Accipiter striatus", category: "Raptor", description: "Smallest accipiter, fierce bird hunter. Similar to Cooper's but smaller with squared tail.", habitat: "Forests, forest edges", imageUrl: "https://cdn.birdphotoworld.com/sharp-shinned-hawk.jpg", audioUrl: "https://cdn.birdphotoworld.com/sharp-shinned-hawk-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Harrier", scientificName: "Circus hudsonius", category: "Raptor", description: "Owl-faced hawk that hunts low over marshes and fields. White rump patch visible in flight.", habitat: "Marshes, grasslands, open fields", imageUrl: "https://cdn.birdphotoworld.com/northern-harrier.jpg", audioUrl: "https://cdn.birdphotoworld.com/northern-harrier-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "American Kestrel", scientificName: "Falco sparverius", category: "Raptor", description: "Smallest falcon in North America. Hovers over fields hunting insects and small mammals.", habitat: "Open fields, farmland, urban areas", imageUrl: "https://cdn.birdphotoworld.com/american-kestrel.jpg", audioUrl: "https://cdn.birdphotoworld.com/american-kestrel-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Merlin", scientificName: "Falco columbarius", category: "Raptor", description: "Small, powerful falcon. Fast, direct flight. Often chases small birds in open areas.", habitat: "Open country, coastlines, cities", imageUrl: "https://cdn.birdphotoworld.com/merlin.jpg", audioUrl: "https://cdn.birdphotoworld.com/merlin-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Mallard", scientificName: "Anas platyrhynchos", category: "Waterfowl", description: "Familiar dabbling duck. Male has iridescent green head. Ancestor of most domestic ducks.", habitat: "Ponds, lakes, rivers, urban parks", imageUrl: "https://cdn.birdphotoworld.com/mallard.jpg", audioUrl: "https://cdn.birdphotoworld.com/mallard-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Wood Duck", scientificName: "Aix sponsa", category: "Waterfowl", description: "Stunningly colorful perching duck. Nests in tree cavities near water.", habitat: "Wooded swamps, marshes, ponds", imageUrl: "https://cdn.birdphotoworld.com/wood-duck.jpg", audioUrl: "https://cdn.birdphotoworld.com/wood-duck-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Canada Goose", scientificName: "Branta canadensis", category: "Waterfowl", description: "Large, familiar goose with black neck and white chinstrap. Forms V-formations during migration.", habitat: "Lakes, rivers, fields, parks", imageUrl: "https://cdn.birdphotoworld.com/canada-goose.jpg", audioUrl: "https://cdn.birdphotoworld.com/canada-goose-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Snow Goose", scientificName: "Anser caerulescens", category: "Waterfowl", description: "White goose with black wingtips. Migrates in massive, noisy flocks. Blue morph also occurs.", habitat: "Arctic tundra (breeding), fields, marshes (winter)", imageUrl: "https://cdn.birdphotoworld.com/snow-goose.jpg", audioUrl: "https://cdn.birdphotoworld.com/snow-goose-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Tundra Swan", scientificName: "Cygnus columbianus", category: "Waterfowl", description: "Large white swan with black bill. Yellow spot at base of bill distinguishes from Trumpeter Swan.", habitat: "Arctic tundra (breeding), coastal bays, lakes (winter)", imageUrl: "https://cdn.birdphotoworld.com/tundra-swan.jpg", audioUrl: "https://cdn.birdphotoworld.com/tundra-swan-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Northern Pintail", scientificName: "Anas acuta", category: "Waterfowl", description: "Elegant, long-necked dabbling duck. Male has distinctive long tail feathers.", habitat: "Marshes, ponds, agricultural fields", imageUrl: "https://cdn.birdphotoworld.com/northern-pintail.jpg", audioUrl: "https://cdn.birdphotoworld.com/northern-pintail-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Killdeer", scientificName: "Charadrius vociferus", category: "Shorebird", description: "Familiar plover with two black breast bands. Famous for broken-wing distraction display.", habitat: "Open fields, shorelines, parking lots", imageUrl: "https://cdn.birdphotoworld.com/killdeer.jpg", audioUrl: "https://cdn.birdphotoworld.com/killdeer-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Greater Yellowlegs", scientificName: "Tringa melanoleuca", category: "Shorebird", description: "Tall, elegant shorebird with bright yellow legs. Loud, ringing calls. Often solitary.", habitat: "Marshes, mudflats, shorelines", imageUrl: "https://cdn.birdphotoworld.com/greater-yellowlegs.jpg", audioUrl: "https://cdn.birdphotoworld.com/greater-yellowlegs-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Spotted Sandpiper", scientificName: "Actitis macularius", category: "Shorebird", description: "Teetering sandpiper with spotted breast (breeding). Walks with distinctive bobbing motion.", habitat: "Shorelines, streams, ponds", imageUrl: "https://cdn.birdphotoworld.com/spotted-sandpiper.jpg", audioUrl: "https://cdn.birdphotoworld.com/spotted-sandpiper-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Semipalmated Sandpiper", scientificName: "Calidris pusilla", category: "Shorebird", description: "Small, abundant 'peep' sandpiper. Short, straight bill. Migrates in huge flocks.", habitat: "Mudflats, beaches, marshes", imageUrl: "https://cdn.birdphotoworld.com/semipalmated-sandpiper.jpg", audioUrl: "https://cdn.birdphotoworld.com/semipalmated-sandpiper-call.mp3", rarity: "Common", conservationStatus: "Near Threatened" },
    { commonName: "Sanderling", scientificName: "Calidris alba", category: "Shorebird", description: "Pale, wave-chasing sandpiper. Runs back and forth with retreating waves on sandy beaches.", habitat: "Sandy beaches, tidal flats", imageUrl: "https://cdn.birdphotoworld.com/sanderling.jpg", audioUrl: "https://cdn.birdphotoworld.com/sanderling-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Wilson's Snipe", scientificName: "Gallinago delicata", category: "Shorebird", description: "Cryptic, long-billed shorebird. Performs winnowing display flight with tail feathers.", habitat: "Wet meadows, marshes, bogs", imageUrl: "https://cdn.birdphotoworld.com/wilsons-snipe.jpg", audioUrl: "https://cdn.birdphotoworld.com/wilsons-snipe-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Yellow Warbler", scientificName: "Setophaga petechia", category: "Warbler", description: "Bright yellow warbler with reddish streaks on male's breast. Sweet, whistled song.", habitat: "Riparian thickets, shrubby areas, gardens", imageUrl: "https://cdn.birdphotoworld.com/yellow-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/yellow-warbler-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Yellow-rumped Warbler", scientificName: "Setophaga coronata", category: "Warbler", description: "Abundant warbler with yellow rump patch. Only warbler that regularly winters in North America.", habitat: "Coniferous forests, open woods, shrublands", imageUrl: "https://cdn.birdphotoworld.com/yellow-rumped-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/yellow-rumped-warbler-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-and-white Warbler", scientificName: "Mniotilta varia", category: "Warbler", description: "Striking black-and-white striped warbler. Creeps along tree trunks like a nuthatch.", habitat: "Deciduous and mixed forests", imageUrl: "https://cdn.birdphotoworld.com/black-and-white-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/black-and-white-warbler-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "American Redstart", scientificName: "Setophaga ruticilla", category: "Warbler", description: "Male is black with orange patches. Flashes tail to startle insects. Very active forager.", habitat: "Deciduous forests, second growth", imageUrl: "https://cdn.birdphotoworld.com/american-redstart.jpg", audioUrl: "https://cdn.birdphotoworld.com/american-redstart-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Ovenbird", scientificName: "Seiurus aurocapilla", category: "Warbler", description: "Ground-walking warbler with orange crown stripes. Builds domed 'oven' nest on forest floor.", habitat: "Mature deciduous forests", imageUrl: "https://cdn.birdphotoworld.com/ovenbird.jpg", audioUrl: "https://cdn.birdphotoworld.com/ovenbird-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Common Yellowthroat", scientificName: "Geothlypis trichas", category: "Warbler", description: "Male has black mask, yellow throat. Skulks in dense vegetation. 'Wichity-wichity-wichity' song.", habitat: "Marshes, thickets, shrubby fields", imageUrl: "https://cdn.birdphotoworld.com/common-yellowthroat.jpg", audioUrl: "https://cdn.birdphotoworld.com/common-yellowthroat-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Waterthrush", scientificName: "Parkesia noveboracensis", category: "Warbler", description: "Streaked warbler that walks along water's edge, bobbing tail. Loud, ringing song.", habitat: "Swamps, bogs, stream banks", imageUrl: "https://cdn.birdphotoworld.com/northern-waterthrush.jpg", audioUrl: "https://cdn.birdphotoworld.com/northern-waterthrush-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Blackburnian Warbler", scientificName: "Setophaga fusca", category: "Warbler", description: "Stunning warbler with flaming orange throat. High canopy forager in spruce-fir forests.", habitat: "Coniferous forests, especially spruce-fir", imageUrl: "https://cdn.birdphotoworld.com/blackburnian-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/blackburnian-warbler-call.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Northern Cardinal", scientificName: "Cardinalis cardinalis", category: "Songbird", description: "Brilliant red male with crest and black mask. Female warm brown with red accents. Year-round resident.", habitat: "Woodland edges, gardens, shrublands", imageUrl: "https://cdn.birdphotoworld.com/northern-cardinal.jpg", audioUrl: "https://cdn.birdphotoworld.com/northern-cardinal-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Blue Jay", scientificName: "Cyanocitta cristata", category: "Songbird", description: "Bold, noisy jay with blue crest and white face. Intelligent, caches acorns for winter.", habitat: "Forests, parks, suburban areas", imageUrl: "https://cdn.birdphotoworld.com/blue-jay.jpg", audioUrl: "https://cdn.birdphotoworld.com/blue-jay-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "American Robin", scientificName: "Turdus migratorius", category: "Songbird", description: "Familiar thrush with orange breast. Early morning singer. Runs and pauses on lawns hunting worms.", habitat: "Lawns, parks, forests, towns", imageUrl: "https://cdn.birdphotoworld.com/american-robin.jpg", audioUrl: "https://cdn.birdphotoworld.com/american-robin-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Carolina Wren", scientificName: "Thryothorus ludovicianus", category: "Songbird", description: "Rich reddish-brown wren with white eyebrow. Loud, varied song for its size. Year-round pair bonds.", habitat: "Woodlands, suburbs, brushy areas", imageUrl: "https://cdn.birdphotoworld.com/carolina-wren.jpg", audioUrl: "https://cdn.birdphotoworld.com/carolina-wren-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Tufted Titmouse", scientificName: "Baeolophus bicolor", category: "Songbird", description: "Gray songbird with prominent crest and black forehead. Acrobatic feeder, often at feeders.", habitat: "Deciduous forests, parks, suburbs", imageUrl: "https://cdn.birdphotoworld.com/tufted-titmouse.jpg", audioUrl: "https://cdn.birdphotoworld.com/tufted-titmouse-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-capped Chickadee", scientificName: "Poecile atricapillus", category: "Songbird", description: "Tiny, curious bird with black cap and bib. 'Chick-a-dee-dee-dee' call. Feeder favorite.", habitat: "Forests, parks, backyards", imageUrl: "https://cdn.birdphotoworld.com/black-capped-chickadee.jpg", audioUrl: "https://cdn.birdphotoworld.com/black-capped-chickadee-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "White-breasted Nuthatch", scientificName: "Sitta carolinensis", category: "Songbird", description: "Blue-gray above, white below. Creeps headfirst down tree trunks. Nasal 'yank-yank' call.", habitat: "Deciduous forests, woodlands", imageUrl: "https://cdn.birdphotoworld.com/white-breasted-nuthatch.jpg", audioUrl: "https://cdn.birdphotoworld.com/white-breasted-nuthatch-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Red-breasted Nuthatch", scientificName: "Sitta canadensis", category: "Songbird", description: "Smaller nuthatch with black eye stripe and rusty underparts. Higher-pitched 'yank' call.", habitat: "Coniferous forests", imageUrl: "https://cdn.birdphotoworld.com/red-breasted-nuthatch.jpg", audioUrl: "https://cdn.birdphotoworld.com/red-breasted-nuthatch-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Brown Creeper", scientificName: "Certhia americana", category: "Songbird", description: "Tiny, cryptic bird that spirals up tree trunks. High, thin 'tsee' call. Well-camouflaged.", habitat: "Mature forests, especially coniferous", imageUrl: "https://cdn.birdphotoworld.com/brown-creeper.jpg", audioUrl: "https://cdn.birdphotoworld.com/brown-creeper-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "House Wren", scientificName: "Troglodytes aedon", category: "Songbird", description: "Plain brown wren with bubbly, energetic song. Nests in cavities, often in birdhouses.", habitat: "Open woods, gardens, suburbs", imageUrl: "https://cdn.birdphotoworld.com/house-wren.jpg", audioUrl: "https://cdn.birdphotoworld.com/house-wren-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Downy Woodpecker", scientificName: "Dryobates pubescens", category: "Woodpecker", description: "Smallest North American woodpecker. Black and white with red nape patch (male). Common feeder visitor.", habitat: "Woodlands, parks, suburbs", imageUrl: "https://cdn.birdphotoworld.com/downy-woodpecker.jpg", audioUrl: "https://cdn.birdphotoworld.com/downy-woodpecker-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Hairy Woodpecker", scientificName: "Dryobates villosus", category: "Woodpecker", description: "Larger version of Downy with longer bill. Same pattern but more powerful drumming.", habitat: "Mature forests, woodlands", imageUrl: "https://cdn.birdphotoworld.com/hairy-woodpecker.jpg", audioUrl: "https://cdn.birdphotoworld.com/hairy-woodpecker-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Flicker", scientificName: "Colaptes auratus", category: "Woodpecker", description: "Large, brown woodpecker with black-spotted belly. Often feeds on ants on the ground.", habitat: "Open woods, edges, suburbs", imageUrl: "https://cdn.birdphotoworld.com/northern-flicker.jpg", audioUrl: "https://cdn.birdphotoworld.com/northern-flicker-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Red-bellied Woodpecker", scientificName: "Melanerpes carolinus", category: "Woodpecker", description: "Pale woodpecker with zebra-striped back and red cap (male). Faint red belly hard to see.", habitat: "Forests, woodlands, suburbs", imageUrl: "https://cdn.birdphotoworld.com/red-bellied-woodpecker.jpg", audioUrl: "https://cdn.birdphotoworld.com/red-bellied-woodpecker-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Great Egret", scientificName: "Ardea alba", category: "Wader", description: "Large, all-white heron with yellow bill and black legs. Stalks gracefully in shallow water.", habitat: "Marshes, swamps, shorelines", imageUrl: "https://cdn.birdphotoworld.com/great-egret.jpg", audioUrl: "https://cdn.birdphotoworld.com/great-egret-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Snowy Egret", scientificName: "Egretta thula", category: "Wader", description: "Medium white heron with black legs, yellow feet, and lacy breeding plumes. Active forager.", habitat: "Marshes, swamps, coastal lagoons", imageUrl: "https://cdn.birdphotoworld.com/snowy-egret.jpg", audioUrl: "https://cdn.birdphotoworld.com/snowy-egret-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Green Heron", scientificName: "Butorides virescens", category: "Wader", description: "Small, stocky heron with greenish back. Uses bait (feathers, twigs) to lure fish.", habitat: "Wooded ponds, marshes, streams", imageUrl: "https://cdn.birdphotoworld.com/green-heron.jpg", audioUrl: "https://cdn.birdphotoworld.com/green-heron-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-crowned Night Heron", scientificName: "Nycticorax nycticorax", category: "Wader", description: "Stocky heron with black cap and back, red eyes. Most active at dusk and night.", habitat: "Marshes, swamps, urban parks", imageUrl: "https://cdn.birdphotoworld.com/black-crowned-night-heron.jpg", audioUrl: "https://cdn.birdphotoworld.com/black-crowned-night-heron-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Ring-billed Gull", scientificName: "Larus delawarensis", category: "Gull/Tern", description: "Medium gull with black ring around yellow bill. Common inland, not just coasts.", habitat: "Lakes, rivers, parking lots, coasts", imageUrl: "https://cdn.birdphotoworld.com/ring-billed-gull.jpg", audioUrl: "https://cdn.birdphotoworld.com/ring-billed-gull-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Herring Gull", scientificName: "Larus argentatus", category: "Gull/Tern", description: "Large, pink-legged gull with gray back. Classic 'seagull' of the Northeast coast.", habitat: "Coasts, lakes, landfills", imageUrl: "https://cdn.birdphotoworld.com/herring-gull.jpg", audioUrl: "https://cdn.birdphotoworld.com/herring-gull-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Common Tern", scientificName: "Sterna hirundo", category: "Gull/Tern", description: "Graceful tern with black cap, orange-red bill. Plunge-dives for small fish.", habitat: "Coasts, islands, large lakes", imageUrl: "https://cdn.birdphotoworld.com/common-tern.jpg", audioUrl: "https://cdn.birdphotoworld.com/common-tern-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Ruby-throated Hummingbird", scientificName: "Archilochus colubris", category: "Other", description: "Only breeding hummingbird in eastern North America. Male has iridescent ruby throat.", habitat: "Gardens, woodlands, meadows", imageUrl: "https://cdn.birdphotoworld.com/ruby-throated-hummingbird.jpg", audioUrl: "https://cdn.birdphotoworld.com/ruby-throated-hummingbird-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Eastern Kingbird", scientificName: "Tyrannus tyrannus", category: "Other", description: "Large flycatcher with dark head, white tail tip. Aggressive defender of nest territory.", habitat: "Open areas, fields, edges", imageUrl: "https://cdn.birdphotoworld.com/eastern-kingbird.jpg", audioUrl: "https://cdn.birdphotoworld.com/eastern-kingbird-call.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Whooping Crane", scientificName: "Grus americana", category: "Wader", description: "Tallest bird in North America. White with black wingtips and red crown. Critically endangered.", habitat: "Wetlands, marshes, coastal prairies", imageUrl: "https://cdn.birdphotoworld.com/whooping-crane.jpg", audioUrl: "https://cdn.birdphotoworld.com/whooping-crane-call.mp3", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "California Condor", scientificName: "Gymnogyps californianus", category: "Raptor", description: "Largest North American land bird. Black with white underwing patches. Critically endangered.", habitat: "Mountains, cliffs, open grasslands", imageUrl: "https://cdn.birdphotoworld.com/california-condor.jpg", audioUrl: "https://cdn.birdphotoworld.com/california-condor-call.mp3", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Kirtland's Warbler", scientificName: "Setophaga kirtlandii", category: "Warbler", description: "Rare warbler breeding only in young jack pine forests in Michigan. Gray-blue above, yellow below.", habitat: "Young jack pine forests", imageUrl: "https://cdn.birdphotoworld.com/kirtlands-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/kirtlands-warbler-call.mp3", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Red-cockaded Woodpecker", scientificName: "Dryobates borealis", category: "Woodpecker", description: "Small woodpecker with black cap and white cheek patches. Requires mature pine forests.", habitat: "Mature pine savannas", imageUrl: "https://cdn.birdphotoworld.com/red-cockaded-woodpecker.jpg", audioUrl: "https://cdn.birdphotoworld.com/red-cockaded-woodpecker-call.mp3", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Golden-cheeked Warbler", scientificName: "Setophaga chrysoparia", category: "Warbler", description: "Endemic to Texas Hill Country. Black throat, golden cheeks. Breeds in mature juniper-oak woodlands.", habitat: "Juniper-oak woodlands", imageUrl: "https://cdn.birdphotoworld.com/golden-cheeked-warbler.jpg", audioUrl: "https://cdn.birdphotoworld.com/golden-cheeked-warbler-call.mp3", rarity: "Rare", conservationStatus: "Endangered" },
    { commonName: "Black-capped Vireo", scientificName: "Vireo atricapilla", category: "Songbird", description: "Small songbird with black cap (male) and white spectacles. Brushy hillsides in Texas and Oklahoma.", habitat: "Brushy hillsides, oak scrub", imageUrl: "https://cdn.birdphotoworld.com/black-capped-vireo.jpg", audioUrl: "https://cdn.birdphotoworld.com/black-capped-vireo-call.mp3", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Florida Scrub-Jay", scientificName: "Aphelocoma coerulescens", category: "Songbird", description: "Only bird endemic to Florida. Blue and gray, cooperative breeder in scrub oak habitat.", habitat: "Florida scrub oak", imageUrl: "https://cdn.birdphotoworld.com/florida-scrub-jay.jpg", audioUrl: "https://cdn.birdphotoworld.com/florida-scrub-jay-call.mp3", rarity: "Rare", conservationStatus: "Vulnerable" },
    { commonName: "Gunnison Sage-Grouse", scientificName: "Centrocercus minimus", category: "Other", description: "Rare grouse of Colorado/Utah sagebrush. Spectacular mating display on leks.", habitat: "Sagebrush flats", imageUrl: "https://cdn.birdphotoworld.com/gunnison-sage-grouse.jpg", audioUrl: "https://cdn.birdphotoworld.com/gunnison-sage-grouse-call.mp3", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "Lesser Prairie-Chicken", scientificName: "Tympanuchus pallidicinctus", category: "Other", description: "Prairie grouse of southern Great Plains. Known for booming lek displays.", habitat: "Sand sagebrush, shinnery oak prairies", imageUrl: "https://cdn.birdphotoworld.com/lesser-prairie-chicken.jpg", audioUrl: "https://cdn.birdphotoworld.com/lesser-prairie-chicken-call.mp3", rarity: "Rare", conservationStatus: "Vulnerable" },
    { commonName: "Sprague's Pipit", scientificName: "Anthus spragueii", category: "Songbird", description: "Grassland specialist with high, spiraling flight song. Declining due to habitat loss.", habitat: "Native mixed-grass prairies", imageUrl: "https://cdn.birdphotoworld.com/spragues-pipit.jpg", audioUrl: "https://cdn.birdphotoworld.com/spragues-pipit-call.mp3", rarity: "Rare", conservationStatus: "Vulnerable" },
  ];

  for (let i = 0; i < speciesData.length; i++) {
    const s = speciesData[i];
    await prisma.species.upsert({
      where: { commonName: s.commonName },
      update: {
        scientificName: s.scientificName,
        category: s.category,
        description: s.description,
        habitat: s.habitat,
        imageUrl: s.imageUrl,
        audioUrl: s.audioUrl,
        rarity: s.rarity,
        conservationStatus: s.conservationStatus,
      },
      create: s,
    });
    if ((i + 1) % 10 === 0) {
      console.log(`  ... seeded ${i + 1} species`);
    }
  }
  console.log(`✅ Created ${speciesData.length} species`);

  const hotspotsData = [
    { name: "Cape May Wetland Reserve", description: "World-renowned migration hotspot. Spring and fall bring massive numbers of warblers, raptors, and shorebirds.", locationName: "Cape May Point, NJ", latitude: 38.9333, longitude: -74.9667, habitatType: "Wetland", amenities: "Boardwalks, observation towers, visitor center, restrooms, hawkwatch platform", coverImage: "https://cdn.birdphotoworld.com/cape-may.jpg" },
    { name: "Central Park Ramble", description: "Urban oasis in Manhattan. 230+ species recorded. Best during spring migration for warblers, tanagers, and flycatchers.", locationName: "Manhattan, NY", latitude: 40.7829, longitude: -73.9654, habitatType: "Forest", amenities: "Walking paths, benches, nearby cafes, restrooms, Belvedere Castle", coverImage: "https://cdn.birdphotoworld.com/central-park.jpg" },
    { name: "Point Pelee Marshlands", description: "Southernmost point of mainland Canada. Famous for spring migration 'fallout' events. Warblers, vireos, flycatchers in abundance.", locationName: "Leamington, ON, Canada", latitude: 41.9167, longitude: -82.5167, habitatType: "Wetland", amenities: "Visitor center, shuttle to tip, boardwalks, restrooms, campground", coverImage: "https://cdn.birdphotoworld.com/point-pelee.jpg" },
    { name: "Olympic Coastal Sanctuary", description: "Rugged Pacific coastline with seabird colonies, tide pools, and old-growth forest. Pelagic species, puffins, murres.", locationName: "Forks, WA", latitude: 47.9542, longitude: -124.3847, habitatType: "Coast", amenities: "Trailheads, campgrounds, visitor center, tide pools, ranger programs", coverImage: "https://cdn.birdphotoworld.com/olympic-coast.jpg" },

    { name: "Everglades National Park", description: "Vast subtropical wilderness. Roseate Spoonbills, Snail Kites, Wood Storks, and countless wading birds.", locationName: "Homestead, FL", latitude: 25.2866, longitude: -80.8987, habitatType: "Wetland", amenities: "Visitor centers, tram tours, boat tours, campgrounds, hiking trails", coverImage: "https://cdn.birdphotoworld.com/everglades.jpg" },
    { name: "Corkscrew Swamp Sanctuary", description: "Old-growth bald cypress forest with 2.25-mile boardwalk. Painted Buntings, Limpkins, Barred Owls.", locationName: "Naples, FL", latitude: 26.3767, longitude: -81.6142, habitatType: "Wetland", amenities: "Boardwalk, visitor center, gift shop, guided walks", coverImage: "https://cdn.birdphotoworld.com/corkscrew-swamp.jpg" },
    { name: "Ding Darling National Wildlife Refuge", description: "Sanibel Island refuge famous for Roseate Spoonbills, Reddish Egrets, and shorebirds on wildlife drive.", locationName: "Sanibel, FL", latitude: 26.4500, longitude: -82.1100, habitatType: "Wetland", amenities: "Wildlife drive, visitor center, tram tours, kayak rentals", coverImage: "https://cdn.birdphotoworld.com/ding-darling.jpg" },

    { name: "Magee Marsh Wildlife Area", description: "Lake Erie's 'Warbler Capital of the World'. Boardwalk through migrant trap during May migration.", locationName: "Oak Harbor, OH", latitude: 41.6333, longitude: -83.2167, habitatType: "Wetland", amenities: "Boardwalk, visitor center, observation tower, restrooms", coverImage: "https://cdn.birdphotoworld.com/magee-marsh.jpg" },
    { name: "Horicon Marsh", description: "Largest freshwater cattail marsh in the US. 300+ species. Massive waterfowl concentrations in migration.", locationName: "Horicon, WI", latitude: 43.4667, longitude: -88.6333, habitatType: "Wetland", amenities: "Visitor center, auto tour, hiking trails, boat launch", coverImage: "https://cdn.birdphotoworld.com/horicon-marsh.jpg" },

    { name: "Bosque del Apache NWR", description: "New Mexico desert refuge. Tens of thousands of Sandhill Cranes and Snow Geese in winter.", locationName: "San Antonio, NM", latitude: 33.8000, longitude: -106.8833, habitatType: "Wetland", amenities: "Auto tour loop, visitor center, photography blinds, hiking trails", coverImage: "https://cdn.birdphotoworld.com/bosque-del-apache.jpg" },
    { name: "Southeastern Arizona Hotspots", description: "Sky Islands region: Ramsey Canyon, Madera Canyon, Cave Creek. Elegant Trogon, hummingbirds, specialty warblers.", locationName: "Sierra Vista, AZ", latitude: 31.5000, longitude: -110.3000, habitatType: "Mountain", amenities: "Visitor centers, feeder stations, hiking trails, lodging nearby", coverImage: "https://cdn.birdphotoworld.com/se-arizona.jpg" },
    { name: "Malheur National Wildlife Refuge", description: "High desert oasis in Oregon. Massive waterfowl concentrations, Sandhill Cranes, Bobolinks.", locationName: "Princeton, OR", latitude: 43.3000, longitude: -118.8333, habitatType: "Wetland", amenities: "Auto tour, visitor center, hiking trails, photography blinds", coverImage: "https://cdn.birdphotoworld.com/malheur.jpg" },

    { name: "Algonquin Provincial Park", description: "Ontario's iconic park. Spruce Grouse, Boreal Chickadee, Gray Jay, warblers, loons on lakes.", locationName: "Whitney, ON, Canada", latitude: 45.6000, longitude: -78.4000, habitatType: "Forest", amenities: "Visitor center, campgrounds, canoe routes, hiking trails", coverImage: "https://cdn.birdphotoworld.com/algonquin.jpg" },
    { name: "Long Point Bird Observatory", description: "World's oldest bird observatory. Migration monitoring on Lake Erie peninsula. Banding demonstrations.", locationName: "Port Rowan, ON, Canada", latitude: 42.5833, longitude: -80.4000, habitatType: "Wetland", amenities: "Visitor center, banding station, trails, old cut", coverImage: "https://cdn.birdphotoworld.com/long-point.jpg" },
    { name: "Reifel Bird Sanctuary", description: "Delta, BC wetland sanctuary. Sandhill Cranes, Snow Geese, owls, woodpeckers. Excellent trails.", locationName: "Delta, BC, Canada", latitude: 49.1000, longitude: -123.1667, habitatType: "Wetland", amenities: "Walking trails, observation towers, heated viewing building, gift shop", coverImage: "https://cdn.birdphotoworld.com/reifel.jpg" },
  ];

  const hotspots = [];
  for (let i = 0; i < hotspotsData.length; i++) {
    const h = hotspotsData[i];
    const hotspot = await prisma.hotspot.upsert({
      where: { name: h.name },
      update: {
        description: h.description,
        locationName: h.locationName,
        latitude: h.latitude,
        longitude: h.longitude,
        habitatType: h.habitatType,
        amenities: h.amenities,
        coverImage: h.coverImage,
      },
      create: h,
    });
    hotspots.push(hotspot);
    if ((i + 1) % 5 === 0) {
      console.log(`  ... seeded ${i + 1} hotspots`);
    }
  }
  console.log(`✅ Created ${hotspotsData.length} hotspots`);

  const capeMay = hotspots.find(h => h.name === "Cape May Wetland Reserve");
  const centralPark = hotspots.find(h => h.name === "Central Park Ramble");
  const pointPelee = hotspots.find(h => h.name === "Point Pelee Marshlands");
  const olympic = hotspots.find(h => h.name === "Olympic Coastal Sanctuary");
  const everglades = hotspots.find(h => h.name === "Everglades National Park");
  const corkscrew = hotspots.find(h => h.name === "Corkscrew Swamp Sanctuary");
  const dingDarling = hotspots.find(h => h.name === "Ding Darling National Wildlife Refuge");
  const magee = hotspots.find(h => h.name === "Magee Marsh Wildlife Area");
  const horicon = hotspots.find(h => h.name === "Horicon Marsh");
  const bosque = hotspots.find(h => h.name === "Bosque del Apache NWR");
  const seArizona = hotspots.find(h => h.name === "Southeastern Arizona Hotspots");
  const malheur = hotspots.find(h => h.name === "Malheur National Wildlife Refuge");
  const algonquin = hotspots.find(h => h.name === "Algonquin Provincial Park");
  const longPoint = hotspots.find(h => h.name === "Long Point Bird Observatory");
  const reifel = hotspots.find(h => h.name === "Reifel Bird Sanctuary");

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
      targetSpecies: JSON.stringify(["Bald Eagle", "Peregrine Falcon", "Belted Kingfisher", "Cedar Waxwing", "Yellow Warbler", "Blackburnian Warbler"]),
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
      targetSpecies: JSON.stringify(["Cedar Waxwing", "Belted Kingfisher", "American Redstart", "Ovenbird"]),
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
      targetSpecies: JSON.stringify(["Cedar Waxwing", "Painted Bunting", "Pileated Woodpecker", "Blackburnian Warbler", "Yellow Warbler"]),
      maxParticipants: 10,
      status: "UPCOMING",
    },
  });

  const trip4 = await prisma.trip.upsert({
    where: { id: "trip-4" },
    update: {},
    create: {
      id: "trip-4",
      title: "Everglades Wading Bird Bonanza",
      description: "Explore the River of Grass for Roseate Spoonbills, Wood Storks, Snail Kites, and dozens of heron/egret species. Boat tour included.",
      hostId: elena.id,
      hotspotId: everglades.id,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Ernest Coe Visitor Center",
      targetSpecies: JSON.stringify(["Great Blue Heron", "Great Egret", "Snowy Egret", "Green Heron"]),
      maxParticipants: 15,
      status: "UPCOMING",
    },
  });

  const trip5 = await prisma.trip.upsert({
    where: { id: "trip-5" },
    update: {},
    create: {
      id: "trip-5",
      title: "Magee Marsh Warbler Week",
      description: "The ultimate warbler experience! Walk the famous boardwalk during peak migration. 30+ warbler species possible.",
      hostId: elena.id,
      hotspotId: magee.id,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Magee Marsh Boardwalk Entrance",
      targetSpecies: JSON.stringify(["Yellow Warbler", "Yellow-rumped Warbler", "Black-and-white Warbler", "American Redstart", "Blackburnian Warbler", "Common Yellowthroat"]),
      maxParticipants: 12,
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

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-4" },
    update: {},
    create: {
      id: "carpool-4",
      tripId: trip4.id,
      driverId: marcus.id,
      originArea: "Miami, FL — Downtown",
      departureTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 3,
      notes: "Early start for best light. Bring mosquito repellent!",
    },
  });

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-5" },
    update: {},
    create: {
      id: "carpool-5",
      tripId: trip5.id,
      driverId: marcus.id,
      originArea: "Cleveland, OH — Tower City Center",
      departureTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 3,
      notes: "2.5 hour drive. Stopping for breakfast in Sandusky.",
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

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip4.id, userId: elena.id } },
    update: {},
    create: { tripId: trip4.id, userId: elena.id, role: "HOST" },
  });

  await prisma.tripRsvp.upsert({
    where: { tripId_userId: { tripId: trip5.id, userId: elena.id } },
    update: {},
    create: { tripId: trip5.id, userId: elena.id, role: "HOST" },
  });

  console.log("✅ Created trip RSVPs");

  const baldEagle = await prisma.species.findUnique({ where: { commonName: "Bald Eagle" } });
  const kingfisher = await prisma.species.findUnique({ where: { commonName: "Belted Kingfisher" } });
  const cedarWaxwing = await prisma.species.findUnique({ where: { commonName: "Cedar Waxwing" } });
  const heron = await prisma.species.findUnique({ where: { commonName: "Great Blue Heron" } });
  const peregrine = await prisma.species.findUnique({ where: { commonName: "Peregrine Falcon" } });
  const yellowWarbler = await prisma.species.findUnique({ where: { commonName: "Yellow Warbler" } });
  const redstart = await prisma.species.findUnique({ where: { commonName: "American Redstart" } });
  const ovenbird = await prisma.species.findUnique({ where: { commonName: "Ovenbird" } });
  const redtail = await prisma.species.findUnique({ where: { commonName: "Red-tailed Hawk" } });
  const woodDuck = await prisma.species.findUnique({ where: { commonName: "Wood Duck" } });
  const cardinal = await prisma.species.findUnique({ where: { commonName: "Northern Cardinal" } });
  const blueJay = await prisma.species.findUnique({ where: { commonName: "Blue Jay" } });
  const downy = await prisma.species.findUnique({ where: { commonName: "Downy Woodpecker" } });
  const greatEgret = await prisma.species.findUnique({ where: { commonName: "Great Egret" } });
  const snowyEgret = await prisma.species.findUnique({ where: { commonName: "Snowy Egret" } });
  const killdeer = await prisma.species.findUnique({ where: { commonName: "Killdeer" } });

  const sightingsData = [
    {
      id: "sighting-1",
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
      id: "sighting-2",
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
      id: "sighting-3",
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
      id: "sighting-4",
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
      id: "sighting-5",
      userId: maya.id,
      speciesId: peregrine.id,
      hotspotId: pointPelee.id,
      count: 1,
      notes: "Stooping on shorebirds at the tip!",
      latitude: 41.9150,
      longitude: -82.5150,
      spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-6",
      userId: elena.id,
      speciesId: yellowWarbler.id,
      hotspotId: magee.id,
      tripId: trip5.id,
      count: 5,
      notes: "Singing males defending territory along boardwalk",
      latitude: 41.6350,
      longitude: -83.2150,
      spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-7",
      userId: marcus.id,
      speciesId: redstart.id,
      hotspotId: magee.id,
      tripId: trip5.id,
      count: 8,
      notes: "Multiple males flashing tails in understory",
      latitude: 41.6340,
      longitude: -83.2160,
      spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-8",
      userId: maya.id,
      speciesId: ovenbird.id,
      hotspotId: centralPark.id,
      count: 1,
      notes: "Heard singing 'teacher-teacher-teacher' near Ramble",
      latitude: 40.7830,
      longitude: -73.9660,
      spottedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-9",
      userId: elena.id,
      speciesId: redtail.id,
      hotspotId: horicon.id,
      count: 4,
      notes: "Pair with two juveniles near auto tour route",
      latitude: 43.4700,
      longitude: -88.6300,
      spottedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-10",
      userId: marcus.id,
      speciesId: woodDuck.id,
      hotspotId: corkscrew.id,
      count: 6,
      notes: "Hen with 5 ducklings on boardwalk pond",
      latitude: 26.3750,
      longitude: -81.6150,
      spottedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-11",
      userId: maya.id,
      speciesId: cardinal.id,
      hotspotId: centralPark.id,
      count: 2,
      notes: "Male feeding female at feeder near feeders",
      latitude: 40.7800,
      longitude: -73.9670,
      spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-12",
      userId: elena.id,
      speciesId: blueJay.id,
      hotspotId: capeMay.id,
      count: 3,
      notes: "Noisy family group at hawkwatch platform",
      latitude: 38.9340,
      longitude: -74.9670,
      spottedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-13",
      userId: marcus.id,
      speciesId: downy.id,
      hotspotId: algonquin.id,
      count: 1,
      notes: "Male drumming on dead spruce near visitor center",
      latitude: 45.6050,
      longitude: -78.4050,
      spottedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-14",
      userId: maya.id,
      speciesId: greatEgret.id,
      hotspotId: dingDarling.id,
      count: 12,
      notes: "Roosting flock at sunset on wildlife drive",
      latitude: 26.4520,
      longitude: -82.1080,
      spottedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-15",
      userId: elena.id,
      speciesId: snowyEgret.id,
      hotspotId: everglades.id,
      count: 8,
      notes: "Active foraging in shallow slough, yellow feet flashing",
      latitude: 25.2900,
      longitude: -80.8950,
      spottedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "sighting-16",
      userId: marcus.id,
      speciesId: killdeer.id,
      hotspotId: horicon.id,
      count: 2,
      notes: "Pair performing distraction display near parking area",
      latitude: 43.4650,
      longitude: -88.6350,
      spottedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const s of sightingsData) {
    await prisma.sighting.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
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