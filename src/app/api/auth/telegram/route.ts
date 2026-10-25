import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { establishSession, getSessionUser } from "@/lib/auth.server";
import { userForTelegram, verifyTelegramLogin } from "@/lib/telegram-auth.server";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/**
 * GET /api/auth/telegram?id=…&hash=…  — the Telegram Login Widget redirects here.
 * Verifies the signature, then signs the user in (or links Telegram to the
 * account they're already signed in with) and sends them to their account.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const back = (path: string) => NextResponse.redirect(new URL(path, origin));

  const rl = rateLimit(`tg-login:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!rl.allowed) return back("/login?error=rate");

  const tg = verifyTelegramLogin(url.searchParams);
  if (!tg) return back("/login?error=telegram");

  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  // Already signed in (email/OTP) without Telegram → link this Telegram account to it.
  const current = await getSessionUser();
  if (current && !current.telegramId) {
    const db = await getDb();
    const [taken] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.telegramId, tg.id));
    if (!taken) {
      await db.update(schema.users).set({ telegramId: tg.id }).where(eq(schema.users.id, current.id));
      return back(safeNext);
    }
  }

  const user = await userForTelegram(tg);
  await establishSession(user);
  return back(user.role === "admin" ? "/admin" : user.role === "reseller" && safeNext === "/account" ? "/reseller" : safeNext);
}
