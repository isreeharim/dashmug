"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categorySchema, menuItemSchema, restaurantSchema } from "@/lib/validation";
import { Diet } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";

// Helper to authenticate owner and get their internal database user record
async function getAuthenticatedUser() {
  const { dbUser } = await getSessionUser();
  if (!dbUser) {
    throw new Error("Unauthorized: You must be logged in.");
  }
  return dbUser;
}

// Helper to check if a restaurant belongs to the authenticated user
async function verifyRestaurantOwnership(restaurantId: string, ownerId: string) {
  const restaurant = await db.restaurant.findFirst({
    where: { id: restaurantId, ownerId },
  });
  if (!restaurant) {
    throw new Error("Forbidden: You do not own this restaurant.");
  }
  return restaurant;
}

// Create Restaurant (Onboarding)
export async function createRestaurantAction(formData: {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}) {
  const user = await getAuthenticatedUser();
  const parsed = restaurantSchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  // Create restaurant and default QR Code
  const restaurant = await db.restaurant.create({
    data: {
      ...parsed.data,
      ownerId: user.id,
      qrCodes: {
        create: {
          destinationPath: `/menu/${parsed.data.slug}`,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/${restaurant.slug}`);
  revalidatePath(`/menu/${restaurant.slug}`);
  
  return restaurant;
}

// Create Category
export async function createCategoryAction(restaurantId: string, data: { name: string; description?: string }) {
  const user = await getAuthenticatedUser();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const [restaurant, maxPositionCategory] = await Promise.all([
    verifyRestaurantOwnership(restaurantId, user.id),
    db.category.findFirst({
      where: { restaurantId },
      orderBy: { position: "desc" },
      select: { position: true },
    }),
  ]);
  const position = maxPositionCategory ? maxPositionCategory.position + 1 : 0;

  const category = await db.category.create({
    data: {
      restaurantId,
      name: parsed.data.name,
      description: parsed.data.description,
      position,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);

  return category;
}

// Delete Category
export async function deleteCategoryAction(categoryId: string) {
  const [user, category] = await Promise.all([
    getAuthenticatedUser(),
    db.category.findUnique({ where: { id: categoryId }, include: { restaurant: true } }),
  ]);

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.restaurant.ownerId !== user.id) {
    throw new Error("Forbidden: You do not own this restaurant.");
  }

  await db.category.delete({
    where: { id: categoryId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${category.restaurant.slug}`);

  return { success: true };
}

// Create Menu Item
export async function createMenuItemAction(data: {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  diet: "VEG" | "NON_VEG";
  isAvailable: boolean;
  isFeatured: boolean;
  imageUrl?: string;
}) {
  const [user, category] = await Promise.all([
    getAuthenticatedUser(),
    db.category.findUnique({ where: { id: data.categoryId }, include: { restaurant: true } }),
  ]);

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.restaurant.ownerId !== user.id) {
    throw new Error("Forbidden: You do not own this restaurant.");
  }

  const parsed = menuItemSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const maxPositionItem = await db.menuItem.findFirst({
    where: { categoryId: data.categoryId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = maxPositionItem ? maxPositionItem.position + 1 : 0;

  const item = await db.menuItem.create({
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      diet: parsed.data.diet as Diet,
      isAvailable: parsed.data.isAvailable,
      isFeatured: parsed.data.isFeatured,
      imageUrl: parsed.data.imageUrl,
      position,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${category.restaurant.slug}`);

  return item;
}

// Update Menu Item
export async function updateMenuItemAction(
  itemId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    diet: "VEG" | "NON_VEG";
    isAvailable: boolean;
    isFeatured: boolean;
    imageUrl?: string;
  }
) {
  const [user, item] = await Promise.all([
    getAuthenticatedUser(),
    db.menuItem.findUnique({
      where: { id: itemId },
      include: { category: { include: { restaurant: true } } },
    }),
  ]);

  if (!item) {
    throw new Error("Menu item not found");
  }

  if (item.category.restaurant.ownerId !== user.id) {
    throw new Error("Forbidden: You do not own this restaurant.");
  }

  const parsed = menuItemSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Validation Error: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }

  const updatedItem = await db.menuItem.update({
    where: { id: itemId },
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      diet: parsed.data.diet as Diet,
      isAvailable: parsed.data.isAvailable,
      isFeatured: parsed.data.isFeatured,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${item.category.restaurant.slug}`);

  return updatedItem;
}

// Delete Menu Item
export async function deleteMenuItemAction(itemId: string) {
  const [user, item] = await Promise.all([
    getAuthenticatedUser(),
    db.menuItem.findUnique({
      where: { id: itemId },
      include: { category: { include: { restaurant: true } } },
    }),
  ]);

  if (!item) {
    throw new Error("Menu item not found");
  }

  if (item.category.restaurant.ownerId !== user.id) {
    throw new Error("Forbidden: You do not own this restaurant.");
  }

  await db.menuItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${item.category.restaurant.slug}`);

  return { success: true };
}
