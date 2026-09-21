import { getDb } from "../src/db";
import { resetAndSeed } from "../src/db/seed";
getDb().then(async (db) => { await resetAndSeed(db); console.log("reset + seeded"); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
