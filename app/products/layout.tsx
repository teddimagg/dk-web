"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/products"
      title={t("products.title")}
      tabs={[
        { href: "/products", label: t("products.tabs.catalogue"), exact: true },
        { href: "/products/inventory", label: t("products.tabs.inventory") },
        { href: "/products/transactions", label: t("products.tabs.transactions") },
        { href: "/products/barcodes", label: t("products.tabs.barcodes") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
