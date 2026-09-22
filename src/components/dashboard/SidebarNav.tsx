"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export function SidebarNav({ items, horizontal }: { items: NavItem[]; horizontal?: boolean }) {
  const pathname = usePathname();
  return (
    <ul className={cn(horizontal ? "flex gap-1" : "mt-2 space-y-0.5")}>
      {items.map((i) => {
        const active = i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + "/");
        return (
          <li key={i.href}>
            <Link
              href={i.href}
              className={cn(
                "block whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold",
                active ? "bg-ink text-on-primary" : "text-ink-muted hover:bg-bg-soft hover:text-ink",
              )}
            >
              {i.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
