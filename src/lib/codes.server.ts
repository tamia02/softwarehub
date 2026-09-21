import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { GEN_ALPHABET, computeCheckChar, normalizeCode, type CodeKind } from "./codes";
import type { Role } from "@/config/site";

/* ------------------------------------------------------------------
   Generation
   ------------------------------------------------------------------ */

const PREFIX: Record<Exclude<CodeKind, "unknown">, string> = {
  "gate-customer": "SHPC",
  "gate-reseller": "SHPR",
  "bundle-pro": "SHPP",
  "bundle-starter": "SHPS",
};

function randomChars(n: number): string {
  // Rejection sampling keeps the distribution uniform over the alphabet.
  const out: string[] = [];
  while (out.length < n) {
    const bytes = randomBytes(n * 2);
    for (const b of bytes) {
      if (b < 256 - (256 % GEN_ALPHABET.length)) {
        out.push(GEN_ALPHABET[b % GEN_ALPHABET.length]);
        if (out.length === n) break;
      }
    }
  }
  return out.join("");
}

/** Generate a plaintext code. Show it once; persist only `hashCode(code)`. */
export function generateCode(kind: Exclude<CodeKind, "unknown">): string {
  const totalLen = kind.startsWith("gate") ? 12 : 16;
  const prefix = PREFIX[kind];
  const body = prefix + randomChars(totalLen - prefix.length - 1);
  return body + computeCheckChar(body);
}

/* ------------------------------------------------------------------
   Hashing
   ------------------------------------------------------------------ */

function salt(): string {
  const s = process.env.CODE_HASH_SALT;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("CODE_HASH_SALT must be set in production");
  }
  return s ?? "dev-salt-change-me";
}

export function hashCode(plaintext: string): string {
  return createHash("sha256").update(`${salt()}:${normalizeCode(plaintext)}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/* ------------------------------------------------------------------
   Gate code store — in-memory for now; swap for Prisma in Phase 2.
   ------------------------------------------------------------------ */

export interface GateCodeRecord {
  id: string;
  codeHash: string;
  type: "customer" | "reseller";
  resellerId?: string;
  maxUses: number;
  uses: number;
  expiresAt?: Date;
  status: "active" | "locked" | "void";
  failedAttempts: number;
}

/** Demo codes — REPLACE BEFORE LAUNCH (see §1.3). */
const DEMO_CODES: Array<{ plaintext: string; type: GateCodeRecord["type"]; resellerId?: string }> = [
  { plaintext: "CUST-DEMO-2026", type: "customer", resellerId: "demo-reseller" },
  { plaintext: "RSL-DEMO-2026", type: "reseller" },
];

let _store: GateCodeRecord[] | null = null;

/** Lazily hashed so importing this module (e.g. at build time) needs no salt. */
function store(): GateCodeRecord[] {
  if (!_store) {
    _store = DEMO_CODES.map((d, i) => ({
      id: `demo-${i + 1}`,
      codeHash: hashCode(d.plaintext),
      type: d.type,
      resellerId: d.resellerId,
      maxUses: Number.MAX_SAFE_INTEGER,
      uses: 0,
      status: "active",
      failedAttempts: 0,
    }));
  }
  return _store;
}

export function findGateCode(plaintext: string): GateCodeRecord | undefined {
  const h = hashCode(plaintext);
  return store().find((r) => safeEqualHex(r.codeHash, h));
}

export interface VerifyResult {
  ok: boolean;
  role?: Role;
  resellerId?: string;
  redirect?: string;
  error?: string;
}

export function verifyGateCode(plaintext: string): VerifyResult {
  const rec = findGateCode(plaintext);
  if (!rec) return { ok: false, error: "We couldn't find that code." };
  if (rec.status !== "active") return { ok: false, error: "This code is no longer active." };
  if (rec.expiresAt && rec.expiresAt < new Date()) return { ok: false, error: "This code has expired." };
  if (rec.uses >= rec.maxUses) return { ok: false, error: "This code has already been used." };

  rec.uses += 1;
  audit("gate_code", rec.id, "verify", `uses:${rec.uses - 1}→${rec.uses}`);

  const role: Role = rec.type === "reseller" ? "reseller" : "customer";
  return {
    ok: true,
    role,
    resellerId: rec.resellerId,
    redirect: role === "reseller" ? "/reseller" : "/home",
  };
}

/* ------------------------------------------------------------------
   Rate limiting — 5 attempts / 10 min / IP (in-memory; use Upstash or
   Postgres in production so it survives multiple instances).
   ------------------------------------------------------------------ */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const attempts = new Map<string, number[]>();

export function rateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const list = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) {
    return { allowed: false, retryAfterSec: Math.ceil((list[0] + RATE_WINDOW_MS - now) / 1000) };
  }
  list.push(now);
  attempts.set(ip, list);
  return { allowed: true, retryAfterSec: 0 };
}

/** A successful verification should not eat into the caller's budget. */
export function clearRateLimit(ip: string) {
  attempts.delete(ip);
}

/* ------------------------------------------------------------------
   Audit — stub that will become the audit_log table.
   Codes are never written to the log.
   ------------------------------------------------------------------ */
export function audit(entity: string, entityId: string, action: string, meta?: string) {
  if (process.env.NODE_ENV !== "test") {
    console.info(`[audit] ${new Date().toISOString()} ${entity}#${entityId} ${action} ${meta ?? ""}`.trim());
  }
}
