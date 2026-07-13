"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
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
  emptyTitle,
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
  const t = useT();

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
    { key: "date", header: t("products.journalDate"), render: (tx) => formatDate(tx.JournalDate) },
  ];
  if (showItemCode) {
    columns.push({
      key: "item",
      header: t("products.item"),
      render: (tx) => <span className="font-mono text-xs">{tx.ItemCode || "–"}</span>,
    });
  }
  columns.push(
    {
      key: "wh",
      header: t("products.warehouse"),
      render: (tx) => <span className="uppercase">{tx.Warehouse || "–"}</span>,
    },
    {
      key: "text",
      header: t("products.text"),
      render: (tx) => (
        <span className="block max-w-[260px] truncate text-fog" title={tx.Text}>
          {tx.Text || "–"}
        </span>
      ),
    },
    {
      key: "qty",
      header: t("products.qty"),
      align: "right",
      render: (tx) => <span className="tnum font-medium">{formatNumber(tx.Quantity)}</span>,
    },
    {
      key: "cost",
      header: t("products.costAmount"),
      align: "right",
      render: (tx) => <span className="tnum">{formatAmount(tx.CostAmount, tx.CurrencyCode || "ISK")}</span>,
    },
    {
      key: "sales",
      header: t("products.salesAmount"),
      align: "right",
      render: (tx) => <span className="tnum">{formatAmount(tx.SalesAmount, tx.CurrencyCode || "ISK")}</span>,
    },
    {
      key: "created",
      header: t("products.createdAt"),
      render: (tx) => <span className="text-fog">{timeAgo(tx.Created)}</span>,
    },
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
      emptyTitle={emptyTitle ?? t("products.noTransactions")}
      emptyBody={emptyBody}
      footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
    />
  );
}
