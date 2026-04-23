import { forwardRef, type SelectHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

import { Icon } from "./icon";

type Option = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, className, id, ...rest },
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
      <div
        className={cx(
          "relative flex cursor-pointer items-center rounded-sm border border-ink/15 bg-white transition-colors hover:border-ink",
          className,
        )}
      >
        <select
          ref={ref}
          id={fieldId}
          className="w-full appearance-none bg-transparent px-3 py-2.5 pr-9 text-[13px] font-medium text-ink outline-none"
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-ink/50">
          <Icon name="chevron-down" size={14} />
        </span>
      </div>
    </div>
  );
});
