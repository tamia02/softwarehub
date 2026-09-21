import "server-only";

/**
 * Sliding-window limiter, in-memory. Fine for a single instance; for
 * multi-instance deployments back this with Upstash/Postgres.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((list[0] + windowMs - now) / 1000) };
  }
  list.push(now);
  buckets.set(key, list);
  return { allowed: true, retryAfterSec: 0 };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "local";
}
