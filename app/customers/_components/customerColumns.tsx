"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import type { Column } from "@/components/ui/DataTable";
import { usePrefetch } from "@/lib/hooks/useDk";
import { formatAmount, timeAgo } from "@/lib/format";
import type { Customer } from "@/lib/api/types/customers";

/** The customer table columns shared by the list page and the groups page. */
export const customerColumns: Column<Customer>[] = [
  {
    key: "number",
    header: "Number",
    width: "130px",
    render: (c) => <span className="font-mono text-xs text-soot">{c.Number}</span>,
  },
  {
    key: "name",
    header: "Name",
    render: (c) => <span className="font-medium text-ink">{c.Name || "–"}</span>,
  },
  { key: "ssn", header: "SSN", render: (c) => c.SSNumber || <span className="text-mist">–</span> },
  {
    key: "group",
    header: "Group",
    render: (c) => (c.Group ? <Badge>{c.Group}</Badge> : <span className="text-mist">–</span>),
  },
  {
    key: "balance",
    header: "Balance",
    align: "right",
    render: (c) => <span className="tnum">{formatAmount(c.BalanceAmount)}</span>,
  },
  {
    key: "blocked",
    header: "Status",
    align: "center",
    render: (c) =>
      c.Blocked ? <Badge tone="red">Blocked</Badge> : <span className="text-mist">–</span>,
  },
  {
    key: "modified",
    header: "Modified",
    align: "right",
    render: (c) => <span className="text-fog">{timeAgo(c.Modified)}</span>,
  },
];

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
