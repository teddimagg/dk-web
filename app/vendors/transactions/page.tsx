"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Filter, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import type { VendorTransaction } from "@/lib/api/types/vendors";
import { transactionText } from "../_components/helpers";

const PAGE_SIZE = 40;

interface Filters {
  voucher: string;
  reference: string;
  dim1: string;
  createdAfter: string;
}

const NO_FILTERS: Filters = { voucher: "", reference: "", dim1: "", createdAfter: "" };

function buildQuery(f: Filters): string {
  const params = new URLSearchParams();
  if (f.voucher.trim()) params.set("Voucher", f.voucher.trim());
  if (f.reference.trim()) params.set("Reference", f.reference.trim());
  if (f.dim1.trim()) params.set("Dim1", f.dim1.trim());
  if (f.createdAfter) params.set("CreatedAfter", f.createdAfter);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function VendorTransactionsPage() {
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [applied, setApplied] = useState<Filters>(NO_FILTERS);

  const qs = buildQuery(applied);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<VendorTransaction[]>(
    ["vendor-transactions", "all", page, qs],
    `/vendor/transaction/${page}/${PAGE_SIZE}${qs}`,
    { placeholderData: keepPreviousData },
  );
  const hasMore = (data?.length ?? 0) === PAGE_SIZE;
  const hasFilters = buildQuery(applied) !== "";

  function apply(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setApplied(draft);
  }

  function clear() {
    setDraft(NO_FILTERS);
    setApplied(NO_FILTERS);
    setPage(1);
  }

  const columns: Column<VendorTransaction>[] = [
    { key: "date", header: "Date", width: "110px", render: (t) => formatDate(t.Date ?? t.Created) },
    {
      key: "vendor",
      header: "Vendor",
      render: (t) => {
        const number = t.VendorNumber ?? t.Vendor;
        if (t.VendorName && number) return `${t.VendorName} (${number})`;
        return t.VendorName ?? number ?? "–";
      },
    },
    { key: "voucher", header: "Voucher", render: (t) => <span className="font-mono text-xs">{t.Voucher ?? "–"}</span> },
    { key: "reference", header: "Reference", render: (t) => t.Reference ?? "–" },
    { key: "text", header: "Text", render: (t) => <span className="text-fog">{transactionText(t)}</span> },
    { key: "dim1", header: "Dim 1", width: "80px", render: (t) => t.Dim1 ?? "–" },
    { key: "due", header: "Due date", width: "110px", render: (t) => formatDate(t.DueDate) },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (t) => <span className="tnum font-medium">{formatAmount(t.Amount, t.Currency || "ISK")}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3 border-b border-line px-4 py-3">
          <Field label="Voucher" className="w-36">
            <Input
              value={draft.voucher}
              onChange={(e) => setDraft((d) => ({ ...d, voucher: e.target.value }))}
              placeholder="e.g. gr0108"
            />
          </Field>
          <Field label="Reference" className="w-36">
            <Input value={draft.reference} onChange={(e) => setDraft((d) => ({ ...d, reference: e.target.value }))} />
          </Field>
          <Field label="Dim 1" className="w-28">
            <Input value={draft.dim1} onChange={(e) => setDraft((d) => ({ ...d, dim1: e.target.value }))} />
          </Field>
          <Field label="Created after" className="w-44">
            <Input
              type="date"
              value={draft.createdAfter}
              onChange={(e) => setDraft((d) => ({ ...d, createdAfter: e.target.value }))}
            />
          </Field>
          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" variant="secondary" size="sm">
              <Filter className="size-4" /> Apply
            </Button>
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
          <div className="ml-auto pb-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              aria-label="Refresh transactions"
            >
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
        </form>

        <DataTable
          columns={columns}
          rows={data}
          rowKey={(t, i) => t.ID ?? t.RecordID ?? `${t.Voucher ?? ""}-${i}`}
          loading={isLoading || (isFetching && !data)}
          error={error}
          onRetry={refetch}
          emptyTitle="No transactions"
          emptyBody={
            hasFilters
              ? "No vendor transactions match the current filters."
              : "Vendor ledger transactions will appear here."
          }
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>
    </div>
  );
}
