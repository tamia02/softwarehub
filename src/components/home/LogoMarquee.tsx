import { VendorMark } from "@/components/brand/VendorMark";
import type { Tool } from "@/data/tools";

/** Real vendor logos under the hero — monochrome, colour on hover; infinite marquee, pauses on hover. */
export function LogoMarquee({ tools }: { tools: Pick<Tool, "slug" | "vendor" | "logoUrl">[] }) {
  const list = [...tools, ...tools];
  return (
    <section aria-label="Included tools" className="border-y border-line bg-white/50 py-8">
      <p className="rule-label container-page font-mono-label text-ink-faint">Every pass includes plans from</p>
      <div className="mask-fade-x mt-6 overflow-hidden">
        <ul className="anim-marquee flex w-max items-center gap-12 px-6">
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
