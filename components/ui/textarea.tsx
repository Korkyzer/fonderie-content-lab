import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  leading?: ReactNode;
};

export function Textarea({
  className,
  hint,
  label,
  leading,
  ...props
}: TextareaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink/60">
        {label}
      </span>
      <span className="relative block">
        {leading ? (
          <span className="pointer-events-none absolute left-4 top-4 text-ink/45">
            {leading}
          </span>
        ) : null}
        <textarea
          className={cx(
            "field min-h-28 resize-y bg-white",
            leading ? "pl-11" : "",
            className,
          )}
          {...props}
        />
      </span>
      {hint ? <span className="mt-2 block text-[11px] text-ink/58">{hint}</span> : null}
    </label>
  );
}
