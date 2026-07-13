"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/sales"
      title={t("sales.title")}
      tabs={[
        { href: "/sales/invoices", label: t("sales.tabs.invoices") },
        { href: "/sales/orders", label: t("sales.tabs.orders") },
        { href: "/sales/quotes", label: t("sales.tabs.quotes") },
        { href: "/sales/salespeople", label: t("sales.tabs.salespeople") },
        { href: "/sales/payment-types", label: t("sales.tabs.paymentTypes") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
