"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { ArrowRightLeft, Filter, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import type { LedgerTransaction } from "@/lib/api/types/ledger";

const COUNT = 50;

interface Filters {
  createdAfter: string;
  createdBefore: string;
  account: string;
  voucher: string;
  reference: string;
}

const EMPTY_FILTERS: Filters = {
  createdAfter: "",
  createdBefore: "",
  account: "",
  voucher: "",
  reference: "",
};

function buildQuery(f: Filters): string {
  const qs = new URLSearchParams();
  if (f.createdAfter) qs.set("createdAfter", `${f.createdAfter}T00:00:00`);
  if (f.createdBefore) qs.set("createdBefore", `${f.createdBefore}T00:00:00`);
  if (f.account.trim()) qs.set("account", f.account.trim());
  if (f.voucher.trim()) qs.set("voucher", f.voucher.trim());
  if (f.reference.trim()) qs.set("reference", f.reference.trim());
  const q = qs.toString();
  return q ? `?${q}` : "";
}

export default function LedgerTransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const query = buildQuery(applied);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<LedgerTransaction[]>(
    ["ledger", "transactions", page, applied],
    `/generalledger/transaction/page/${page}/${COUNT}${query}`,
    { placeholderData: keepPreviousData },
  );

  const hasMore = (data?.length ?? 0) === COUNT;
  const hasFilters = Object.values(applied).some((v) => v !== "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    setApplied(draft);
    setPage(1);
  }

  function clear() {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  const columns: Column<LedgerTransaction>[] = [
    {
      key: "date",
      header: "Journal date",
      width: "120px",
      render: (t) => <span className="tnum">{formatDate(t.JournalDate ?? t.Created)}</span>,
    },
    {
      key: "account",
      header: "Account",
      width: "100px",
      render: (t) => <span className="font-mono text-xs text-soot">{t.Account ?? "–"}</span>,
    },
    {
      key: "text",
      header: "Text",
      render: (t) => <span className="block max-w-md truncate text-ink">{t.Text || "–"}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      width: "110px",
      render: (t) => <span className="text-fog">{t.Reference || "–"}</span>,
    },
    {
      key: "voucher",
      header: "Voucher",
      width: "100px",
      render: (t) => <span className="text-fog">{t.Voucher || "–"}</span>,
    },
    {
      key: "taxcode",
      header: "Tax code",
      width: "90px",
      render: (t) => <span className="text-fog">{t.TaxCode || "–"}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (t) => (
        <span className="tnum font-medium">{formatAmount(t.Amount, t.Currency ?? "ISK")}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardTitle icon={<Filter />} className="mb-4">
          Filter ledger transactions
        </CardTitle>
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
          <Field label="Created after" className="w-40">
            <Input
              type="date"
              value={draft.createdAfter}
              onChange={(e) => setDraft({ ...draft, createdAfter: e.target.value })}
            />
          </Field>
          <Field label="Created before" className="w-40">
            <Input
              type="date"
              value={draft.createdBefore}
              onChange={(e) => setDraft({ ...draft, createdBefore: e.target.value })}
            />
          </Field>
          <Field label="Account" className="w-32">
            <Input
              value={draft.account}
              onChange={(e) => setDraft({ ...draft, account: e.target.value })}
              placeholder="e.g. 1150"
            />
          </Field>
          <Field label="Voucher" className="w-32">
            <Input
              value={draft.voucher}
              onChange={(e) => setDraft({ ...draft, voucher: e.target.value })}
              placeholder="e.g. s21"
            />
          </Field>
          <Field label="Reference" className="w-32">
            <Input
              value={draft.reference}
              onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              placeholder="e.g. S001"
            />
          </Field>
          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" size="sm" variant="secondary">
              <Filter className="size-4" /> Apply
            </Button>
            {hasFilters && (
              <Button type="button" size="sm" variant="ghost" onClick={clear}>
                <X className="size-4" /> Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <CardTitle icon={<ArrowRightLeft />}>Ledger transaction feed</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-fog">Rows open the account</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh transactions">
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
        </div>
        <DataTable<LedgerTransaction>
          columns={columns}
          rows={data}
          rowKey={(t, i) => t.ID ?? `${t.Voucher ?? ""}-${i}`}
          loading={isLoading || isFetching}
          error={error}
          onRetry={() => refetch()}
          onRowClick={(t) =>
            t.Account ? router.push(`/ledger/accounts/${encodeURIComponent(t.Account)}`) : undefined
          }
          emptyTitle="No ledger transactions"
          emptyBody={
            hasFilters
              ? "Nothing matches the current filters — widen the date range or clear them."
              : "No transactions have been posted to the general ledger yet."
          }
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>
    </div>
  );
}
