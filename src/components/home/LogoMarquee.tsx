import { ToolLogo } from "@/components/brand/ToolLogo";
import type { Tool } from "@/data/tools";

/** Real vendor logos in a slow marquee under the hero; names in a light brown. */
export function LogoMarquee({ tools }: { tools: Pick<Tool, "slug" | "vendor" | "logoUrl">[] }) {
  const list = [...tools, ...tools];
  return (
    <section aria-label="Included tools" className="py-4 md:py-6">
      <div className="mask-fade-x overflow-hidden">
        <ul className="anim-marquee flex w-max items-center gap-10 px-6">
          {list.map((t, i) => (
            <li key={`${t.slug}-${i}`} className="inline-flex shrink-0 items-center gap-2.5" aria-hidden={i >= tools.length}>
              <ToolLogo slug={t.slug} name={t.vendor} logoUrl={t.logoUrl} size={30} className="border-line-strong" />
              <span className="text-[16px] font-bold leading-none text-[#a67c52] whitespace-nowrap">{t.vendor}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
