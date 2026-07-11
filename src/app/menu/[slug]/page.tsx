import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import MenuClient from "./MenuClient";
import { Metadata } from "next";
import { cache } from "react";

// Memoize dynamic menu queries for the duration of a single request
const getMenuRestaurant = cache(async (slug: string) => {
  return db.restaurant.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      categories: {
        orderBy: { position: "asc" },
        include: {
          items: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getMenuRestaurant(slug);

  if (!restaurant) {
    return { title: "Menu Not Found" };
  }

  return {
    title: `${restaurant.name} | Menu`,
    description: restaurant.description ?? `View the dynamic QR menu for ${restaurant.name}`,
  };
}

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const restaurant = await getMenuRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  // Safely serialize Decimal values from database to standard numbers/strings
  const serializedCategories = restaurant.categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      price: `₹${item.price}`, // Format price as string currency representation
      diet: item.diet,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      image: item.imageUrl ?? "",
    })),
  }));

  const serializedRestaurant = {
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description ?? "",
    address: restaurant.address ?? "",
    categories: serializedCategories,
  };

  return <MenuClient restaurant={serializedRestaurant} />;
}
