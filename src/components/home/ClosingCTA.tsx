import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { formatINR } from "@/lib/format";

export function ClosingCTA({ proPricePaise, seatPricePaise, toolCount }: { proPricePaise: number; seatPricePaise: number; toolCount: number }) {
  return (
    <Section className="py-16 text-center md:py-24">
      <FadeUp>
        <h2 className="t-h2 mx-auto max-w-2xl text-balance text-ink-line">
          {toolCount} tools. One code. Twelve months.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.45] text-ink-muted md:text-[18px]">
          {formatINR(proPricePaise)} for the Pro Pass, or {formatINR(seatPricePaise)} for a seat in a pool.
        </p>
        <div className="mt-7">
          <Button href="/checkout/direct?tier=pro" size="lg">
            Get the Pro Pass
          </Button>
        </div>
      </FadeUp>
    </Section>
  );
}
