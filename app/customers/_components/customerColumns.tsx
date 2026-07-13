"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import type { Column } from "@/components/ui/DataTable";
import { usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, timeAgo } from "@/lib/format";
import type { Customer } from "@/lib/api/types/customers";

/** The customer table columns shared by the list page and the groups page. */
export function useCustomerColumns(): Column<Customer>[] {
  const t = useT();
  return useMemo<Column<Customer>[]>(
    () => [
      {
        key: "number",
        header: t("customers.col.number"),
        width: "130px",
        render: (c) => <span className="font-mono text-xs text-soot">{c.Number}</span>,
      },
      {
        key: "name",
        header: t("customers.col.name"),
        render: (c) => <span className="font-medium text-ink">{c.Name || "–"}</span>,
      },
      {
        key: "ssn",
        header: t("customers.col.ssn"),
        render: (c) => c.SSNumber || <span className="text-mist">–</span>,
      },
      {
        key: "group",
        header: t("customers.col.group"),
        render: (c) => (c.Group ? <Badge>{c.Group}</Badge> : <span className="text-mist">–</span>),
      },
      {
        key: "balance",
        header: t("customers.col.balance"),
        align: "right",
        render: (c) => <span className="tnum">{formatAmount(c.BalanceAmount)}</span>,
      },
      {
        key: "blocked",
        header: t("customers.col.status"),
        align: "center",
        render: (c) =>
          c.Blocked ? (
            <Badge tone="red">{t("customers.badge.blocked")}</Badge>
          ) : (
            <span className="text-mist">–</span>
          ),
      },
      {
        key: "modified",
        header: t("customers.col.modified"),
        align: "right",
        render: (c) => <span className="text-fog">{timeAgo(c.Modified)}</span>,
      },
    ],
    [t],
  );
}

/** Row click → detail page; row hover → prefetch the customer card. */
export function useCustomerRowNav() {
  const router = useRouter();
  const prefetch = usePrefetch();
  return {
    onRowClick: (c: Customer) => router.push(`/customers/${encodeURIComponent(c.Number)}`),
    onRowHover: (c: Customer) =>
      prefetch(["customer", c.Number], `/customer/${encodeURIComponent(c.Number)}`),
  };
}
