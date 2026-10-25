import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";
import { audit } from "./audit.server";
import { uuid } from "./ids";

/**
 * "Continue with Google" — OAuth 2.0 authorization-code flow. The access token
 * is exchanged server-to-server with our client secret, and the profile comes
 * from Google's userinfo endpoint over TLS, so no client-side token is trusted.
 * Enabled only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export const GOOGLE_STATE_COOKIE = "shp_g_state";

export function googleConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function googleRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function googleAuthUrl(origin: string, state: string): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", googleRedirectUri(origin));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", state);
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

export interface GoogleProfile {
  email: string;
  name: string;
}

/** Exchanges the code and returns the verified profile, or null on any failure. */
export async function googleProfileFromCode(origin: string, code: string): Promise<GoogleProfile | null> {
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: googleRedirectUri(origin),
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!tokenRes.ok) return null;
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return null;
    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!infoRes.ok) return null;
    const info = (await infoRes.json()) as { email?: string; email_verified?: boolean; name?: string };
    if (!info.email || info.email_verified !== true) return null;
    return { email: info.email.trim().toLowerCase(), name: (info.name ?? "").trim() };
  } catch {
    return null;
  }
}

/** Find the site user for a Google email, or create one. */
export async function userForGoogle(p: GoogleProfile): Promise<User> {
  const db = await getDb();
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, p.email));
  if (existing) {
    if (!existing.name && p.name) await db.update(schema.users).set({ name: p.name }).where(eq(schema.users.id, existing.id));
    return existing;
  }
  const [user] = await db.insert(schema.users).values({ id: uuid(), name: p.name || null, email: p.email }).returning();
  await audit({ actorId: user.id, entity: "user", entityId: user.id, to: "created", meta: { via: "google" } }, db);
  return user;
}
