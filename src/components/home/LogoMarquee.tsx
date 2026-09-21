import { VendorMark } from "@/components/brand/VendorMark";
import { tools } from "@/data/tools";

/**
 * Infinite horizontal marquee of vendor marks. The list is duplicated so the
 * -50% translate loops seamlessly; hover pauses via CSS; edges fade with a
 * mask. Pure CSS — nothing to hydrate.
 */
export function LogoMarquee() {
  const list = [...tools, ...tools];
  return (
    <section aria-label="Included tools" className="border-y border-line bg-bg-soft/60 py-6">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
        Every pass includes tools from
      </p>
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
