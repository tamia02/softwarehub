import { Catalog } from "@/components/home/Catalog";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { PoolExplainer } from "@/components/home/PoolExplainer";
import { Pricing } from "@/components/home/Pricing";
import { Savings } from "@/components/home/Savings";
import { faq } from "@/data/faq";
import type { PoolSummary } from "@/data/pools";
import { getCatalog } from "@/lib/catalog.server";
import { listOpenPools } from "@/lib/pools.server";

export const metadata = { title: "Home" };
/** ISR: re-rendered at most every 30 s; admin edits and pool events also revalidate it. */
export const revalidate = 30;

export default async function HomePage() {
  const [{ tools, core, pro, pricing }, openPools] = await Promise.all([getCatalog(), listOpenPools(8)]);
  const pools: PoolSummary[] = openPools.map((p) => ({
    id: p.id,
    tier: p.tierId as PoolSummary["tier"],
    seats: p.seats,
    filled: p.filled,
    seatPricePaise: p.seatPricePaise,
    status: "open",
    expiresAt: p.expiresAt.toISOString(),
    city: p.name ?? undefined,
  }));

  return (
    <>
      <Hero toolCount={tools.length} />
      <LogoMarquee tools={tools} />
      <Catalog core={core} pro={pro} starterRetailPaise={pricing.starter.retailPaise} proRetailPaise={pricing.pro.retailPaise} />
      <Savings pricing={pricing} tools={tools} />
      <Pricing pricing={pricing} />
      <PoolExplainer pools={pools} usdInrRate={pricing.pro.usdInrRate} />
      <FAQ items={faq} />
      <ClosingCTA proPricePaise={pricing.pro.pricePaise} seatPricePaise={pricing.pro.seatPricePaise} toolCount={tools.length} usdInrRate={pricing.pro.usdInrRate} />
    </>
  );
}
