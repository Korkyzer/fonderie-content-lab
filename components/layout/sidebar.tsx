"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { navigation, type NavItem } from "@/lib/mock-data";
import { cx } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const sections: Array<NavItem["section"]> = ["Workspace", "Intelligence"];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-ink text-cream">
      <div className="flex items-center gap-2.5 border-b border-cream/12 px-5 py-5">
        <span className="grid h-7 w-7 place-items-center rounded-sm bg-purple text-[18px] font-bold text-ink">
          F
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-bold uppercase tracking-[0.02em]">
            Content Lab
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-cream/55">
            Fonderie · CFI
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section}>
            <p className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-cream/40">
              {section}
            </p>
            <nav className="flex flex-col">
              {navigation
                .filter((item) => item.section === section)
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cx(
                        "grid grid-cols-[24px_1fr_auto] items-center gap-3 border-l-2 px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.03em] transition-colors",
                        active
                          ? "border-ink bg-purple text-ink"
                          : "border-transparent text-cream/72 hover:bg-cream/4 hover:text-cream",
                      )}
                    >
                      <span className="grid h-[18px] w-[18px] place-items-center">
                        <Icon name={item.icon} size={18} />
                      </span>
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-sky px-1.5 py-0.5 text-[10px] font-bold text-ink">
                          {item.badge}
                        </span>
                      ) : (
                        <kbd
                          className={cx(
                            "rounded-[3px] px-1.5 py-0.5 font-mono text-[10px]",
                            active
                              ? "bg-ink text-purple"
                              : "bg-cream/10 text-cream/80",
                          )}
                        >
                          ⌘{item.kbd}
                        </kbd>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-cream/12 px-5 py-4">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-cream/55">
            <span>Crédits studio</span>
            <span>62/100</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-cream/10">
            <div className="h-full w-[62%] bg-sky" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-purple text-[12px] font-bold text-ink">
            LR
          </span>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold">Laure Reymond</span>
            <span className="text-[10px] uppercase tracking-[0.08em] text-cream/55">
              Resp. Communication
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
