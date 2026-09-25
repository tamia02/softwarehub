"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Passes" },
  { href: "/account/redeem", label: "Redeem code" },
  { href: "/account/pools", label: "Pools" },
  { href: "/account/orders", label: "Orders & invoices" },
];

export function AccountNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/market");
    router.refresh();
  }
  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-full border border-line bg-bg-card p-1 text-sm font-semibold">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={cn("rounded-full px-3.5 py-2", pathname === i.href ? "bg-ink text-on-primary" : "text-ink-muted hover:bg-bg-soft hover:text-ink")}>
          {i.label}
        </Link>
      ))}
      {(role === "reseller" || role === "admin") && (
        <Link href={role === "admin" ? "/admin" : "/reseller"} className="rounded-full px-3.5 py-2 text-primary hover:bg-primary-soft">
          {role === "admin" ? "Admin" : "Reseller"}
        </Link>
      )}
      <button onClick={logout} className="rounded-full px-3.5 py-2 text-ink-muted hover:bg-bg-soft hover:text-ink">
        Sign out
      </button>
    </nav>
  );
}
