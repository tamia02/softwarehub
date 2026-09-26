import { PostHogProvider } from "@/components/analytics/PostHogProvider";

/**
 * Chrome-less shell for full-bleed, immersive pages (Methods). No site header
 * or footer — the page owns the whole viewport for its own hacker aesthetic.
 * The hacker display font is loaded at runtime via <link> (React 19 hoists it
 * to <head>); CSP already allows Google Fonts, and this avoids the build-time
 * Google fetch that next/font/google would trigger in Docker/CI.
 */
export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Intentionally scoped to immersive pages only. eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap"
        rel="stylesheet"
      />
      <PostHogProvider />
      {children}
    </>
  );
}
