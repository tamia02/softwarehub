import { DashboardShell } from "@/components/dashboard/Shell";
import { requireUser } from "@/lib/auth.server";

const nav = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/codes", label: "Codes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/payouts", label: "Resellers & payouts" },
  { href: "/admin/issues", label: "Guarantee claims" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("admin", "/admin");
  return (
    <DashboardShell nav={nav} title="Admin" topRight={<p className="text-xs text-ink-faint">{user.email}</p>}>
      {children}
    </DashboardShell>
  );
}
