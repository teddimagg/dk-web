"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Products module" title="Products" />
      <NavTabs
        tabs={[
          { href: "/products", label: "Catalogue", exact: true },
          { href: "/products/inventory", label: "Inventory" },
          { href: "/products/transactions", label: "Transactions" },
          { href: "/products/barcodes", label: "Barcode search" },
        ]}
      />
      {children}
    </div>
  );
}
