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
            <p className="text-[15px] font-bold uppercase tracking-wider text-accent-2">{site.name}</p>
            <h2 className="t-h1 mt-4 text-ink">{site.tagline}</h2>
            <p className="mt-6 text-lg text-ink-muted">One activation code. Every tool a builder needs. Buy outright or split it ten ways.</p>
          </div>
          <div className="hidden md:block">
            <HeroIllustration interactive={false} />
          </div>
        </div>
        <div className="absolute inset-0 bg-[rgba(251,246,236,0.62)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(232,163,23,0.14),transparent)]" />
      </div>

      <GateCard initialRole={initialRole} />
    </main>
  );
}
