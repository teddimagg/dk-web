"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Braces } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Collapsible raw-payload inspector for detail pages (power-user affordance). */
export function JsonView({ data, label }: { data: unknown; label?: string }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const heading = label ?? t("ui.rawPayload");
  return (
    <div className="rounded-2xl border border-line bg-haze/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-[13px] font-medium text-fog hover:text-ink"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <Braces className="size-3.5" />
        {heading}
      </button>
      {open && (
        <pre className="max-h-96 overflow-auto border-t border-line px-4 py-3 text-xs leading-relaxed text-soot">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
