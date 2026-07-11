import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurantSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) { 
  const { userId, dbUser } = await getSessionUser(); 
  if (!userId || !dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
  }
  if (!rateLimit(`restaurant:${userId}`, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 }); 
  }
  const parsed = restaurantSchema.safeParse(await request.json()); 
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 }); 
  }
  try { 
    const restaurant = await db.restaurant.create({ 
      data: { 
        ...parsed.data, 
        ownerId: dbUser.id, 
        qrCodes: { create: { destinationPath: `/menu/${parsed.data.slug}` } } 
      } 
    }); 
    return NextResponse.json(restaurant, { status: 201 }); 
  } catch { 
    return NextResponse.json({ error: "That restaurant slug is already in use." }, { status: 409 }); 
  } 
}
