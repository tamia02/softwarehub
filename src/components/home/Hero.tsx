import { StaggerWords } from "@/components/motion/StaggerWords";
import { Button } from "@/components/ui/Button";
import { HeroEmailForm } from "./HeroEmailForm";
import { HeroIllustration } from "./HeroIllustration";
import { formatUSD } from "@/lib/format";

/**
 * Entrance animations are pure CSS (`anim-fade-up` + animation-delay) so the
 * hero paints from the SSR HTML before any JavaScript arrives.
 */
export function Hero({ retailUsd, toolCount }: { retailUsd: number; toolCount: number }) {
  const worth = formatUSD(Math.floor(retailUsd / 1000) * 1000);
  const at = (s: number) => ({ animationDelay: `${s}s` });

  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-6 pb-10 pt-6 md:grid-cols-2 md:gap-12 md:pb-20 md:pt-8">
        {/* Illustration first on mobile, right on desktop */}
        <div className="anim-fade-scale order-1 md:order-2" style={at(0.15)}>
          <HeroIllustration />
        </div>

        <div className="order-2 text-center md:order-1 md:text-left">
          <StaggerWords
            as="h1"
            delay={0.1}
            text={`Get ${toolCount} premium AI and product tools for a year (worth over ${worth}!)`}
            highlight={[`${toolCount}`, "premium", "AI"]}
            className="text-balance text-[38px] font-bold leading-[1.06] md:text-[56px]"
          />

          <p className="anim-fade-up mx-auto mt-6 max-w-lg text-[17px] text-ink-muted md:mx-0 md:text-lg" style={at(0.5)}>
            One activation code unlocks a full year of every tool in the pass. Buy the whole bundle, or split it with nine
            others in a pool and pay a tenth of the price.
          </p>

          <div className="anim-fade-up mx-auto mt-8 flex justify-center md:mx-0 md:justify-start" style={at(0.6)}>
            <HeroEmailForm />
          </div>

          <p className="anim-fade-up mt-4 font-display text-[15px] font-semibold text-ink-muted" style={at(0.7)}>
            Codes are limited — <span className="text-primary">claim yours now!</span>
          </p>

          <div className="anim-fade-up mt-6 flex flex-wrap justify-center gap-3 md:justify-start" style={at(0.8)}>
            <Button href="#tools" variant="secondary" size="md">
              See all {toolCount} tools
            </Button>
            <Button href="#pool" variant="ghost" size="md">
              How pools work →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
