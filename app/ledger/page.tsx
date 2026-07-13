"use client";

import { Landmark, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatPercent } from "@/lib/format";
import type { LedgerAccount } from "@/lib/api/types/ledger";

const TX_COUNT = 50;

function accountName(a: LedgerAccount): string {
  return a.Name || a.Description || "–";
}

function isActive(a: LedgerAccount): boolean | undefined {
  if (a.Active != null) return a.Active;
  if (a.IsActive != null) return a.IsActive;
  if (a.Blocked != null) return !a.Blocked;
  return undefined;
}

export default function LedgerAccountsPage() {
  const t = useT();
  const router = useRouter();
  const prefetch = usePrefetch();
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<LedgerAccount[]>(
    ["ledger", "accounts"],
    "/generalLedger/account",
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data?.filter((a) =>
      [a.Number, a.Name, a.Description, a.TaxCode].some(
        (v) => v != null && String(v).toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const columns: Column<LedgerAccount>[] = [
    {
      key: "number",
      header: t("ledger.col.account"),
      width: "110px",
      render: (a) => <span className="font-mono text-xs text-soot">{String(a.Number)}</span>,
    },
    {
      key: "name",
      header: t("ledger.field.name"),
      render: (a) => <span className="font-medium text-ink">{accountName(a)}</span>,
    },
    {
      key: "taxcode",
      header: t("ledger.field.taxCode"),
      width: "100px",
      render: (a) => <span className="text-fog">{a.TaxCode || "–"}</span>,
    },
    {
      key: "taxpercent",
      header: t("ledger.col.taxPercent"),
      width: "90px",
      align: "right",
      render: (a) => (
        <span className="tnum text-fog">{a.TaxPercent != null ? formatPercent(a.TaxPercent) : "–"}</span>
      ),
    },
    {
      key: "status",
      header: t("ledger.field.status"),
      width: "100px",
      render: (a) => {
        const active = isActive(a);
        if (active == null) return <span className="text-mist">–</span>;
        return active ? (
          <Badge tone="green">{t("ledger.status.active")}</Badge>
        ) : (
          <Badge tone="neutral">{t("ledger.status.inactive")}</Badge>
        );
      },
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <CardTitle icon={<Landmark />}>{t("ledger.accounts.title")}</CardTitle>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("ledger.accounts.filterPlaceholder")}
            className="w-72 pl-9"
            aria-label={t("ledger.accounts.filterAria")}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          aria-label={t("ledger.accounts.refreshAria")}
        >
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      <DataTable<LedgerAccount>
        columns={columns}
        rows={filtered}
        rowKey={(a, i) => `${String(a.Number)}-${i}`}
        loading={isLoading || isFetching}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(a) => router.push(`/ledger/accounts/${encodeURIComponent(String(a.Number))}`)}
        onRowHover={(a) =>
          prefetch(
            ["ledger", "account", String(a.Number), "tx", 1],
            `/generalledger/account/${encodeURIComponent(String(a.Number))}/transaction/1/${TX_COUNT}`,
          )
        }
        emptyTitle={t("ledger.accounts.emptyTitle")}
        emptyBody={search ? t("ledger.accounts.emptySearch") : t("ledger.accounts.emptyNone")}
        footer={
          <div className="border-t border-line px-4 py-3 text-[13px] text-fog tnum">
            {search && data
              ? t("ledger.accounts.countFiltered", { n: filtered?.length ?? 0, total: data.length })
              : t("ledger.accounts.count", { n: filtered?.length ?? 0 })}
          </div>
        }
      />
    </Card>
  );
}
