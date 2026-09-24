import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2, Copy, FileText, KeyRound } from "lucide-react";
import { getDb, schema } from "@/db";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { revealOrderCode } from "@/lib/orders.server";
import { revealMarketCode } from "@/lib/market.server";
import { formatINR } from "@/lib/format";
import { displayCode } from "@/lib/codes";

export const metadata = { title: "Payment successful" };
export const dynamic = "force-dynamic";

/** Shows the bundle code exactly once (then the encrypted copy is wiped). */
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  const user = await requireUser(undefined, `/checkout/success?order=${orderId ?? ""}`);
  const db = await getDb();
  const [order] = orderId ? await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)) : [];
  if (!order || order.userId !== user.id) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">Order not found</h1>
        <Link href="/account" className="mt-4 inline-block font-semibold text-primary">Go to My Pass →</Link>
      </div>
    );
  }
  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.orderId, order.id));
  const reveal = order.type === "direct" ? await revealOrderCode(order.id, user.id) : null;
  const productReveal = order.type === "product" ? await revealMarketCode(order.id, user.id) : null;
  const poolId = (order.metaJson as { poolId?: string } | null)?.poolId;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={30} /></span>
        <h1 className="mt-4 text-[28px] font-black">Payment received</h1>
        <p className="mt-1 text-ink-muted">{formatINR(order.amountPaise)} · order {order.id.slice(0, 8)}</p>

        {order.type === "direct" && (
          <div className="mt-8 rounded-2xl border border-line bg-bg-soft p-5 text-left">
            <p className="inline-flex items-center gap-2 text-sm font-bold"><KeyRound size={16} className="text-primary" /> Your activation code</p>
            {reveal?.code ? (
              <>
                <p className="mt-3 select-all font-mono text-2xl font-bold tracking-[0.15em]">{displayCode(reveal.code)}</p>
                <p className="mt-2 text-xs text-ink-muted">Shown once. It was also sent to your email/phone. Redeem it from My Pass.</p>
              </>
            ) : reveal?.revealed ? (
              <p className="mt-3 text-sm text-ink-muted">This code (ending {reveal.last4}) was already shown. Check your email or SMS.</p>
            ) : order.status === "awaiting_inventory" ? (
              <p className="mt-3 text-sm text-accent">We are allocating your code — you will receive it by email/SMS shortly.</p>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Your code is on its way by email/SMS.</p>
            )}
          </div>
        )}

        {order.type === "product" && (
          <div className="mt-8 rounded-2xl border border-line bg-bg-soft p-5 text-left">
            <p className="inline-flex items-center gap-2 text-sm font-bold"><KeyRound size={16} className="text-primary" /> Your code</p>
            {productReveal?.code ? (
              <>
                <p className="mt-3 select-all font-mono text-xl font-bold tracking-[0.12em]">{productReveal.code}</p>
                <p className="mt-2 text-xs text-ink-muted">Shown once — save it now. Confirm it works from My purchases so the seller is paid.</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">This code (ending {productReveal?.last4}) is in My purchases.</p>
            )}
          </div>
        )}

        {order.type === "pool_seat" && poolId && (
          <p className="mt-6 text-sm text-ink-muted">Your seat is confirmed. Track the order and share the link to fill it faster.</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {order.type === "product" ? (
            <Button href="/account/purchases" size="lg" className="flex-1">My purchases</Button>
          ) : order.type === "pool_seat" && poolId ? (
            <Button href={`/pool/${poolId}`} size="lg" className="flex-1">View order</Button>
          ) : order.type === "reseller_code" ? (
            <Button href="/reseller/codes" size="lg" className="flex-1">View inventory</Button>
          ) : (
            <Button href="/account/redeem" size="lg" className="flex-1">Redeem in My Pass</Button>
          )}
          {invoice && (
            <Button href={`/account/invoices/${invoice.id}`} variant="secondary" size="lg"><FileText size={16} /> GST invoice</Button>
          )}
        </div>
        <p className="mt-4 inline-flex items-center gap-1 text-xs text-ink-faint"><Copy size={12} /> Tip: select the code to copy it.</p>
      </div>
    </div>
  );
}
