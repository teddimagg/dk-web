"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Layers, Plus, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { Vendor } from "@/lib/api/types/vendors";
import { useDebounced } from "./_components/helpers";
import { VendorFormDialog } from "./_components/VendorFormDialog";

const PAGE_SIZE = 40;

export default function VendorsPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const t = useT();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);

  const q = useDebounced(search.trim());
  const searching = q.length > 0;

  const key = searching
    ? ["vendors", "search", q]
    : showAll
      ? ["vendors", "all"]
      : ["vendors", "page", page];
  const path = searching
    ? `/vendor/search/${encodeURIComponent(q)}`
    : showAll
      ? "/vendor"
      : `/vendor/page/${page}/${PAGE_SIZE}`;

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Vendor[]>(key, path, {
    placeholderData: keepPreviousData,
  });
  const hasMore = (data?.length ?? 0) === PAGE_SIZE;
  const count = data?.length ?? 0;

  const columns: Column<Vendor>[] = [
    {
      key: "number",
      header: t("vendors.col.number"),
      width: "130px",
      render: (v) => <span className="font-mono text-xs text-fog">{v.Number}</span>,
    },
    {
      key: "name",
      header: t("vendors.col.name"),
      render: (v) => (
        <span className="flex items-center gap-2 font-medium text-ink">
          {v.Name ?? "–"}
          {v.Blocked && <Badge tone="red">{t("vendors.badge.blocked")}</Badge>}
          {v.Inactive && <Badge tone="amber">{t("vendors.badge.inactive")}</Badge>}
        </span>
      ),
    },
    { key: "ssn", header: t("vendors.col.ssn"), render: (v) => <span className="tnum">{v.SSNumber ?? "–"}</span> },
    { key: "phone", header: t("vendors.col.phone"), render: (v) => v.Phone ?? "–" },
    { key: "email", header: t("vendors.col.email"), render: (v) => v.Email ?? "–" },
    { key: "payment", header: t("vendors.col.payment"), render: (v) => v.PaymentMode ?? "–" },
    { key: "ledger", header: t("vendors.col.ledger"), render: (v) => v.LedgerCode ?? "–" },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("vendors.list.searchPlaceholder")}
              className="pl-9"
              aria-label={t("vendors.list.searchAria")}
            />
          </div>
          {!searching && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAll((a) => !a);
                setPage(1);
              }}
            >
              <Layers className="size-4" /> {showAll ? t("vendors.list.pagedView") : t("vendors.list.loadAll")}
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label={t("vendors.list.refreshAria")}>
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {t("vendors.list.new")}
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={data}
          rowKey={(v, i) => v.Number ?? i}
          loading={isLoading || (isFetching && !data)}
          error={error}
          onRetry={refetch}
          emptyTitle={searching ? t("vendors.list.emptySearchTitle", { term: q }) : t("vendors.list.emptyTitle")}
          emptyBody={searching ? t("vendors.list.emptySearchBody") : t("vendors.list.emptyBody")}
          onRowClick={(v) => router.push(`/vendors/${encodeURIComponent(v.Number)}`)}
          onRowHover={(v) => prefetch(["vendor", v.Number], `/vendor/${encodeURIComponent(v.Number)}`)}
          footer={
            !searching && !showAll ? (
              <Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />
            ) : (
              <div className="border-t border-line px-4 py-3 text-[13px] text-fog tnum">
                {searching
                  ? t(count === 1 ? "vendors.list.countFound1" : "vendors.list.countFoundN", { n: count })
                  : t(count === 1 ? "vendors.list.countLoaded1" : "vendors.list.countLoadedN", { n: count })}
              </div>
            )
          }
        />
      </Card>

      <VendorFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(number) => router.push(`/vendors/${encodeURIComponent(number)}`)}
      />
    </div>
  );
}
