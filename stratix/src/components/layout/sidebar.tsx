"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";
import { StratixLogo } from "@/components/brand";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/dashboard">
          <StratixLogo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group}
            </p>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-accent-glow" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="accent" className="ml-auto px-1.5 py-0 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/pricing"
          className="block rounded-lg bg-gradient-to-br from-navy to-charcoal p-3 text-ivory transition-opacity hover:opacity-95"
        >
          <p className="text-xs font-semibold text-accent-glow">Pro plan</p>
          <p className="mt-0.5 text-[11px] text-ivory/70">
            Unlock lead export, sequences & white-label proposals.
          </p>
        </Link>
      </div>
    </aside>
  );
}
