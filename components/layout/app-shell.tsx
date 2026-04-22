"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  headerActions?: ReactNode;
  user: Session["user"] | null;
};

export function AppShell({ children, headerActions, user }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-shell">
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      <div
        className={cx(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={cx(
          "fixed inset-y-0 left-0 z-50 w-[248px] transform transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
      </div>

      <main className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-ink/8 bg-page px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Ouvrir la navigation"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-sm border border-ink/15 bg-cream text-ink"
          >
            <Icon name="filter" size={18} />
          </button>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Fonderie Content Lab
          </span>
          <span className="h-9 w-9" />
        </div>
        <Header user={user} actions={headerActions} />
        <div className="flex flex-1 flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
