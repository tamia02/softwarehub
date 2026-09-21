import { ArrowRight, ShieldCheck } from "lucide-react";
import { StaggerWords } from "@/components/motion/StaggerWords";
import { Eyebrow } from "@/components/ui/Section";
import { HeroEmailForm } from "./HeroEmailForm";
import { HeroIllustration } from "./HeroIllustration";
import { formatINRCompact } from "@/lib/format";

/**
 * Entrance animations are pure CSS (`anim-fade-up` + animation-delay) so the
 * hero paints from the SSR HTML before any JavaScript arrives.
 */
export function Hero({ retailPaise, toolCount, guaranteeDays }: { retailPaise: number; toolCount: number; guaranteeDays: number }) {
  const at = (s: number) => ({ animationDelay: `${s}s` });

  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 pb-14 pt-8 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:pb-24 md:pt-14">
        <div className="order-2 md:order-1">
          <Eyebrow className="anim-fade-up mb-6" tone="primary">
            Annual software pass · India
          </Eyebrow>

          <StaggerWords
            as="h1"
            delay={0.08}
            text="The tools serious builders pay for. One pass, one year, one price."
            className="text-balance text-[40px] leading-[1.04] md:text-[62px]"
          />

          <p className="anim-fade-up mt-6 max-w-[34rem] text-[17px] leading-relaxed text-ink-muted md:text-lg" style={at(0.45)}>
            We negotiate annual plans on {toolCount} premium AI and product tools and hand them to you as a single activation
            code. Buy the pass outright, or open a pool and split it with up to nine people.
          </p>

          <div className="anim-fade-up mt-8" style={at(0.55)}>
            <HeroEmailForm />
            <p className="mt-3 text-sm text-ink-muted">Enter your email or mobile to start — no password. Codes are allocated per vendor and are limited.</p>
          </div>

          <dl className="anim-fade-up mt-9 grid max-w-[34rem] grid-cols-3 gap-4 border-t border-line-strong pt-6" style={at(0.65)}>
            <div>
              <dt className="font-mono-label text-ink-faint">Tools</dt>
              <dd className="mt-1 font-display text-[26px] leading-none text-ink">{toolCount}</dd>
            </div>
            <div>
              <dt className="font-mono-label text-ink-faint">Retail value</dt>
              <dd className="mt-1 font-display text-[26px] leading-none text-ink">{formatINRCompact(retailPaise)}</dd>
            </div>
            <div>
              <dt className="font-mono-label text-ink-faint">Guarantee</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 font-display text-[26px] leading-none text-ink">
                <ShieldCheck size={20} className="text-primary" /> {guaranteeDays}-day
              </dd>
            </div>
          </dl>

          <div className="anim-fade-up mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold" style={at(0.75)}>
            <a href="#pricing" className="inline-flex items-center gap-1.5 text-primary hover:underline">
              See passes &amp; pricing <ArrowRight size={15} />
            </a>
            <a href="#tools" className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink">
              Browse all {toolCount} tools <ArrowRight size={15} />
            </a>
          </div>
        </div>

        <div className="anim-fade-scale order-1 md:order-2" style={at(0.2)}>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
