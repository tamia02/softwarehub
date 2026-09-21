import "server-only";
import { cookies } from "next/headers";
import { cookieNames, settings, type Role } from "@/config/site";

export async function getRole(): Promise<Role | null> {
  const jar = await cookies();
  const v = jar.get(cookieNames.role)?.value;
  return v === "customer" || v === "reseller" || v === "admin" ? v : null;
}

export function roleCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: settings.roleCookieDays * 24 * 60 * 60,
  };
}
