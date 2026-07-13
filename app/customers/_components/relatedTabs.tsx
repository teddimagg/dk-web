"use client";

import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate, timeAgo } from "@/lib/format";
import type {
  CustomerInvoice,
  CustomerProject,
  CustomerSalesDoc,
  CustomerTransaction,
} from "@/lib/api/types/customers";

/**
 * Related-data tabs on the customer detail page. Each component mounts only
 * while its tab is active, so the queries fire lazily. Transaction / order /
 * quote / project payload shapes are undocumented — columns render
 * best-effort fields and fall back to a dash.
 */

const dash = <span className="text-mist">–</span>;

/** GET /customer/:number/transaction */
export function TransactionsTab({ customerNumber }: { customerNumber: string }) {
  const q = useDkQuery<CustomerTransaction[]>(
    ["customer", customerNumber, "transactions"],
    `/customer/${encodeURIComponent(customerNumber)}/transaction`,
  );
  return (
    <DataTable<CustomerTransaction>
      columns={[
        {
          key: "date",
          header: "Date",
          width: "110px",
          render: (t) => formatDate(t.Date ?? t.TransactionDate ?? t.Created),
        },
        {
          key: "voucher",
          header: "Voucher",
          render: (t) => (
            <span className="font-mono text-xs text-soot">{t.Voucher ?? t.Number ?? "–"}</span>
          ),
        },
        { key: "text", header: "Text", render: (t) => t.Text || t.Reference || dash },
        {
          key: "due",
          header: "Due",
          width: "110px",
          render: (t) => formatDate(t.DueDate),
        },
        {
          key: "amount",
          header: "Amount",
          align: "right",
          render: (t) => (
            <span className="tnum">{formatAmount(t.Amount, t.Currency || t.CurrencyCode || "ISK")}</span>
          ),
        },
        {
          key: "balance",
          header: "Balance",
          align: "right",
          render: (t) =>
            t.Balance != null ? <span className="tnum">{formatAmount(t.Balance)}</span> : dash,
        },
      ]}
      rows={q.data}
      rowKey={(t, i) => t.RecordID ?? i}
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
      emptyTitle="No transactions"
      emptyBody="No ledger transactions recorded for this customer."
    />
  );
}

/** GET /customer/:number/order and GET /customer/:number/quote share a shape. */
export function SalesDocsTab({
  customerNumber,
  kind,
}: {
  customerNumber: string;
  kind: "order" | "quote";
}) {
  const q = useDkQuery<CustomerSalesDoc[]>(
    ["customer", customerNumber, `${kind}s`],
    `/customer/${encodeURIComponent(customerNumber)}/${kind}`,
  );
  return (
    <DataTable<CustomerSalesDoc>
      columns={[
        {
          key: "number",
          header: "Number",
          width: "120px",
          render: (d) => (
            <span className="font-mono text-xs text-soot">
              {d.Number ?? d.OrderNumber ?? d.QuoteNumber ?? "–"}
            </span>
          ),
        },
        {
          key: "date",
          header: "Date",
          width: "110px",
          render: (d) =>
            formatDate(
              (kind === "order" ? d.OrderDate : d.QuoteDate) ?? d.Date ?? d.Created ?? d.Modified,
            ),
        },
        { key: "reference", header: "Reference", render: (d) => d.Reference || d.Text1 || dash },
        { key: "project", header: "Project", render: (d) => d.Project || dash },
        {
          key: "salesperson",
          header: "Salesperson",
          render: (d) => d.SalePerson || d.SalesPerson || dash,
        },
        {
          key: "total",
          header: "Total",
          align: "right",
          render: (d) => (
            <span className="tnum">
              {formatAmount(d.TotalAmountWithTax ?? d.TotalAmount, d.Currency || "ISK")}
            </span>
          ),
        },
      ]}
      rows={q.data}
      rowKey={(d, i) => d.RecordID ?? i}
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
      emptyTitle={kind === "order" ? "No orders" : "No quotes"}
      emptyBody={
        kind === "order"
          ? "No sales orders exist for this customer."
          : "No quotes exist for this customer."
      }
    />
  );
}

