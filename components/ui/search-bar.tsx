"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

import { Icon } from "./icon";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  shortcut?: string;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      shortcut = "⌘K",
      className,
      "aria-label": ariaLabel = "Rechercher dans Content Lab",
      ...rest
    },
    ref,
  ) {
    return (
      <label
        className={cx(
          "flex w-full sm:w-[260px] items-center gap-2 rounded-sm border border-ink/10 bg-cream px-3 py-2 text-[13px] transition-colors focus-within:border-ink hover:border-ink/30",
          className,
        )}
      >
        <span className="text-ink/50">
          <Icon name="search" size={14} />
        </span>
        <input
          ref={ref}
          type="search"
          aria-label={ariaLabel ?? "Rechercher"}
          placeholder="Rechercher contenu, brief, persona…"
          className="flex-1 bg-transparent outline-none placeholder:text-ink/50"
          {...rest}
        />
        {shortcut ? (
          <kbd className="rounded-[3px] bg-ink/8 px-1.5 py-0.5 font-mono text-[10px] text-ink/70">
            {shortcut}
          </kbd>
        ) : null}
      </label>
    );
  },
);
