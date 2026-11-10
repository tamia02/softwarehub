"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { methodCategories, methods as defaultMethods } from "@/data/methods";
import { audit } from "@/lib/audit.server";
import { requireUser } from "@/lib/auth.server";
import { uuid } from "@/lib/ids";
import type { ActionResult } from "../../reseller/actions";

const methodInput = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(120, "Use 120 characters or fewer for the title."),
  summary: z.string().trim().min(1, "Enter a summary.").max(500, "Use 500 characters or fewer for the summary."),
  category: z.enum(methodCategories),
  tier: z.enum(["Free", "Pro"]),
  minutes: z.coerce.number().int().min(1).max(180),
  steps: z.array(z.string().max(600, "Use 600 characters or fewer per step."))
    .min(1, "Enter at least one step.").max(30, "Enter 30 steps or fewer."),
});

export async function saveMethod(slug: string | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser("admin", "/admin/methods");
  const steps = formData.get("steps");
  const parsed = methodInput.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    tier: formData.get("tier"),
    minutes: formData.get("minutes"),
    steps: typeof steps === "string" ? steps.split(/\r?\n/).map((step) => step.trim()).filter(Boolean) : [],
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const db = await getDb();
  const id = slug ?? uuid();
  const content = parsed.data;
  const saved = await db.transaction(async (tx) => {
    if (slug && !defaultMethods.some((method) => method.slug === slug)) {
      const [updated] = await tx.update(schema.methodPlaybooks).set({ content })
        .where(eq(schema.methodPlaybooks.slug, slug)).returning();
      if (!updated) return false;
    } else {
      await tx.insert(schema.methodPlaybooks).values({ slug: id, content })
        .onConflictDoUpdate({ target: schema.methodPlaybooks.slug, set: { content } });
    }
    await audit({ actorId: user.id, entity: "method", entityId: id, to: slug ? "updated" : "published" }, tx);
    return true;
  });
  if (!saved) return { ok: false, error: "This method could not be found." };

  revalidatePath("/admin/methods");
  revalidatePath("/methods");
  revalidatePath("/market");
  return { ok: true, message: slug ? "Changes published." : "Method published." };
}
