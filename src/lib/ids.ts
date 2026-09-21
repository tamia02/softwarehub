import { randomBytes, randomUUID } from "node:crypto";

const SHORT = "abcdefghjkmnpqrstuvwxyz23456789";

/** UUID for internal rows. */
export const uuid = () => randomUUID();

/** Short, URL-friendly id for public things like /pool/[id]. */
export function shortId(len = 8): string {
  const bytes = randomBytes(len);
  let out = "";
  for (const b of bytes) out += SHORT[b % SHORT.length];
  return out;
}
