import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("tabletap_session_user_id")?.value;

  if (!sessionUserId) {
    return { userId: null, dbUser: null };
  }

  const user = await db.user.findUnique({
    where: { clerkId: sessionUserId },
    include: {
      restaurants: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!user) {
    return { userId: null, dbUser: null };
  }

  return { userId: user.clerkId, dbUser: user };
}
