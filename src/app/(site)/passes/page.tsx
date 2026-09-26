import { Catalog } from "@/components/home/Catalog";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { FAQ } from "@/components/home/FAQ";
import { Hero } from "@/components/home/Hero";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { Pricing } from "@/components/home/Pricing";
import { Savings } from "@/components/home/Savings";
import { Testimonials } from "@/components/home/Testimonials";
import { faq } from "@/data/faq";
import { getCatalog } from "@/lib/catalog.server";

export const metadata = { title: "Passes" };
export const dynamic = "force-dynamic";

/** The Starter (₹25k) / Pro (₹47k) Passes — 35 premium tools in one bundle.
 *  Order: hero → pricing (what it costs) → all the tools → savings → proof. */
export default async function PassesPage() {
  const { tools, core, pro, pricing } = await getCatalog();
  return (
    <>
      <Hero toolCount={tools.length} />
      <LogoMarquee tools={tools} />
      <Pricing pricing={pricing} />
      <Catalog core={core} pro={pro} starterRetailPaise={pricing.starter.retailPaise} proRetailPaise={pricing.pro.retailPaise} />
      <Savings pricing={pricing} tools={tools} />
      <Testimonials />
      <FAQ items={faq} />
      <ClosingCTA proPricePaise={pricing.pro.pricePaise} seatPricePaise={pricing.pro.seatPricePaise} toolCount={tools.length} usdInrRate={pricing.pro.usdInrRate} />
    </>
  );
}
