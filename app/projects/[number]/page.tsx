"use client";

import { ArrowLeft, FolderKanban, ReceiptText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import type { Project, ProjectInvoice } from "@/lib/api/types/projects";

function invoiceNumber(inv: ProjectInvoice): string {
  const n = inv.Number ?? inv.InvoiceNumber ?? inv.Reference;
  return n == null ? "–" : String(n);
}

export default function ProjectDetailPage() {
  const params = useParams<{ number: string }>();
  const raw = params?.number;
  const number = decodeURIComponent(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""));
  const router = useRouter();
  const [tab, setTab] = useState("details");

  const project = useDkQuery<Project>(
    ["project", number],
    `/project/${encodeURIComponent(number)}`,
    { enabled: !!number },
  );

  const invoices = useDkQuery<ProjectInvoice[]>(
    ["project", number, "invoices"],
    `/project/${encodeURIComponent(number)}/invoice`,
    { enabled: !!number },
  );

  const p = project.data;

  const invoiceColumns: Column<ProjectInvoice>[] = [
    {
      key: "number",
      header: "Invoice",
      width: "110px",
      render: (inv) => <span className="font-mono text-xs text-soot">{invoiceNumber(inv)}</span>,
    },
    {
      key: "date",
      header: "Date",
      width: "110px",
      render: (inv) => <span className="tnum">{formatDate(inv.Date)}</span>,
    },
    {
      key: "due",
      header: "Due date",
      width: "110px",
      render: (inv) => <span className="tnum">{formatDate(inv.DueDate)}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (inv) =>
        inv.Customer?.Name || inv.Customer?.Number ? (
          <span className="text-ink">
            {inv.Customer?.Name ?? "–"}
            {inv.Customer?.Number && (
              <span className="ml-1.5 font-mono text-xs text-mist">{inv.Customer.Number}</span>
            )}
          </span>
        ) : (
          <span className="text-mist">–</span>
        ),
    },
    {
      key: "reference",
      header: "Reference",
      render: (inv) => <span className="text-fog">{inv.Reference || "–"}</span>,
    },
    {
      key: "total",
      header: "Total incl. tax",
      align: "right",
      render: (inv) => (
        <span className="tnum font-medium">
          {formatAmount(inv.TotalAmountWithTax ?? inv.TotalAmount, inv.Currency ?? "ISK")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
          <ArrowLeft className="size-4" /> All projects
        </Button>
        {project.isLoading ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {p?.Name || `Project ${number}`}
          </h2>
        )}
        <span className="font-mono text-xs text-mist">Nº {number}</span>
        {p?.Closed != null &&
          (p.Closed ? <Badge tone="red">Closed</Badge> : <Badge tone="green">Open</Badge>)}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            project.refetch();
            invoices.refetch();
          }}
          aria-label="Refresh project"
        >
          <RefreshCw
            className={project.isFetching || invoices.isFetching ? "size-4 animate-spin" : "size-4"}
          />
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "details", label: "Details" },
          { id: "invoices", label: "Invoices", count: invoices.data?.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "details" && (
        <Card className="p-6">
          <CardTitle icon={<FolderKanban />} className="mb-5">
            Project details
          </CardTitle>
          {project.error ? (
            <ErrorState error={project.error} onRetry={() => project.refetch()} />
          ) : project.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : (
            <KV
              items={[
                { label: "Number", value: String(p?.Number ?? number) },
                { label: "Name", value: p?.Name },
                { label: "Description", value: p?.Description },
                { label: "Manager", value: p?.Manager },
                { label: "Contact", value: p?.Contact },
                { label: "Start date", value: p?.StartDate ? formatDate(p.StartDate) : undefined },
                { label: "End date", value: p?.EndDate ? formatDate(p.EndDate) : undefined },
                { label: "Created", value: p?.Created ? formatDate(p.Created) : undefined },
                { label: "Modified", value: p?.Modified ? formatDate(p.Modified) : undefined },
                {
                  label: "Status",
                  value:
                    p?.Closed == null ? undefined : p.Closed ? (
                      <Badge tone="red">Closed</Badge>
                    ) : (
                      <Badge tone="green">Open</Badge>
                    ),
                },
              ]}
            />
          )}
        </Card>
      )}

      {tab === "invoices" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <CardTitle icon={<ReceiptText />}>Invoices for this project</CardTitle>
            <span className="text-[13px] text-fog">Rows open the invoice in Sales</span>
          </div>
          <DataTable<ProjectInvoice>
            columns={invoiceColumns}
            rows={invoices.data}
            rowKey={(inv, i) => `${invoiceNumber(inv)}-${i}`}
            loading={invoices.isLoading || invoices.isFetching}
            error={invoices.error}
            onRetry={() => invoices.refetch()}
            onRowClick={(inv) =>
              router.push(`/sales/invoices/${encodeURIComponent(invoiceNumber(inv))}`)
            }
            emptyTitle="No invoices"
            emptyBody="No sales invoices have been created for this project yet."
          />
        </Card>
      )}

      <JsonView data={tab === "invoices" ? invoices.data : project.data} />

      <p className="text-[13px] text-fog">
        Looking for project postings? See the{" "}
        <Link href="/projects/transactions" className="font-medium text-ink underline underline-offset-2">
          project transaction feed
        </Link>
        .
      </p>
    </div>
  );
}
