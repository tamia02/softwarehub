import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { formatINR } from "@/lib/format";

export function ClosingCTA({ proPricePaise, seatPricePaise, toolCount }: { proPricePaise: number; seatPricePaise: number; toolCount: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(245,158,11,0.22),transparent)]" />
      <div className="container-page section-pad relative text-center">
        <FadeUp>
          <h2 className="mx-auto max-w-3xl text-balance text-[38px] leading-[1.05] md:text-[56px]">
            {toolCount} plans. One code. <em className="font-normal italic text-primary">Yours for a year.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">
            {formatINR(proPricePaise)} for the Pro Pass, or {formatINR(seatPricePaise)} for a seat in a pool. Allocation is per vendor, so codes are limited.
          </p>
          <div className="mt-8">
            <Button href="/checkout/direct?tier=pro" size="lg">
              Get the Pro Pass <ArrowRight size={18} />
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
