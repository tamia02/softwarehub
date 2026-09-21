import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PromoBar } from "@/components/layout/PromoBar";
import { getRole } from "@/lib/role.server";

/** Shell for every page except the gate: promo bar, header, footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  return (
    <>
      <PromoBar />
      <Header role={role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
