"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cx } from "@/lib/utils";

export type DropdownItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className={cx("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger}
      </button>
      {open ? (
        <div
          className={cx(
            "absolute top-full z-30 mt-2 min-w-[200px] overflow-hidden rounded-md border border-ink/10 bg-cream shadow-hover",
            align === "right" ? "right-0" : "left-0",
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              className={cx(
                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12px] font-medium transition-colors hover:bg-ink/6",
                item.tone === "danger" ? "text-red" : "text-ink",
              )}
            >
              {item.icon ? (
                <span className="text-current">{item.icon}</span>
              ) : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
