import { StaggerWords } from "@/components/motion/StaggerWords";
import { HeroEmailForm } from "./HeroEmailForm";
import { HeroIllustration } from "./HeroIllustration";

/**
 * Hero, measured against the reference: 720px headline column at 50px/1.05,
 * 16px sub-copy, email pill, 24px "codes are limited" line, visual on the right.
 * Entrance is CSS so it paints before hydration.
 */
export function Hero({ toolCount }: { toolCount: number }) {
  const at = (s: number) => ({ animationDelay: `${s}s` });
  return (
    <section className="relative">
      <div className="container-page grid items-center gap-10 pb-10 pt-6 md:grid-cols-[minmax(0,720px)_minmax(0,1fr)] md:gap-12 md:pb-20 md:pt-12">
        <div className="order-2 md:order-1">
          <StaggerWords
            as="h1"
            delay={0.05}
            text={`Get ${toolCount} premium AI and product tools for a full year, on one pass.`}
            className="t-h1 max-w-[720px] text-balance text-ink-line"
          />
          <p className="anim-fade-up mt-5 max-w-[600px] text-[16px] leading-[1.4] text-ink md:mt-6" style={at(0.4)}>
            Software Hub Pool negotiates annual plans with each vendor and issues them to you as one activation code. Buy a
            pass outright, or open a pool and split it with up to nine people at a tenth of the price each.
          </p>
          <div className="anim-fade-up mt-7 md:mt-8" style={at(0.5)}>
            <HeroEmailForm />
          </div>
          <p className="anim-fade-up mt-5 text-[20px] leading-[1.1] text-ink-line md:text-[24px]" style={at(0.6)}>
            Codes are limited — <span className="font-hand text-[28px] text-accent-2 md:text-[32px]">claim yours now!</span>
          </p>
        </div>
        <div className="anim-fade-scale order-1 md:order-2" style={at(0.15)}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
