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
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate } from "@/lib/format";
import type { Project, ProjectInvoice } from "@/lib/api/types/projects";

function invoiceNumber(inv: ProjectInvoice): string {
  const n = inv.Number ?? inv.InvoiceNumber ?? inv.Reference;
  return n == null ? "–" : String(n);
}

export default function ProjectDetailPage() {
  const t = useT();
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
      header: t("projects.invoice.number"),
      width: "110px",
      render: (inv) => <span className="font-mono text-xs text-soot">{invoiceNumber(inv)}</span>,
    },
    {
      key: "date",
      header: t("projects.invoice.date"),
      width: "110px",
      render: (inv) => <span className="tnum">{formatDate(inv.Date)}</span>,
    },
    {
      key: "due",
      header: t("projects.invoice.dueDate"),
      width: "110px",
      render: (inv) => <span className="tnum">{formatDate(inv.DueDate)}</span>,
    },
    {
      key: "customer",
      header: t("projects.invoice.customer"),
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
      header: t("projects.invoice.reference"),
      render: (inv) => <span className="text-fog">{inv.Reference || "–"}</span>,
    },
    {
      key: "total",
      header: t("projects.invoice.total"),
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
          <ArrowLeft className="size-4" /> {t("projects.detail.back")}
        </Button>
        {project.isLoading ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {p?.Name || t("projects.detail.fallbackName", { number })}
          </h2>
        )}
        <span className="font-mono text-xs text-mist">
          {t("projects.detail.numberTag", { number })}
        </span>
        {p?.Closed != null &&
          (p.Closed ? (
            <Badge tone="red">{t("projects.status.closed")}</Badge>
          ) : (
            <Badge tone="green">{t("projects.status.open")}</Badge>
          ))}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            project.refetch();
            invoices.refetch();
          }}
          aria-label={t("projects.detail.refreshAria")}
        >
          <RefreshCw
            className={project.isFetching || invoices.isFetching ? "size-4 animate-spin" : "size-4"}
          />
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "details", label: t("projects.detail.tabDetails") },
          { id: "invoices", label: t("projects.detail.tabInvoices"), count: invoices.data?.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "details" && (
        <Card className="p-6">
          <CardTitle icon={<FolderKanban />} className="mb-5">
            {t("projects.detail.cardTitle")}
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
                { label: t("projects.field.number"), value: String(p?.Number ?? number) },
                { label: t("projects.field.name"), value: p?.Name },
                { label: t("projects.field.description"), value: p?.Description },
                { label: t("projects.field.manager"), value: p?.Manager },
                { label: t("projects.field.contact"), value: p?.Contact },
                {
                  label: t("projects.field.startDate"),
                  value: p?.StartDate ? formatDate(p.StartDate) : undefined,
                },
                {
                  label: t("projects.field.endDate"),
                  value: p?.EndDate ? formatDate(p.EndDate) : undefined,
                },
                {
                  label: t("projects.field.created"),
                  value: p?.Created ? formatDate(p.Created) : undefined,
                },
                {
                  label: t("projects.field.modified"),
                  value: p?.Modified ? formatDate(p.Modified) : undefined,
                },
                {
                  label: t("projects.field.status"),
                  value:
                    p?.Closed == null ? undefined : p.Closed ? (
                      <Badge tone="red">{t("projects.status.closed")}</Badge>
                    ) : (
                      <Badge tone="green">{t("projects.status.open")}</Badge>
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
            <CardTitle icon={<ReceiptText />}>{t("projects.detail.invoicesTitle")}</CardTitle>
            <span className="text-[13px] text-fog">{t("projects.detail.invoicesHint")}</span>
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
            emptyTitle={t("projects.detail.invoicesEmptyTitle")}
            emptyBody={t("projects.detail.invoicesEmptyBody")}
          />
        </Card>
      )}

      <JsonView data={tab === "invoices" ? invoices.data : project.data} />

      <p className="text-[13px] text-fog">
        {t("projects.detail.postingsBefore")}{" "}
        <Link href="/projects/transactions" className="font-medium text-ink underline underline-offset-2">
          {t("projects.detail.postingsLink")}
        </Link>
        {t("projects.detail.postingsAfter")}
      </p>
    </div>
  );
}
