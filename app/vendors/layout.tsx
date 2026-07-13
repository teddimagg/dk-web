"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/vendors"
      title={t("vendors.title")}
      tabs={[
        { href: "/vendors", label: t("vendors.tabs.vendors"), exact: true },
        { href: "/vendors/invoices", label: t("vendors.tabs.invoices") },
        { href: "/vendors/approvals", label: t("vendors.tabs.approvals") },
        { href: "/vendors/purchases", label: t("vendors.tabs.purchases") },
        { href: "/vendors/transactions", label: t("vendors.tabs.transactions") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
