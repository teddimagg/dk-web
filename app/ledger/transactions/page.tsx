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
import { useT } from "@/lib/i18n";
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
  const t = useT();
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
      header: t("ledger.tx.colDate"),
      width: "120px",
      render: (row) => <span className="tnum">{formatDate(row.JournalDate ?? row.Created)}</span>,
    },
    {
      key: "account",
      header: t("ledger.tx.colAccount"),
      width: "100px",
      render: (row) => <span className="font-mono text-xs text-soot">{row.Account ?? "–"}</span>,
    },
    {
      key: "text",
      header: t("ledger.tx.colText"),
      render: (row) => <span className="block max-w-md truncate text-ink">{row.Text || "–"}</span>,
    },
    {
      key: "reference",
      header: t("ledger.tx.colReference"),
      width: "110px",
      render: (row) => <span className="text-fog">{row.Reference || "–"}</span>,
    },
    {
      key: "voucher",
      header: t("ledger.tx.colVoucher"),
      width: "100px",
      render: (row) => <span className="text-fog">{row.Voucher || "–"}</span>,
    },
    {
      key: "taxcode",
      header: t("ledger.tx.colTaxCode"),
      width: "90px",
      render: (row) => <span className="text-fog">{row.TaxCode || "–"}</span>,
    },
    {
      key: "amount",
      header: t("ledger.tx.colAmount"),
      align: "right",
      render: (row) => (
        <span className="tnum font-medium">{formatAmount(row.Amount, row.Currency ?? "ISK")}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardTitle icon={<Filter />} className="mb-4">
          {t("ledger.tx.filterTitle")}
        </CardTitle>
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
          <Field label={t("ledger.tx.createdAfter")} className="w-40">
            <Input
              type="date"
              value={draft.createdAfter}
              onChange={(e) => setDraft({ ...draft, createdAfter: e.target.value })}
            />
          </Field>
          <Field label={t("ledger.tx.createdBefore")} className="w-40">
            <Input
              type="date"
              value={draft.createdBefore}
              onChange={(e) => setDraft({ ...draft, createdBefore: e.target.value })}
            />
          </Field>
          <Field label={t("ledger.tx.account")} className="w-32">
            <Input
              value={draft.account}
              onChange={(e) => setDraft({ ...draft, account: e.target.value })}
              placeholder={t("ledger.tx.accountPh")}
            />
          </Field>
          <Field label={t("ledger.tx.voucher")} className="w-32">
            <Input
              value={draft.voucher}
              onChange={(e) => setDraft({ ...draft, voucher: e.target.value })}
              placeholder={t("ledger.tx.voucherPh")}
            />
          </Field>
          <Field label={t("ledger.tx.reference")} className="w-32">
            <Input
              value={draft.reference}
              onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              placeholder={t("ledger.tx.referencePh")}
            />
          </Field>
          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" size="sm" variant="secondary">
              <Filter className="size-4" /> {t("ledger.tx.apply")}
            </Button>
            {hasFilters && (
              <Button type="button" size="sm" variant="ghost" onClick={clear}>
                <X className="size-4" /> {t("ledger.tx.clear")}
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <CardTitle icon={<ArrowRightLeft />}>{t("ledger.tx.feedTitle")}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-fog">{t("ledger.tx.rowsHint")}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              aria-label={t("ledger.tx.refreshAria")}
            >
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
        </div>
        <DataTable<LedgerTransaction>
          columns={columns}
          rows={data}
          rowKey={(row, i) => row.ID ?? `${row.Voucher ?? ""}-${i}`}
          loading={isLoading || isFetching}
          error={error}
          onRetry={() => refetch()}
          onRowClick={(row) =>
            row.Account
              ? router.push(`/ledger/accounts/${encodeURIComponent(row.Account)}`)
              : undefined
          }
          emptyTitle={t("ledger.tx.emptyTitle")}
          emptyBody={hasFilters ? t("ledger.tx.emptyFiltered") : t("ledger.tx.emptyNone")}
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>
    </div>
  );
}
