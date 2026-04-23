"use client";

import { useState } from "react";

import { Dropdown } from "@/components/ui/dropdown";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/utils";

type ExportOption = {
  id: string;
  label: string;
  endpoint: "/api/export/pdf" | "/api/export/docx" | "/api/export/csv";
  body: unknown;
};

type ExportDropdownProps = {
  options: ExportOption[];
  className?: string;
};

function readFilename(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/i);
  return match?.[1] ?? "export";
}

export function ExportDropdown({
  options,
  className,
}: ExportDropdownProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleExport(option: ExportOption) {
    setPendingId(option.id);
    try {
      const response = await fetch(option.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(option.body),
      });
      if (!response.ok) throw new Error("export_failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = readFilename(response.headers.get("content-disposition"));
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Dropdown
      className={className}
      trigger={
        <span
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-sm border border-ink bg-purple px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink shadow-hard transition-all duration-150 ease-brand hover:-translate-x-px hover:-translate-y-px hover:bg-hover-primary hover:shadow-hard-lg",
            pendingId && "pointer-events-none opacity-70",
          )}
        >
          <Icon name="arrow" size={14} />
          {pendingId ? "Export…" : "Exporter"}
          <Icon name="chevron-down" size={14} />
        </span>
      }
      items={options.map((option) => ({
        id: option.id,
        label: option.label,
        icon: <Icon name="arrow" size={14} />,
        onSelect: () => {
          void handleExport(option);
        },
      }))}
    />
  );
}
