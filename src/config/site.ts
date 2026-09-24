/**
 * Site-wide configuration. Anything that is a business decision lives here
 * (or in the `settings` table once the DB exists) — never hard-coded in UI.
 */
export const site = {
  name: "Software Hub Pool",
  shortName: "SHP",
  tagline: "Annual plans on 35 premium AI and product tools, issued as one activation code.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@softwarehubpool.example",
  currency: "INR" as const,
  locale: "en-IN" as const,
  /** Public origin, no trailing slash - set NEXT_PUBLIC_SITE_URL in production. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://softwarehubpool.example").replace(/\/$/, ""),
};

/**
 * Runtime settings. In production these are read from the `settings` table
 * (see §7 of the build guide); these are the defaults / seed values.
 */
export const settings = {
  /** Illustrative rate — recompute from the settings table, never hard-code in UI. */
  usdInrRate: 84,
  /** Platform fee on reseller-managed pools, in percent. */
  platformFeePct: 2,
  /** Days before an unfilled pool auto-expires and refunds every member. */
  poolExpiryDays: 7,
  /** Pool seat bounds. */
  poolSeatsMin: 5,
  poolSeatsMax: 10,
  poolSeatsDefault: 10,
  /** Days a "Code Works Guarantee" claim can be raised after activation. */
  guaranteeDays: 7,
  /** Role cookie lifetime. */
  roleCookieDays: 30,
  /** Team discount shown on the pricing strip. */
  teamDiscountPct: 10,
  teamMinSeats: 5,
};

export const cookieNames = {
  role: "shp_role",
  ref: "shp_ref",
};

export type Role = "customer" | "reseller" | "admin";

export const nav = [
  { label: "Passes", href: "/home" },
  { label: "Growth", href: "/growth" },
  { label: "Community", href: "/community" },
];
