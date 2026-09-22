import { VendorMark } from "@/components/brand/VendorMark";
import type { Tool } from "@/data/tools";

/** Real vendor logos in a slow marquee under the hero. */
export function LogoMarquee({ tools }: { tools: Pick<Tool, "slug" | "vendor" | "logoUrl">[] }) {
  const list = [...tools, ...tools];
  return (
    <section aria-label="Included tools" className="py-4 md:py-6">
      <div className="mask-fade-x overflow-hidden">
        <ul className="anim-marquee flex w-max items-center gap-10 px-6">
          {list.map((t, i) => (
            <li key={`${t.slug}-${i}`} className="mark-gray shrink-0" aria-hidden={i >= tools.length}>
              <VendorMark slug={t.slug} name={t.vendor} logoUrl={t.logoUrl} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
