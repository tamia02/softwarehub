"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HeroIllustration } from "./HeroIllustration";

/** Lazy — the whole three.js bundle only loads when we actually render 3D. */
const ProPass3D = dynamic(() => import("./ProPass3D"), {
  ssr: false,
  loading: () => <HeroIllustration />,
});

/** Only render 3D on capable, motion-friendly, non-phone devices. */
function canRender3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return false;
  try {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2") && !c.getContext("webgl")) return false;
  } catch {
    return false;
  }
  return true;
}

/**
 * Renders the glossy 3D Pro Pass on capable devices, otherwise the existing
 * 2D illustration. Server + first client paint both render the 2D version, so
 * there's no hydration mismatch; the 3D swaps in after mount if supported.
 */
export function ProPassHero3D() {
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(canRender3D()), []);
  return use3D ? <ProPass3D /> : <HeroIllustration />;
}
