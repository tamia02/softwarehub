import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { formatDual } from "@/lib/format";

export function ClosingCTA({ proPricePaise, seatPricePaise, toolCount, usdInrRate }: { proPricePaise: number; seatPricePaise: number; toolCount: number; usdInrRate: number }) {
  return (
    <section className="py-3 md:py-4">
      <div className="panel border-2 border-ink-line bg-accent">
        <div className="panel-inner text-center">
          <FadeUp>
            <h2 className="t-h2 mx-auto max-w-3xl text-balance text-ink">
              {toolCount} tools. One code. Twelve months.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.4] text-ink-line/80 md:text-[20px]">
              {formatDual(proPricePaise, usdInrRate)} for the Pro Pass, or {formatDual(seatPricePaise, usdInrRate)} for a seat in a group. Allocation is per vendor, so codes are limited.
            </p>
            <div className="mt-7 md:mt-8">
              <Button href="/checkout/direct?tier=pro" size="lg" variant="dark">
                Get the Pro Pass
              </Button>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
