"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { ArrowLeft, ArrowRightLeft, Landmark, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate, formatDateTime, formatPercent } from "@/lib/format";
import type { LedgerAccount, LedgerTransaction } from "@/lib/api/types/ledger";

const COUNT = 50;

function accountActive(a: LedgerAccount): boolean | undefined {
  if (a.Active != null) return a.Active;
  if (a.IsActive != null) return a.IsActive;
  if (a.Blocked != null) return !a.Blocked;
  return undefined;
}

export default function LedgerAccountDetailPage() {
  const t = useT();
  const params = useParams<{ number: string }>();
  const raw = params?.number;
  const number = decodeURIComponent(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""));
  const router = useRouter();
  const [page, setPage] = useState(1);

  // No single-account GET exists — reuse the cached chart of accounts for the header.
  const accounts = useDkQuery<LedgerAccount[]>(["ledger", "accounts"], "/generalLedger/account");
  const account = useMemo(
    () => accounts.data?.find((a) => String(a.Number) === number),
    [accounts.data, number],
  );

  const tx = useDkQuery<LedgerTransaction[]>(
    ["ledger", "account", number, "tx", page],
    `/generalledger/account/${encodeURIComponent(number)}/transaction/${page}/${COUNT}`,
    { enabled: !!number, placeholderData: keepPreviousData },
  );

  const hasMore = (tx.data?.length ?? 0) === COUNT;
  const pageTotal = useMemo(
    () => (tx.data ?? []).reduce((sum, t) => sum + (t.Amount ?? 0), 0),
    [tx.data],
  );

  const columns: Column<LedgerTransaction>[] = [
    {
      key: "date",
      header: t("ledger.tx.colDate"),
      width: "120px",
      render: (row) => <span className="tnum">{formatDate(row.JournalDate ?? row.Created)}</span>,
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
      key: "created",
      header: t("ledger.tx.colCreated"),
      width: "150px",
      render: (row) => <span className="tnum text-fog">{formatDateTime(row.Created)}</span>,
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/ledger")}>
          <ArrowLeft className="size-4" /> {t("ledger.account.back")}
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {account?.Name || account?.Description || t("ledger.account.fallbackName", { number })}
        </h2>
        <span className="font-mono text-xs text-mist">
          {t("ledger.account.numberTag", { number })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            accounts.refetch();
            tx.refetch();
          }}
          aria-label={t("ledger.account.refreshAria")}
        >
          <RefreshCw className={tx.isFetching || accounts.isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      <Card className="p-6">
        <CardTitle icon={<Landmark />} className="mb-5">
          {t("ledger.account.cardTitle")}
        </CardTitle>
        {account ? (
          <KV
            items={[
              { label: t("ledger.field.number"), value: String(account.Number) },
              { label: t("ledger.field.name"), value: account.Name || account.Description },
              { label: t("ledger.field.taxCode"), value: account.TaxCode },
              {
                label: t("ledger.field.taxPercent"),
                value: account.TaxPercent != null ? formatPercent(account.TaxPercent) : undefined,
              },
              {
                label: t("ledger.field.status"),
                value:
                  accountActive(account) == null ? undefined : accountActive(account) ? (
                    <Badge tone="green">{t("ledger.status.active")}</Badge>
                  ) : (
                    <Badge tone="neutral">{t("ledger.status.inactive")}</Badge>
                  ),
              },
              {
                label: t("ledger.field.modified"),
                value: account.Modified ? formatDate(account.Modified) : undefined,
              },
            ]}
          />
        ) : (
          <p className="text-sm text-fog">
            {accounts.isLoading ? t("ledger.account.loading") : t("ledger.account.notFound")}
          </p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
          <CardTitle icon={<ArrowRightLeft />}>{t("ledger.account.txTitle")}</CardTitle>
          <span className="text-[13px] text-fog tnum">
            {t("ledger.account.pageSum")}{" "}
            <span className="font-medium text-ink">{formatAmount(pageTotal)}</span>
          </span>
        </div>
        <DataTable<LedgerTransaction>
          columns={columns}
          rows={tx.data}
          rowKey={(row, i) => row.ID ?? `${row.Voucher ?? ""}-${i}`}
          loading={tx.isLoading || tx.isFetching}
          error={tx.error}
          onRetry={() => tx.refetch()}
          emptyTitle={t("ledger.account.emptyTitle")}
          emptyBody={
            page > 1
              ? t("ledger.account.emptyBodyPage", { number })
              : t("ledger.account.emptyBody", { number })
          }
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={tx.isFetching} />}
        />
      </Card>

      <JsonView data={{ Account: account ?? null, Transactions: tx.data ?? [] }} />
    </div>
  );
}
