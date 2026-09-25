"use client";

import { useState } from "react";
import { smmCatalog, smmStats } from "@/data/smm";
import { formatINR } from "@/lib/format";

const platforms = ["All", ...Array.from(new Set(smmCatalog.map((c) => c.platform)))];

/** simple-icons slug per platform for a brand logo (falls back to a dot). */
const icon: Record<string, string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  TikTok: "tiktok",
  Telegram: "telegram",
  Facebook: "facebook",
  "Twitter / X": "x",
  Spotify: "spotify",
  "Website Traffic": "googlechrome",
};

function BrandIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  const slug = icon[platform];
  if (!slug) return <span className="h-2 w-2 rounded-full bg-accent-2" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://cdn.simpleicons.org/${slug}`} alt="" width={size} height={size} className="object-contain" loading="lazy" />;
}

export function SmmCatalogue() {
  const [platform, setPlatform] = useState("All");
  const groups = platform === "All" ? smmCatalog : smmCatalog.filter((c) => c.platform === platform);

  return (
    <section id="services" className="container-page scroll-mt-24 py-10 md:py-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="t-h2 text-ink">Services catalogue</h2>
        <p className="font-hand text-[24px] text-accent-2 md:text-[28px]">real growth, wholesale rates</p>
        <p className="t-lead max-w-2xl text-ink-muted">
          {smmStats.services} services · {smmStats.categories} categories · {smmStats.platforms} platforms · rates per 1,000
        </p>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
              platform === p ? "border-ink-line bg-accent text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"
            }`}
          >
            {p !== "All" && <BrandIcon platform={p} size={15} />}
            {p}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {groups.map((c) => (
          <div key={c.platform + c.category} className="overflow-hidden rounded-[var(--r-card-lg)] border-2 border-ink-line bg-bg-card shadow-[5px_5px_0_var(--offset-card)]">
            <div className="flex items-center gap-2.5 border-b-2 border-ink-line bg-accent-soft px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink-line bg-bg-card">
                <BrandIcon platform={c.platform} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-black leading-tight text-ink">{c.platform}</h3>
                <p className="text-[12px] font-medium text-ink-muted">{c.category}</p>
              </div>
              <span className="rounded-full bg-bg-card px-2 py-0.5 text-[11px] font-bold text-ink-faint">{c.services.length}</span>
            </div>
            <div className="divide-y divide-line">
              {c.services.map((sv) => (
                <div key={sv.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-soft/60">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-tight text-ink">{sv.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {sv.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">{tag}</span>
                      ))}
                      <span className="text-[11px] text-ink-faint">{sv.min.toLocaleString("en-IN")}–{sv.max.toLocaleString("en-IN")} · {sv.avgTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black tabular-nums text-ink">{formatINR(sv.ratePer1k * 100)}</span>
                    <span className="block text-[10px] font-medium text-ink-faint">/ 1K</span>
                  </div>
                  <a href="/login" className="shrink-0 rounded-full border-2 border-ink-line bg-accent px-3.5 py-1.5 text-[12px] font-bold text-on-accent hover:brightness-105">Order</a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
