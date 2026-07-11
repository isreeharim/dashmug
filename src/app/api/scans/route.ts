import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const bodySchema = z.object({
  // Production QR codes use CUIDs; the seeded/demo catalog uses stable readable IDs.
  qr: z.union([z.string().cuid(), z.string().regex(/^qr_[a-z0-9_]{3,96}$/)]),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`scan:${ip}`, 30)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid scan" }, { status: 422 });
  const code = await db.qRCode.findUnique({ where: { publicId: parsed.data.qr }, select: { id: true, isActive: true } });
  if (!code?.isActive) return NextResponse.json({ ok: true });
  await db.qRScan.create({ data: { qrCodeId: code.id, userAgent: request.headers.get("user-agent")?.slice(0, 512), referer: request.headers.get("referer")?.slice(0, 512), ipHash: createHash("sha256").update(`${ip}:${process.env.SCAN_HASH_SALT ?? ""}`).digest("hex") } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
