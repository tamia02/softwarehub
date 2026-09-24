import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { LogoLockup } from "@/components/brand/Logo";
import { PrintButton } from "@/components/account/PrintButton";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { getSettings } from "@/lib/settings.server";

export const metadata = { title: "Invoice" };

/** Printable GST tax invoice (browser print → PDF). */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();
  const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
  if (!inv || (inv.userId !== user.id && user.role !== "admin")) notFound();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, inv.orderId));
  const [buyer] = await db.select().from(schema.users).where(eq(schema.users.id, inv.userId));
  const s = await getSettings();
  const tax = inv.cgstPaise + inv.sgstPaise + inv.igstPaise;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <article className="card p-8 print:border-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6">
          <div>
            <LogoLockup />
            <p className="mt-3 text-sm font-semibold">{s.sellerLegalName}</p>
            <p className="text-xs text-ink-muted">{s.sellerAddress}</p>
            <p className="text-xs text-ink-muted">GSTIN {s.sellerGstin}</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black">Tax invoice</h1>
            <p className="mt-1 font-mono text-sm">{inv.number}</p>
            <p className="text-xs text-ink-muted">{inv.issuedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Billed to</p>
            <p className="mt-1 font-semibold">{inv.buyerName ?? buyer?.name ?? "Customer"}</p>
            <p className="text-sm text-ink-muted">{buyer?.email ?? buyer?.phone}</p>
            {inv.buyerGstin && <p className="text-sm text-ink-muted">GSTIN {inv.buyerGstin}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Order</p>
            <p className="mt-1 font-mono text-sm">{order?.id.slice(0, 8)}</p>
            <p className="text-sm text-ink-muted">Paid via {order?.gateway}</p>
          </div>
        </section>

        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="py-2">Description</th>
              <th className="py-2 text-right">HSN/SAC</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3">{inv.description}</td>
              <td className="py-3 text-right text-ink-muted">998313</td>
              <td className="py-3 text-right tabular-nums">{formatINR(inv.taxablePaise)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 text-right text-ink-muted">Taxable value</td>
              <td className="pt-3 text-right tabular-nums">{formatINR(inv.taxablePaise)}</td>
            </tr>
            {inv.igstPaise > 0 ? (
              <tr>
                <td colSpan={2} className="py-1 text-right text-ink-muted">IGST @ {s.gstPct}%</td>
                <td className="py-1 text-right tabular-nums">{formatINR(inv.igstPaise)}</td>
              </tr>
            ) : (
              <>
                <tr>
                  <td colSpan={2} className="py-1 text-right text-ink-muted">CGST @ {s.gstPct / 2}%</td>
                  <td className="py-1 text-right tabular-nums">{formatINR(inv.cgstPaise)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-1 text-right text-ink-muted">SGST @ {s.gstPct / 2}%</td>
                  <td className="py-1 text-right tabular-nums">{formatINR(inv.sgstPaise)}</td>
                </tr>
              </>
            )}
            <tr className="border-t border-line text-base font-black">
              <td colSpan={2} className="pt-3 text-right">Total (incl. {formatINR(tax)} GST)</td>
              <td className="pt-3 text-right tabular-nums">{formatINR(inv.totalPaise)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-xs text-ink-faint">
          Computer-generated invoice; no signature required. Software Hub resells third-party software subscriptions; each tool is governed by its vendor’s terms.
        </p>
      </article>
    </div>
  );
}
