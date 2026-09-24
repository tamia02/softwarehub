import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { Button } from "@/components/ui/Button";
import { getProduct } from "@/lib/marketplace.server";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  return (
    <main className="container-page py-10 md:py-14">
      <Link href="/market" className="text-[13px] font-bold text-accent-2 hover:underline">← Back to marketplace</Link>
      <div className="mt-5 grid gap-8 md:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-4">
            <ToolLogo slug={p.slug} name={p.vendor} logoUrl={p.logoUrl} size={64} />
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{p.vendor} · {p.category}</p>
              <h1 className="text-[28px] font-black leading-tight text-ink">{p.name}</h1>
            </div>
          </div>
          <p className="mt-6 text-[16px] leading-relaxed text-ink">{p.description ?? p.blurb}</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            {[
              "Delivered as an activation code, instantly after payment clears.",
              `${p.warrantyDays}-day buyer protection — report any issue and we step in.`,
              "Payment held in escrow until you confirm it works.",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Check size={12} strokeWidth={3} /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <aside className="card h-fit p-6">
          <div className="flex items-end justify-between">
            <span className="text-[32px] font-black text-ink">{formatINR(p.pricePaise)}</span>
            <span className={`text-[13px] font-bold ${p.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>{p.stock > 0 ? `${p.stock} in stock` : "Sold out"}</span>
          </div>
          <div className="mt-5">
            <Button href={`/checkout/product?slug=${p.slug}`} size="lg" className="w-full" variant={p.stock > 0 ? "primary" : "secondary"}>
              {p.stock > 0 ? "Buy now" : "Notify me"}
            </Button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint">
            <ShieldCheck size={13} /> Escrow-protected · UPI, cards, net-banking
          </p>
        </aside>
      </div>
    </main>
  );
}
