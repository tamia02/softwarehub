"use client";

import { useState } from "react";
import { logoSources } from "@/data/logos";
import { cn } from "@/lib/utils";

/**
 * Real vendor logo. Resolution order:
 *  1. `logoUrl` — official asset uploaded by admin (see launch checklist)
 *  2. simple-icons brand glyph (CC0) in the brand colour
 *  3. the vendor's favicon, self-hosted in /public/logos (scripts/fetch-logos.cjs)
 *  4. a lettered tile (never blank)
 */
export function ToolLogo({
  slug,
  name,
  logoUrl,
  size = 40,
  mono = false,
  className,
}: {
  slug: string;
  name: string;
  logoUrl?: string | null;
  size?: number;
  /** Render brand glyphs in ink instead of brand colour (marquee, footers). */
  mono?: boolean;
  className?: string;
}) {
  const src = logoSources[slug];
  const [failed, setFailed] = useState(false);
  const glyph = size * 0.58;
  const box = cn("relative grid shrink-0 place-items-center overflow-hidden rounded-[22%] border border-line bg-bg-card", className);

  if (logoUrl && !failed) {
    return (
      <span className={box} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={`${name} logo`} width={glyph} height={glyph} className="object-contain" onError={() => setFailed(true)} loading="lazy" />
      </span>
    );
  }

  if (src?.path) {
    const dark = !src.hex || parseInt(src.hex, 16) < 0x333333;
    return (
      <span className={box} style={{ width: size, height: size }} role="img" aria-label={`${name} logo`}>
        <svg viewBox="0 0 24 24" width={glyph} height={glyph} aria-hidden>
          <path d={src.path} fill={mono || dark ? "var(--ink)" : `#${src.hex}`} />
        </svg>
      </span>
    );
  }

  if (src?.domain && !failed) {
    return (
      <span className={box} style={{ width: size, height: size }}>
        {/* Self-hosted favicon fetched by scripts/fetch-logos.cjs */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${slug}.png`}
          alt={`${name} logo`}
          width={glyph}
          height={glyph}
          className={cn("object-contain", mono && "grayscale")}
          onError={() => setFailed(true)}
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span className={cn(box, "bg-accent-soft font-display font-semibold text-primary")} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-label={`${name} logo`} role="img">
      {name.replace(/[^A-Za-z0-9]/g, "")[0]?.toUpperCase()}
    </span>
  );
}
