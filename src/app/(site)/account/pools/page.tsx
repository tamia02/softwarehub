import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "My pools" };

export default async function AccountPoolsPage() {
  const user = await requireUser();
  const db = await getDb();
  const memberships = await db.select().from(schema.poolMembers).where(eq(schema.poolMembers.userId, user.id));
  const ids = memberships.map((m) => m.poolId);
  const pools = ids.length ? await db.select().from(schema.pools).where(inArray(schema.pools.id, ids)) : [];
  const created = await db.select().from(schema.pools).where(eq(schema.pools.creatorUserId, user.id));
  const all = [...pools, ...created.filter((c) => !ids.includes(c.id))];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Pools</h2>
        <Button href="/checkout/pool" variant="secondary" size="sm">Create a pool</Button>
      </div>
      {!all.length ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">You have not joined any pool yet.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((p) => {
            const m = memberships.find((x) => x.poolId === p.id);
            return (
              <li key={p.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-primary">{p.tierId} pool</p>
                  <Badge tone={p.status === "fulfilled" ? "new" : p.status === "expired" ? "limited" : "success"}>{p.status}</Badge>
                </div>
                <p className="mt-1 font-bold">{p.name ?? `Pool ${p.id}`}</p>
                <p className="text-sm text-ink-muted">
                  {m ? `Seat ${m.seatNo} · ${m.paidAt ? "paid" : "reserved"}${m.refundedAt ? " · refunded" : ""}` : "You created this pool"} · {formatINR(p.seatPricePaise)}
                </p>
                <Link href={`/pool/${p.id}`} className="mt-3 inline-block text-sm font-bold text-primary hover:underline">Open pool →</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
