import "server-only";
import { getDb, schema, type Db } from "@/db";
import { uuid } from "./ids";

/**
 * Every state change writes an audit row (§5.2). Never pass plaintext codes in meta.
 */
export async function audit(
  entry: {
    actorId?: string | null;
    entity: string;
    entityId: string;
    from?: string | null;
    to?: string | null;
    meta?: Record<string, unknown>;
  },
  db?: Db,
) {
  const d = db ?? (await getDb());
  await d.insert(schema.auditLog).values({
    id: uuid(),
    actorId: entry.actorId ?? null,
    entity: entry.entity,
    entityId: entry.entityId,
    fromState: entry.from ?? null,
    toState: entry.to ?? null,
    metaJson: entry.meta ?? null,
  });
}
