"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { cx } from "@/lib/utils";

type StudioFrameProps = {
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  description: string;
  aliases?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/generator",
    label: "Générateur",
    description: "Production éditoriale et optimisation SEO.",
    aliases: ["/"],
  },
  {
    href: "/newsletter",
    label: "Newsletter",
    description: "Assemblage, prévisualisation et export HTML.",
  },
  {
    href: "/community",
    label: "Community",
    description: "Alumni, partenaires et opportunités activables.",
  },
  {
    href: "/inspiration",
    label: "Inspiration",
    description: "Références visuelles et briefs réutilisables.",
  },
];

export function StudioFrame({ children }: StudioFrameProps) {
  const pathname = usePathname();

  return (
    <main className="shell px-5 py-5 md:px-8 md:py-8">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel h-fit p-5 md:sticky md:top-6">
          <div className="border-b border-black/8 pb-5">
            <p className="eyebrow mb-3">Fonderie Content Lab</p>
            <h1 className="font-heading text-3xl leading-tight">
              Sprint 2
              <br />
              navigation commune
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Même repère sur chaque écran pour passer du générateur aux modules
              community, newsletter et inspiration sans rupture de parcours.
            </p>
          </div>

          <nav aria-label="Navigation studio" className="mt-5 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = [item.href, ...(item.aliases ?? [])].some((candidate) =>
                candidate === "/"
                  ? pathname === "/"
                  : pathname === candidate || pathname.startsWith(`${candidate}/`),
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "block rounded-[22px] border px-4 py-4 transition",
                    isActive
                      ? "border-[rgba(13,106,109,0.22)] bg-[rgba(13,106,109,0.08)]"
                      : "border-black/8 bg-white/75 hover:-translate-y-0.5 hover:bg-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {item.description}
                      </p>
                    </div>
                    <Icon name="arrow" size={12} />
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-[22px] border border-black/8 bg-white/80 p-4">
            <div className="flex flex-wrap gap-2">
              <Tag tone="caramel">Sprint 2</Tag>
              <Tag tone="outline">Requesty mutualisé</Tag>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Les écrans gardent leur rôle propre, avec une structure de navigation et
              des patterns partagés pour limiter les écarts d&apos;implémentation.
            </p>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
