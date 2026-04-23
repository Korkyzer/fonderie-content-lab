import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  leading?: ReactNode;
};

export function Input({ className, label, leading, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink/60">
        {label}
      </span>
      <span className="relative block">
        {leading ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45">
            {leading}
          </span>
        ) : null}
        <input
          className={cx(
            "field bg-white",
            leading ? "pl-11" : "",
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}
