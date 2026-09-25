import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { hashCode } from "./codes.server";
import { uuid } from "./ids";

/** Create a new API key for a user. Returns the plaintext ONCE. */
export async function createApiKey(userId: string, label?: string): Promise<string> {
  const db = await getDb();
  const key = `shp-${uuid().replace(/-/g, "")}${uuid().replace(/-/g, "").slice(0, 8)}`;
  await db.insert(schema.apiKeys).values({ id: uuid(), userId, keyHash: hashCode(key), last4: key.slice(-4), label: label ?? "API key" });
  return key;
}

/** Resolve an API key to its user id (and stamp last-used), or null. */
export async function userForApiKey(key: string): Promise<string | null> {
  if (!key || key.length < 20) return null;
  const db = await getDb();
  const [row] = await db.select().from(schema.apiKeys).where(and(eq(schema.apiKeys.keyHash, hashCode(key)), isNull(schema.apiKeys.revokedAt)));
  if (!row) return null;
  await db.update(schema.apiKeys).set({ lastUsedAt: new Date() }).where(eq(schema.apiKeys.id, row.id));
  return row.userId;
}

export interface ApiKeyRow {
  id: string;
  last4: string;
  label: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export async function listApiKeys(userId: string): Promise<ApiKeyRow[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.apiKeys).where(and(eq(schema.apiKeys.userId, userId), isNull(schema.apiKeys.revokedAt))).orderBy(desc(schema.apiKeys.createdAt));
  return rows.map((r) => ({ id: r.id, last4: r.last4, label: r.label, createdAt: r.createdAt, lastUsedAt: r.lastUsedAt }));
}

export async function revokeApiKey(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const r = await db.update(schema.apiKeys).set({ revokedAt: new Date() }).where(and(eq(schema.apiKeys.id, id), eq(schema.apiKeys.userId, userId))).returning();
  return r.length > 0;
}
