/**
 * Activation code helpers that are safe to run in the browser
 * (no crypto, no secrets). Server-side generation/hashing lives in
 * `codes.server.ts`.
 *
 * Formats (§5.1):
 *   Customer gate   SHP-C-XXXX-XXXX          (12 chars normalised)
 *   Reseller gate   SHP-R-XXXX-XXXX          (12 chars normalised)
 *   Bundle (Pro)    SHP-P-XXXX-XXXX-XXXX     (16 chars normalised)
 *   Bundle (Start)  SHP-S-XXXX-XXXX-XXXX     (16 chars normalised)
 *
 * The final character of every SHP code is a check character computed over
 * the preceding characters, so obvious typos are rejected before the network.
 */

export type CodeKind = "gate-customer" | "gate-reseller" | "bundle-pro" | "bundle-starter" | "unknown";

/** Base-36 alphabet used for check-character arithmetic. */
const CHECK_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Generation alphabet excludes look-alikes (0/O, 1/I). */
export const GEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const GATE_CODE_LENGTH = 12;
export const BUNDLE_CODE_LENGTH = 16;
export const MAX_CODE_LENGTH = 16;

/** Strip everything except A–Z / 0–9 and upper-case. */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, MAX_CODE_LENGTH);
}

/** Render a normalised code as XXXX-XXXX-XXXX(-XXXX). */
export function maskCode(input: string): string {
  const n = normalizeCode(input);
  return n.replace(/(.{4})(?=.)/g, "$1-");
}

/** Pretty-print a full SHP code as SHP-C-XXXX-XXXX for display. */
export function displayCode(normalized: string): string {
  if (/^SHP[CRPS]/.test(normalized)) {
    const rest = normalized.slice(4).replace(/(.{4})(?=.)/g, "$1-");
    return `SHP-${normalized[3]}-${rest}`;
  }
  return maskCode(normalized);
}

export function codeKind(normalized: string): CodeKind {
  if (normalized.startsWith("SHPC")) return "gate-customer";
  if (normalized.startsWith("SHPR")) return "gate-reseller";
  if (normalized.startsWith("SHPP")) return "bundle-pro";
  if (normalized.startsWith("SHPS")) return "bundle-starter";
  return "unknown";
}

/**
 * ISO 7064 MOD 37-2 (pure system, radix 2, prime modulus 37). Detects every
 * single-character substitution and every adjacent transposition. The check
 * value 36 maps to "*", which is outside the code alphabet, so generators
 * retry until the check lands on 0-9/A-Z (see `checkCharIsUsable`).
 */
const CHECK_ALPHABET_37 = CHECK_ALPHABET + "*";
const MODULUS = 37;
const RADIX = 2;

function iso7064Checksum(s: string): number {
  let check = 0;
  for (const ch of s) {
    const v = CHECK_ALPHABET_37.indexOf(ch);
    if (v < 0) throw new Error(`Invalid character in code: ${ch}`);
    check = (check * RADIX + v) % MODULUS;
  }
  return check;
}

/** Returns the check character, or "*" when the body is unusable (regenerate it). */
export function computeCheckChar(body: string): string {
  return CHECK_ALPHABET_37[(((1 - iso7064Checksum(body) * RADIX) % MODULUS) + MODULUS) % MODULUS];
}

export function checkCharIsUsable(body: string): boolean {
  return computeCheckChar(body) !== "*";
}

export function hasValidCheckChar(normalized: string): boolean {
  if (normalized.length < 2 || normalized.includes("*")) return false;
  try {
    return iso7064Checksum(normalized) === 1;
  } catch {
    return false;
  }
}

/**
 * Client-side pre-flight. Returns an error string or null.
 * Demo codes (non-SHP prefix) skip the check-character rule and are
 * validated only on the server.
 */
export function preflightGateCode(input: string): string | null {
  const n = normalizeCode(input);
  if (n.length < 8) return "That code looks too short.";
  const kind = codeKind(n);
  if (kind === "bundle-pro" || kind === "bundle-starter") {
    return "That is a bundle code — redeem it from My Pass after you sign in.";
  }
  if (kind !== "unknown") {
    if (n.length !== GATE_CODE_LENGTH) return "Gate codes are 12 characters long.";
    if (!hasValidCheckChar(n)) return "That code has a typo — please check it and try again.";
  }
  return null;
}
