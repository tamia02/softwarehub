import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";
import type { Product } from "@/data/products";

/**
 * A finished landing page for one product area (Passes / Growth / Community / Lab).
 * Cream by default; the Lab passes `dark` for a graphite + acid-green treatment.
 * Default order: Hero → features → how-it-works → children → CTA.
 * `catalogueFirst` reorders to: Hero → children → how-it-works → features → CTA.
 * `heroAside` replaces the default hero stat cluster with a custom visual.
 */
export function ProductLanding({
  product,
  children,
  heroAside,
  catalogueFirst = false,
}: {
  product: Product;
  children?: React.ReactNode;
  heroAside?: React.ReactNode;
  catalogueFirst?: boolean;
}) {
  const dark = product.dark;
  const t = dark
    ? {
        wrap: "bg-[#0b0f0e] text-[#e7f6ef]",
        eyebrow: "font-code text-[13px] uppercase tracking-[0.2em] text-[#34d399]",
        head: "text-[#f2fbf6]",
        hl: "text-[#34d399]",
        hand: "font-code text-[#5eead4]",
        sub: "text-[#9fb6ac]",
        card: "border border-[#1f2a25] bg-[#111815]",
        cardTitle: "text-[#e7f6ef]",
        cardBody: "text-[#9fb6ac]",
        statValue: "text-[#34d399]",
        statLabel: "text-[#7f948b]",
        step: "border-[#233029] bg-[#0e1512] text-[#34d399]",
        rule: "border-[#1f2a25]",
      }
    : {
        wrap: "bg-bg text-ink",
        eyebrow: "text-[15px] font-bold uppercase tracking-wider text-accent-2",
        head: "text-ink",
        hl: "text-accent-2",
        hand: "font-hand text-accent-2",
        sub: "text-ink-muted",
        card: "border-2 border-ink-line bg-bg-card shadow-[5px_5px_0_var(--offset-card)]",
        cardTitle: "text-ink",
        cardBody: "text-ink-muted",
        statValue: "text-ink",
        statLabel: "text-ink-faint",
        step: "border-ink-line bg-accent-soft text-ink",
        rule: "border-line-strong",
      };

  const highlight = (text: string) => {
    const words = product.highlight;
    return text.split(/(\s+)/).map((w, i) => {
      const bare = w.replace(/[^\w]/g, "");
      return words.includes(bare) ? (
        <span key={i} className={t.hl}>
          {w}
        </span>
      ) : (
        <span key={i}>{w}</span>
      );
    });
  };

  const featuresSection = (
    <section className="container-page py-10 md:py-14">
      <Reveal>
        <h2 className={`t-h2 ${t.head}`}>What you get</h2>
      </Reveal>
      <Stagger className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
        {product.features.map((f) => (
          <StaggerItem key={f.title} className="h-full">
            <Tilt max={6} className="h-full rounded-[var(--r-card)] [transform-style:preserve-3d]">
              <div className={`h-full rounded-[var(--r-card)] p-6 [transform-style:preserve-3d] ${t.card}`}>
                <h3 className={`t-card-title text-[18px] [transform:translateZ(20px)] ${t.cardTitle}`}>{f.title}</h3>
                <p className={`mt-2 text-[15px] leading-[1.5] ${t.cardBody}`}>{f.body}</p>
              </div>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );

  const howSection = (
    <section className="container-page py-10 md:py-14">
      <Reveal>
        <h2 className={`t-h2 ${t.head}`}>How it works</h2>
      </Reveal>
      <Stagger className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
        {product.how.map((h) => (
          <StaggerItem key={h.step} className="h-full">
            <div className={`group h-full rounded-[var(--r-card)] p-6 transition-transform duration-200 hover:-translate-y-1 ${t.card}`}>
              <span className={`grid h-11 w-11 place-items-center rounded-full border-2 font-display text-[16px] font-black transition-transform duration-300 group-hover:scale-110 ${t.step}`}>
                {h.step}
              </span>
              <h3 className={`t-card-title mt-4 text-[18px] ${t.cardTitle}`}>{h.title}</h3>
              <p className={`mt-2 text-[15px] leading-[1.5] ${t.cardBody}`}>{h.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );

  return (
    <main className={t.wrap}>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 pb-12 pt-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-16 md:pt-16">
        <div>
          <p className={`anim-fade-up ${t.eyebrow}`} style={{ animationDelay: "0.05s" }}>{product.eyebrow}</p>
          <h1 className={`anim-fade-up t-h1 mt-4 max-w-[16ch] text-balance ${t.head}`} style={{ animationDelay: "0.12s" }}>{highlight(product.headline)}</h1>
          <p className={`anim-fade-up mt-3 text-[24px] leading-none ${t.hand}`} style={{ animationDelay: "0.25s" }}>{product.hand}</p>
          <p className={`anim-fade-up mt-5 max-w-[60ch] text-[16px] leading-[1.5] ${t.sub}`} style={{ animationDelay: "0.32s" }}>{product.sub}</p>
          <div className="anim-fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: "0.4s" }}>
            <Button href={product.primary.href} size="lg" variant="primary" className={dark ? undefined : "anim-cta-glow"}>
              {product.primary.label}
            </Button>
            <Button href={product.secondary.href} size="lg" variant="secondary">
              {product.secondary.label}
            </Button>
          </div>
        </div>

        {/* Hero aside — custom visual, or the default stat cluster */}
        {heroAside ?? (
          <Stagger className="grid grid-cols-2 gap-3 rounded-[var(--r-card-lg)] p-1.5" gap={0.06}>
            {product.stats.map((s) => (
              <StaggerItem key={s.label} className="h-full">
                <Tilt max={6} className="h-full rounded-[var(--r-card)] [transform-style:preserve-3d]">
                  <div className={`h-full rounded-[var(--r-card)] p-5 ${t.card}`}>
                    <p className={`font-display text-[30px] font-black leading-none [transform:translateZ(22px)] ${t.statValue}`}>{s.value}</p>
                    <p className={`mt-2 text-[13px] font-medium ${t.statLabel}`}>{s.label}</p>
                  </div>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      {catalogueFirst ? (
        <>
          {children}
          {howSection}
          {featuresSection}
        </>
      ) : (
        <>
          {featuresSection}
          {howSection}
          {children}
        </>
      )}

      {/* Closing CTA */}
      <section className="container-page py-14 md:py-20">
        <Reveal className={`flex flex-col items-center gap-5 rounded-[var(--r-card-lg)] p-10 text-center ${t.card}`} y={28}>
          <h2 className={`t-h2 max-w-[20ch] ${t.head}`}>{product.name} is ready when you are.</h2>
          <p className={`max-w-[52ch] text-[16px] ${t.sub}`}>{product.sub}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={product.primary.href} size="lg" className={dark ? undefined : "anim-cta-glow"}>
              {product.primary.label}
            </Button>
            <Button href="/login" size="lg" variant="secondary">
              Sign in
            </Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
