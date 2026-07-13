"use client";

import { clsx } from "clsx";
import { ArrowLeft, Download, Eye, FileText, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate, formatNumber } from "@/lib/format";
import type { SalesOrder, SalesOrderLine } from "@/lib/api/types/sales";
import { EmailDialog } from "../../_components/EmailDialog";
import { HtmlPreviewDialog } from "../../_components/HtmlPreviewDialog";
import { useRecentIds, RECENT_QUOTES_KEY } from "../../_components/recent";
import { usePdfDownload } from "../../_components/usePdfDownload";

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const enc = encodeURIComponent(id);
  const pdf = usePdfDownload();
  const { remember } = useRecentIds(RECENT_QUOTES_KEY);

  const [emailOpen, setEmailOpen] = useState(false);
  const [htmlOpen, setHtmlOpen] = useState(false);

  // Per the dkPlus doc, a quote's data is fetched through the order endpoint.
  const { data: quote, isLoading, error, refetch } = useDkQuery<SalesOrder>(
    ["sales-quote", id],
    `/sales/order/${enc}`,
  );

  useEffect(() => {
    if (quote) remember(id);
  }, [quote, id, remember]);

  const currency = quote?.Currency ?? "ISK";
  const lineColumns: Column<SalesOrderLine>[] = [
    { key: "item", header: "Item", width: "110px", render: (l) => <span className="font-medium text-ink">{l.ItemCode}</span> },
    {
      key: "text",
      header: "Text",
      render: (l) => (
        <div className="min-w-0">
          <p className="truncate">{l.Text || "–"}</p>
          {l.Text2 && <p className="truncate text-xs text-fog">{l.Text2}</p>}
        </div>
      ),
    },
    { key: "qty", header: "Qty", align: "right", width: "70px", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    {
      key: "price",
      header: "Unit price",
      align: "right",
      render: (l) => <span className="tnum">{formatAmount(l.UnitPrice ?? l.Price, currency)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (l) => (
        <span className={clsx("tnum font-medium", (l.TotalAmount ?? 0) < 0 ? "text-danger" : "text-ink")}>
          {formatAmount(l.TotalAmount, currency)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/sales/quotes"
            aria-label="Back to quotes"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Quote {id}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => pdf.download(`/sales/quote/${enc}/pdf`, `quote-${id}.pdf`)} loading={pdf.busy}>
            <Download className="size-4" /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setHtmlOpen(true)}>
            <Eye className="size-4" /> Preview
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            <Mail className="size-4" /> Email
          </Button>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-fog">
        Quote data is served by the shared order endpoint (GET /sales/order/:id) — the PDF, preview
        and email buttons above use the quote-specific routes.
      </p>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} />
        </Card>
      ) : quote ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<UserRound />} className="mb-5">
                Customer
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Name", value: quote.Customer?.Name },
                  { label: "Number", value: quote.Customer?.Number },
                  {
                    label: "Address",
                    value: [quote.Customer?.Address1, quote.Customer?.Address2].filter(Boolean).join(", "),
                  },
                  { label: "Zip", value: quote.Customer?.ZipCode },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<FileText />} className="mb-5">
                Quote
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Date", value: formatDate(quote.Date ?? quote.OrderDate) },
                  { label: "Reference", value: quote.Reference },
                  { label: "Salesperson", value: quote.SalePerson },
                  { label: "Currency", value: quote.Currency },
                  {
                    label: "Exchange",
                    value: quote.Exchange != null && quote.Exchange !== 1 ? formatNumber(quote.Exchange) : "",
                  },
                  { label: "Total", value: quote.TotalAmount != null ? formatAmount(quote.TotalAmount, currency) : "" },
                  { label: "Text", value: quote.Text1 },
                ]}
              />
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Lines</CardTitle>
              <span className="text-[13px] text-fog tnum">{quote.Lines?.length ?? 0} lines</span>
            </div>
            <DataTable
              columns={lineColumns}
              rows={quote.Lines ?? []}
              rowKey={(l, i) => `${l.SequenceNumber ?? "seq"}-${l.ItemCode ?? "item"}-${i}`}
              emptyTitle="No lines on this quote"
            />
          </Card>

          <JsonView data={quote} />
        </>
      ) : null}

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        path={`/sales/quote/${enc}/email`}
        entity={`Quote ${id}`}
        defaultSubject={`Quote ${id}`}
      />
      <HtmlPreviewDialog
        open={htmlOpen}
        onClose={() => setHtmlOpen(false)}
        path={`/sales/quote/${enc}/html`}
        title={`Quote ${id}`}
      />
    </div>
  );
}
