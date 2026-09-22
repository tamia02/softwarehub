import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { cookieNames, type Role } from "@/config/site";
import { audit } from "./audit.server";
import { bindResellerGateCode } from "./codes.server";
import { randomDigits, safeEqualHex, sha256Salted } from "./crypto.server";
import { uuid } from "./ids";
import { notifyOtp, emailConfigured, smsConfigured } from "./notify.server";
import { rateLimit } from "./rate-limit.server";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session-edge";
import type { User } from "@/db/schema";

export const PENDING_RESELLER_COOKIE = "shp_pending_reseller";

/* ------------------------------------------------------------------
   Identifiers
   ------------------------------------------------------------------ */

export function normalizeIdentifier(raw: string): { channel: "email" | "sms"; identifier: string } | null {
  const v = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { channel: "email", identifier: v.toLowerCase() };
  const digits = v.replace(/[^\d]/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return { channel: "sms", identifier: `+91${digits}` };
  if (/^91[6-9]\d{9}$/.test(digits)) return { channel: "sms", identifier: `+${digits}` };
  return null;
}

/* ------------------------------------------------------------------
   OTP
   ------------------------------------------------------------------ */

const OTP_TTL_MS = 10 * 60 * 1000;

export async function requestOtp(raw: string, ip: string) {
  const id = normalizeIdentifier(raw);
  if (!id) return { ok: false as const, error: "Enter a valid email address or 10-digit Indian mobile number." };

  const rl = rateLimit(`otp:${ip}:${id.identifier}`, 5, OTP_TTL_MS);
  if (!rl.allowed) return { ok: false as const, error: `Too many codes requested. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.` };

  const db = await getDb();
  const code = randomDigits(6);
  await db.insert(schema.otpCodes).values({
    id: uuid(),
    identifier: id.identifier,
    channel: id.channel,
    codeHash: sha256Salted(`otp:${id.identifier}:${code}`),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  await notifyOtp(id.channel, id.identifier, code);

  const providerMissing = id.channel === "email" ? !emailConfigured() : !smsConfigured();
  const devCode = providerMissing && (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_OTP === "true") ? code : undefined;
  return { ok: true as const, channel: id.channel, identifier: id.identifier, devCode };
}

export async function verifyOtp(raw: string, code: string): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const id = normalizeIdentifier(raw);
  if (!id) return { ok: false, error: "Invalid identifier." };
  const db = await getDb();
  const [otp] = await db
    .select()
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.identifier, id.identifier), isNull(schema.otpCodes.consumedAt)))
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);

  if (!otp || otp.expiresAt < new Date()) return { ok: false, error: "That code has expired. Request a new one." };
  if (otp.attempts >= 5) return { ok: false, error: "Too many wrong attempts. Request a new code." };

  const ok = safeEqualHex(otp.codeHash, sha256Salted(`otp:${id.identifier}:${code.trim()}`));
  if (!ok) {
    await db.update(schema.otpCodes).set({ attempts: otp.attempts + 1 }).where(eq(schema.otpCodes.id, otp.id));
    return { ok: false, error: "Wrong code. Check it and try again." };
  }
  await db.update(schema.otpCodes).set({ consumedAt: new Date() }).where(eq(schema.otpCodes.id, otp.id));

  const where = id.channel === "email" ? eq(schema.users.email, id.identifier) : eq(schema.users.phone, id.identifier);
  let [user] = await db.select().from(schema.users).where(where);
  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({ id: uuid(), email: id.channel === "email" ? id.identifier : null, phone: id.channel === "sms" ? id.identifier : null })
      .returning();
    await audit({ actorId: user.id, entity: "user", entityId: user.id, to: "created" }, db);
  }
  return { ok: true, user };
}

/* ------------------------------------------------------------------
   Session
   ------------------------------------------------------------------ */

function cookieOpts(maxAgeDays = SESSION_DAYS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}

/**
 * Finishes sign-in: applies any pending reseller gate code or customer
 * attribution, then sets the session + role cookies.
 */
export async function establishSession(user: User) {
  const db = await getDb();
  const jar = await cookies();

  const pendingReseller = jar.get(PENDING_RESELLER_COOKIE)?.value;
  if (pendingReseller && user.role !== "admin") {
    const [gc] = await db.select().from(schema.gateCodes).where(eq(schema.gateCodes.id, pendingReseller));
    if (gc && gc.type === "reseller" && gc.status === "active" && (!gc.boundUserId || gc.boundUserId === user.id)) {
      await db.update(schema.users).set({ role: "reseller" }).where(eq(schema.users.id, user.id));
      await db
        .insert(schema.resellers)
        .values({ userId: user.id, resellerCodeId: gc.id })
        .onConflictDoNothing();
      await bindResellerGateCode(gc.id, user.id);
      await audit({ actorId: user.id, entity: "user", entityId: user.id, from: user.role, to: "reseller", meta: { gateCodeId: gc.id } }, db);
      user = { ...user, role: "reseller" };
    }
    jar.delete(PENDING_RESELLER_COOKIE);
  }

  const ref = jar.get(cookieNames.ref)?.value;
  if (ref && !user.referredByResellerId && user.role === "customer") {
    await db.update(schema.users).set({ referredByResellerId: ref }).where(eq(schema.users.id, user.id));
  }

  const token = await signSession({ sub: user.id, role: user.role as Role, name: user.name });
  jar.set(SESSION_COOKIE, token, cookieOpts());
  jar.set(cookieNames.role, user.role, cookieOpts());
  return user;
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const claims = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const db = await getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, claims.sub));
  return user ?? null;
}

/** Server-component guard. Redirects to /login (or /home when the role is wrong). */
export async function requireUser(role?: Role | Role[], next?: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role as Role) && user.role !== "admin") redirect("/home");
  }
  return user;
}

/** Route-handler guard. Returns null instead of redirecting. */
export async function requireApiUser(role?: Role | Role[]): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role as Role) && user.role !== "admin") return null;
  }
  return user;
}

/* ------------------------------------------------------------------
   Demo sign-in — one click, no OTP. Guarded to demo/dev only.
   ------------------------------------------------------------------ */

/** True when password-free demo sign-in is allowed (never in a real prod build). */
export function demoLoginAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_OTP === "true";
}

/**
 * Signs in as one of the seeded demo users (customer / reseller / admin)
 * without an OTP. Creates the row if the demo DB was reset without a seed.
 * Only callable when `demoLoginAllowed()`.
 */
export async function establishDemoSession(role: Role): Promise<User> {
  const db = await getDb();
  const email = `${role}@softwarehubpool.example`;
  let [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({ id: uuid(), name: `Demo ${role[0].toUpperCase()}${role.slice(1)}`, email, role })
      .returning();
    await audit({ actorId: user.id, entity: "user", entityId: user.id, to: `demo-${role}` }, db);
  }
  const token = await signSession({ sub: user.id, role: user.role as Role, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOpts());
  jar.set(cookieNames.role, user.role, cookieOpts());
  return user;
}
