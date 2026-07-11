import { db } from "@/lib/db";
import AdminClient from "./AdminClient";
import { UserRole } from "@prisma/client";
import { ShieldAlert } from "lucide-react";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { dbUser } = await getSessionUser();

  // Guard: Access allowed ONLY if role matches PLATFORM_ADMIN
  if (!dbUser || dbUser.role !== UserRole.PLATFORM_ADMIN) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-sm mb-5 border border-red-100">
          <ShieldAlert size={30} />
        </div>
        <h1 className="text-2xl font-black tracking-tight font-[family-name:var(--font-display)]">
          Admin Authentication Required
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#52635f] leading-6">
          Your current account does not have platform administrator credentials to enter the tabletap command center.
        </p>
        <div className="mt-6 bg-white border border-stone-150 rounded-2xl p-4 text-left max-w-md text-xs text-stone-600 shadow-sm space-y-2">
          <p className="font-semibold text-stone-850">To grant admin rights locally:</p>
          <p>
            Update your record in MongoDB using the mongo shell or standard database script:
          </p>
          <pre className="bg-stone-50 p-2.5 rounded-lg font-mono text-[10px] text-stone-600 overflow-x-auto border border-stone-100">
            {`db.User.updateMany({ clerkId: 'local_dev_owner' }, { $set: { role: 'PLATFORM_ADMIN' } })`}
          </pre>
        </div>
      </main>
    );
  }

  // Fetch administrator metrics
  const [totalRestaurants, activeOwners, restaurants] = await Promise.all([
    db.restaurant.count(),
    db.user.count({ where: { role: UserRole.RESTAURANT_OWNER } }),
    db.restaurant.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Format restaurant data
  const formattedRestaurants = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    owner: {
      name: r.owner.name,
      email: r.owner.email,
    },
  }));

  return (
    <AdminClient
      restaurants={formattedRestaurants}
      stats={{
        totalRestaurants,
        activeOwners,
      }}
    />
  );
}
