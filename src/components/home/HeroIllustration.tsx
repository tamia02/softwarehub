import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";

/**
 * Hero visual: one calm object — a 3×3 grid of outlined tiles with real
 * product logos and the Pro Pass tile in the centre. No rotation, no motion,
 * no offset layers: the illustration should read in one glance.
 */
const GRID = ["cursor", "notion", "linear", "framer", null, "supabase", "posthog", "replit", "elevenlabs"] as const;

export function HeroIllustration({ compact = false }: { interactive?: boolean; compact?: boolean }) {
  const size = compact ? 72 : 104;
  return (
    <div className={`mx-auto grid grid-cols-3 gap-3 md:gap-4 ${compact ? "max-w-[280px]" : "max-w-[300px] md:max-w-[360px]"}`} aria-hidden>
      {GRID.map((slug, i) => {
        if (!slug) {
          return (
            <div key="brand" className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[22px] border-2 border-ink-line bg-accent text-ink-line">
              <Logo size={compact ? 26 : 34} />
              <span className="text-[13px] font-bold leading-none md:text-[15px]">Pro Pass</span>
            </div>
          );
        }
        const t = tools.find((x) => x.slug === slug);
        return (
          <div key={slug} className="anim-fade-up grid aspect-square place-items-center rounded-[22px] border-2 border-ink-line bg-white" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
            <ToolLogo slug={slug} name={t?.vendor ?? slug} logoUrl={t?.logoUrl} size={Math.round(size * 0.5)} className="border-0 bg-transparent" />
          </div>
        );
      })}
    </div>
  );
}
