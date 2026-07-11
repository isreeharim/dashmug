import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";
import OnboardingClient from "./OnboardingClient";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { dbUser } = await getSessionUser();

  if (!dbUser) {
    return (
      <main className="p-6 text-center text-sm font-bold text-red-500">
        Could not initialize local session database connection.
      </main>
    );
  }

  // Onboarding: If user has no active restaurants, render setup view
  if (dbUser.restaurants.length === 0) {
    return <OnboardingClient />;
  }

  // Pick first restaurant for the dashboard overview
  const restaurant = dbUser.restaurants[0];

  // 1. Total scans
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // These are independent database operations. Running them together avoids
  // serial network round trips on every dashboard load.
  const [totalScans, monthScans, totalItems, featuredItems, scans, fullRestaurant] = await Promise.all([
    db.qRScan.count({ where: { qrCode: { restaurantId: restaurant.id } } }),
    db.qRScan.count({
      where: { qrCode: { restaurantId: restaurant.id }, scannedAt: { gte: startOfMonth } },
    }),
    db.menuItem.count({ where: { category: { restaurantId: restaurant.id } } }),
    db.menuItem.count({
      where: { category: { restaurantId: restaurant.id }, isFeatured: true },
    }),
    db.qRScan.findMany({
      where: { qrCode: { restaurantId: restaurant.id }, scannedAt: { gte: sevenDaysAgo } },
      select: { scannedAt: true },
    }),
    db.restaurant.findUnique({
      where: { id: restaurant.id },
      include: {
        qrCodes: { select: { publicId: true, isActive: true } },
        categories: {
          orderBy: { position: "asc" },
          include: { items: { orderBy: { position: "asc" } } },
        },
      },
    }),
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const scansLast7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayLabel = dayNames[date.getDay()];

    const count = scans.filter((s) => {
      const scanDate = new Date(s.scannedAt);
      return scanDate.toDateString() === date.toDateString();
    }).length;

    return { day: dayLabel, count };
  });

  if (!fullRestaurant) {
    return <OnboardingClient />;
  }

  // Safely serialize database model for client component (converting decimal types)
  const serializedCategories = fullRestaurant.categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    items: c.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      diet: item.diet,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      imageUrl: item.imageUrl,
    })),
  }));

  const serializedRestaurant = {
    id: fullRestaurant.id,
    name: fullRestaurant.name,
    slug: fullRestaurant.slug,
    description: fullRestaurant.description ?? "",
    address: fullRestaurant.address ?? "",
    qrCodes: fullRestaurant.qrCodes,
    categories: serializedCategories,
  };

  return (
    <DashboardClient
      restaurant={serializedRestaurant}
      stats={{
        totalScans,
        monthScans,
        totalItems,
        featuredItems,
        scansLast7Days,
      }}
      ownerName={dbUser.name || dbUser.email.split("@")[0] || "Owner"}
    />
  );
}
