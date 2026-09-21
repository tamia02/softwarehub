"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Initialises PostHog on the client (funnels: gate → catalog → checkout).
 * Renders nothing; safe to mount without a key.
 */
export function PostHogProvider() {
  const pathname = usePathname();
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    import("posthog-js").then(({ default: posthog }) => {
      const w = window as unknown as { posthog?: unknown };
      if (!w.posthog) {
        posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com", capture_pageview: false, persistence: "localStorage+cookie" });
        w.posthog = posthog;
      }
      posthog.capture("$pageview", { $current_url: window.location.href });
    });
  }, [pathname]);
  return null;
}
