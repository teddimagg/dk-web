"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function GeneralLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/general"
      title={t("general.title")}
      intro={t("general.intro")}
      tabs={[
        { href: "/general/employees", label: t("general.tabs.employees") },
        { href: "/general/payments", label: t("general.tabs.payments") },
        { href: "/general/reference", label: t("general.tabs.reference") },
        { href: "/general/tables", label: t("general.tabs.tables") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
