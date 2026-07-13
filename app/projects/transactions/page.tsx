"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { ArrowRightLeft, Filter, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate } from "@/lib/format";
import type { ProjectTransaction } from "@/lib/api/types/projects";

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

export default function ProjectTransactionsPage() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const query = buildQuery(applied);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<ProjectTransaction[]>(
    ["projects", "transactions", page, applied],
    `/project/transaction/page/${page}/${COUNT}${query}`,
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

  const columns: Column<ProjectTransaction>[] = [
    {
      key: "date",
      header: t("projects.tx.colDate"),
      width: "120px",
      render: (tx) => <span className="tnum">{formatDate(tx.JournalDate ?? tx.Created)}</span>,
    },
    {
      key: "project",
      header: t("projects.tx.colProject"),
      width: "110px",
      render: (tx) => (
        <span className="font-mono text-xs text-soot">
          {tx.Project ?? tx.Number ?? tx.Dim1 ?? "–"}
        </span>
      ),
    },
    {
      key: "account",
      header: t("projects.tx.colAccount"),
      width: "100px",
      render: (tx) => <span className="font-mono text-xs text-soot">{tx.Account ?? "–"}</span>,
    },
    {
      key: "text",
      header: t("projects.tx.colText"),
      render: (tx) => <span className="block max-w-md truncate text-ink">{tx.Text || "–"}</span>,
    },
    {
      key: "reference",
      header: t("projects.tx.colReference"),
      width: "110px",
      render: (tx) => <span className="text-fog">{tx.Reference || "–"}</span>,
    },
    {
      key: "voucher",
      header: t("projects.tx.colVoucher"),
      width: "100px",
      render: (tx) => <span className="text-fog">{tx.Voucher || "–"}</span>,
    },
    {
      key: "amount",
      header: t("projects.tx.colAmount"),
      align: "right",
      render: (tx) => (
        <span className="tnum font-medium">{formatAmount(tx.Amount, tx.Currency ?? "ISK")}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardTitle icon={<Filter />} className="mb-4">
          {t("projects.tx.filterTitle")}
        </CardTitle>
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
          <Field label={t("projects.tx.createdAfter")} className="w-40">
            <Input
              type="date"
              value={draft.createdAfter}
              onChange={(e) => setDraft({ ...draft, createdAfter: e.target.value })}
            />
          </Field>
          <Field label={t("projects.tx.createdBefore")} className="w-40">
            <Input
              type="date"
              value={draft.createdBefore}
              onChange={(e) => setDraft({ ...draft, createdBefore: e.target.value })}
            />
          </Field>
          <Field label={t("projects.tx.account")} className="w-32">
            <Input
              value={draft.account}
              onChange={(e) => setDraft({ ...draft, account: e.target.value })}
              placeholder={t("projects.tx.accountPh")}
            />
          </Field>
          <Field label={t("projects.tx.voucher")} className="w-32">
            <Input
              value={draft.voucher}
              onChange={(e) => setDraft({ ...draft, voucher: e.target.value })}
              placeholder={t("projects.tx.voucherPh")}
            />
          </Field>
          <Field label={t("projects.tx.reference")} className="w-32">
            <Input
              value={draft.reference}
              onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              placeholder={t("projects.tx.referencePh")}
            />
          </Field>
          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" size="sm" variant="secondary">
              <Filter className="size-4" /> {t("projects.tx.apply")}
            </Button>
            {hasFilters && (
              <Button type="button" size="sm" variant="ghost" onClick={clear}>
                <X className="size-4" /> {t("projects.tx.clear")}
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <CardTitle icon={<ArrowRightLeft />}>{t("projects.tx.feedTitle")}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            aria-label={t("projects.tx.refreshAria")}
          >
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </div>
        <DataTable<ProjectTransaction>
          columns={columns}
          rows={data}
          rowKey={(tx, i) => tx.ID ?? `${tx.Voucher ?? ""}-${i}`}
          loading={isLoading || isFetching}
          error={error}
          onRetry={() => refetch()}
          emptyTitle={t("projects.tx.emptyTitle")}
          emptyBody={hasFilters ? t("projects.tx.emptyFiltered") : t("projects.tx.emptyNone")}
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>
    </div>
  );
}
