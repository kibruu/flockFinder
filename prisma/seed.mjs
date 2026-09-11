import { config } from "dotenv";
config();

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
    { commonName: "Bald Eagle", scientificName: "Haliaeetus leucocephalus", category: "Raptor", description: "Iconic raptor with white head and tail, found near large bodies of water. National bird of the USA.", habitat: "Coastal areas, lakes, rivers", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Bald%20Eagle%20Head%20sq.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Yellowstone_sound_library_-_Bald_Eagle_-_002.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Cedar Waxwing", scientificName: "Bombycilla cedrorum", category: "Songbird", description: "Sleek, crested bird with waxy red tips on wing feathers. Travels in flocks, feeding on berries.", habitat: "Woodlands, orchards, suburban areas", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/20230608%20cedar%20waxwing%20PD26635.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Bombycilla_cedrorum_-_Cedar_Waxwing_XC107623.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Belted Kingfisher", scientificName: "Megaceryle alcyon", category: "Kingfisher", description: "Stocky, crested bird with a rattling call. Hovers over water before diving for fish.", habitat: "Rivers, lakes, estuaries, coastal waters", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Belted%20Kingfisher.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Great Blue Heron", scientificName: "Ardea herodias", category: "Wader", description: "Large, stately heron with blue-gray plumage. Stalks prey in shallow water with lightning-fast strikes.", habitat: "Marshes, swamps, shorelines, tidal flats", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Blue%20Heron%200887.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Pileated Woodpecker", scientificName: "Dryocopus pileatus", category: "Woodpecker", description: "Largest woodpecker in North America. Creates rectangular holes in dead trees searching for carpenter ants.", habitat: "Mature forests with large trees", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Pileated%20Woodpecker%20(9597212081).jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Dryocopus_pileatus_-_Pileated_Woodpecker_XC71727.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Painted Bunting", scientificName: "Passerina ciris", category: "Songbird", description: "Male is a rainbow of colors — blue head, red underparts, green back. A true gem of the southern brushlands.", habitat: "Brushy areas, woodland edges, thickets", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Painted-bunting-branch.jpg?width=640", audioUrl: "", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Peregrine Falcon", scientificName: "Falco peregrinus", category: "Raptor", description: "Fastest animal on earth — dives at 200+ mph. Nests on cliffs and tall buildings.", habitat: "Cliffs, cities, coastlines", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Peregrine%20Falcon%20Nepal.jpg?width=640", audioUrl: "", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Red-tailed Hawk", scientificName: "Buteo jamaicensis", category: "Raptor", description: "Most common buteo in North America. Soars on broad wings, often perched on roadside poles.", habitat: "Open country, woodlands, cities", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Red-tailed%20hawk%20(44371).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Cooper's Hawk", scientificName: "Accipiter cooperii", category: "Raptor", description: "Agile forest hawk that hunts birds at feeders. Long tail, short rounded wings for maneuvering through trees.", habitat: "Woodlands, suburban areas", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Cooper's%20hawk.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Accipiter_cooperii_-_Cooper%27s_Hawk_XC579251.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Sharp-shinned Hawk", scientificName: "Accipiter striatus", category: "Raptor", description: "Smallest accipiter, fierce bird hunter. Similar to Cooper's but smaller with squared tail.", habitat: "Forests, forest edges", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Puerto%20Rican%20Sharp-shinned%20hawk%20perched%20on%20tree%20limb.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Harrier", scientificName: "Circus hudsonius", category: "Raptor", description: "Owl-faced hawk that hunts low over marshes and fields. White rump patch visible in flight.", habitat: "Marshes, grasslands, open fields", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Northern%20harrier%20cape%20may%2010.23%20DSC%207919-topaz-sharpen.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Circus_cyaneus_-_Hen_Harrier_XC558933.mp3", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "American Kestrel", scientificName: "Falco sparverius", category: "Raptor", description: "Smallest falcon in North America. Hovers over fields hunting insects and small mammals.", habitat: "Open fields, farmland, urban areas", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/American%20kestrel%20(44273).jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Falco_sparverius_-_American_Kestrel_XC250844.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Merlin", scientificName: "Falco columbarius", category: "Raptor", description: "Small, powerful falcon. Fast, direct flight. Often chases small birds in open areas.", habitat: "Open country, coastlines, cities", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Falco_columbarius_001.jpg?width=640", audioUrl: "", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Mallard", scientificName: "Anas platyrhynchos", category: "Waterfowl", description: "Familiar dabbling duck. Male has iridescent green head. Ancestor of most domestic ducks.", habitat: "Ponds, lakes, rivers, urban parks", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Male%20mallard%20duck%202.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Wood Duck", scientificName: "Aix sponsa", category: "Waterfowl", description: "Stunningly colorful perching duck. Nests in tree cavities near water.", habitat: "Wooded swamps, marshes, ponds", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Wood%20Duck%20Male%20Aix%20sponsa%2004.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Aix_sponsa_-_Wood_Duck_XC63109.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Canada Goose", scientificName: "Branta canadensis", category: "Waterfowl", description: "Large, familiar goose with black neck and white chinstrap. Forms V-formations during migration.", habitat: "Lakes, rivers, fields, parks", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/20231208%20canada%20goose%20goodwin%20dock%20PD101660.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Branta_canadensis_-_Canada_Goose_XC62259.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Snow Goose", scientificName: "Anser caerulescens", category: "Waterfowl", description: "White goose with black wingtips. Migrates in massive, noisy flocks. Blue morph also occurs.", habitat: "Arctic tundra (breeding), fields, marshes (winter)", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Snow%20Goose.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Tundra Swan", scientificName: "Cygnus columbianus", category: "Waterfowl", description: "Large white swan with black bill. Yellow spot at base of bill distinguishes from Trumpeter Swan.", habitat: "Arctic tundra (breeding), coastal bays, lakes (winter)", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Tundra%20Swan%20(Cygnus%20columbianus)%20(8571142484).jpg?width=640", audioUrl: "", rarity: "Uncommon", conservationStatus: "Least Concern" },
    { commonName: "Northern Pintail", scientificName: "Anas acuta", category: "Waterfowl", description: "Elegant, long-necked dabbling duck. Male has distinctive long tail feathers.", habitat: "Marshes, ponds, agricultural fields", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Male%20northern%20pintail%20at%20Llano%20Seco.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Anas_acuta_-_Northern_Pintail_XC543138.mp3", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Killdeer", scientificName: "Charadrius vociferus", category: "Shorebird", description: "Familiar plover with two black breast bands. Famous for broken-wing distraction display.", habitat: "Open fields, shorelines, parking lots", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Killdeer.jpg?width=640", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Charadrius_vociferus_-_Killdeer_XC62728.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Greater Yellowlegs", scientificName: "Tringa melanoleuca", category: "Shorebird", description: "Tall, elegant shorebird with bright yellow legs. Loud, ringing calls. Often solitary.", habitat: "Marshes, mudflats, shorelines", imageUrl: "https://static.inaturalist.org/photos/312548110/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Spotted Sandpiper", scientificName: "Actitis macularius", category: "Shorebird", description: "Teetering sandpiper with spotted breast (breeding). Walks with distinctive bobbing motion.", habitat: "Shorelines, streams, ponds", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/46532647/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Semipalmated Sandpiper", scientificName: "Calidris pusilla", category: "Shorebird", description: "Small, abundant 'peep' sandpiper. Short, straight bill. Migrates in huge flocks.", habitat: "Mudflats, beaches, marshes", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/320602640/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Near Threatened" },
    { commonName: "Sanderling", scientificName: "Calidris alba", category: "Shorebird", description: "Pale, wave-chasing sandpiper. Runs back and forth with retreating waves on sandy beaches.", habitat: "Sandy beaches, tidal flats", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/232281217/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Wilson's Snipe", scientificName: "Gallinago delicata", category: "Shorebird", description: "Cryptic, long-billed shorebird. Performs winnowing display flight with tail feathers.", habitat: "Wet meadows, marshes, bogs", imageUrl: "https://static.inaturalist.org/photos/105697371/medium.jpg", audioUrl: "", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Yellow Warbler", scientificName: "Setophaga petechia", category: "Warbler", description: "Bright yellow warbler with reddish streaks on male's breast. Sweet, whistled song.", habitat: "Riparian thickets, shrubby areas, gardens", imageUrl: "https://static.inaturalist.org/photos/592586627/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Yellow-rumped Warbler", scientificName: "Setophaga coronata", category: "Warbler", description: "Abundant warbler with yellow rump patch. Only warbler that regularly winters in North America.", habitat: "Coniferous forests, open woods, shrublands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/128439522/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-and-white Warbler", scientificName: "Mniotilta varia", category: "Warbler", description: "Striking black-and-white striped warbler. Creeps along tree trunks like a nuthatch.", habitat: "Deciduous and mixed forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/71502776/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "American Redstart", scientificName: "Setophaga ruticilla", category: "Warbler", description: "Male is black with orange patches. Flashes tail to startle insects. Very active forager.", habitat: "Deciduous forests, second growth", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Female%20American%20Redstart.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Ovenbird", scientificName: "Seiurus aurocapilla", category: "Warbler", description: "Ground-walking warbler with orange crown stripes. Builds domed 'oven' nest on forest floor.", habitat: "Mature deciduous forests", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Ovenbird%20(90507).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Common Yellowthroat", scientificName: "Geothlypis trichas", category: "Warbler", description: "Male has black mask, yellow throat. Skulks in dense vegetation. 'Wichity-wichity-wichity' song.", habitat: "Marshes, thickets, shrubby fields", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Common%20yellowthroat%20in%20PP%20(14155).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Waterthrush", scientificName: "Parkesia noveboracensis", category: "Warbler", description: "Streaked warbler that walks along water's edge, bobbing tail. Loud, ringing song.", habitat: "Swamps, bogs, stream banks", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Northern%20waterthrush%20in%20PP%20(72375).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Blackburnian Warbler", scientificName: "Setophaga fusca", category: "Warbler", description: "Stunning warbler with flaming orange throat. High canopy forager in spruce-fir forests.", habitat: "Coniferous forests, especially spruce-fir", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Blackburnian%20warbler%20(71064).jpg?width=640", audioUrl: "", rarity: "Uncommon", conservationStatus: "Least Concern" },

    { commonName: "Northern Cardinal", scientificName: "Cardinalis cardinalis", category: "Songbird", description: "Brilliant red male with crest and black mask. Female warm brown with red accents. Year-round resident.", habitat: "Woodland edges, gardens, shrublands", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/20240125%20northern%20cardinal%20casa%20PD201493.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Blue Jay", scientificName: "Cyanocitta cristata", category: "Songbird", description: "Bold, noisy jay with blue crest and white face. Intelligent, caches acorns for winter.", habitat: "Forests, parks, suburban areas", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20jay%20in%20PP%20(30960).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "American Robin", scientificName: "Turdus migratorius", category: "Songbird", description: "Familiar thrush with orange breast. Early morning singer. Runs and pauses on lawns hunting worms.", habitat: "Lawns, parks, forests, towns", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/American%20robin%20(71307).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Carolina Wren", scientificName: "Thryothorus ludovicianus", category: "Songbird", description: "Rich reddish-brown wren with white eyebrow. Loud, varied song for its size. Year-round pair bonds.", habitat: "Woodlands, suburbs, brushy areas", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Carolina%20Wren1.jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Tufted Titmouse", scientificName: "Baeolophus bicolor", category: "Songbird", description: "Gray songbird with prominent crest and black forehead. Acrobatic feeder, often at feeders.", habitat: "Deciduous forests, parks, suburbs", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Tufted%20titmouse%20(10092).jpg?width=640", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-capped Chickadee", scientificName: "Poecile atricapillus", category: "Songbird", description: "Tiny, curious bird with black cap and bib. 'Chick-a-dee-dee-dee' call. Feeder favorite.", habitat: "Forests, parks, backyards", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/178279576/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "White-breasted Nuthatch", scientificName: "Sitta carolinensis", category: "Songbird", description: "Blue-gray above, white below. Creeps headfirst down tree trunks. Nasal 'yank-yank' call.", habitat: "Deciduous forests, woodlands", imageUrl: "https://static.inaturalist.org/photos/25544020/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Red-breasted Nuthatch", scientificName: "Sitta canadensis", category: "Songbird", description: "Smaller nuthatch with black eye stripe and rusty underparts. Higher-pitched 'yank' call.", habitat: "Coniferous forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/117331702/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Brown Creeper", scientificName: "Certhia americana", category: "Songbird", description: "Tiny, cryptic bird that spirals up tree trunks. High, thin 'tsee' call. Well-camouflaged.", habitat: "Mature forests, especially coniferous", imageUrl: "https://static.inaturalist.org/photos/31423761/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "House Wren", scientificName: "Troglodytes aedon", category: "Songbird", description: "Plain brown wren with bubbly, energetic song. Nests in cavities, often in birdhouses.", habitat: "Open woods, gardens, suburbs", imageUrl: "https://static.inaturalist.org/photos/103258086/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Downy Woodpecker", scientificName: "Dryobates pubescens", category: "Woodpecker", description: "Smallest North American woodpecker. Black and white with red nape patch (male). Common feeder visitor.", habitat: "Woodlands, parks, suburbs", imageUrl: "https://static.inaturalist.org/photos/25544008/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Hairy Woodpecker", scientificName: "Dryobates villosus", category: "Woodpecker", description: "Larger version of Downy with longer bill. Same pattern but more powerful drumming.", habitat: "Mature forests, woodlands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/1275/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Northern Flicker", scientificName: "Colaptes auratus", category: "Woodpecker", description: "Large, brown woodpecker with black-spotted belly. Often feeds on ants on the ground.", habitat: "Open woods, edges, suburbs", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/123812445/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Red-bellied Woodpecker", scientificName: "Melanerpes carolinus", category: "Woodpecker", description: "Pale woodpecker with zebra-striped back and red cap (male). Faint red belly hard to see.", habitat: "Forests, woodlands, suburbs", imageUrl: "https://static.inaturalist.org/photos/383227697/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Great Egret", scientificName: "Ardea alba", category: "Wader", description: "Large, all-white heron with yellow bill and black legs. Stalks gracefully in shallow water.", habitat: "Marshes, swamps, shorelines", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/56653891/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Snowy Egret", scientificName: "Egretta thula", category: "Wader", description: "Medium white heron with black legs, yellow feet, and lacy breeding plumes. Active forager.", habitat: "Marshes, swamps, coastal lagoons", imageUrl: "https://static.inaturalist.org/photos/107527504/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Green Heron", scientificName: "Butorides virescens", category: "Wader", description: "Small, stocky heron with greenish back. Uses bait (feathers, twigs) to lure fish.", habitat: "Wooded ponds, marshes, streams", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/175041644/medium.jpeg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Black-crowned Night Heron", scientificName: "Nycticorax nycticorax", category: "Wader", description: "Stocky heron with black cap and back, red eyes. Most active at dusk and night.", habitat: "Marshes, swamps, urban parks", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/49357930/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Ring-billed Gull", scientificName: "Larus delawarensis", category: "Gull/Tern", description: "Medium gull with black ring around yellow bill. Common inland, not just coasts.", habitat: "Lakes, rivers, parking lots, coasts", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/117303151/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Herring Gull", scientificName: "Larus argentatus", category: "Gull/Tern", description: "Large, pink-legged gull with gray back. Classic 'seagull' of the Northeast coast.", habitat: "Coasts, lakes, landfills", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/183734844/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Common Tern", scientificName: "Sterna hirundo", category: "Gull/Tern", description: "Graceful tern with black cap, orange-red bill. Plunge-dives for small fish.", habitat: "Coasts, islands, large lakes", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/144056225/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Ruby-throated Hummingbird", scientificName: "Archilochus colubris", category: "Other", description: "Only breeding hummingbird in eastern North America. Male has iridescent ruby throat.", habitat: "Gardens, woodlands, meadows", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/221352761/medium.jpg", audioUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Archilochus_colubris_-_Ruby-throated_Hummingbird_XC109597.mp3", rarity: "Common", conservationStatus: "Least Concern" },
    { commonName: "Eastern Kingbird", scientificName: "Tyrannus tyrannus", category: "Other", description: "Large flycatcher with dark head, white tail tip. Aggressive defender of nest territory.", habitat: "Open areas, fields, edges", imageUrl: "https://static.inaturalist.org/photos/518522154/medium.jpg", audioUrl: "", rarity: "Common", conservationStatus: "Least Concern" },

    { commonName: "Whooping Crane", scientificName: "Grus americana", category: "Wader", description: "Tallest bird in North America. White with black wingtips and red crown. Critically endangered.", habitat: "Wetlands, marshes, coastal prairies", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/132879083/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "California Condor", scientificName: "Gymnogyps californianus", category: "Raptor", description: "Largest North American land bird. Black with white underwing patches. Critically endangered.", habitat: "Mountains, cliffs, open grasslands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/205288597/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Kirtland's Warbler", scientificName: "Setophaga kirtlandii", category: "Warbler", description: "Rare warbler breeding only in young jack pine forests in Michigan. Gray-blue above, yellow below.", habitat: "Young jack pine forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/534078490/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Red-cockaded Woodpecker", scientificName: "Dryobates borealis", category: "Woodpecker", description: "Small woodpecker with black cap and white cheek patches. Requires mature pine forests.", habitat: "Mature pine savannas", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/411562717/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Golden-cheeked Warbler", scientificName: "Setophaga chrysoparia", category: "Warbler", description: "Endemic to Texas Hill Country. Black throat, golden cheeks. Breeds in mature juniper-oak woodlands.", habitat: "Juniper-oak woodlands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/6534514/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Endangered" },
    { commonName: "Black-capped Vireo", scientificName: "Vireo atricapilla", category: "Songbird", description: "Small songbird with black cap (male) and white spectacles. Brushy hillsides in Texas and Oklahoma.", habitat: "Brushy hillsides, oak scrub", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/133477929/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Florida Scrub-Jay", scientificName: "Aphelocoma coerulescens", category: "Songbird", description: "Only bird endemic to Florida. Blue and gray, cooperative breeder in scrub oak habitat.", habitat: "Florida scrub oak", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/180030608/medium.jpeg", audioUrl: "", rarity: "Rare", conservationStatus: "Vulnerable" },
    { commonName: "Gunnison Sage-Grouse", scientificName: "Centrocercus minimus", category: "Other", description: "Rare grouse of Colorado/Utah sagebrush. Spectacular mating display on leks.", habitat: "Sagebrush flats", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/18100968/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "Lesser Prairie-Chicken", scientificName: "Tympanuchus pallidicinctus", category: "Other", description: "Prairie grouse of southern Great Plains. Known for booming lek displays.", habitat: "Sand sagebrush, shinnery oak prairies", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/6069/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Vulnerable" },
    { commonName: "Sprague's Pipit", scientificName: "Anthus spragueii", category: "Songbird", description: "Grassland specialist with high, spiraling flight song. Declining due to habitat loss.", habitat: "Native mixed-grass prairies", imageUrl: "https://static.inaturalist.org/photos/66214769/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Vulnerable" },

    { commonName: "Ivory-billed Woodpecker", scientificName: "Campephilus principalis", category: "Woodpecker", description: "Possibly the most famous extinct bird. Once the largest woodpecker in North America. Last confirmed sighting in 1944.", habitat: "Old-growth bottomland hardwood forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/183734844/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Possibly Extinct" },
    { commonName: "Philippine Eagle", scientificName: "Pithecophaga jefferyi", category: "Raptor", description: "One of the largest and most powerful eagles. National bird of the Philippines. Crown of long brown feathers.", habitat: "Tropical rainforests on Mindanao", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/205288597/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Kakapo", scientificName: "Strigops habroptilus", category: "Other", description: "World's only flightless parrot. Nocturnal, ground-dwelling, with owl-like facial disc. Critically endangered, ~250 individuals.", habitat: "Native forests on predator-free islands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/18100968/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Spix's Macaw", scientificName: "Cyanopsitta spixii", category: "Other", description: "Extinct in the wild since 2000. Reintroduction programs underway. The inspiration for the movie 'Rio'.", habitat: "Catinga scrubland (historically)", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/6069/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Extinct in the Wild" },
    { commonName: "Orange-bellied Parrot", scientificName: "Neophema chrysogaster", category: "Other", description: "Australia's most endangered bird. Migrates between Tasmania and mainland. Fewer than 50 wild birds remain.", habitat: "Coastal saltmarsh, melaleuca swamp", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/133477929/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Blue-throated Macaw", scientificName: "Ara glaucogularis", category: "Other", description: "Critically endangered macaw of Bolivia. Bright blue with turquoise throat patch. Fewer than 500 in the wild.", habitat: "Palm savannas, Beni savanna", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/180030608/medium.jpeg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Javan Hawk-Eagle", scientificName: "Nisaetus bartelsi", category: "Raptor", description: "Indonesia's national bird. Striking crest and bold facial pattern. Endemic to Java's remaining forests.", habitat: "Tropical moist lowland forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/132879083/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "Regent Honeyeater", scientificName: "Anthochaera phrygia", category: "Songbird", description: "Australia's most critically endangered honeyeater. Fewer than 400 remain. Black and yellow with scalloped breast.", habitat: "Box-Ironbark eucalypt woodland", imageUrl: "https://static.inaturalist.org/photos/66214769/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Black-faced Spoonbill", scientificName: "Platalea minor", category: "Wader", description: "East Asia's rarest spoonbill. White with black face and spatulate bill. Breeds in Taiwan, winters in Hong Kong.", habitat: "Coastal mudflats, mangroves, rice paddies", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/56653891/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "Blue-crowned Laughingthrush", scientificName: "Trochalopteron yersini", category: "Songbird", description: "Endemic to Vietnam's Da Lat Plateau. Stunning blue crown, chestnut body. Fewer than 200 mature birds.", habitat: "Montane evergreen forest", imageUrl: "https://static.inaturalist.org/photos/31423761/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Chinese Crested Tern", scientificName: "Thalasseus bernsteini", category: "Gull/Tern", description: "One of the world's rarest seabirds. ~100 individuals. Black crest, yellow-tipped bill. Breeds on tiny islands in Zhejiang.", habitat: "Rocky offshore islands, coastal waters", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/144056225/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Philippine Cockatoo", scientificName: "Cacatua haematuropygia", category: "Other", description: "White cockatoo with red-orange vent. Once common across the Philippines. Fewer than 1,000 remain.", habitat: "Coastal mangroves, lowland forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/117331702/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Sumatran Ground Cuckoo", scientificName: "Carpococcyx viridis", category: "Other", description: "Elusive ground-dweller of Sumatra's highland forests. One of Asia's most elusive birds. Fewer than 250 mature birds.", habitat: "Montane and submontane forest", imageUrl: "https://static.inaturalist.org/photos/518522154/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Yellow-breasted Bunting", scientificName: "Emberiza aureola", category: "Songbird", description: "Once one of Asia's most abundant birds. Crashed from millions to near-extinction due to trapping.", habitat: "Grasslands, farmland, marshes", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/71502776/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Inca Tern", scientificName: "Larosterna inca", category: "Gull/Tern", description: "Striking dark-gray tern with white mustache plumes and red bill. Endemic to Peru and Chile's Humboldt Current coast.", habitat: "Rocky cliffs, coastal islands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/183734844/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Near Threatened" },
    { commonName: "Harpy Eagle", scientificName: "Harpia harpyja", category: "Raptor", description: "One of the world's largest and most powerful eagles. Massive talons can crush bones. Icon of Central/South American rainforests.", habitat: "Tropical lowland rainforests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/205288597/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Vulnerable" },
    { commonName: "Baer's Pochard", scientificName: "Aythya baeri", category: "Waterfowl", description: "Critically endangered diving duck. Once thought extinct, rediscovered in 2000. Fewer than 1,000 remain.", habitat: "Freshwater lakes, marshes, ponds", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Snow%20Goose.jpg?width=640", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Forest Owlet", scientificName: "Athene blewitti", category: "Raptor", description: "Thought extinct for 113 years, rediscovered in 1997 in central India. Small, stocky owlet with bold barring.", habitat: "Dry deciduous teak forests", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/132879083/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Endangered" },
    { commonName: "Cebu Flowerpecker", scientificName: "Dicaeum quadricolor", category: "Songbird", description: "Tiny, brilliantly colored bird endemic to Cebu, Philippines. Fewer than 100 individuals survive.", habitat: "Remaining lowland forest fragments", imageUrl: "https://static.inaturalist.org/photos/383227697/medium.jpeg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "White-shouldered Ibis", scientificName: "Pseudibis davisoni", category: "Wader", description: "Southeast Asia's rarest ibis. Bare dark head, white shoulder patch. Fewer than 100 pairs in Cambodia.", habitat: "Seasonally flooded grasslands, dipterocarp forest", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/56653891/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Spoon-billed Sandpiper", scientificName: "Calidris pygmaea", category: "Shorebird", description: "Tiny shorebird with unique spatulate bill. One of the world's most critically endangered shorebirds. ~240 breeding pairs.", habitat: "Arctic tundra (breeding), tropical mudflats (winter)", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Calidris_pygmaea_spoon-billed_sandpiper.jpg?width=640", audioUrl: "", rarity: "Accidental", conservationStatus: "Critically Endangered" },
    { commonName: "Philippine Dwarf Kingfisher", scientificName: "Ceyx mindanensis", category: "Other", description: "One of the world's smallest kingfishers. Electric blue and orange. Endemic to Mindanao, Philippines.", habitat: "Lowland rainforest streams", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/46532647/medium.jpg", audioUrl: "", rarity: "Accidental", conservationStatus: "Near Threatened" },
    { commonName: "Steppe Eagle", scientificName: "Aquila nipalensis", category: "Raptor", description: "Large eagle of open steppes. Declining due to power line collisions and habitat loss across Central Asia.", habitat: "Steppes, semi-deserts, grasslands", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/183734844/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Endangered" },
    { commonName: "Snowy Owl", scientificName: "Bubo scandiacus", category: "Raptor", description: "Large, white owl of the Arctic tundra. Unlike most owls, hunts in daylight. Iridescent yellow eyes. Males become whiter with age.", habitat: "Arctic tundra, open fields, coastlines (winter irruptions)", imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/205288597/medium.jpg", audioUrl: "", rarity: "Rare", conservationStatus: "Vulnerable" },
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

  const speciesByName = new Map(
    (await prisma.species.findMany({ select: { id: true, commonName: true } })).map((s) => [s.commonName, s.id])
  );
  const toSpeciesIds = (names) =>
    JSON.stringify(names.map((name) => speciesByName.get(name)).filter(Boolean));

  const hotspotsData = [
    { name: "Cape May Wetland Reserve", description: "World-renowned migration hotspot. Spring and fall bring massive numbers of warblers, raptors, and shorebirds.", locationName: "Cape May Point, NJ", latitude: 38.9333, longitude: -74.9667, habitatType: "Wetland", amenities: "Boardwalks, observation towers, visitor center, restrooms, hawkwatch platform", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Cape%20May%20Landscape%20-%20Flickr%20-%20kinglear55.jpg?width=640" },
    { name: "Central Park Ramble", description: "Urban oasis in Manhattan. 230+ species recorded. Best during spring migration for warblers, tanagers, and flycatchers.", locationName: "Manhattan, NY", latitude: 40.7829, longitude: -73.9654, habitatType: "Forest", amenities: "Walking paths, benches, nearby cafes, restrooms, Belvedere Castle", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Central%20Park%2C%20birds%20and%20flowers%20in%20the%20Ramble.jpg?width=640" },
    { name: "Point Pelee Marshlands", description: "Southernmost point of mainland Canada. Famous for spring migration 'fallout' events. Warblers, vireos, flycatchers in abundance.", locationName: "Leamington, ON, Canada", latitude: 41.9167, longitude: -82.5167, habitatType: "Wetland", amenities: "Visitor center, shuttle to tip, boardwalks, restrooms, campground", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Approaching%20Point%20Pelee%20National%20Park%2C%20Leamington%2C%20Ontario%2C%20Canada%20%2821150817804%29.jpg?width=640" },
    { name: "Olympic Coastal Sanctuary", description: "Rugged Pacific coastline with seabird colonies, tide pools, and old-growth forest. Pelagic species, puffins, murres.", locationName: "Forks, WA", latitude: 47.9542, longitude: -124.3847, habitatType: "Coast", amenities: "Trailheads, campgrounds, visitor center, tide pools, ranger programs", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/OCNMS%20--%20Stream%20Meets%20The%20Sea%20(35223194573).jpg?width=640" },

    { name: "Everglades National Park", description: "Vast subtropical wilderness. Roseate Spoonbills, Snail Kites, Wood Storks, and countless wading birds.", locationName: "Homestead, FL", latitude: 25.2866, longitude: -80.8987, habitatType: "Wetland", amenities: "Visitor centers, tram tours, boat tours, campgrounds, hiking trails", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Everglades%20National%20Park%20SPOT%201286.jpg?width=640" },
    { name: "Corkscrew Swamp Sanctuary", description: "Old-growth bald cypress forest with 2.25-mile boardwalk. Painted Buntings, Limpkins, Barred Owls.", locationName: "Naples, FL", latitude: 26.3767, longitude: -81.6142, habitatType: "Wetland", amenities: "Boardwalk, visitor center, gift shop, guided walks", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Corkscrew%20swamp%20sanctuary%202.jpg?width=640" },
    { name: "Ding Darling National Wildlife Refuge", description: "Sanibel Island refuge famous for Roseate Spoonbills, Reddish Egrets, and shorebirds on wildlife drive.", locationName: "Sanibel, FL", latitude: 26.4500, longitude: -82.1100, habitatType: "Wetland", amenities: "Wildlife drive, visitor center, tram tours, kayak rentals", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Ding%20Darling%20National%20Wildlife%20Refuge.jpg?width=640" },

    { name: "Magee Marsh Wildlife Area", description: "Lake Erie's 'Warbler Capital of the World'. Boardwalk through migrant trap during May migration.", locationName: "Oak Harbor, OH", latitude: 41.6333, longitude: -83.2167, habitatType: "Wetland", amenities: "Boardwalk, visitor center, observation tower, restrooms", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Magee%20Marsh%20Wildlife%20Area%2C%20Ohio%20(ASTER).jpg?width=640" },
    { name: "Horicon Marsh", description: "Largest freshwater cattail marsh in the US. 300+ species. Massive waterfowl concentrations in migration.", locationName: "Horicon, WI", latitude: 43.4667, longitude: -88.6333, habitatType: "Wetland", amenities: "Visitor center, auto tour, hiking trails, boat launch", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Drumlins%20around%20Horicon%20Marsh%20in%20Wisconsin.jpg?width=640" },

    { name: "Bosque del Apache NWR", description: "New Mexico desert refuge. Tens of thousands of Sandhill Cranes and Snow Geese in winter.", locationName: "San Antonio, NM", latitude: 33.8000, longitude: -106.8833, habitatType: "Wetland", amenities: "Auto tour loop, visitor center, photography blinds, hiking trails", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Female%20Pintail%2C%20Bosque%20del%20Apache%20NWR%20(260895271).jpg?width=640" },
    { name: "Southeastern Arizona Hotspots", description: "Sky Islands region: Ramsey Canyon, Madera Canyon, Cave Creek. Elegant Trogon, hummingbirds, specialty warblers.", locationName: "Sierra Vista, AZ", latitude: 31.5000, longitude: -110.3000, habitatType: "Mountain", amenities: "Visitor centers, feeder stations, hiking trails, lodging nearby", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Madera%20Canyon%20Arizona%202012.jpg?width=640" },
    { name: "Malheur National Wildlife Refuge", description: "High desert oasis in Oregon. Massive waterfowl concentrations, Sandhill Cranes, Bobolinks.", locationName: "Princeton, OR", latitude: 43.3000, longitude: -118.8333, habitatType: "Wetland", amenities: "Auto tour, visitor center, hiking trails, photography blinds", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buena%20Vista%20Overlook%2C%20Jeff%20Sorn%20%285352564568%29.jpg?width=640" },

    { name: "Algonquin Provincial Park", description: "Ontario's iconic park. Spruce Grouse, Boreal Chickadee, Gray Jay, warblers, loons on lakes.", locationName: "Whitney, ON, Canada", latitude: 45.6000, longitude: -78.4000, habitatType: "Forest", amenities: "Visitor center, campgrounds, canoe routes, hiking trails", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20small%20lake%20in%20Algonquin%20Provincial%20Park.jpg?width=640" },
    { name: "Long Point Bird Observatory", description: "World's oldest bird observatory. Migration monitoring on Lake Erie peninsula. Banding demonstrations.", locationName: "Port Rowan, ON, Canada", latitude: 42.5833, longitude: -80.4000, habitatType: "Wetland", amenities: "Visitor center, banding station, trails, old cut", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Long%20Point%2C%20Ontario%2C%20Canada%20%2832540520747%29.jpg?width=640" },
    { name: "Reifel Bird Sanctuary", description: "Delta, BC wetland sanctuary. Sandhill Cranes, Snow Geese, owls, woodpeckers. Excellent trails.", locationName: "Delta, BC, Canada", latitude: 49.1000, longitude: -123.1667, habitatType: "Wetland", amenities: "Walking trails, observation towers, heated viewing building, gift shop", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/George%20C.%20Reifel%20Migratory%20Bird%20Sanctuary%20%284553308670%29.jpg?width=640" },

    // Europe
    { name: "Doñana National Park", description: "UNESCO World Heritage wetland. Spanish Imperial Eagle, Marbled Teal, Greater Flamingo, and massive waterfowl migrations.", locationName: "Andalusia, Spain", latitude: 37.0167, longitude: -6.4500, habitatType: "Wetland", amenities: "Visitor centers, 4x4 tours, observation hides, research station", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Paisaje%20en%20el%20Parque%20de%20Do%C3%B1ana%2C%20Espa%C3%B1a%2C%202015-12-07%2C%20DD%2018.JPG?width=640" },
    { name: "Camargue", description: "Rhône delta wetlands — Europe's largest flamingo breeding colony. Slender-billed Gull, Bee-eaters, herons.", locationName: "Provence, France", latitude: 43.5667, longitude: 4.5000, habitatType: "Wetland", amenities: "Observation towers, guided tours, visitor center, cycling paths", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Camargue%202017.jpg?width=640" },
    { name: "Danube Delta", description: "Europe's largest wetland. Dalmatian Pelican, Pygmy Cormorant, Red-breasted Goose, 300+ species.", locationName: "Tulcea, Romania", latitude: 45.1667, longitude: 29.1667, habitatType: "Wetland", amenities: "Boat tours, floating hotels, visitor center, bird hides", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Delta%20del%20Danubio%2C%20Ruman%C3%ADa%2C%202016-05-28%2C%20DD%2031.jpg?width=640" },
    { name: "Hortobágy National Park", description: "Puszta steppe grassland. Great Bustard, Saker Falcon, Aquatic Warbler, Red-footed Falcon.", locationName: "Hungary", latitude: 47.5833, longitude: 21.1667, habitatType: "Grassland", amenities: "Visitor center, guided tours, bird ringing station, shepherd museum", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Hortob%C3%A1gy%20River%2C%20Hungary%2002.JPG?width=640" },
    { name: "Falsterbo", description: "Sweden's premier migration hotspot. World-class autumn raptor migration (100k+ Honey Buzzards, Sparrowhawks, Red Kites). Falsterbo Bird Observatory operates here.", locationName: "Skåne, Sweden", latitude: 55.3833, longitude: 12.8167, habitatType: "Coast", amenities: "Bird observatory, observation tower, lighthouse, guided walks, ringing demonstrations", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Falsterbo%20strand.jpg?width=640" },
    { name: "Ottenby (Öland)", description: "Southern tip of Öland island. Top passerine migration site. Ottenby Bird Observatory, huge numbers of warblers, flycatchers, thrushes in spring/autumn.", locationName: "Öland, Sweden", latitude: 56.1981, longitude: 16.4050, habitatType: "Coast", amenities: "Bird observatory, lighthouse, nature center, walking trails, ringing demonstrations", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Nunnedalen%20%C3%96land.JPG?width=640" },
    { name: "Lake Tåkern", description: "Ramsar wetland, one of Europe's most important bird lakes. 270+ species. Massive waterfowl staging, Black Tern colony, White-tailed Eagle, Bittern.", locationName: "Östergötland, Sweden", latitude: 58.3500, longitude: 14.8333, habitatType: "Wetland", amenities: "Visitor center (Naturum Tåkern), bird towers, boardwalks, hides, guided tours", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/2011.05%20%C3%96sterg%C3%B6tland%20T%C3%A5kern%20sj%C3%B6%20g.jpg?width=640" },
    { name: "Hornborgasjön", description: "Famous crane lake. 20,000+ Eurasian Cranes stage here in spring. Also Whooper Swan, Bean Goose, White-tailed Eagle, wetland passerines.", locationName: "Västergötland, Sweden", latitude: 58.3167, longitude: 13.5667, habitatType: "Wetland", amenities: "Visitor center (Naturum Hornborgasjön), crane watching towers, hides, trails", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Crane%20Lake%20Hornborga.jpg?width=640" },
    { name: "Gete (Öland)", description: "Northwest Öland migration hotspot. Excellent for raptors, passerines, and seabird passage. Gete Bird Observatory, coastal meadows, alvar grassland.", locationName: "Öland, Sweden", latitude: 56.7500, longitude: 16.5333, habitatType: "Coast", amenities: "Bird observatory, observation tower, meadow trails, ringing demonstrations", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%96land%20Gettlinge.jpg?width=640" },
    { name: "Kullaberg Nature Reserve", description: "Dramatic coastal cliffs in NW Skåne. Seabird colonies (Guillemot, Razorbill), Peregrine, Raven, migrant passerines, rarities.", locationName: "Skåne, Sweden", latitude: 56.3000, longitude: 12.4667, habitatType: "Coast", amenities: "Lighthouse, hiking trails, bird hides, boat tours, visitor info", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Kullaberg%2C%20the%20Kullen%20V%C3%A4stra%20Lighthouse.JPG?width=640" },
    { name: "Landsort (Öja)", description: "Southernmost point of Stockholm archipelago. Top migration site. Landsort Bird Observatory, huge passerine/seabird numbers, rarities.", locationName: "Södermanland, Sweden", latitude: 58.7333, longitude: 17.8667, habitatType: "Coast", amenities: "Bird observatory, lighthouse, ringing station, trails, accommodation", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Landsort%202012d.jpg?width=640" },
    { name: "Tyresta National Park", description: "Primeval forest near Stockholm. Black Woodpecker, Three-toed Woodpecker, Pygmy Owl, Capercaillie, Hazel Grouse.", locationName: "Stockholm County, Sweden", latitude: 59.1833, longitude: 18.3000, habitatType: "Forest", amenities: "Trails, bird towers, visitor center, primeval forest, camping", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%A4verdamm%20i%20Tyresta%201.jpg?width=640" },
    { name: "Store Mosse National Park", description: "Largest bog south of Lapland. Golden Plover, Crane, Whooper Swan, Short-eared Owl, Red-throated Diver on lakes.", locationName: "Jönköping County, Sweden", latitude: 57.2833, longitude: 13.9500, habitatType: "Wetland", amenities: "Visitor center (Naturum Store Mosse), boardwalks, bird towers, trails", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Store%20Mosse%20Nationalpark%202023.jpg?width=640" },
    { name: "Sjaunja Nature Reserve", description: "Vast mire complex in Norrbotten. Whooper Swan, Bean Goose, Golden Eagle, Gyrfalcon, Siberian Jay, Arctic warblers.", locationName: "Norrbotten, Sweden", latitude: 66.5000, longitude: 20.5000, habitatType: "Wetland", amenities: "Wilderness cabins, bird towers, hiking trails, guided tours in summer", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Sjaunja%20naturreservat.jpg?width=640" },

    // Africa
    { name: "Kruger National Park", description: "Iconic savanna park. Southern Ground Hornbill, Kori Bustard, Martial Eagle, 500+ species.", locationName: "Limpopo/Mpumalanga, South Africa", latitude: -24.0000, longitude: 31.5000, habitatType: "Grassland", amenities: "Rest camps, game drives, bush walks, bird hides", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Kruger%20National%20Park%2C%20South%20Africa%20%2836478621960%29.jpg?width=640" },
    { name: "Okavango Delta", description: "Inland delta oasis. Pel's Fishing Owl, Wattled Crane, Slaty Egret, African Skimmer.", locationName: "Ngamiland, Botswana", latitude: -19.3333, longitude: 22.9333, habitatType: "Wetland", amenities: "Mokoro trips, luxury lodges, walking safaris, boat safaris", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Vista%20a%C3%A9rea%20del%20delta%20del%20Okavango%2C%20Botsuana%2C%202018-08-01%2C%20DD%2039.jpg?width=640" },
    { name: "Djoudj National Bird Sanctuary", description: "Saharan wetland on Senegal River. 1.5M+ migratory birds. Greater Flamingo, White Pelican, Purple Heron.", locationName: "Saint-Louis, Senegal", latitude: 16.4000, longitude: -16.2333, habitatType: "Wetland", amenities: "Boat tours, observation towers, visitor center, research station", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/CormoransDjoudj.JPG?width=640" },

    // Asia
    { name: "Keoladeo National Park (Bharatpur)", description: "UNESCO wetland. Sarus Crane, Painted Stork, Black-necked Stork, 370+ species.", locationName: "Rajasthan, India", latitude: 27.1667, longitude: 77.5000, habitatType: "Wetland", amenities: "Cycle rickshaws, boat rides, observation towers, guesthouse", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Deer%2C%20In%20Keoladeo%20National%20Park%2C%20Bharatpur%2C%20Rajasthan.jpg?width=640" },
    { name: "Tangkoko Nature Reserve", description: "Sulawesi endemic hotspot. Maleo, Knobbed Hornbill, Sulawesi Pitta, Kingfishers.", locationName: "North Sulawesi, Indonesia", latitude: 1.5167, longitude: 125.1833, habitatType: "Forest", amenities: "Guided hikes, homestays, ranger station, night walks", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Tangkoko%20National%20Park%2C%20North%20Sulawesi%2C%20Indonesia.jpg?width=640" },
    { name: "Fraser's Hill", description: "Montane cloud forest. Mountain Peacock-Pheasant, Malayan Whistling Thrush, Silver-eared Mesia.", locationName: "Pahang, Malaysia", latitude: 3.7167, longitude: 101.7333, habitatType: "Forest", amenities: "Trails, bird hides, colonial bungalows, night birding", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/View%20of%20Titiwangsa%20range%20from%20Fraser%27s%20Hill%203.jpg?width=640" },

    // South America
    { name: "Pantanal", description: "World's largest tropical wetland. Hyacinth Macaw, Jabiru, Greater Rhea, 650+ species.", locationName: "Mato Grosso, Brazil", latitude: -17.5000, longitude: -56.5000, habitatType: "Wetland", amenities: "Boat safaris, lodges, horseback riding, night drives", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Renaissance%20of%20the%20Pantanal%20wetlands%2C%20Brazil.jpg?width=640" },
    { name: "Manu National Park", description: "Andes-to-Amazon transect. Andean Cock-of-the-rock, Harpy Eagle, Hoatzin, 1000+ species.", locationName: "Madre de Dios, Peru", latitude: -11.8333, longitude: -71.8333, habitatType: "Forest", amenities: "Lodges, canopy tower, river trips, research stations", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Manu%20National%20Park%20Peru%20%28109758147%29.jpeg?width=640" },
    { name: "Los Llanos", description: "Vast seasonal floodplains. Scarlet Ibis, Orinoco Goose, Horned Screamer, Jabiru.", locationName: "Apure, Venezuela", latitude: 8.5000, longitude: -67.5000, habitatType: "Wetland", amenities: "Hato tours, wildlife photography, boat trips, rustic lodges", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Los%20Llanos%2C%20Venezuela%20%2812832335223%29.jpg?width=640" },

    // Oceania
    { name: "Kakadu National Park", description: "Top End wetlands & escarpments. Gouldian Finch, Red Goshawk, Hooded Parrot, 280+ species.", locationName: "Northern Territory, Australia", latitude: -12.6667, longitude: 132.5000, habitatType: "Wetland", amenities: "Cruises, rock art sites, bird hides, camping, guided tours", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Kakadu%20%28AU%29%2C%20Kakadu%20National%20Park%2C%20Nadap%20Lookout%20--%202019%20--%204200.jpg?width=640" },
    { name: "Atherton Tablelands", description: "Rainforest & crater lakes. Southern Cassowary, Golden Bowerbird, Victoria's Riflebird, 12 endemics.", locationName: "Queensland, Australia", latitude: -17.2667, longitude: 145.5000, habitatType: "Forest", amenities: "Birding lodges, canopy walkway, night spotlighting, crater lakes", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Atherton%20Tablelands%2C%20Queensland%20%288603078682%29.jpg?width=640" },
    { name: "Tiritiri Matangi Island", description: "Predator-free sanctuary. Takahe, Kokako, Stitchbird, Saddleback, Little Spotted Kiwi.", locationName: "Hauraki Gulf, New Zealand", latitude: -36.6000, longitude: 174.8833, habitatType: "Forest", amenities: "Ferry access, guided walks, visitor center, overnight stays", coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Tiritiri%20Matangi%20Island%20Shakespear.jpg?width=640" },
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
      update: { targetSpecies: toSpeciesIds(["Bald Eagle", "Peregrine Falcon", "Belted Kingfisher", "Cedar Waxwing", "Yellow Warbler", "Blackburnian Warbler"]) },
      create: {
        id: "trip-1",
      title: "Cape May Spring Migration Spectacular",
      description: "Join us for a dawn-to-dusk birding marathon at the legendary Cape May. Target: 20+ warbler species, raptors, shorebirds. Meet at the Hawkwatch Platform at 6:00 AM.",
      hostId: elena.id,
      hotspotId: capeMay.id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Hawkwatch Platform, Cape May Point State Park",
      targetSpecies: toSpeciesIds(["Bald Eagle", "Peregrine Falcon", "Belted Kingfisher", "Cedar Waxwing", "Yellow Warbler", "Blackburnian Warbler"]),
      maxParticipants: 12,
      status: "UPCOMING",
    },
  });

  const trip2 = await prisma.trip.upsert({
where: { id: "trip-2" },
      update: { targetSpecies: toSpeciesIds(["Cedar Waxwing", "Belted Kingfisher", "American Redstart", "Ovenbird"]) },
      create: {
        id: "trip-2",
      title: "Central Park Warbler Walk",
      description: "Leisurely morning walk through the Ramble during peak spring migration. Perfect for beginners! Target: 15+ warbler species, Scarlet Tanager, Wood Thrush.",
      hostId: elena.id,
      hotspotId: centralPark.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
      meetingPoint: "Belvedere Castle, Central Park",
      targetSpecies: toSpeciesIds(["Cedar Waxwing", "Belted Kingfisher", "American Redstart", "Ovenbird"]),
      maxParticipants: 8,
      status: "UPCOMING",
    },
  });

  const trip3 = await prisma.trip.upsert({
where: { id: "trip-3" },
      update: { targetSpecies: toSpeciesIds(["Cedar Waxwing", "Painted Bunting", "Pileated Woodpecker", "Blackburnian Warbler", "Yellow Warbler"]) },
      create: {
        id: "trip-3",
      title: "Point Pelee Fallout Expedition",
      description: "Multi-day trip to witness the legendary spring migration fallout. Early mornings at the tip, afternoons exploring trails. Target: 25+ warbler species.",
      hostId: elena.id,
      hotspotId: pointPelee.id,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      meetingPoint: "Point Pelee National Park Visitor Center",
      targetSpecies: toSpeciesIds(["Cedar Waxwing", "Painted Bunting", "Pileated Woodpecker", "Blackburnian Warbler", "Yellow Warbler"]),
      maxParticipants: 10,
      status: "UPCOMING",
    },
  });

  const trip4 = await prisma.trip.upsert({
where: { id: "trip-4" },
      update: { targetSpecies: toSpeciesIds(["Great Blue Heron", "Great Egret", "Snowy Egret", "Green Heron"]) },
      create: {
        id: "trip-4",
      title: "Everglades Wading Bird Bonanza",
      description: "Explore the River of Grass for Roseate Spoonbills, Wood Storks, Snail Kites, and dozens of heron/egret species. Boat tour included.",
      hostId: elena.id,
      hotspotId: everglades.id,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Ernest Coe Visitor Center",
      targetSpecies: toSpeciesIds(["Great Blue Heron", "Great Egret", "Snowy Egret", "Green Heron"]),
      maxParticipants: 15,
      status: "UPCOMING",
    },
  });

  const trip5 = await prisma.trip.upsert({
where: { id: "trip-5" },
      update: { targetSpecies: toSpeciesIds(["Yellow Warbler", "Yellow-rumped Warbler", "Black-and-white Warbler", "American Redstart", "Blackburnian Warbler", "Common Yellowthroat"]) },
      create: {
        id: "trip-5",
      title: "Magee Marsh Warbler Week",
      description: "The ultimate warbler experience! Walk the famous boardwalk during peak migration. 30+ warbler species possible.",
      hostId: elena.id,
      hotspotId: magee.id,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      meetingTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      meetingPoint: "Magee Marsh Boardwalk Entrance",
      targetSpecies: toSpeciesIds(["Yellow Warbler", "Yellow-rumped Warbler", "Black-and-white Warbler", "American Redstart", "Blackburnian Warbler", "Common Yellowthroat"]),
      maxParticipants: 12,
      status: "UPCOMING",
    },
  });

  console.log("✅ Created trips");

  await prisma.carpoolOffer.upsert({
    where: { id: "carpool-1" },
    update: { availableSeats: 3 },
    create: {
      id: "carpool-1",
      tripId: trip1.id,
      driverId: marcus.id,
      originArea: "Philadelphia, PA — 30th Street Station",
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      totalSeats: 3,
      availableSeats: 3,
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
