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
import { useT } from "@/lib/i18n";
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
  const t = useT();
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
        onSuccess: () =>
          toast.success(t("sales.invoice.refreshed", { number }), t("sales.invoice.refreshedDetail")),
        onError: (e) => toast.error(t("sales.invoice.refreshFailed"), e.message),
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
            credit?.Number
              ? t("sales.invoice.reversedCredit", { number: credit.Number })
              : t("sales.invoice.reversed"),
            t("sales.invoice.reversedDetail", { number }),
          );
          if (credit?.Number) router.push(`/sales/invoices/${encodeURIComponent(credit.Number)}`);
        },
        onError: (e) => {
          setReverseOpen(false);
          toast.error(t("sales.invoice.reverseFailed"), e.message);
        },
      },
    );
  }

  const lineColumns: Column<SalesInvoiceLine>[] = [
    { key: "item", header: t("sales.col.item"), width: "120px", render: (l) => <span className="font-medium text-ink">{l.ItemCode}</span> },
    {
      key: "text",
      header: t("sales.col.text"),
      render: (l) => (
        <div className="min-w-0">
          <p className="truncate">{l.Text || "–"}</p>
          {l.Text2 && <p className="truncate text-xs text-fog">{l.Text2}</p>}
        </div>
      ),
    },
    { key: "wh", header: t("sales.col.warehouse"), width: "100px", render: (l) => l.Warehouse || "–" },
    { key: "qty", header: t("sales.col.qty"), align: "right", width: "70px", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    { key: "price", header: t("sales.col.unitPrice"), align: "right", render: (l) => <span className="tnum">{formatAmount(l.UnitPrice, inv?.Currency ?? "ISK")}</span> },
    { key: "disc", header: t("sales.col.discountShort"), align: "right", width: "70px", render: (l) => <span className="tnum">{formatPercent(l.Discount, 0)}</span> },
    {
      key: "total",
      header: t("sales.col.totalWithTax"),
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
            aria-label={t("sales.invoice.backAria")}
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
            {t("sales.entity.invoice", { number })}
            {inv && <SettledBadge invoice={inv} />}
            {inv?.SalesType === 1 && <Badge tone="red">{t("sales.invoice.credit")}</Badge>}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => pdf.download(`/sales/invoice/${enc}/pdf`, `invoice-${number}.pdf`)} loading={pdf.busy}>
            <Download className="size-4" /> {t("sales.actions.pdf")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setHtmlOpen(true)}>
            <Eye className="size-4" /> {t("sales.actions.preview")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            <Mail className="size-4" /> {t("sales.actions.email")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPlanOpen(true)}>
            <CalendarDays className="size-4" /> {t("sales.invoice.paymentPlan")}
          </Button>
          <Button variant="secondary" size="sm" onClick={doRefresh} loading={refresh.isPending}>
            <RefreshCw className="size-4" /> {t("ui.refresh")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setReverseOpen(true)}>
            <ArrowRightLeft className="size-4" /> {t("sales.invoice.reverse")}
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
                {t("sales.card.customer")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: t("sales.kv.name"), value: inv.CName },
                  { label: t("sales.kv.number"), value: inv.CNumber },
                  { label: t("sales.kv.ssn"), value: inv.CSSNumber },
                  { label: t("sales.kv.address"), value: [inv.CAddress1, inv.CAddress2].filter(Boolean).join(", ") },
                  { label: t("sales.kv.zipCountry"), value: [inv.CZipCode, inv.CCountryCode].filter(Boolean).join(" ") },
                  { label: t("sales.kv.phone"), value: inv.CPhone },
                  { label: t("sales.kv.contact"), value: inv.CContact },
                  { label: t("sales.kv.receiver"), value: inv.IRName },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<ReceiptText />} className="mb-5">
                {t("sales.card.invoice")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: t("sales.kv.invoiceDate"), value: formatDate(inv.InvoiceDate) },
                  { label: t("sales.kv.dueDate"), value: formatDate(inv.DueDate) },
                  { label: t("sales.kv.reference"), value: inv.Reference },
                  { label: t("sales.kv.salesperson"), value: inv.SalePerson },
                  { label: t("sales.kv.paymentTerm"), value: inv.PaymentTerm },
                  { label: t("sales.kv.salesType"), value: inv.SalesType === 1 ? t("sales.kv.credit") : t("sales.kv.debit") },
                  { label: t("sales.kv.orderNumber"), value: inv.OrderNumber ? String(inv.OrderNumber) : "" },
                  { label: t("sales.kv.project"), value: inv.Project },
                  { label: t("sales.kv.voucher"), value: inv.Voucher },
                  { label: t("sales.kv.claimStatus"), value: inv.ClaimStatus ? String(inv.ClaimStatus) : "" },
                  { label: t("sales.kv.recordId"), value: inv.RecordID != null ? String(inv.RecordID) : "" },
                ]}
              />
            </Card>
          </div>

          <Card className="p-6">
            <CardTitle icon={<Banknote />} className="mb-5">
              {t("sales.card.totals")}
            </CardTitle>
            <KV
              columns={3}
              items={[
                { label: t("sales.kv.total"), value: formatAmount(inv.TotalAmount, inv.Currency ?? "ISK") },
                {
                  label: t("sales.kv.totalWithTax"),
                  value: (
                    <span className={clsx((inv.TotalAmountWithTax ?? 0) < 0 && "text-danger")}>
                      {formatAmount(inv.TotalAmountWithTax, inv.Currency ?? "ISK")}
                    </span>
                  ),
                },
                { label: t("sales.kv.settledAmount"), value: formatAmount(inv.SettledAmount, inv.Currency ?? "ISK") },
                { label: t("sales.kv.discount"), value: inv.Discount ? formatAmount(inv.Discount, inv.Currency ?? "ISK") : "" },
                { label: t("sales.kv.discountPercent"), value: inv.DiscountPercent ? formatPercent(inv.DiscountPercent, 0) : "" },
                { label: t("sales.kv.currency"), value: inv.Currency },
                { label: t("sales.kv.exchange"), value: inv.Exchange != null && inv.Exchange !== 1 ? formatNumber(inv.Exchange) : "" },
              ]}
            />
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>{t("sales.card.lines")}</CardTitle>
              <span className="text-[13px] text-fog tnum">{t("sales.lines.count", { n: inv.Lines?.length ?? 0 })}</span>
            </div>
            <DataTable
              columns={lineColumns}
              rows={inv.Lines ?? []}
              rowKey={(l, i) => `${l.SequenceNumber ?? "seq"}-${l.ItemCode ?? "item"}-${i}`}
              emptyTitle={t("sales.invoice.linesEmptyTitle")}
              emptyBody={t("sales.invoice.linesEmptyBody")}
            />
          </Card>

          <JsonView data={inv} />
        </>
      ) : null}

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        path={`/sales/invoice/${enc}/email`}
        kind="invoice"
        number={number}
      />
      <HtmlPreviewDialog
        open={htmlOpen}
        onClose={() => setHtmlOpen(false)}
        path={`/sales/invoice/${enc}/html`}
        title={t("sales.entity.invoice", { number })}
      />
      <PaymentPlanDialog open={planOpen} onClose={() => setPlanOpen(false)} invoiceNumber={number} />

      <ConfirmDialog
        open={reverseOpen}
        onClose={() => setReverseOpen(false)}
        title={t("sales.invoice.confirmReverseTitle", { number })}
        body={t("sales.invoice.confirmReverseBody", { number })}
        confirmLabel={t("sales.invoice.confirmReverseAction")}
        loading={reverse.isPending}
        onConfirm={doReverse}
      />
    </div>
  );
}
