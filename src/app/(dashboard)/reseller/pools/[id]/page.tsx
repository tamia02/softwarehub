import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb, schema } from "@/db";
import { ActionButton } from "@/components/dashboard/ActionButton";
import { AssignmentEditor } from "@/components/dashboard/AssignmentEditor";
import { Panel, StatCard, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/config/site";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { getPool } from "@/lib/pools.server";
import { getSettings } from "@/lib/settings.server";
import { computeSplit, type SplitResult } from "@/lib/split";
import { fulfilPoolAction } from "../../actions";
import { PayButton } from "@/components/checkout/PayButton";

export const metadata = { title: "Pool detail" };

export default async function ResellerPoolDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["reseller", "admin"]);
  const d = await getPool(id);
  if (!d || (user.role !== "admin" && d.pool.resellerId !== user.id)) notFound();
  const { pool, members, tier, paidSeats } = d;
  const s = await getSettings();
  const db = await getDb();
  const tools = await db.select().from(schema.tools).where(eq(schema.tools.active, true));
  const tierTools = tools.filter((t) => pool.tierId === "pro" || t.tierMin === "starter").sort((a, b) => a.sort - b.sort);

  const url = `${site.url}/pool/${pool.id}`;
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 180, color: { dark: "#0b0f19" } });

  // Live projection of the split (final numbers are frozen at fulfilment).
  const eligible = members.filter((m) => m.paidAt || pool.paymentModel === "single");
  const projected = (pool.settlementJson as SplitResult | null)?.memberShares
    ? (pool.settlementJson as SplitResult)
    : (() => {
        try {
          return computeSplit({
            members: eligible.map((m) => ({ userId: m.userId, paidPaise: pool.seatPricePaise })),
            resellerCostPaise: tier.resellerPricePaise,
            feePct: s.platformFeePct,
            mode: pool.splitMode as SplitResult["mode"],
            customPct: pool.splitJson ?? undefined,
          });
        } catch {
          return null;
        }
      })();
  const canFulfil = pool.status === "paid" || (pool.status === "filled" && pool.paymentModel === "single" && !!pool.paidAt);
  const needsSinglePayment = pool.paymentModel === "single" && !pool.paidAt && pool.status !== "expired";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <Link href="/reseller/pools" className="text-xs font-bold text-primary">← Pools</Link>
          <h1 className="mt-1 text-2xl font-black">{pool.name ?? `Pool ${pool.id}`}</h1>
          <p className="text-sm text-ink-muted">
            {tier.name} · {pool.seats} seats × {formatINR(pool.seatPricePaise)} · {pool.paymentModel} · {pool.distributionMode} · expires {pool.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </p>
        </div>
        <Badge tone={pool.status === "fulfilled" ? "new" : pool.status === "expired" ? "limited" : "success"}>{pool.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Paid seats" value={`${paidSeats}/${pool.seats}`} />
        <StatCard label="Collected" value={formatINR(paidSeats * pool.seatPricePaise)} />
        <StatCard label="Your projected share" value={projected ? formatINR(projected.resellerSharePaise) : "—"} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Members">
          {members.length === 0 ? (
            <p className="text-sm text-ink-muted">No one has joined yet. Share the link →</p>
          ) : (
            <Table head={["Seat", "Member", "Contact", "Paid", "Joined"]}>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2.5 tabular-nums">{m.seatNo}</td>
                  <td className="px-4 py-2.5 font-semibold">{m.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-muted">{m.phone ?? m.email}</td>
                  <td className="px-4 py-2.5">{m.paidAt || pool.paymentModel === "single" ? <span className="text-emerald-300">✓</span> : <span className="text-ink-faint">✗</span>}{m.refundedAt && <span className="ml-1 text-xs text-rose-400">refunded</span>}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs">{m.joinedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Share">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code for the pool link" width={120} height={120} className="rounded-xl border border-line" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Payment link</p>
                <p className="mt-1 break-all font-mono text-xs">{url}</p>
                <Link href={`/pool/${pool.id}`} className="mt-2 inline-block text-sm font-bold text-primary hover:underline">Open public page →</Link>
              </div>
            </div>
          </Panel>

          <Panel title="Actions">
            <div className="space-y-3">
              {needsSinglePayment && (
                <PayButton createUrl={`/api/pools/${pool.id}/pay`} label={`Pay bundle ${formatINR(pool.seatPricePaise * pool.seats)}`} successHref={() => `/reseller/pools/${pool.id}`} size="md" />
              )}
              <ActionButton
                action={fulfilPoolAction.bind(null, pool.id)}
                label={pool.status === "fulfilled" ? "Fulfilled" : "Fulfil — assign code & create passes"}
                confirm="This assigns a bundle code from your inventory (or platform stock) and freezes the revenue split. Continue?"
                variant={canFulfil ? "primary" : "secondary"}
              />
              {!canFulfil && pool.status !== "fulfilled" && (
                <p className="text-xs text-ink-muted">
                  {pool.paymentModel === "escrow" ? "Fulfilment runs automatically once every seat is paid." : "Available once the bundle is paid and the pool is full."}
                </p>
              )}
              {pool.status === "fulfilled" && (
                <a href={`/api/reseller/pools/${pool.id}/statement`} className="inline-block text-sm font-bold text-primary hover:underline">Download statement (CSV) →</a>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {pool.resellerId && (
        <Panel title={pool.status === "fulfilled" ? "Revenue split (final)" : "Revenue split (projected)"}>
          {!projected ? (
            <p className="text-sm text-rose-400">The split cannot be computed (negative margin). Check the reseller price and seat count.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <dl className="space-y-2 text-sm">
                {[
                  ["Gross (member payments)", projected.grossPaise],
                  [`Platform fee (${s.platformFeePct}%)`, -projected.platformFeePaise],
                  ["Reseller code cost", -projected.resellerCostPaise],
                  ["Margin", projected.marginPaise],
                  ["Your share", projected.resellerSharePaise],
                  ["Member credits", projected.memberShares.reduce((a, m) => a + m.sharePaise, 0)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between border-b border-line pb-1.5">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className={`font-semibold tabular-nums ${Number(v) < 0 ? "text-rose-400" : ""}`}>{formatINR(Number(v))}</dd>
                  </div>
                ))}
              </dl>
              <div className="text-sm text-ink-muted">
                <p><strong className="text-ink">Mode:</strong> {pool.splitMode.replace("_", " ")}</p>
                <p className="mt-2">Splits are computed server-side, stored immutably at fulfilment, and member credits are returned as partial refunds on their seat payment.</p>
              </div>
            </div>
          )}
        </Panel>
      )}

      {pool.status !== "fulfilled" && (
        <Panel title="Tool distribution">
          <AssignmentEditor
            poolId={pool.id}
            mode={pool.distributionMode as "shared" | "assigned"}
            members={eligible.map((m) => ({ userId: m.userId, label: m.name ?? m.email ?? m.phone ?? m.userId }))}
            tools={tierTools.map((t) => ({ id: t.id, name: t.name }))}
            initial={pool.assignmentJson ?? {}}
          />
        </Panel>
      )}
    </div>
  );
}
