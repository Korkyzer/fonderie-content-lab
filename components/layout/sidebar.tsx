"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/lib/mock-data";
import { cx } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const sections = ["Workspace", "Intelligence"] as const;

  return (
    <aside className="flex h-full flex-col justify-between bg-ink px-5 py-6 text-cream">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cream/60">
            Fonderie Content Lab
          </p>
          <div className="rounded-md border border-cream/12 bg-cream/8 p-4">
            <p className="text-menu uppercase">CFI Creative Studio</p>
            <p className="mt-2 text-sm text-cream/70">
              Pilotage éditorial, garde-fous de marque et production.
            </p>
          </div>
        </div>
        {sections.map((section) => (
          <div key={section} className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-cream/50">
              {section}
            </p>
            <nav className="space-y-2">
              {navigation
                .filter((item) => item.section === section)
                .map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cx(
                        "block rounded-sm border px-3 py-3 text-sm uppercase tracking-[0.06em] transition hover:border-cream hover:bg-cream hover:text-ink",
                        active
                          ? "border-cream bg-cream text-ink shadow-hard"
                          : "border-cream/10 bg-transparent text-cream",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
            </nav>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-cream/12 bg-cream/8 p-4">
        <p className="text-sm font-bold uppercase tracking-[0.06em]">
          Laure Reymond
        </p>
        <p className="mt-1 text-sm text-cream/70">Resp. Communication</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-cream/45">
          Crédits générateur 62/100
        </p>
      </div>
    </aside>
  );
}
