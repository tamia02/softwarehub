import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { PayButton } from "@/components/checkout/PayButton";
import { getProduct } from "@/lib/marketplace.server";
import { getSessionUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function ProductCheckoutPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  const product = slug ? await getProduct(slug) : null;
  if (!product) notFound();
  const user = await getSessionUser();

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-md">
        <Link href={`/market/${product.slug}`} className="text-[13px] font-bold text-accent-2 hover:underline">← Back</Link>
        <div className="card mt-4 p-6">
          <div className="flex items-center gap-3">
            <ToolLogo slug={product.slug} name={product.vendor} logoUrl={product.logoUrl} size={48} />
            <div>
              <h1 className="text-[18px] font-black leading-tight">{product.name}</h1>
              <p className="text-[13px] text-ink-muted">{product.vendor}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Price</dt><dd className="font-semibold">{formatINR(product.pricePaise)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-black">{formatINR(product.pricePaise)}</dd></div>
          </dl>
          <div className="mt-6">
            {product.stock > 0 ? (
              user ? (
                <PayButton createUrl="/api/market/buy" body={{ slug: product.slug }} label={`Pay ${formatINR(product.pricePaise)}`} successHref="/checkout/success?order={orderId}" size="lg" event="market_purchase" />
              ) : (
                <Link href={`/login?next=${encodeURIComponent(`/checkout/product?slug=${product.slug}`)}`} className="block rounded-full border-2 border-ink-line bg-accent py-3 text-center font-bold text-on-accent">Sign in to buy</Link>
              )
            ) : (
              <p className="rounded-2xl bg-bg-soft p-4 text-center text-sm font-semibold text-rose-600">Out of stock</p>
            )}
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint"><ShieldCheck size={13} /> Escrow-protected — the seller is paid only after you confirm.</p>
        </div>
      </div>
    </div>
  );
}
