import "server-only";

/**
 * Tiny per-process TTL memo for read-heavy public data (catalog, open pools,
 * pricing). Writers call `bust(key)` so admin edits and pool events show up
 * immediately. Multi-instance deployments still converge within the TTL.
 */
const store = new Map<string, { at: number; value: unknown; inflight?: Promise<unknown> }>();

export async function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) return hit.value as T;
  if (hit?.inflight) return hit.inflight as Promise<T>;
  const inflight = load()
    .then((value) => {
      store.set(key, { at: Date.now(), value });
      return value;
    })
    .catch((err) => {
      store.delete(key);
      throw err;
    });
  store.set(key, { at: hit?.at ?? 0, value: hit?.value, inflight });
  return inflight;
}

export function bust(prefix: string) {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
