"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useT } from "@/lib/i18n";

/** Search is not a registered module — plain translated header, no ModuleFrame. */
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("search.eyebrow")} title={t("search.title")} />
      {children}
    </div>
  );
}
