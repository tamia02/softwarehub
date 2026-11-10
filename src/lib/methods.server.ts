import "server-only";
import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { methods as defaultMethods } from "@/data/methods";

/** Saved entries with a built-in slug replace that guide in its original position. */
export async function listMethods() {
  const db = await getDb();
  const rows = await db.select().from(schema.methodPlaybooks)
    .orderBy(desc(schema.methodPlaybooks.createdAt), desc(schema.methodPlaybooks.slug));
  const saved = new Map(rows.map(({ slug, content }) => [slug, { ...content, slug }]));
  const builtIn = defaultMethods.map((method) => {
    const edited = saved.get(method.slug);
    saved.delete(method.slug);
    return edited ?? method;
  });
  return [...saved.values(), ...builtIn];
}
