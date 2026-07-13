"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function TimeclockLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame href="/timeclock" title={t("timeclock.title")}>
      {children}
    </ModuleFrame>
  );
}
