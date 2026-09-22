import { StaggerWords } from "@/components/motion/StaggerWords";
import { HeroEmailForm } from "./HeroEmailForm";
import { HeroIllustration } from "./HeroIllustration";

/** Hero: headline, one paragraph, the email pill, one line. Nothing else. */
export function Hero({ toolCount }: { toolCount: number }) {
  const at = (s: number) => ({ animationDelay: `${s}s` });
  return (
    <section className="relative">
      <div className="container-page grid items-center gap-10 pb-10 pt-8 md:grid-cols-[minmax(0,640px)_minmax(0,1fr)] md:gap-16 md:pb-20 md:pt-16">
        <div className="order-2 text-center md:order-1 md:text-left">
          <StaggerWords as="h1" delay={0.05} text={`Get ${toolCount} premium AI and product tools for a year, on one pass.`} className="t-h1 mx-auto max-w-[640px] text-balance text-ink-line md:mx-0" />
          <p className="anim-fade-up mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.45] text-ink md:mx-0 md:text-[17px]" style={at(0.4)}>
            One activation code unlocks a full year of every plan in your pass. Buy it outright, or split a pass ten ways in a pool.
          </p>
          <div className="anim-fade-up mx-auto mt-7 flex justify-center md:mx-0 md:justify-start" style={at(0.5)}>
            <HeroEmailForm />
          </div>
          <p className="anim-fade-up mt-4 text-[18px] leading-[1.1] text-ink-line md:text-[20px]" style={at(0.6)}>
            Codes are limited — <span className="font-hand text-[26px] text-accent-2 md:text-[28px]">claim yours now!</span>
          </p>
        </div>
        <div className="anim-fade-scale order-1 md:order-2" style={at(0.15)}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
