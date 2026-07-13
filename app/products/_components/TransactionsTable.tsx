"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatAmount, formatDate, formatNumber, timeAgo } from "@/lib/format";
import type { ProductTransaction } from "@/lib/api/types/products";

const COUNT = 40;

/**
 * Paged product-transaction table shared by the global feed
 * (GET /product/transaction/:page/:count) and the per-product tab
 * (GET /product/:number/transaction/:page/:count).
 */
export function TransactionsTable({
  pathFor,
  queryKey,
  showItemCode = true,
  linkToProduct = false,
  emptyTitle = "No transactions",
  emptyBody,
}: {
  pathFor: (page: number, count: number) => string;
  queryKey: readonly unknown[];
  showItemCode?: boolean;
  linkToProduct?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const prefetch = usePrefetch();

  // Reset to page 1 whenever the underlying filter/key changes.
  const keySignature = JSON.stringify(queryKey);
  useEffect(() => {
    setPage(1);
  }, [keySignature]);

  const { data, isFetching, error, refetch } = useDkQuery<ProductTransaction[]>(
    [...queryKey, page],
    pathFor(page, COUNT),
    { placeholderData: keepPreviousData },
  );
  const hasMore = (data?.length ?? 0) === COUNT;

  const columns: Column<ProductTransaction>[] = [
    { key: "date", header: "Journal date", render: (t) => formatDate(t.JournalDate) },
  ];
  if (showItemCode) {
    columns.push({
      key: "item",
      header: "Item",
      render: (t) => <span className="font-mono text-xs">{t.ItemCode || "–"}</span>,
    });
  }
  columns.push(
    { key: "wh", header: "Warehouse", render: (t) => <span className="uppercase">{t.Warehouse || "–"}</span> },
    {
      key: "text",
      header: "Text",
      render: (t) => (
        <span className="block max-w-[260px] truncate text-fog" title={t.Text}>
          {t.Text || "–"}
        </span>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      align: "right",
      render: (t) => <span className="tnum font-medium">{formatNumber(t.Quantity)}</span>,
    },
    {
      key: "cost",
      header: "Cost amount",
      align: "right",
      render: (t) => <span className="tnum">{formatAmount(t.CostAmount, t.CurrencyCode || "ISK")}</span>,
    },
    {
      key: "sales",
      header: "Sales amount",
      align: "right",
      render: (t) => <span className="tnum">{formatAmount(t.SalesAmount, t.CurrencyCode || "ISK")}</span>,
    },
    { key: "created", header: "Created", render: (t) => <span className="text-fog">{timeAgo(t.Created)}</span> },
  );

  return (
    <DataTable
      columns={columns}
      rows={data}
      rowKey={(t, i) => t.ID ?? i}
      loading={isFetching}
      error={error}
      onRetry={() => refetch()}
      onRowClick={
        linkToProduct
          ? (t) => {
              if (t.ItemCode) router.push(`/products/${encodeURIComponent(t.ItemCode)}`);
            }
          : undefined
      }
      onRowHover={
        linkToProduct
          ? (t) => {
              if (t.ItemCode) prefetch(["product", t.ItemCode], `/Product/${encodeURIComponent(t.ItemCode)}`);
            }
          : undefined
      }
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
    />
  );
}
