/**
 * Session token helpers that run in both Node and the Edge runtime
 * (middleware). HS256 JWT signed with AUTH_SECRET.
 */
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/config/site";

export const SESSION_COOKIE = "shp_session";
export const SESSION_DAYS = 30;

export interface SessionClaims {
  sub: string;
  role: Role;
  name?: string | null;
}

function key() {
  const secret = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-auth-secret-change-me-please-32b");
  if (!secret) throw new Error("AUTH_SECRET must be set in production");
  return new TextEncoder().encode(secret);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ role: claims.role, name: claims.name ?? undefined })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const role = payload.role;
    if (!payload.sub || (role !== "customer" && role !== "reseller" && role !== "admin")) return null;
    return { sub: payload.sub, role, name: (payload.name as string | undefined) ?? null };
  } catch {
    return null;
  }
}
