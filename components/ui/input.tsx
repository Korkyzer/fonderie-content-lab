import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, leading, trailing, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/70"
        >
          {label}
        </label>
      ) : null}
      <div
        className={cx(
          "flex items-center gap-2 rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-[13px] transition-colors focus-within:border-ink hover:border-ink/40",
          className,
        )}
      >
        {leading ? <span className="text-ink/50">{leading}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className="flex-1 bg-transparent font-medium text-ink outline-none placeholder:text-ink/40"
          {...rest}
        />
        {trailing ? <span className="text-ink/50">{trailing}</span> : null}
      </div>
      {hint ? <p className="text-[11px] text-ink/60">{hint}</p> : null}
    </div>
  );
});
