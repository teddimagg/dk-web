"use client";

import { clsx } from "clsx";
import {
  ArrowLeft,
  ArrowRightLeft,
  Banknote,
  CalendarDays,
  Download,
  Eye,
  Mail,
  ReceiptText,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate, formatNumber, formatPercent } from "@/lib/format";
import type { SalesInvoice, SalesInvoiceLine } from "@/lib/api/types/sales";
import { EmailDialog } from "../../_components/EmailDialog";
import { HtmlPreviewDialog } from "../../_components/HtmlPreviewDialog";
import { PaymentPlanDialog } from "../../_components/PaymentPlanDialog";
import { SettledBadge } from "../../_components/SettledBadge";
import { usePdfDownload } from "../../_components/usePdfDownload";

export default function InvoiceDetailPage() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const enc = encodeURIComponent(number);
  const router = useRouter();
  const toast = useToast();
  const pdf = usePdfDownload();

  const [emailOpen, setEmailOpen] = useState(false);
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [reverseOpen, setReverseOpen] = useState(false);

  const { data: inv, isLoading, error, refetch } = useDkQuery<SalesInvoice>(
    ["sales-invoice", number],
    `/sales/invoice/${enc}`,
  );

  const refresh = useDkMutation<SalesInvoice>({
    invalidates: [["sales-invoice", number], ["sales-invoices"]],
  });
  const reverse = useDkMutation<SalesInvoice>({
    invalidates: [["sales-invoice", number], ["sales-invoices"]],
  });

  function doRefresh() {
    refresh.mutate(
      { path: `/sales/invoice/${enc}/refresh`, method: "PATCH" },
      {
        onSuccess: () => toast.success(`Invoice ${number} refreshed`, "Recalculated by dkPlus and reloaded."),
        onError: (e) => toast.error("Could not refresh invoice", e.message),
      },
    );
  }

  function doReverse() {
    reverse.mutate(
      { path: `/sales/invoice/${enc}/reverse`, method: "POST" },
      {
        onSuccess: (credit) => {
          setReverseOpen(false);
          toast.success(
            credit?.Number ? `Credit invoice ${credit.Number} created` : "Reversing credit invoice created",
            `Invoice ${number} has been offset.`,
          );
          if (credit?.Number) router.push(`/sales/invoices/${encodeURIComponent(credit.Number)}`);
        },
        onError: (e) => {
          setReverseOpen(false);
          toast.error("Could not reverse invoice", e.message);
        },
      },
    );
  }

  const lineColumns: Column<SalesInvoiceLine>[] = [
    { key: "item", header: "Item", width: "120px", render: (l) => <span className="font-medium text-ink">{l.ItemCode}</span> },
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
    { key: "wh", header: "Warehouse", width: "100px", render: (l) => l.Warehouse || "–" },
    { key: "qty", header: "Qty", align: "right", width: "70px", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    { key: "price", header: "Unit price", align: "right", render: (l) => <span className="tnum">{formatAmount(l.UnitPrice, inv?.Currency ?? "ISK")}</span> },
    { key: "disc", header: "Disc.", align: "right", width: "70px", render: (l) => <span className="tnum">{formatPercent(l.Discount, 0)}</span> },
    {
      key: "total",
      header: "Total w/ tax",
      align: "right",
      render: (l) => (
        <span className={clsx("tnum font-medium", (l.TotalAmountWithTax ?? 0) < 0 ? "text-danger" : "text-ink")}>
          {formatAmount(l.TotalAmountWithTax, inv?.Currency ?? "ISK")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/sales/invoices"
            aria-label="Back to invoices"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
            Invoice {number}
            {inv && <SettledBadge invoice={inv} />}
            {inv?.SalesType === 1 && <Badge tone="red">Credit</Badge>}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => pdf.download(`/sales/invoice/${enc}/pdf`, `invoice-${number}.pdf`)} loading={pdf.busy}>
            <Download className="size-4" /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setHtmlOpen(true)}>
            <Eye className="size-4" /> Preview
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            <Mail className="size-4" /> Email
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPlanOpen(true)}>
            <CalendarDays className="size-4" /> Payment plan
          </Button>
          <Button variant="secondary" size="sm" onClick={doRefresh} loading={refresh.isPending}>
            <RefreshCw className="size-4" /> Refresh
          </Button>
          <Button variant="danger" size="sm" onClick={() => setReverseOpen(true)}>
            <ArrowRightLeft className="size-4" /> Reverse
          </Button>
        </div>
      </div>

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
      ) : inv ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<UserRound />} className="mb-5">
                Customer
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Name", value: inv.CName },
                  { label: "Number", value: inv.CNumber },
                  { label: "SSN", value: inv.CSSNumber },
                  { label: "Address", value: [inv.CAddress1, inv.CAddress2].filter(Boolean).join(", ") },
                  { label: "Zip / country", value: [inv.CZipCode, inv.CCountryCode].filter(Boolean).join(" ") },
                  { label: "Phone", value: inv.CPhone },
                  { label: "Contact", value: inv.CContact },
                  { label: "Receiver", value: inv.IRName },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<ReceiptText />} className="mb-5">
                Invoice
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Invoice date", value: formatDate(inv.InvoiceDate) },
                  { label: "Due date", value: formatDate(inv.DueDate) },
                  { label: "Reference", value: inv.Reference },
                  { label: "Salesperson", value: inv.SalePerson },
                  { label: "Payment term", value: inv.PaymentTerm },
                  { label: "Sales type", value: inv.SalesType === 1 ? "Credit" : "Debit" },
                  { label: "Order number", value: inv.OrderNumber ? String(inv.OrderNumber) : "" },
                  { label: "Project", value: inv.Project },
                  { label: "Voucher", value: inv.Voucher },
                  { label: "Claim status", value: inv.ClaimStatus ? String(inv.ClaimStatus) : "" },
                  { label: "Record ID", value: inv.RecordID != null ? String(inv.RecordID) : "" },
                ]}
              />
            </Card>
          </div>

          <Card className="p-6">
            <CardTitle icon={<Banknote />} className="mb-5">
              Totals
            </CardTitle>
            <KV
              columns={3}
              items={[
                { label: "Total", value: formatAmount(inv.TotalAmount, inv.Currency ?? "ISK") },
                {
                  label: "Total with tax",
                  value: (
                    <span className={clsx((inv.TotalAmountWithTax ?? 0) < 0 && "text-danger")}>
                      {formatAmount(inv.TotalAmountWithTax, inv.Currency ?? "ISK")}
                    </span>
                  ),
                },
                { label: "Settled amount", value: formatAmount(inv.SettledAmount, inv.Currency ?? "ISK") },
                { label: "Discount", value: inv.Discount ? formatAmount(inv.Discount, inv.Currency ?? "ISK") : "" },
                { label: "Discount %", value: inv.DiscountPercent ? formatPercent(inv.DiscountPercent, 0) : "" },
                { label: "Currency", value: inv.Currency },
                { label: "Exchange", value: inv.Exchange != null && inv.Exchange !== 1 ? formatNumber(inv.Exchange) : "" },
              ]}
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Lines</CardTitle>
              <span className="text-[13px] text-fog tnum">{inv.Lines?.length ?? 0} lines</span>
            </div>
            <DataTable
              columns={lineColumns}
              rows={inv.Lines ?? []}
              rowKey={(l, i) => `${l.SequenceNumber ?? "seq"}-${l.ItemCode ?? "item"}-${i}`}
              emptyTitle="No lines"
              emptyBody="This invoice has no lines — list endpoints omit lines by design."
            />
          </Card>

          <JsonView data={inv} />
        </>
      ) : null}

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        path={`/sales/invoice/${enc}/email`}
        entity={`Invoice ${number}`}
        defaultSubject={`Invoice ${number}`}
      />
      <HtmlPreviewDialog
        open={htmlOpen}
        onClose={() => setHtmlOpen(false)}
        path={`/sales/invoice/${enc}/html`}
        title={`Invoice ${number}`}
      />
      <PaymentPlanDialog open={planOpen} onClose={() => setPlanOpen(false)} invoiceNumber={number} />

      <ConfirmDialog
        open={reverseOpen}
        onClose={() => setReverseOpen(false)}
        title={`Reverse invoice ${number}?`}
        body={
          <>
            dk creates a <strong>reversing credit invoice</strong> that offsets invoice{" "}
            <strong>{number}</strong> — the original invoice stays untouched. This is the supported
            way to undo a posted invoice.
          </>
        }
        confirmLabel="Create credit invoice"
        loading={reverse.isPending}
        onConfirm={doReverse}
      />
    </div>
  );
}
