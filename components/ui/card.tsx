import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "cream" | "ink" | "transparent";
};

const TONES = {
  cream: "bg-cream border-ink/6 text-ink",
  ink: "bg-ink text-cream border-ink",
  transparent: "bg-transparent border-ink/8 text-ink",
} as const;

export function Card({ tone = "cream", className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-md border p-5 shadow-card transition-shadow hover:shadow-hover",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  more?: ReactNode;
  className?: string;
};

export function CardHeader({ title, more, className }: CardHeaderProps) {
  return (
    <header
      className={cx(
        "mb-4 flex items-center justify-between gap-3",
        className,
      )}
    >
      <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
        {title}
      </h3>
      {more ? (
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-60 hover:opacity-100">
          {more}
        </div>
      ) : null}
    </header>
  );
}

export function CardContent({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("space-y-3", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <footer
      className={cx(
        "mt-4 flex items-center justify-between border-t border-ink/8 pt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink/60",
        className,
      )}
      {...rest}
    >
      {children}
    </footer>
  );
}
