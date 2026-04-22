"use client";

import { useEffect, type ReactNode } from "react";

import { cx } from "@/lib/utils";

import { Icon } from "./icon";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cx(
          "w-full rounded-lg border border-ink bg-cream p-6 shadow-hard-lg",
          SIZES[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-b2 font-display uppercase">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-sm p-1 text-ink/60 transition-colors hover:bg-ink/6 hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="space-y-4 text-sm text-ink/80">{children}</div>
        {footer ? (
          <footer className="mt-6 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
