import { Button } from "@/components/ui/Button";
import { DashboardShell } from "@/components/dashboard/Shell";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { resellerRevenue } from "@/lib/reseller.server";

const nav = [
  { href: "/reseller", label: "Overview", exact: true },
  { href: "/reseller/pools", label: "Pools" },
  { href: "/reseller/codes", label: "Codes" },
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
          <div className="text-right">
            <p className="text-xs text-ink-faint">{user.name ?? user.email ?? user.phone}</p>
            <p className="text-sm font-bold tabular-nums">Balance {formatINR(rev.availablePaise)}</p>
          </div>
          <Button href="/reseller/codes#buy" size="sm">Buy codes</Button>
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
