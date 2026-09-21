import { getDb } from "../src/db";
import { seedIfEmpty } from "../src/db/seed";
getDb().then(async (db) => { await seedIfEmpty(db); console.log("seeded"); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
