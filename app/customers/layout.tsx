"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/customers"
      title={t("customers.title")}
      intro={t("customers.intro")}
      tabs={[
        { href: "/customers", label: t("customers.tabs.all"), exact: true },
        { href: "/customers/groups", label: t("customers.tabs.groups") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
