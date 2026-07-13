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
      header: "Journal date",
      width: "120px",
      render: (t) => <span className="tnum">{formatDate(t.JournalDate ?? t.Created)}</span>,
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
      key: "created",
      header: "Created",
      width: "150px",
      render: (t) => <span className="tnum text-fog">{formatDateTime(t.Created)}</span>,
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/ledger")}>
          <ArrowLeft className="size-4" /> All accounts
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {account?.Name || account?.Description || `Account ${number}`}
        </h2>
        <span className="font-mono text-xs text-mist">Nº {number}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            accounts.refetch();
            tx.refetch();
          }}
          aria-label="Refresh account"
        >
          <RefreshCw className={tx.isFetching || accounts.isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      <Card className="p-6">
        <CardTitle icon={<Landmark />} className="mb-5">
          Account
        </CardTitle>
        {account ? (
          <KV
            items={[
              { label: "Number", value: String(account.Number) },
              { label: "Name", value: account.Name || account.Description },
              { label: "Tax code", value: account.TaxCode },
              {
                label: "Tax percent",
                value: account.TaxPercent != null ? formatPercent(account.TaxPercent) : undefined,
              },
              {
                label: "Status",
                value:
                  accountActive(account) == null ? undefined : accountActive(account) ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Inactive</Badge>
                  ),
              },
              { label: "Modified", value: account.Modified ? formatDate(account.Modified) : undefined },
            ]}
          />
        ) : (
          <p className="text-sm text-fog">
            {accounts.isLoading
              ? "Loading account details…"
              : "Account details not found in the chart of accounts — showing transactions below."}
          </p>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
          <CardTitle icon={<ArrowRightLeft />}>Transactions</CardTitle>
          <span className="text-[13px] text-fog tnum">
            Page sum: <span className="font-medium text-ink">{formatAmount(pageTotal)}</span>
          </span>
        </div>
        <DataTable<LedgerTransaction>
          columns={columns}
          rows={tx.data}
          rowKey={(t, i) => t.ID ?? `${t.Voucher ?? ""}-${i}`}
          loading={tx.isLoading || tx.isFetching}
          error={tx.error}
          onRetry={() => tx.refetch()}
          emptyTitle="No transactions"
          emptyBody={`No ledger transactions have been posted to account ${number}${page > 1 ? " on this page" : ""}.`}
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={tx.isFetching} />}
        />
      </Card>

      <JsonView data={{ Account: account ?? null, Transactions: tx.data ?? [] }} />
    </div>
  );
}
