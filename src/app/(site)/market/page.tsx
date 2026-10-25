import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, GraduationCap, LogIn, Music, Package, Palette, Send, Sparkles, Wallet, Zap, type LucideIcon } from "lucide-react";
import { SectionShowcase } from "@/components/home/SectionShowcase";
import { LuciferGrid, logoUrlFor } from "@/components/market/LuciferGrid";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { Button } from "@/components/ui/Button";
import { SECTIONS, getLuciferCatalogSafe, luciferBotUrl } from "@/lib/lucifer.server";
import { formatINRPrecise } from "@/lib/format";

export const metadata = { title: "Marketplace" };
export const dynamic = "force-dynamic";

const SECTION_ICONS: Record<string, LucideIcon> = {
  ai: Sparkles,
  creative: Palette,
  entertain: Music,
  telegram: Send,
  learn: GraduationCap,
  other: Package,
};

const steps = [
  { icon: LogIn, title: "Log in with Telegram", body: "One tap — it's the same account as the Lucifer bot, so your wallet and orders are already here." },
  { icon: Wallet, title: "Top up your wallet", body: "Add money in the bot with UPI or crypto. Your balance shows here instantly." },
  { icon: Zap, title: "Order & get delivery", body: "Pay from your wallet in one click. Delivery comes to you on Telegram." },
];

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const [{ products, error }, { q = "", cat = "all" }] = await Promise.all([getLuciferCatalogSafe(), searchParams]);
  const inStock = products.filter((p) => p.stock === null || p.stock > 0);
  const trending = [...inStock.filter((p) => p.logoSlug && p.section === "ai"), ...inStock.filter((p) => p.logoSlug && p.section !== "ai")].slice(0, 6);
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.section, (counts.get(p.section) ?? 0) + 1);
  const sections = SECTIONS.map((s) => ({ id: s.id, name: s.name }));
  const stats = [
    { value: products.length ? `${products.length}+` : "600+", label: "Products listed" },
    { value: "1-tap", label: "Wallet checkout" },
    { value: "UPI · Crypto", label: "Wallet top-ups" },
  ];

  return (
    <div className="pb-6">
      {/* Hero banner */}
      <section className="container-page pt-5 md:pt-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-primary px-6 py-9 text-on-primary md:px-10 md:py-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(239,65,54,0.35),transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(80,110,255,0.18),transparent_60%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <div className="relative max-w-[600px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/85 ring-1 ring-inset ring-white/15">
                <BadgeCheck size={13} className="text-accent" /> Powered by the Lucifer bot
              </span>
              <h1 className="t-h1 mt-4 text-balance text-white">
                Premium AI tools, subscriptions &amp; digital services — <span className="text-accent">one wallet, one tap.</span>
              </h1>
              <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/65 md:text-[16px]">
                ChatGPT, Gemini, Canva, Netflix and hundreds more. Log in with Telegram, pay from your Lucifer wallet, and get delivery on Telegram.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#products" size="lg">
                  Browse products <ArrowRight size={17} />
                </Button>
                <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-[8px] border border-white/20 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.07]">
                  <Send size={16} /> Log in with Telegram
                </Link>
              </div>
              <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-[22px] font-extrabold leading-none text-white">{s.value}</dd>
                    <dd className="mt-1 text-[12.5px] text-white/50">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Popular now */}
          <div className="card flex flex-col p-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold text-ink">Popular now</h2>
              <Link href="#products" className="inline-flex items-center text-[12.5px] font-semibold text-accent-2 hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {trending.length ? (
              <ul className="mt-3 flex flex-1 flex-col gap-1">
                {trending.map((p, i) => (
                  <li key={p.ref}>
                    <Link href={`/market/${p.ref}`} className="flex items-center gap-3 rounded-[10px] p-2 transition-colors hover:bg-bg">
                      <span className="w-4 text-center font-display text-[13px] font-bold text-ink-faint">{i + 1}</span>
                      <ToolLogo slug={`lucifer-${p.ref}`} name={p.name} logoUrl={logoUrlFor(p)} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
                        <span className="block truncate text-[12px] text-ink-faint">{p.sectionName}</span>
                      </span>
                      <span className="font-display text-[14px] font-bold text-ink">{formatINRPrecise(p.pricePaise)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 flex-1 px-1 text-[13px] text-ink-muted">The catalog is refreshing — check back in a moment.</p>
            )}
            <a href={luciferBotUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 rounded-[10px] bg-bg px-3 py-2.5 text-[12.5px] text-ink-muted hover:text-ink">
              <Send size={14} className="text-[#229ED9]" /> Also on Telegram: @{luciferBotUrl.split("/").pop()}
            </a>
          </div>
        </div>
      </section>

      <SectionShowcase />

      {/* Categories */}
      <section className="container-page pt-8 md:pt-10">
        <h2 className="t-h2 text-ink">Popular categories</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.id] ?? Package;
            return (
              <li key={s.id}>
                <Link
                  href={`/market?cat=${s.id}#products`}
                  className="group flex h-full flex-col gap-3 rounded-[var(--r-card)] border border-ink-line bg-bg-card p-4 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:border-accent/40 hover:shadow-[var(--shadow-hover)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-accent-soft text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{s.name}</span>
                    <span className="block text-[12px] text-ink-faint">{counts.get(s.id) ?? 0} products</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Products */}
      <section id="products" className="container-page scroll-mt-32 pt-10">
        <div className="mb-4">
          <h2 className="t-h2 text-ink">All products</h2>
          <p className="mt-1 text-[14px] text-ink-muted">Live catalog from the Lucifer bot — prices and stock update automatically.</p>
        </div>
        {error && !products.length ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
            <Package size={24} className="text-ink-faint" />
            <p className="text-[15px] font-semibold text-ink">The catalog is temporarily unavailable</p>
            <p className="max-w-md text-[13px] text-ink-muted">We couldn&apos;t reach the store just now. You can still order in the Telegram bot while we reconnect.</p>
            <Button href={luciferBotUrl} variant="secondary">Open @{luciferBotUrl.split("/").pop()}</Button>
          </div>
        ) : (
          <LuciferGrid key={`${cat}|${q}`} products={products} sections={sections} initialSection={cat} initialQ={q} />
        )}
      </section>

      {/* How it works */}
      <section id="how" className="container-page scroll-mt-32 pt-12">
        <div className="panel">
          <div className="panel-inner">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-2">How it works</p>
                <h2 className="t-h2 mt-1 text-ink">Order in three steps</h2>
              </div>
              <p className="max-w-md text-[14px] text-ink-muted">Your website account and the Telegram bot share one wallet — top up anywhere, buy anywhere.</p>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-[var(--r-card)] border border-line bg-bg p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-primary text-white">
                      <s.icon size={18} />
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="container-page pt-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--r-card-lg)] bg-primary px-6 py-8 text-on-primary md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="text-[22px] font-bold text-white md:text-[26px]">Prefer Telegram?</h2>
            <p className="mt-1 max-w-xl text-[14px] text-white/60">Everything here also works inside the Lucifer bot — top up, browse, order and get support without leaving Telegram.</p>
          </div>
          <Button href={luciferBotUrl} size="lg">
            <Send size={17} /> Open the bot
          </Button>
        </div>
      </section>
    </div>
  );
}
