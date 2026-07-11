import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function getSessionUser() {
  // Find the first user in the database (which will be seeded as 'Priya')
  let user = await db.user.findFirst({
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      restaurants: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });

  // If no user exists, create a default owner
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: "local_dev_owner",
        email: "owner@tabletap.com",
        name: "Priya",
        role: UserRole.RESTAURANT_OWNER,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        restaurants: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
      },
    });
  }

  return { userId: user.clerkId, dbUser: user };
}
