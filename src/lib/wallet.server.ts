import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import { uuid } from "./ids";

/** Current wallet balance in paise. */
export async function getBalance(userId: string): Promise<number> {
  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  return Number(u?.walletPaise ?? 0);
}

/** Atomically move `deltaPaise` (+credit / -debit) and write a ledger row.
 *  Returns the new balance, or null if a debit would overdraw. */
export async function moveWallet(
  db: Db,
  userId: string,
  deltaPaise: number,
  kind: "deposit" | "order" | "refund" | "adjust",
  ref?: string,
  note?: string,
): Promise<number | null> {
  // Guarded update: for debits, only succeed if the balance is sufficient.
  const rows = await db
    .update(schema.users)
    .set({ walletPaise: sql`${schema.users.walletPaise} + ${deltaPaise}` })
    .where(deltaPaise < 0 ? and(eq(schema.users.id, userId), sql`${schema.users.walletPaise} + ${deltaPaise} >= 0`) : eq(schema.users.id, userId))
    .returning();
  if (rows.length === 0) return null; // insufficient funds
  const balance = Number(rows[0].walletPaise);
  await db.insert(schema.walletLedger).values({ id: uuid(), userId, deltaPaise, balanceAfterPaise: balance, kind, ref: ref ?? null, note: note ?? null });
  return balance;
}

export async function creditWallet(userId: string, deltaPaise: number, kind: "deposit" | "refund" | "adjust", ref?: string, note?: string): Promise<number> {
  const db = await getDb();
  const b = await moveWallet(db, userId, Math.abs(deltaPaise), kind, ref, note);
  return b ?? (await getBalance(userId));
}

export interface LedgerEntry {
  id: string;
  deltaPaise: number;
  balanceAfterPaise: number;
  kind: string;
  note: string | null;
  createdAt: Date;
}

export async function listLedger(userId: string, limit = 50): Promise<LedgerEntry[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.walletLedger).where(eq(schema.walletLedger.userId, userId)).orderBy(desc(schema.walletLedger.createdAt)).limit(limit);
  return rows.map((r) => ({ id: r.id, deltaPaise: r.deltaPaise, balanceAfterPaise: r.balanceAfterPaise, kind: r.kind, note: r.note, createdAt: r.createdAt }));
}
