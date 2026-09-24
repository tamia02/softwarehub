import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { settings as defaults } from "@/config/site";

/**
 * Runtime settings backed by the `settings` table, with the defaults from
 * config/site.ts. Cached per process for 30 s.
 */
export interface RuntimeSettings {
  usdInrRate: number;
  platformFeePct: number;
  poolExpiryDays: number;
  poolSeatsMin: number;
  poolSeatsMax: number;
  poolSeatsDefault: number;
  guaranteeDays: number;
  gstPct: number;
  sellerStateCode: string;
  sellerGstin: string;
  sellerLegalName: string;
  sellerAddress: string;
  invoicePrefix: string;
  teamDiscountPct: number;
  passReminderDays: number;
}

export const SETTING_DEFAULTS: RuntimeSettings = {
  usdInrRate: defaults.usdInrRate,
  platformFeePct: defaults.platformFeePct,
  poolExpiryDays: defaults.poolExpiryDays,
  poolSeatsMin: defaults.poolSeatsMin,
  poolSeatsMax: defaults.poolSeatsMax,
  poolSeatsDefault: defaults.poolSeatsDefault,
  guaranteeDays: defaults.guaranteeDays,
  gstPct: 18,
  sellerStateCode: "27",
  sellerGstin: "27AAAAA0000A1Z5",
  sellerLegalName: "Software Hub",
  sellerAddress: "Mumbai, Maharashtra, India",
  invoicePrefix: "SHP",
  teamDiscountPct: defaults.teamDiscountPct,
  passReminderDays: 14,
};

let cache: { at: number; value: RuntimeSettings } | null = null;

export async function getSettings(): Promise<RuntimeSettings> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  const db = await getDb();
  const rows = await db.select().from(schema.settings);
  const value: RuntimeSettings = { ...SETTING_DEFAULTS };
  // Rates/counts that must never be zero — a blank/0 stored value would zero
  // every price, so we ignore it and keep the default.
  const mustBePositive = new Set<keyof RuntimeSettings>(["usdInrRate", "poolSeatsMin", "poolSeatsMax", "poolSeatsDefault", "poolExpiryDays", "guaranteeDays"]);
  for (const r of rows) {
    const k = r.key as keyof RuntimeSettings;
    if (!(k in value)) continue;
    const def = SETTING_DEFAULTS[k];
    if (typeof def === "number") {
      const num = Number(r.value);
      const bad = !Number.isFinite(num) || (mustBePositive.has(k) && num <= 0);
      (value as unknown as Record<string, unknown>)[k] = bad ? def : num;
    } else {
      (value as unknown as Record<string, unknown>)[k] = r.value;
    }
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function setSetting(key: keyof RuntimeSettings, value: string | number) {
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value: String(value), updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: String(value), updatedAt: new Date() } });
  cache = null;
}

export function invalidateSettings() {
  cache = null;
}

/** Test-only escape hatch. */
export const _resetSettingsCache = invalidateSettings;

export async function getSetting<K extends keyof RuntimeSettings>(key: K): Promise<RuntimeSettings[K]> {
  return (await getSettings())[key];
}

export async function getSettingRaw(key: string) {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  return row?.value;
}
