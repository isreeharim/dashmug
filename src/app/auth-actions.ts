"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function signUpAction(formData: FormData): Promise<void> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!name || !email) {
    redirect("/sign-up?error=missing_fields");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/sign-up?error=user_exists");
  }

  // Create a new local Clerk-mocked user ID
  const localClerkId = `user_local_${Math.random().toString(36).substring(2, 11)}`;

  // Create the User in database
  const user = await db.user.create({
    data: {
      clerkId: localClerkId,
      email,
      name,
      role: UserRole.RESTAURANT_OWNER, // New users default to restaurant owner
    },
  });

  // Set the session cookie (expires in 30 days)
  const cookieStore = await cookies();
  cookieStore.set("tabletap_session_user_id", user.clerkId, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    httpOnly: true,
  });

  redirect("/dashboard");
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email) {
    redirect("/sign-in?error=missing_email");
  }

  // Find user by email
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/sign-in?error=user_not_found");
  }

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("tabletap_session_user_id", user.clerkId, {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
  });

  redirect("/dashboard");
}

export async function signInAsUserAction(clerkId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    redirect("/sign-in?error=user_not_found");
  }

  const cookieStore = await cookies();
  cookieStore.set("tabletap_session_user_id", user.clerkId, {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
  });

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("tabletap_session_user_id");
  redirect("/sign-in");
}
