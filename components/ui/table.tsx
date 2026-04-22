"use client";

import { useMemo, useState, type ReactNode } from "react";

import { cx } from "@/lib/utils";

import { Icon } from "./icon";

export type Column<T> = {
  id: keyof T & string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
  emptyLabel?: string;
};

export function Table<T>({
  columns,
  rows,
  rowKey,
  className,
  emptyLabel = "Aucun résultat",
}: TableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortBy) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortBy];
      const bv = (b as Record<string, unknown>)[sortBy];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), "fr", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  const onSort = (column: Column<T>) => {
    if (!column.sortable) return;
    if (sortBy === column.id) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column.id);
      setSortDir("asc");
    }
  };

  return (
    <div className={cx("overflow-hidden rounded-md border border-ink/8 bg-cream", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/10 bg-ink/3">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                aria-sort={
                  column.sortable
                    ? sortBy === column.id
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
                className={cx(
                  "px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-ink/70",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.align !== "right" && column.align !== "center" && "text-left",
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort(column)}
                    className={cx(
                      "inline-flex w-full items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple hover:text-ink",
                      column.align === "right" && "justify-end",
                      column.align === "center" && "justify-center",
                    )}
                  >
                    <span>{column.header}</span>
                    {sortBy === column.id ? (
                      <Icon
                        name={sortDir === "asc" ? "up" : "down"}
                        size={10}
                      />
                    ) : null}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1">{column.header}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[11px] uppercase tracking-[0.1em] text-ink/50"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-dashed border-ink/10 last:border-0 transition-colors hover:bg-white"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cx(
                      "px-4 py-3 align-middle",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.id] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
