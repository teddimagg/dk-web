"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Vendors module" title="Vendors" />
      <NavTabs
        tabs={[
          { href: "/vendors", label: "Vendors", exact: true },
          { href: "/vendors/invoices", label: "Invoices" },
          { href: "/vendors/approvals", label: "Approvals" },
          { href: "/vendors/purchases", label: "Purchase orders" },
          { href: "/vendors/transactions", label: "Transactions" },
        ]}
      />
      {children}
    </div>
  );
}
