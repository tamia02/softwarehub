import { VendorMark } from "@/components/brand/VendorMark";
import type { Tool } from "@/data/tools";

/**
 * Tool strip under the hero: infinite marquee of vendor marks. The list is
 * duplicated so the -50% translate loops seamlessly; hover pauses; edges fade.
 */
export function LogoMarquee({ tools }: { tools: Pick<Tool, "slug" | "vendor" | "hue">[] }) {
  const list = [...tools, ...tools];
  return (
    <section aria-label="Included tools" className="pb-10 pt-2">
      <p className="mb-5 text-center font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-faint">Every pass includes tools from</p>
      <div className="mask-fade-x overflow-hidden">
        <ul className="anim-marquee flex w-max items-center gap-10 px-5">
          {list.map((t, i) => (
            <li key={`${t.slug}-${i}`} className="mark-gray shrink-0" aria-hidden={i >= tools.length}>
              <VendorMark name={t.vendor} hue={t.hue} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
