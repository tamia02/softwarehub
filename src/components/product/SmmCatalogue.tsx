"use client";

import { useState } from "react";
import { smmCatalog, smmStats } from "@/data/smm";
import { formatINR } from "@/lib/format";

const platforms = ["All", ...Array.from(new Set(smmCatalog.map((c) => c.platform)))];

export function SmmCatalogue() {
  const [platform, setPlatform] = useState("All");
  const groups = platform === "All" ? smmCatalog : smmCatalog.filter((c) => c.platform === platform);

  return (
    <section id="services" className="container-page scroll-mt-24 py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="t-h2 text-ink">Services catalogue</h2>
          <p className="mt-2 text-[15px] text-ink-muted">
            {smmStats.services} services · {smmStats.categories} categories · {smmStats.platforms} platforms · rates per 1,000
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
              platform === p ? "border-ink-line bg-accent text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((c) => (
          <div key={c.platform + c.category} className="overflow-hidden rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card">
            <div className="flex items-center justify-between border-b-2 border-ink-line bg-accent-soft px-4 py-2.5">
              <h3 className="text-[15px] font-black text-ink">
                {c.platform} · {c.category}
              </h3>
              <span className="text-[12px] font-bold text-ink-faint">{c.services.length} services</span>
            </div>
            <div className="divide-y divide-line">
              {c.services.map((sv) => (
                <div key={sv.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto_auto]">
                  <span className="font-code text-[12px] text-ink-faint sm:order-1">#{sv.id}</span>
                  <div className="sm:order-2">
                    <p className="text-[14px] font-semibold leading-tight text-ink">{sv.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {sv.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                          {tag}
                        </span>
                      ))}
                      <span className="text-[11px] text-ink-faint">
                        {sv.min.toLocaleString("en-IN")}–{sv.max.toLocaleString("en-IN")} · {sv.avgTime}
                      </span>
                    </div>
                  </div>
                  <span className="text-right font-black tabular-nums text-ink sm:order-3">
                    {formatINR(sv.ratePer1k * 100)}
                    <span className="block text-[10px] font-medium text-ink-faint">/ 1K</span>
                  </span>
                  <a
                    href="/login"
                    className="justify-self-end rounded-full border-2 border-ink-line bg-bg-card px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-primary-soft sm:order-4"
                  >
                    Order
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
