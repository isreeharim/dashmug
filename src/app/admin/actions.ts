"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { UserRole, RestaurantStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";

async function verifyAdminAccess() {
  const { dbUser } = await getSessionUser();

  if (!dbUser || dbUser.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error("Forbidden: Admin access required.");
  }

  return dbUser;
}

export async function toggleRestaurantStatusAction(restaurantId: string, currentStatus: RestaurantStatus) {
  await verifyAdminAccess();

  const newStatus = currentStatus === RestaurantStatus.ACTIVE 
    ? RestaurantStatus.SUSPENDED 
    : RestaurantStatus.ACTIVE;

  const restaurant = await db.restaurant.update({
    where: { id: restaurantId },
    data: { status: newStatus },
  });

  revalidatePath("/admin");
  revalidatePath(`/${restaurant.slug}`);
  revalidatePath(`/menu/${restaurant.slug}`);

  return restaurant;
}