/** GET /customer/:number/invoice — rows link into the Sales module. */
export function InvoicesTab({ customerNumber }: { customerNumber: string }) {
  const router = useRouter();
  const q = useDkQuery<CustomerInvoice[]>(
    ["customer", customerNumber, "invoices"],
    `/customer/${encodeURIComponent(customerNumber)}/invoice`,
  );
  return (
    <DataTable<CustomerInvoice>
      columns={[
        {
          key: "number",
          header: "Invoice",
          width: "110px",
          render: (inv) => <span className="font-mono text-xs text-soot">{inv.Number}</span>,
        },
        {
          key: "date",
          header: "Date",
          width: "110px",
          render: (inv) => formatDate(inv.InvoiceDate),
        },
        { key: "reference", header: "Reference", render: (inv) => inv.Reference || dash },
        { key: "project", header: "Project", render: (inv) => inv.Project || dash },
        {
          key: "salesperson",
          header: "Salesperson",
          render: (inv) => inv.SalePerson || dash,
        },
        {
          key: "total",
          header: "Total",
          align: "right",
          render: (inv) => (
            <span className="tnum">{formatAmount(inv.TotalAmount, inv.Currency || "ISK")}</span>
          ),
        },
        {
          key: "totalWithTax",
          header: "Total w/ tax",
          align: "right",
          render: (inv) => (
            <span className="tnum font-medium">
              {formatAmount(inv.TotalAmountWithTax, inv.Currency || "ISK")}
            </span>
          ),
        },
        {
          key: "open",
          header: "",
          align: "right",
          width: "40px",
          render: () => <ExternalLink className="ml-auto size-4 text-mist" />,
        },
      ]}
      rows={q.data}
      rowKey={(inv, i) => inv.RecordID ?? inv.Number ?? i}
      onRowClick={(inv) => router.push(`/sales/invoices/${encodeURIComponent(inv.Number)}`)}
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
      emptyTitle="No invoices"
      emptyBody="No invoices have been issued to this customer."
    />
  );
}

/** GET /customer/:number/project — rows link into the Projects module. */
export function ProjectsTab({ customerNumber }: { customerNumber: string }) {
  const router = useRouter();
  const q = useDkQuery<CustomerProject[]>(
    ["customer", customerNumber, "projects"],
    `/customer/${encodeURIComponent(customerNumber)}/project`,
  );
  return (
    <DataTable<CustomerProject>
      columns={[
        {
          key: "number",
          header: "Number",
          width: "130px",
          render: (p) => <span className="font-mono text-xs text-soot">{p.Number ?? "–"}</span>,
        },
        {
          key: "name",
          header: "Name",
          render: (p) => (
            <span className="font-medium text-ink">{p.Name || p.Description || "–"}</span>
          ),
        },
        { key: "group", header: "Group", render: (p) => p.Group || dash },
        {
          key: "status",
          header: "Status",
          render: (p) => (p.Status != null && p.Status !== "" ? String(p.Status) : dash),
        },
        {
          key: "modified",
          header: "Modified",
          align: "right",
          render: (p) => <span className="text-fog">{timeAgo(p.Modified ?? p.Created)}</span>,
        },
        {
          key: "open",
          header: "",
          align: "right",
          width: "40px",
          render: () => <ExternalLink className="ml-auto size-4 text-mist" />,
        },
      ]}
      rows={q.data}
      rowKey={(p, i) => p.RecordID ?? p.Number ?? i}
      onRowClick={(p) => {
        if (p.Number != null) router.push(`/projects/${encodeURIComponent(String(p.Number))}`);
      }}
      loading={q.isLoading}
      error={q.error}
      onRetry={() => q.refetch()}
      emptyTitle="No projects"
      emptyBody="This customer does not own any projects."
    />
  );
}
