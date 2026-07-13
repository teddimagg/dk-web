"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Ledger module" title="General ledger" />
      <NavTabs
        tabs={[
          { href: "/ledger", label: "Accounts", exact: true },
          { href: "/ledger/transactions", label: "Transactions" },
          { href: "/ledger/journal", label: "New journal" },
        ]}
      />
      {children}
    </div>
  );
}
