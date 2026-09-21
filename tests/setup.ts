import { vi } from "vitest";

// In-memory Postgres for every test file; a fresh DB per process.
process.env.PGLITE_DATA_DIR = "memory://shp-test";
(process.env as Record<string, string>).NODE_ENV = "test";
process.env.CODE_HASH_SALT = "test-salt";
process.env.CODE_ENCRYPTION_KEY = "11".repeat(32);
process.env.AUTH_SECRET = "test-auth-secret-at-least-32-bytes-long";

// Server components read cookies via next/headers; the libs under test don't need real ones.
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));
vi.mock("next/navigation", () => ({ redirect: (u: string) => { throw new Error(`redirect:${u}`); } }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
