import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cx("panel p-5 md:p-6", className)} {...props} />;
}
