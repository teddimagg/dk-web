"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { ArrowLeft, FileText, IdCard, Pencil, ReceiptText, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { ErrorState } from "@/components/ui/EmptyState";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate } from "@/lib/format";
import type { Vendor, VendorTransaction } from "@/lib/api/types/vendors";
import { transactionText } from "../_components/helpers";
import { NewVendorInvoiceForm } from "../_components/NewVendorInvoiceForm";
import { VendorFormDialog } from "../_components/VendorFormDialog";

const TX_PAGE_SIZE = 25;

export default function VendorDetailPage() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("transactions");
  const [txPage, setTxPage] = useState(1);

  const vendorQuery = useDkQuery<Vendor>(["vendor", number], `/vendor/${encodeURIComponent(number)}`);
  const vendor = vendorQuery.data;

  const txQuery = useDkQuery<VendorTransaction[]>(
    ["vendor-transactions", number, txPage],
    `/vendor/${encodeURIComponent(number)}/transaction/${txPage}/${TX_PAGE_SIZE}`,
    { placeholderData: keepPreviousData, enabled: tab === "transactions" },
  );
  const txHasMore = (txQuery.data?.length ?? 0) === TX_PAGE_SIZE;

  const txColumns: Column<VendorTransaction>[] = [
    { key: "date", header: t("vendors.col.date"), width: "110px", render: (tx) => formatDate(tx.Date ?? tx.Created) },
    { key: "voucher", header: t("vendors.col.voucher"), render: (tx) => <span className="font-mono text-xs">{tx.Voucher ?? "–"}</span> },
    { key: "reference", header: t("vendors.col.reference"), render: (tx) => tx.Reference ?? "–" },
    { key: "text", header: t("vendors.col.text"), render: (tx) => <span className="text-fog">{transactionText(tx)}</span> },
    { key: "due", header: t("vendors.col.due"), width: "110px", render: (tx) => formatDate(tx.DueDate) },
    {
      key: "amount",
      header: t("vendors.col.amount"),
      align: "right",
      render: (tx) => <span className="tnum font-medium">{formatAmount(tx.Amount, tx.Currency || "ISK")}</span>,
    },
    {
      key: "balance",
      header: t("vendors.col.balance"),
      align: "right",
      render: (tx) => <span className="tnum text-fog">{formatAmount(tx.Balance ?? tx.Remaining, tx.Currency || "ISK")}</span>,
    },
  ];

  if (vendorQuery.error) {
    return (
      <Card>
        <ErrorState error={vendorQuery.error} onRetry={vendorQuery.refetch} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/vendors"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
            aria-label={t("vendors.detail.back")}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            {vendor ? (
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                {vendor.Name ?? number}
                {vendor.Blocked && <Badge tone="red">{t("vendors.badge.blocked")}</Badge>}
                {vendor.Inactive && <Badge tone="amber">{t("vendors.badge.inactive")}</Badge>}
              </h2>
            ) : (
              <Skeleton className="h-6 w-56" />
            )}
            <p className="text-[13px] text-fog tnum">{t("vendors.detail.vendorNo", { number })}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)} disabled={!vendor}>
          <Pencil className="size-4" /> {t("vendors.detail.edit")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardTitle icon={<IdCard />} className="mb-5">
            {t("vendors.detail.identity")}
          </CardTitle>
          {vendor ? (
            <KV
              columns={1}
              items={[
                { label: t("vendors.col.number"), value: vendor.Number },
                { label: t("vendors.col.ssn"), value: vendor.SSNumber },
                { label: t("vendors.field.alias"), value: vendor.Alias },
                { label: t("vendors.field.ledgerCode"), value: vendor.LedgerCode },
                { label: t("vendors.field.paymentMode"), value: vendor.PaymentMode },
                { label: t("vendors.field.paymentTerm"), value: vendor.PaymentTerm },
                { label: t("vendors.field.currency"), value: vendor.CurrencyCode },
                { label: t("vendors.field.bankAccount"), value: vendor.BankAccount },
                {
                  label: t("vendors.field.balance"),
                  value: vendor.Balance != null ? formatAmount(vendor.Balance, vendor.CurrencyCode || "ISK") : null,
                },
                { label: t("vendors.field.created"), value: formatDate(vendor.Created) === "–" ? null : formatDate(vendor.Created) },
                { label: t("vendors.field.modified"), value: formatDate(vendor.Modified) === "–" ? null : formatDate(vendor.Modified) },
              ]}
            />
          ) : (
            <Skeleton className="h-48" />
          )}
        </Card>
        <Card className="p-6">
          <CardTitle icon={<Truck />} className="mb-5">
            {t("vendors.detail.contact")}
          </CardTitle>
          {vendor ? (
            <KV
              columns={1}
              items={[
                { label: t("vendors.field.address"), value: vendor.Address1 },
                { label: t("vendors.field.address2"), value: vendor.Address2 },
                { label: t("vendors.field.zipCity"), value: [vendor.ZipCode, vendor.City].filter(Boolean).join(" ") },
                { label: t("vendors.field.country"), value: vendor.Country },
                { label: t("vendors.col.phone"), value: vendor.Phone },
                { label: t("vendors.field.fax"), value: vendor.Fax },
                { label: t("vendors.col.email"), value: vendor.Email },
                { label: t("vendors.field.contact"), value: vendor.ContactName },
                { label: t("vendors.field.comment"), value: vendor.Comment },
              ]}
            />
          ) : (
            <Skeleton className="h-48" />
          )}
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: "transactions", label: t("vendors.tabs.transactions") },
          { id: "new-invoice", label: t("vendors.detail.newInvoiceTab") },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "transactions" && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <CardTitle icon={<ReceiptText />}>{t("vendors.detail.transactions")}</CardTitle>
          </div>
          <DataTable
            columns={txColumns}
            rows={txQuery.data}
            rowKey={(tx, i) => tx.ID ?? tx.RecordID ?? `${tx.Voucher ?? ""}-${i}`}
            loading={txQuery.isLoading || (txQuery.isFetching && !txQuery.data)}
            error={txQuery.error}
            onRetry={txQuery.refetch}
            emptyTitle={t("vendors.tx.emptyTitle")}
            emptyBody={t("vendors.detail.txEmptyBody", { number })}
            footer={<Pagination page={txPage} onPage={setTxPage} hasMore={txHasMore} loading={txQuery.isFetching} />}
          />
        </Card>
      )}

      {tab === "new-invoice" && (
        <Card className="p-6">
          <CardTitle icon={<FileText />} className="mb-5">
            {t("vendors.detail.newInvoiceFor", { name: vendor?.Name ?? number })}
          </CardTitle>
          <NewVendorInvoiceForm vendorNumber={number} vendorName={vendor?.Name} />
        </Card>
      )}

      {vendor && <JsonView data={vendor} />}

      {vendor && <VendorFormDialog open={editing} onClose={() => setEditing(false)} vendor={vendor} />}
    </div>
  );
}
