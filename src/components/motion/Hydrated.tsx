"use client";

import { useEffect } from "react";

/** Marks <html class="hydrated"> once React is live (see globals.css). */
export function Hydrated() {
  useEffect(() => {
    document.documentElement.classList.add("hydrated");
  }, []);
  return null;
}
