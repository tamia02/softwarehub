import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function requireEnv(name: string, devDefault: string): string {
  const v = process.env[name];
  if (!v) {
    if (process.env.NODE_ENV === "production") throw new Error(`${name} must be set in production`);
    return devDefault;
  }
  return v;
}

export const codeSalt = () => requireEnv("CODE_HASH_SALT", "dev-salt-change-me");
export const authSecret = () => requireEnv("AUTH_SECRET", "dev-auth-secret-change-me-please-32b");

function encKey(): Buffer {
  const hex = requireEnv("CODE_ENCRYPTION_KEY", "0".repeat(64));
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("CODE_ENCRYPTION_KEY must be 32 bytes hex (64 chars)");
  return key;
}

/** Salted SHA-256 for codes and OTPs. */
export function sha256Salted(value: string): string {
  return createHash("sha256").update(`${codeSalt()}:${value}`).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function hmacSha256Hex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** AES-256-GCM — used only to hold a bundle code until it is delivered once. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), enc.toString("base64"), tag.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [iv, enc, tag] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function randomDigits(n: number): string {
  const bytes = randomBytes(n);
  let out = "";
  for (const b of bytes) out += String(b % 10);
  return out;
}
