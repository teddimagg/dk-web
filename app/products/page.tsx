"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Download, Package, Plus, RefreshCw, Search, Warehouse, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatAmount, formatNumber, timeAgo } from "@/lib/format";
import {
  productGroupCode,
  productGroupLabel,
  warehouseCode,
  warehouseLabel,
  type Product,
  type ProductGroup,
  type ProductWarehouseInfo,
} from "@/lib/api/types/products";
import { ProductFormDialog } from "./_components/ProductFormDialog";
import { useDebouncedValue } from "./_components/useDebouncedValue";

const COUNT = 40;

export default function ProductsCataloguePage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const toast = useToast();
  const t = useT();
  const company = useActiveCompany();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [modifiedSince, setModifiedSince] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const searching = debouncedSearch.length >= 2;

  const filterParams = new URLSearchParams();
  if (group) filterParams.set("group", group);
  if (warehouse) filterParams.set("warehouse", warehouse);
  const qs = filterParams.toString() ? `?${filterParams.toString()}` : "";

  // Paged catalogue (GET /Product/page/:page/:count) or, with a date filter,
  // modified-since paging (GET /Product/modified/:modifieddate/:page/:size).
  const listPath = modifiedSince
    ? `/Product/modified/${modifiedSince}/${page}/${COUNT}${qs}`
    : `/Product/page/${page}/${COUNT}${qs}`;

  const list = useDkQuery<Product[]>(
    ["products", "list", modifiedSince || "all", group, warehouse, page],
    listPath,
    { placeholderData: keepPreviousData, enabled: !searching },
  );

  // Debounced free-text search (GET /Product/search/:searchstring).
  const searchResults = useDkQuery<Product[]>(
    ["products", "search", debouncedSearch],
    `/Product/search/${encodeURIComponent(debouncedSearch)}`,
    { enabled: searching, placeholderData: keepPreviousData },
  );

  const groups = useDkQuery<ProductGroup[]>(["productgroups"], "/productgroup");
  const warehouses = useDkQuery<ProductWarehouseInfo[]>(["productwarehouses"], "/productwarehouse");

  const active = searching ? searchResults : list;
  const rows = active.data;
  const hasMore = !searching && (rows?.length ?? 0) === COUNT;

  async function exportJson() {
    if (!company) return;
    setExporting(true);
    try {
      // Fetch-all route (GET /Product) with the current group/warehouse filters.
      const blob = await dkFetchBlob(`/Product${qs}`, { token: company.token });
      downloadBlob(blob, `products-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success(t("products.exportReady"), t("products.exportReadyDetail"));
    } catch (err) {
      toast.error(t("products.exportFailed"), err instanceof Error ? err.message : undefined);
    } finally {
      setExporting(false);
    }
  }

  const columns: Column<Product>[] = [
    {
      key: "code",
      header: t("products.itemCode"),
      render: (p) => (
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium">{p.ItemCode}</span>
          {p.Inactive && <Badge tone="red">{t("products.inactive")}</Badge>}
        </span>
      ),
    },
    {
      key: "desc",
      header: t("products.description"),
      render: (p) => (
        <span className="block max-w-[320px]">
          <span className="block truncate font-medium">{p.Description || "–"}</span>
          {p.Description2 && <span className="block truncate text-xs text-fog">{p.Description2}</span>}
        </span>
      ),
    },
    {
      key: "group",
      header: t("products.group"),
      render: (p) => (p.Group ? <Badge>{p.Group}</Badge> : <span className="text-mist">–</span>),
    },
    {
      key: "qty",
      header: t("products.inStock"),
      align: "right",
      render: (p) => <span className="tnum">{formatNumber(p.TotalQuantityInWarehouse)}</span>,
    },
    {
      key: "price",
      header: t("products.unitPrice"),
      align: "right",
      render: (p) => <span className="tnum font-medium">{formatAmount(p.UnitPrice1, p.CurrencyCode || "ISK")}</span>,
    },
    {
      key: "modified",
      header: t("products.modifiedAt"),
      render: (p) => <span className="text-fog">{timeAgo(p.RecordModified)}</span>,
    },
  ];

  const warehouseChips = (warehouses.data ?? [])
    .map((w) => ({ code: warehouseCode(w), label: warehouseLabel(w) }))
    .filter((w, i, arr) => w.code !== "" && arr.findIndex((x) => x.code === w.code) === i)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <Input
              className="w-64 pl-9"
              placeholder={t("products.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("products.searchAria")}
            />
          </div>
          <Select
            className="w-44"
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setPage(1);
            }}
            aria-label={t("products.filterByGroupAria")}
          >
            <option value="">{t("products.allGroups")}</option>
            {(groups.data ?? []).map((g, i) => {
              const code = productGroupCode(g);
              if (!code) return null;
              return (
                <option key={`${code}-${i}`} value={code}>
                  {productGroupLabel(g)}
                </option>
              );
            })}
          </Select>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-fog">{t("products.modifiedSince")}</span>
            <Input
              type="date"
              className="w-40"
              value={modifiedSince}
              onChange={(e) => {
                setModifiedSince(e.target.value);
                setPage(1);
              }}
              aria-label={t("products.modifiedSinceAria")}
            />
            {modifiedSince && (
              <button
                onClick={() => {
                  setModifiedSince("");
                  setPage(1);
                }}
                aria-label={t("products.clearDateFilter")}
                className="grid size-7 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-haze hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => active.refetch()} aria-label={t("products.refreshList")}>
              <RefreshCw className={clsx("size-4", active.isFetching && "animate-spin")} />
            </Button>
            <Button variant="secondary" size="sm" onClick={exportJson} loading={exporting}>
              <Download className="size-4" /> {t("products.exportJson")}
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> {t("products.newProduct")}
            </Button>
          </div>
        </div>

        {warehouseChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-mist">
              <Warehouse className="size-3.5" /> {t("products.warehouses")}
            </span>
            {warehouseChips.map((w) => {
              const isActive = warehouse === w.code;
              return (
                <button
                  key={w.code}
                  onClick={() => {
                    setWarehouse(isActive ? "" : w.code);
                    setPage(1);
                  }}
                  title={w.label}
                  aria-pressed={isActive}
                  className="cursor-pointer"
                >
                  <Badge tone={isActive ? "ink" : "neutral"}>{w.code}</Badge>
                </button>
              );
            })}
            {warehouse && (
              <button
                onClick={() => {
                  setWarehouse("");
                  setPage(1);
                }}
                className="cursor-pointer text-xs text-fog underline hover:text-ink"
              >
                {t("products.clearFilter")}
              </button>
            )}
          </div>
        )}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p, i) => p.ItemCode ?? i}
          loading={active.isFetching}
          error={active.error}
          onRetry={() => active.refetch()}
          onRowClick={(p) => router.push(`/products/${encodeURIComponent(p.ItemCode)}`)}
          onRowHover={(p) => prefetch(["product", p.ItemCode], `/Product/${encodeURIComponent(p.ItemCode)}`)}
          emptyTitle={searching ? t("products.emptySearchTitle") : t("products.emptyTitle")}
          emptyBody={
            searching ? t("products.emptySearchBody", { term: debouncedSearch }) : t("products.emptyBody")
          }
          emptyAction={
            !searching ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> {t("products.newProduct")}
              </Button>
            ) : undefined
          }
          footer={
            searching ? (
              <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-[13px] text-fog">
                <Package className="size-4" />
                {t((rows?.length ?? 0) === 1 ? "products.searchResults1" : "products.searchResultsN", {
                  n: rows?.length ?? 0,
                  term: debouncedSearch,
                })}
              </div>
            ) : (
              <Pagination page={page} onPage={setPage} hasMore={hasMore} loading={active.isFetching} />
            )
          }
        />
      </Card>

      <ProductFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(p) => {
          if (p?.ItemCode) router.push(`/products/${encodeURIComponent(p.ItemCode)}`);
        }}
      />
    </div>
  );
}
