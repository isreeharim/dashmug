import { PrismaClient, UserRole, RestaurantStatus, Diet } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up existing database...");
  await prisma.qRScan.deleteMany({});
  await prisma.qRCode.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👤 Creating seed user (owner)...");
  const owner = await prisma.user.create({
    data: {
      clerkId: "user_seed_owner_123",
      email: "owner@tabletap.com",
      name: "Priya",
      role: UserRole.RESTAURANT_OWNER,
    },
  });

  console.log("🏢 Creating seed restaurant...");
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Cedar & Salt",
      slug: "cedar-salt",
      description: "Seasonal plates, slow mornings, and good company.",
      address: "18 Garden Lane, Bengaluru",
      phone: "+91 80 5555 0190",
      email: "hello@cedarsalt.com",
      website: "https://cedarsalt.com",
      status: RestaurantStatus.ACTIVE,
      socialLinks: {
        instagram: "@cedarandsalt",
        facebook: "cedarandsalt.blr",
      },
      openingHours: {
        monday: "11:00 AM - 11:00 PM",
        tuesday: "11:00 AM - 11:00 PM",
        wednesday: "11:00 AM - 11:00 PM",
        thursday: "11:00 AM - 11:00 PM",
        friday: "11:00 AM - Midnight",
        saturday: "11:00 AM - Midnight",
        sunday: "11:00 AM - 10:00 PM",
      },
    },
  });

  console.log("📊 Creating menu categories and items...");

  // Category 1: Small plates
  const starters = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Small plates",
      position: 0,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: starters.id,
        name: "Wild mushroom toast",
        description: "Whipped ricotta, roasted mushrooms, herb oil",
        price: 380.0,
        diet: Diet.VEG,
        isAvailable: true,
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        position: 0,
      },
      {
        categoryId: starters.id,
        name: "Charred corn ribs",
        description: "Lime butter, chilli salt, coriander",
        price: 290.0,
        diet: Diet.VEG,
        isAvailable: true,
        isFeatured: false,
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
        position: 1,
      },
    ],
  });

  // Category 2: Mains
  const mains = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Mains",
      position: 1,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: mains.id,
        name: "Summer tomato pasta",
        description: "Hand-cut pasta, basil, parmesan",
        price: 560.0,
        diet: Diet.VEG,
        isAvailable: true,
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
        position: 0,
      },
      {
        categoryId: mains.id,
        name: "Roast chicken",
        description: "Half chicken, jus, greens, potatoes",
        price: 690.0,
        diet: Diet.NON_VEG,
        isAvailable: false,
        isFeatured: false,
        imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80",
        position: 1,
      },
    ],
  });

  // Category 3: Drinks
  const drinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Drinks",
      position: 2,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: drinks.id,
        name: "House citrus tonic",
        description: "Grapefruit, rosemary, sparkling water",
        price: 220.0,
        diet: Diet.VEG,
        isAvailable: true,
        isFeatured: false,
        imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
        position: 0,
      },
    ],
  });

  console.log("🔗 Creating QR code...");
  const qrCode = await prisma.qRCode.create({
    data: {
      restaurantId: restaurant.id,
      publicId: "qr_cedar_salt",
      destinationPath: `/menu/cedar-salt`,
      isActive: true,
    },
  });

  console.log("📈 Generating mock QR scans for dashboard charts...");
  const now = new Date();
  const scanData = [];

  // Generate scans over the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    // Number of scans for this day: random between 30 and 120
    const dailyScansCount = Math.floor(Math.random() * 90) + 30;

    for (let j = 0; j < dailyScansCount; j++) {
      const scanTime = new Date(date);
      // Stagger times randomly across the day
      scanTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      scanData.push({
        qrCodeId: qrCode.id,
        scannedAt: scanTime,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
        referer: "https://instagram.com",
        ipHash: `ip_hash_${Math.floor(Math.random() * 100000)}`,
      });
    }
  }

  // Create scans in batches to avoid payload limits
  await prisma.qRScan.createMany({
    data: scanData,
  });

  console.log(`✅ Database successfully seeded!`);
  console.log(`   Owner Email:      owner@tabletap.com`);
  console.log(`   Owner Clerk ID:   user_seed_owner_123`);
  console.log(`   Restaurant Slug:  cedar-salt`);
  console.log(`   QR Code Public ID: qr_cedar_salt`);
  console.log(`   Scans Generated:  ${scanData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
