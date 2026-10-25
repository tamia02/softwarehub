import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";
import { audit } from "./audit.server";
import { uuid } from "./ids";

/**
 * Telegram Login Widget verification
 * (https://core.telegram.org/widgets/login#checking-authorization).
 * The widget signs the user's fields with a key derived from the bot token, so
 * only Telegram can produce a valid hash — and the Telegram id it carries is
 * the same id the Lucifer bot uses for wallets and orders.
 */

const MAX_AGE_S = 24 * 60 * 60;

export interface TelegramIdentity {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export function verifyTelegramLogin(params: URLSearchParams): TelegramIdentity | null {
  const token = process.env.LUCIFER_BOT_TOKEN ?? "";
  const hash = params.get("hash") ?? "";
  const id = params.get("id") ?? "";
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!token || !/^[0-9a-f]{64}$/.test(hash) || !/^\d{1,20}$/.test(id) || !authDate) return null;
  if (Math.abs(Date.now() / 1000 - authDate) > MAX_AGE_S) return null;

  const fields = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"];
  const dataCheck = fields
    .filter((k) => params.has(k))
    .sort()
    .map((k) => `${k}=${params.get(k)}`)
    .join("\n");
  const secret = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", secret).update(dataCheck).digest();
  const given = Buffer.from(hash, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  return {
    id,
    firstName: params.get("first_name") ?? "",
    lastName: params.get("last_name") ?? "",
    username: params.get("username") ?? "",
  };
}

/** Find the site user for a Telegram id, or create one. */
export async function userForTelegram(tg: TelegramIdentity): Promise<User> {
  const db = await getDb();
  const name = [tg.firstName, tg.lastName].filter(Boolean).join(" ") || (tg.username ? `@${tg.username}` : `Telegram ${tg.id}`);
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.telegramId, tg.id));
  if (existing) {
    if (!existing.name && name) await db.update(schema.users).set({ name }).where(eq(schema.users.id, existing.id));
    return existing;
  }
  const [user] = await db.insert(schema.users).values({ id: uuid(), name, telegramId: tg.id }).returning();
  await audit({ actorId: user.id, entity: "user", entityId: user.id, to: "created", meta: { via: "telegram" } }, db);
  return user;
}
