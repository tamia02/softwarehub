import { Button } from "@/components/ui/Button";
import { DashboardShell } from "@/components/dashboard/Shell";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { resellerRevenue } from "@/lib/reseller.server";

const nav = [
  { href: "/reseller", label: "Overview", exact: true },
  { href: "/reseller/products", label: "Products" },
  { href: "/reseller/revenue", label: "Revenue & payouts" },
  { href: "/reseller/settings", label: "Business & KYC" },
];

export default async function ResellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["reseller", "admin"], "/reseller");
  const rev = await resellerRevenue(user.id);
  return (
    <DashboardShell
      nav={nav}
      title="Reseller"
      topRight={
        <>
          <div className="min-w-0 text-right">
            <p className="hidden truncate text-xs text-ink-faint sm:block">{user.name ?? user.email ?? user.phone}</p>
            <p className="whitespace-nowrap text-sm font-bold tabular-nums"><span className="hidden sm:inline">Balance </span>{formatINR(rev.availablePaise)}</p>
          </div>
          <Button href="/reseller/products" size="sm" className="shrink-0 px-3"><span className="sm:hidden">+ Add</span><span className="hidden sm:inline">Add product</span></Button>
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
