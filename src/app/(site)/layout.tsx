import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PromoBar } from "@/components/layout/PromoBar";

/**
 * Shell for every page except the gate. Deliberately reads no cookies so the
 * marketing page can be statically cached (ISR); the header probes
 * /api/auth/me on the client for the signed-in state.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogProvider />
      <PromoBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
