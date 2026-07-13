"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/ledger"
      title={t("ledger.title")}
      tabs={[
        { href: "/ledger", label: t("ledger.tabs.accounts"), exact: true },
        { href: "/ledger/transactions", label: t("ledger.tabs.transactions") },
        { href: "/ledger/journal", label: t("ledger.tabs.newJournal") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
