"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sales module" title="Sales" />
      <NavTabs
        tabs={[
          { href: "/sales/invoices", label: "Invoices" },
          { href: "/sales/orders", label: "Orders" },
          { href: "/sales/quotes", label: "Quotes" },
          { href: "/sales/salespeople", label: "Salespeople" },
          { href: "/sales/payment-types", label: "Payment types" },
        ]}
      />
      {children}
    </div>
  );
}
