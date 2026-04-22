import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fonderie Content Lab",
  description: "Pilotage éditorial CFI pour les équipes communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-page text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
