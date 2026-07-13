"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customers module" title="Customers" />
      <NavTabs
        tabs={[
          { href: "/customers", label: "All customers", exact: true },
          { href: "/customers/groups", label: "Groups" },
        ]}
      />
      {children}
    </div>
  );
}
