import { getDb, schema } from "../src/db";

async function main() {
  const db = await getDb();
  const tiers = await db.select().from(schema.tiers);
  const tools = await db.select().from(schema.tools);
  const pools = await db.select().from(schema.pools);
  const codes = await db.select().from(schema.bundleCodes);
  console.log({ tiers: tiers.length, tools: tools.length, pools: pools.length, bundleCodes: codes.length });
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
