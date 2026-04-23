"use client";

import { useState, type ReactNode } from "react";

import { cx } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "pill" | "underline";
  onChange?: (id: string) => void;
  className?: string;
};

export function Tabs({
  tabs,
  defaultTab,
  variant = "pill",
  onChange,
  className,
}: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const handleSelect = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className={cx("flex flex-col gap-4", className)}>
      <div
        className={cx(
          "flex flex-wrap gap-1",
          variant === "pill"
            ? "w-fit rounded-md bg-ink/6 p-1"
            : "border-b border-ink/10",
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(tab.id)}
              className={cx(
                "cursor-pointer rounded-sm px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all",
                variant === "pill"
                  ? isActive
                    ? "bg-cream text-ink shadow-card"
                    : "text-ink/60 hover:text-ink"
                  : isActive
                    ? "border-b-2 border-ink text-ink"
                    : "border-b-2 border-transparent text-ink/60 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}
