import "server-only";
import fs from "node:fs";
import path from "node:path";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

/**
 * One connection per process.
 *  - DATABASE_URL set   → Postgres (Neon / Supabase / RDS) via postgres-js.
 *  - DATABASE_URL unset → embedded PGlite (real Postgres in WASM) at .data/pglite.
 *
 * Migrations in ./drizzle are applied on first connect so a fresh clone runs
 * with zero setup. In production run `npm run db:migrate` in CI instead and set
 * DB_AUTO_MIGRATE=false.
 */
export type Db = PgliteDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

const g = globalThis as unknown as { __shpDb?: Promise<Db> };

async function connect(): Promise<Db> {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  const auto = process.env.DB_AUTO_MIGRATE !== "false";

  if (process.env.DATABASE_URL) {
    const postgres = (await import("postgres")).default;
    const client = postgres(process.env.DATABASE_URL, { max: 10, prepare: false });
    const db = drizzlePg(client, { schema });
    if (auto) await migratePg(db, { migrationsFolder });
    return db;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), ".data", "pglite");
  if (!dataDir.startsWith("memory://")) fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client, { schema });
  await migratePglite(db, { migrationsFolder });
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty(db);
  return db;
}

export function getDb(): Promise<Db> {
  if (!g.__shpDb) {
    g.__shpDb = connect().catch((err) => {
      g.__shpDb = undefined;
      throw err;
    });
  }
  return g.__shpDb;
}

export { schema };
