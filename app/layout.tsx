import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";

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
  const session = await auth();

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-page text-ink">
        <AppShell user={session?.user ?? null}>{children}</AppShell>
      </body>
    </html>
  );
}
