"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/search-bar";
import { pageMeta } from "@/lib/mock-data";

type HeaderProps = {
  actions?: ReactNode;
};

function RouteActions({ pathname }: { pathname: string }) {
  if (pathname === "/") {
    return (
      <>
        <Button variant="light" icon={<Icon name="filter" size={14} />}>
          Filtres
        </Button>
        <Button variant="primary" icon={<Icon name="plus" size={14} />}>
          Nouveau contenu
        </Button>
      </>
    );
  }

  if (pathname === "/kanban") {
    return (
      <>
        <Button variant="light" icon={<Icon name="filter" size={14} />}>
          Filtres
        </Button>
        <Button variant="light" icon={<Icon name="users" size={14} />}>
          Équipe (4)
        </Button>
        <Button variant="primary" icon={<Icon name="plus" size={14} />}>
          Nouveau brief
        </Button>
      </>
    );
  }

  return null;
}

export function Header({ actions }: HeaderProps) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta["/"];

  return (
    <header className="sticky top-0 z-20 grid grid-cols-1 gap-4 border-b border-ink/8 bg-page/95 px-6 py-4 backdrop-blur md:grid-cols-[1fr_auto] md:items-center md:gap-6">
      <div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em]">
          <span className="text-ink/50">Fonderie Content Lab</span>
          <Icon name="chevron" size={10} />
          <b className="font-bold">{meta.crumb}</b>
        </div>
        <h1 className="mt-0.5 text-h1 font-display uppercase tracking-[0.01em]">
          {meta.title}
        </h1>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <SearchBar />
        <Button variant="light" size="md" icon={<Icon name="bell" size={14} />}>
          3
        </Button>
        <RouteActions pathname={pathname} />
        {actions}
      </div>
    </header>
  );
}
