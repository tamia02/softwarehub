import { Catalog } from "@/components/home/Catalog";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { PoolExplainer } from "@/components/home/PoolExplainer";
import { Pricing } from "@/components/home/Pricing";
import { Savings } from "@/components/home/Savings";
import type { CatalogTool } from "@/components/home/ToolCard";
import { faq } from "@/data/faq";
import { mockPools } from "@/data/mockPools";
import { coreTools, proTools, tools } from "@/data/tools";
import { allPricing, toolRetailPaise } from "@/lib/pricing";

export const metadata = { title: "Home" };

const withRetail = (list: typeof tools): CatalogTool[] => list.map((t) => ({ ...t, retailPaise: toolRetailPaise(t) }));

export default function HomePage() {
  const pricing = allPricing();
  const catalog = withRetail(tools);

  return (
    <>
      <Hero retailUsd={pricing.pro.retailUsd} toolCount={tools.length} />
      <LogoMarquee />
      <Catalog
        core={withRetail(coreTools)}
        pro={withRetail(proTools)}
        starterRetailPaise={pricing.starter.retailPaise}
        proRetailPaise={pricing.pro.retailPaise}
      />
      <Savings pricing={pricing} tools={catalog} />
      <Pricing pricing={pricing} />
      <PoolExplainer pools={mockPools.filter((p) => p.status === "open")} />
      <FAQ items={faq} />
      <ClosingCTA proPricePaise={pricing.pro.pricePaise} seatPricePaise={pricing.pro.seatPricePaise} toolCount={tools.length} />
    </>
  );
}
