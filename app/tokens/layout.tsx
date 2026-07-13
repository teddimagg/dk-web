"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function TokensLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame href="/tokens" title={t("tokens.title")}>
      {children}
    </ModuleFrame>
  );
}
