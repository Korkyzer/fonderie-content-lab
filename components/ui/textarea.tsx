import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  emphasized?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, emphasized = false, className, id, ...rest },
    ref,
  ) {
    const fieldId = id ?? rest.name ?? undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={fieldId}
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/70"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={fieldId}
          className={cx(
            "w-full resize-vertical rounded-md bg-white p-4 font-medium leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-purple",
            emphasized
              ? "min-h-[120px] border-2 border-ink text-[15px]"
              : "min-h-[100px] border border-ink/15 text-[13px] hover:border-ink/40 focus:border-ink",
            className,
          )}
          {...rest}
        />
        {hint ? <p className="text-[11px] text-ink/60">{hint}</p> : null}
      </div>
    );
  },
);
