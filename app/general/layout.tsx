"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GeneralLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="General module" title="General">
        <p className="mt-2 max-w-lg text-sm text-fog">
          Employees, payment lookups, reference data and direct dkSystem table access.
        </p>
      </PageHeader>
      <NavTabs
        tabs={[
          { href: "/general/employees", label: "Employees" },
          { href: "/general/payments", label: "Payments" },
          { href: "/general/reference", label: "Reference" },
          { href: "/general/tables", label: "Table explorer" },
        ]}
      />
      {children}
    </div>
  );
}
