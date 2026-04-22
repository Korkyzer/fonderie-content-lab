import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-shell">
      <Sidebar />
      <main className="min-w-0">
        <Header />
        <div className="px-4 py-5 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
