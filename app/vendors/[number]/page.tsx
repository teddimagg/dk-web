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
import { formatAmount, formatDate } from "@/lib/format";
import type { Vendor, VendorTransaction } from "@/lib/api/types/vendors";
import { transactionText } from "../_components/helpers";
import { NewVendorInvoiceForm } from "../_components/NewVendorInvoiceForm";
import { VendorFormDialog } from "../_components/VendorFormDialog";

const TX_PAGE_SIZE = 25;

export default function VendorDetailPage() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
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
    { key: "date", header: "Date", width: "110px", render: (t) => formatDate(t.Date ?? t.Created) },
    { key: "voucher", header: "Voucher", render: (t) => <span className="font-mono text-xs">{t.Voucher ?? "–"}</span> },
    { key: "reference", header: "Reference", render: (t) => t.Reference ?? "–" },
    { key: "text", header: "Text", render: (t) => <span className="text-fog">{transactionText(t)}</span> },
    { key: "due", header: "Due date", width: "110px", render: (t) => formatDate(t.DueDate) },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (t) => <span className="tnum font-medium">{formatAmount(t.Amount, t.Currency || "ISK")}</span>,
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (t) => <span className="tnum text-fog">{formatAmount(t.Balance ?? t.Remaining, t.Currency || "ISK")}</span>,
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
            aria-label="Back to vendors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            {vendor ? (
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                {vendor.Name ?? number}
                {vendor.Blocked && <Badge tone="red">Blocked</Badge>}
                {vendor.Inactive && <Badge tone="amber">Inactive</Badge>}
              </h2>
            ) : (
              <Skeleton className="h-6 w-56" />
            )}
            <p className="text-[13px] text-fog tnum">Vendor Nº {number}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)} disabled={!vendor}>
          <Pencil className="size-4" /> Edit vendor
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardTitle icon={<IdCard />} className="mb-5">
            Identity & terms
          </CardTitle>
          {vendor ? (
            <KV
              columns={1}
              items={[
                { label: "Number", value: vendor.Number },
                { label: "SSN", value: vendor.SSNumber },
                { label: "Alias", value: vendor.Alias },
                { label: "Ledger code", value: vendor.LedgerCode },
                { label: "Payment mode", value: vendor.PaymentMode },
                { label: "Payment term", value: vendor.PaymentTerm },
                { label: "Currency", value: vendor.CurrencyCode },
                { label: "Bank account", value: vendor.BankAccount },
                {
                  label: "Balance",
                  value: vendor.Balance != null ? formatAmount(vendor.Balance, vendor.CurrencyCode || "ISK") : null,
                },
                { label: "Created", value: formatDate(vendor.Created) === "–" ? null : formatDate(vendor.Created) },
                { label: "Modified", value: formatDate(vendor.Modified) === "–" ? null : formatDate(vendor.Modified) },
              ]}
            />
          ) : (
            <Skeleton className="h-48" />
          )}
        </Card>
        <Card className="p-6">
          <CardTitle icon={<Truck />} className="mb-5">
            Contact
          </CardTitle>
          {vendor ? (
            <KV
              columns={1}
              items={[
                { label: "Address", value: vendor.Address1 },
                { label: "Address 2", value: vendor.Address2 },
                { label: "Zip / City", value: [vendor.ZipCode, vendor.City].filter(Boolean).join(" ") },
                { label: "Country", value: vendor.Country },
                { label: "Phone", value: vendor.Phone },
                { label: "Fax", value: vendor.Fax },
                { label: "Email", value: vendor.Email },
                { label: "Contact", value: vendor.ContactName },
                { label: "Comment", value: vendor.Comment },
              ]}
            />
          ) : (
            <Skeleton className="h-48" />
          )}
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: "transactions", label: "Transactions" },
          { id: "new-invoice", label: "New vendor invoice" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "transactions" && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <CardTitle icon={<ReceiptText />}>Vendor transactions</CardTitle>
          </div>
          <DataTable
            columns={txColumns}
            rows={txQuery.data}
            rowKey={(t, i) => t.ID ?? t.RecordID ?? `${t.Voucher ?? ""}-${i}`}
            loading={txQuery.isLoading || (txQuery.isFetching && !txQuery.data)}
            error={txQuery.error}
            onRetry={txQuery.refetch}
            emptyTitle="No transactions"
            emptyBody={`No ledger transactions found for vendor ${number}.`}
            footer={<Pagination page={txPage} onPage={setTxPage} hasMore={txHasMore} loading={txQuery.isFetching} />}
          />
        </Card>
      )}

      {tab === "new-invoice" && (
        <Card className="p-6">
          <CardTitle icon={<FileText />} className="mb-5">
            New vendor invoice for {vendor?.Name ?? number}
          </CardTitle>
          <NewVendorInvoiceForm vendorNumber={number} vendorName={vendor?.Name} />
        </Card>
      )}

      {vendor && <JsonView data={vendor} />}

      {vendor && <VendorFormDialog open={editing} onClose={() => setEditing(false)} vendor={vendor} />}
    </div>
  );
}
