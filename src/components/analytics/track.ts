"use client";

/** Thin PostHog wrapper — no-op when NEXT_PUBLIC_POSTHOG_KEY is unset. */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    const ph = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
    ph?.capture(event, props);
  } catch {
    /* analytics must never break the UI */
  }
}
