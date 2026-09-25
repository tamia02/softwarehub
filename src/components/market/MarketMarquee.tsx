import { ToolLogo } from "@/components/brand/ToolLogo";

interface Item {
  slug: string;
  vendor: string;
  logoUrl: string | null;
}

/** Slow, continuous marquee of brand logos + names under the hero. */
export function MarketMarquee({ items }: { items: Item[] }) {
  const seen = new Set<string>();
  const brands = items.filter((i) => (seen.has(i.vendor) ? false : (seen.add(i.vendor), true)));
  const list = [...brands, ...brands];
  return (
    <section aria-label="Brands available" className="border-y-2 border-ink-line/10 bg-bg-card/40 py-4 md:py-5">
      <div className="mask-fade-x overflow-hidden">
        <ul className="anim-marquee flex w-max items-center gap-10 px-6">
          {list.map((t, i) => (
            <li key={`${t.slug}-${i}`} className="inline-flex shrink-0 items-center gap-2.5" aria-hidden={i >= brands.length}>
              <ToolLogo slug={t.slug} name={t.vendor} logoUrl={t.logoUrl} size={28} className="border-line-strong" />
              <span className="whitespace-nowrap text-[15px] font-bold leading-none text-[#a67c52]">{t.vendor}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
