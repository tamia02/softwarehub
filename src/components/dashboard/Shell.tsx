import Link from "next/link";
import { LogoLockup } from "@/components/brand/Logo";
import { SidebarNav, type NavItem } from "./SidebarNav";

export function DashboardShell({
  nav,
  title,
  topRight,
  children,
}: {
  nav: NavItem[];
  title: string;
  topRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-bg-card px-4 py-5 md:flex">
        <Link href="/home"><LogoLockup /></Link>
        <p className="mt-6 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">{title}</p>
        <SidebarNav items={nav} />
        <div className="mt-auto px-3 text-xs text-ink-faint">
          <Link href="/account" className="hover:text-ink">My account</Link> · <a href="/api/auth/logout" className="hover:text-ink">Sign out</a>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg-card/80 px-4 backdrop-blur md:px-8">
          <Link href="/market" className="shrink-0 md:hidden"><LogoLockup /></Link>
          <div className="hidden md:block" />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">{topRight}</div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-bg-card px-3 py-2 md:hidden">
          <SidebarNav items={nav} horizontal />
        </nav>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`min-w-0 rounded-[20px] border p-4 sm:p-5 ${accent ? "border-primary/30 bg-primary text-on-primary" : "border-line bg-bg-card"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-on-primary/80" : "text-ink-faint"}`}>{label}</p>
      <p className="mt-2 truncate font-display text-[22px] font-black leading-none tabular-nums sm:text-[28px]">{value}</p>
      {sub && <p className={`mt-1.5 text-xs ${accent ? "text-on-primary/80" : "text-ink-muted"}`}>{sub}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-line bg-bg-card ${className ?? ""}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-sm font-extrabold">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** On phones each row becomes a card; the per-table rule below labels every cell with its column name (see .rtable in globals.css). */
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  let h = 0;
  for (const c of head.join("|")) h = (h * 31 + c.charCodeAt(0)) | 0;
  const cls = `rt-${(h >>> 0).toString(36)}`;
  const labels = head
    .map((label, i) => (label ? `.${cls} td:nth-child(${i + 1}):not([colspan])::before{content:${JSON.stringify(label)}}` : ""))
    .join("");
  return (
    <div className="-mx-5 -my-5 overflow-x-auto">
      <style>{`@media (max-width:767px){${labels}}`}</style>
      <table className={`rtable ${cls} w-full text-left text-sm`}>
        <thead className="bg-bg-soft text-[11px] uppercase tracking-wider text-ink-faint">
          <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-2.5 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
