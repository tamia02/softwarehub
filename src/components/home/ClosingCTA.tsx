import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { formatINR } from "@/lib/format";

export function ClosingCTA({ proPricePaise, seatPricePaise, toolCount }: { proPricePaise: number; seatPricePaise: number; toolCount: number }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(0,87,255,0.12),transparent)]" />
      <div className="container-page section-pad relative text-center">
        <FadeUp>
          <h2 className="mx-auto max-w-3xl text-balance text-[36px] font-black leading-[1.1] md:text-[56px]">
            {toolCount} tools. One code. <span className="text-primary">Get started today.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-muted">
            {formatINR(proPricePaise)} for the whole year — or {formatINR(seatPricePaise)} in a pool. Codes are limited.
          </p>
          <div className="mt-8">
            <Button href="/checkout/direct?tier=pro" size="lg">
              Get Pro Pass <ArrowRight size={18} />
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
