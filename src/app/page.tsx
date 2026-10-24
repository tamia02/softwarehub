import type { Metadata } from "next";
import { GateCard } from "@/components/gate/GateCard";

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
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5 py-10">
      {/* Navy backdrop with a soft accent glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 select-none bg-primary" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(239,65,54,0.28),transparent_70%),radial-gradient(40%_40%_at_0%_100%,rgba(80,110,255,0.16),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
      </div>

      <GateCard initialRole={initialRole} />
    </main>
  );
}
