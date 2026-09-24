// Demo: simulate a reseller adding a NEW product with 5 codes, to prove it
// appears on the marketplace with our commission + stock. Run:
//   npx tsx --tsconfig scripts/tsconfig.json scripts/demo-add-product.ts
import { getDb, schema } from "../src/db";
import { hashCode } from "../src/lib/codes.server";
import { encrypt } from "../src/lib/crypto.server";
import { uuid, shortId } from "../src/lib/ids";

getDb().then(async (db) => {
  const id = uuid();
  const slug = "demo-vpn-1y";
  await db.insert(schema.products).values({
    id, slug, name: "NordVPN · 1 Year (demo add)", vendor: "NordVPN", category: "Software",
    blurb: "Added live by a reseller to prove the flow — 1 year of NordVPN.",
    basePricePaise: 900_00, commissionPct: 20, hue: 220, badge: "NEW", sort: 999,
  }).onConflictDoNothing();
  const codes = Array.from({ length: 5 }, () => `NORD-${shortId().toUpperCase()}-${shortId().toUpperCase()}`);
  await db.insert(schema.productCodes).values(
    codes.map((c) => ({ id: uuid(), productId: id, codeHash: hashCode(c), codeEnc: encrypt(c), last4: c.slice(-4), batch: "demo" })),
  );
  console.log(`Inserted product ${slug} (base ₹900 → customer ₹1080) with ${codes.length} codes.`);
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });
