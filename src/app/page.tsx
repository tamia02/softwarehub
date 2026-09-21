import type { Metadata } from "next";
import { GateCard } from "@/components/gate/GateCard";
import { HeroIllustration } from "@/components/home/HeroIllustration";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Choose your path",
};

/**
 * Gate (/): a blurred, dimmed copy of the hero sits behind a centred card.
 * Middleware already redirects visitors with a remembered role.
 */
export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialRole = role === "reseller" ? "reseller" : role === "customer" ? "customer" : undefined;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-10">
      {/* Blurred hero backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 select-none" aria-hidden>
        <div className="container-page grid h-full items-center gap-12 blur-[10px] md:grid-cols-2">
          <div className="max-w-xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">{site.name}</p>
            <h2 className="mt-4 text-[44px] font-bold leading-[1.05] md:text-[64px]">{site.tagline}</h2>
            <p className="mt-6 text-lg text-ink-muted">One activation code. Every tool a builder needs. Buy outright or split it ten ways.</p>
          </div>
          <div className="hidden md:block">
            <HeroIllustration interactive={false} />
          </div>
        </div>
        <div className="absolute inset-0 bg-[rgba(255,251,235,0.6)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(245,158,11,0.16),transparent)]" />
      </div>

      <GateCard initialRole={initialRole} />
    </main>
  );
}
