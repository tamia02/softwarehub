import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StaggerWords } from "@/components/motion/StaggerWords";
import { HeroIllustration } from "./HeroIllustration";
import { formatUSD } from "@/lib/format";

/**
 * Entrance animations here are pure CSS (`anim-fade-up` + animation-delay) so
 * the hero paints from the SSR HTML before any JavaScript arrives.
 */
export function Hero({ retailUsd, toolCount }: { retailUsd: number; toolCount: number }) {
  const worth = `${formatUSD(Math.floor(retailUsd / 1000) * 1000)}+`;
  const at = (s: number) => ({ animationDelay: `${s}s` });

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(0,87,255,0.10),transparent_60%)]" />
      <div className="container-page grid items-center gap-12 pb-14 pt-10 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
        <div className="max-w-xl">
          <p
            className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink-muted shadow-sm"
            style={at(0)}
          >
            <Sparkles size={14} className="text-accent" />
            {toolCount} tools · 1 activation code · 1 year
          </p>

          <StaggerWords
            as="h1"
            delay={0.1}
            text={`${toolCount} premium AI and product tools for a year — worth ${worth}`}
            highlight={[worth]}
            className="mt-5 text-balance text-[36px] font-black leading-[1.15] md:text-[56px] md:leading-[1.12]"
          />

          <p className="anim-fade-up mt-6 text-lg text-ink-muted" style={at(0.55)}>
            One activation code unlocks the stack that top product teams run on. Buy the whole bundle, or join a
            pool of 10 and pay a tenth of the price.
          </p>

          <p className="anim-fade-up mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-600" style={at(0.65)}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            Codes are limited — allocated per vendor, first come first served.
          </p>

          <div className="anim-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={at(0.75)}>
            <Button href="/checkout/direct?tier=pro" size="lg">
              Get Pro Pass <ArrowRight size={18} />
            </Button>
            <Button href="#tools" variant="secondary" size="lg">
              See all {toolCount} tools
            </Button>
          </div>
        </div>

        <div className="anim-fade-scale" style={at(0.3)}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
