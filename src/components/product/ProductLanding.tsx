import { Button } from "@/components/ui/Button";
import type { Product } from "@/data/products";

/**
 * A finished landing page for one product area (Passes / Growth / Community / Lab).
 * Cream by default; the Lab passes `dark` for a graphite + acid-green treatment.
 * Hero → stat row → features → how-it-works → closing CTA.
 */
export function ProductLanding({ product, children }: { product: Product; children?: React.ReactNode }) {
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

  return (
    <main className={t.wrap}>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 pb-12 pt-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-16 md:pt-16">
        <div>
          <p className={t.eyebrow}>{product.eyebrow}</p>
          <h1 className={`t-h1 mt-4 max-w-[16ch] text-balance ${t.head}`}>{highlight(product.headline)}</h1>
          <p className={`mt-3 text-[24px] leading-none ${t.hand}`}>{product.hand}</p>
          <p className={`mt-5 max-w-[60ch] text-[16px] leading-[1.5] ${t.sub}`}>{product.sub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={product.primary.href} size="lg" variant={dark ? "primary" : "primary"}>
              {product.primary.label}
            </Button>
            <Button href={product.secondary.href} size="lg" variant="secondary">
              {product.secondary.label}
            </Button>
          </div>
        </div>

        {/* Stat card cluster */}
        <div className={`grid grid-cols-2 gap-3 rounded-[var(--r-card-lg)] p-1.5 ${dark ? "" : ""}`}>
          {product.stats.map((s) => (
            <div key={s.label} className={`rounded-[var(--r-card)] p-5 ${t.card}`}>
              <p className={`font-display text-[30px] font-black leading-none ${t.statValue}`}>{s.value}</p>
              <p className={`mt-2 text-[13px] font-medium ${t.statLabel}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {product.features.map((f) => (
            <div key={f.title} className={`rounded-[var(--r-card)] p-6 ${t.card}`}>
              <h3 className={`t-card-title text-[18px] ${t.cardTitle}`}>{f.title}</h3>
              <p className={`mt-2 text-[15px] leading-[1.5] ${t.cardBody}`}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-10 md:py-14">
        <h2 className={`t-h2 ${t.head}`}>How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
          {product.how.map((h) => (
            <div key={h.step} className={`rounded-[var(--r-card)] p-6 ${t.card}`}>
              <span className={`grid h-11 w-11 place-items-center rounded-full border-2 font-display text-[16px] font-black ${t.step}`}>
                {h.step}
              </span>
              <h3 className={`t-card-title mt-4 text-[18px] ${t.cardTitle}`}>{h.title}</h3>
              <p className={`mt-2 text-[15px] leading-[1.5] ${t.cardBody}`}>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {children}

      {/* Closing CTA */}
      <section className="container-page py-14 md:py-20">
        <div className={`flex flex-col items-center gap-5 rounded-[var(--r-card-lg)] p-10 text-center ${t.card}`}>
          <h2 className={`t-h2 max-w-[20ch] ${t.head}`}>{product.name} is ready when you are.</h2>
          <p className={`max-w-[52ch] text-[16px] ${t.sub}`}>{product.sub}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={product.primary.href} size="lg">
              {product.primary.label}
            </Button>
            <Button href="/login" size="lg" variant="secondary">
              Sign in
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
