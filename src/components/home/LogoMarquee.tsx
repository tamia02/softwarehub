import { ToolLogo } from "@/components/brand/ToolLogo";
import type { Tool } from "@/data/tools";

const FEATURED = ["notion", "cursor", "linear", "framer", "supabase", "posthog"];

/** Static row of six real logos — quiet, like the reference. */
export function LogoMarquee({ tools }: { tools: Pick<Tool, "slug" | "vendor" | "logoUrl">[] }) {
  const list = FEATURED.map((s) => tools.find((t) => t.slug === s)).filter((t): t is (typeof tools)[number] => !!t);
  return (
    <section aria-label="Included tools" className="pb-8 pt-2 md:pb-12">
      <ul className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
        {list.map((t) => (
          <li key={t.slug} className="mark-gray inline-flex items-center gap-2">
            <ToolLogo slug={t.slug} name={t.vendor} logoUrl={t.logoUrl} size={30} className="border-0 bg-transparent" />
            <span className="text-[16px] font-bold leading-none text-ink-line">{t.vendor}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
