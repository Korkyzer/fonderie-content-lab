import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getActiveAlerts } from "@/lib/queries";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fonderie Content Lab",
  description: "Pilotage éditorial CFI pour les équipes communication.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let alertsCount = 0;
  try {
    alertsCount = getActiveAlerts().length;
  } catch {
    alertsCount = 0;
  }
  const session = await auth();

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-page text-ink">
        <AppShell alertsCount={alertsCount} user={session?.user ?? null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
