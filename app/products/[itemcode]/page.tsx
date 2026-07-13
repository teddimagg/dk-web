"use client";

import { clsx } from "clsx";
import { ArrowLeft, Coins, Package, Pencil, RefreshCw, Warehouse } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDateTime, formatNumber, formatPercent, timeAgo } from "@/lib/format";
import type { Product, ProductWarehouseStock } from "@/lib/api/types/products";
import { AttachmentsTab } from "../_components/AttachmentsTab";
import { BarcodesTab } from "../_components/BarcodesTab";
import { ProductFormDialog } from "../_components/ProductFormDialog";
import { TransactionsTable } from "../_components/TransactionsTable";
import { VendorLinksTab } from "../_components/VendorLinksTab";

export default function ProductDetailPage() {
  const params = useParams<{ itemcode: string }>();
  const itemcode = decodeURIComponent(params.itemcode);
  const enc = encodeURIComponent(itemcode);
  const router = useRouter();
  const t = useT();

  const [tab, setTab] = useState("barcodes");
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: product,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDkQuery<Product>(["product", itemcode], `/Product/${enc}`);

  const currency = product?.CurrencyCode || "ISK";

  const whColumns: Column<ProductWarehouseStock>[] = [
    {
      key: "wh",
      header: t("products.warehouse"),
      render: (w) => <span className="font-medium uppercase">{w.Warehouse || "–"}</span>,
    },
    {
      key: "qty",
      header: t("products.inStock"),
      align: "right",
      render: (w) => <span className="tnum font-medium">{formatNumber(w.QuantityInStock)}</span>,
    },
    {
      key: "back",
      header: t("products.backOrders"),
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.QuantityOnBackOrders)}</span>,
    },
    {
      key: "po",
      header: t("products.onPo"),
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.QuantityPoOrders)}</span>,
    },
    {
      key: "min",
      header: t("products.min"),
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.MinimumStock)}</span>,
    },
    {
      key: "max",
      header: t("products.max"),
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.MaximumStock)}</span>,
    },
    { key: "loc", header: t("products.location"), render: (w) => w.LocationInWarehouse || "–" },
    {
      key: "mod",
      header: t("products.modifiedAt"),
      render: (w) => <span className="text-fog">{timeAgo(w.Modified)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("products.backToCatalogue")}
            onClick={() => router.push("/products")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {product?.Description?.trim() || itemcode}
              </h2>
              {product?.Inactive && <Badge tone="red">{t("products.inactive")}</Badge>}
              {product?.Group && <Badge>{product.Group}</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-[13px] text-fog">{itemcode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} /> {t("ui.refresh")}
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)} disabled={!product}>
            <Pencil className="size-4" /> {t("products.edit")}
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      ) : isLoading || !product ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((k) => (
            <Card key={k} className="space-y-3 p-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<Package />} className="mb-5">
                {t("products.overviewCard")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: t("products.itemCode"), value: <span className="font-mono">{product.ItemCode}</span> },
                  { label: t("products.description"), value: product.Description },
                  { label: t("products.description2"), value: product.Description2 },
                  { label: t("products.alias"), value: product.AliasItemCode },
                  { label: t("products.group"), value: product.Group },
                  { label: t("products.unit"), value: product.UnitCode },
                  {
                    label: t("products.status"),
                    value: product.Inactive ? (
                      <Badge tone="red">{t("products.inactive")}</Badge>
                    ) : (
                      <Badge tone="green">{t("products.active")}</Badge>
                    ),
                  },
                  { label: t("products.inWebShop"), value: product.ShowItemInWebShop ? t("products.yes") : t("products.no") },
                  { label: t("products.createdAt"), value: formatDateTime(product.RecordCreated) },
                  { label: t("products.modifiedAt"), value: formatDateTime(product.RecordModified) },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Coins />} className="mb-5">
                {t("products.pricing")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: t("products.unitPrice1"), value: formatAmount(product.UnitPrice1, currency) },
                  { label: t("products.unitPrice1WithTax"), value: formatAmount(product.UnitPrice1WithTax, currency) },
                  {
                    label: t("products.unitPrice2"),
                    value: product.UnitPrice2 ? formatAmount(product.UnitPrice2, currency) : "",
                  },
                  {
                    label: t("products.unitPrice3"),
                    value: product.UnitPrice3 ? formatAmount(product.UnitPrice3, currency) : "",
                  },
                  {
                    label: t("products.purchasePrice"),
                    value: product.PurchasePrice ? formatAmount(product.PurchasePrice, currency) : "",
                  },
                  {
                    label: t("products.costPrice"),
                    value: product.CostPrice ? formatAmount(product.CostPrice, currency) : "",
                  },
                  { label: t("products.tax"), value: formatPercent(product.TaxPercent, 0) },
                  {
                    label: t("products.profitRatio"),
                    value: product.ProfitRatio1 ? formatPercent(product.ProfitRatio1) : "",
                  },
                  { label: t("products.discountAllowed"), value: product.AllowDiscount ? t("products.yes") : t("products.no") },
                ]}
              />
            </Card>
          </div>

          <Card className="p-6">
            <CardTitle
              icon={<Warehouse />}
              className="mb-4"
              action={
                <span className="text-[13px] text-fog tnum">
                  {t("products.totalInStock", { n: formatNumber(product.TotalQuantityInWarehouse) })}
                </span>
              }
            >
              {t("products.warehouseStock")}
            </CardTitle>
            <DataTable
              columns={whColumns}
              rows={product.Warehouses ?? []}
              rowKey={(w, i) => w.Warehouse ?? i}
              emptyTitle={t("products.noWarehouses")}
              emptyBody={t("products.noWarehousesBody")}
            />
          </Card>

          <Card className="p-6">
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "barcodes", label: t("products.tab.barcodes") },
                { id: "transactions", label: t("products.tab.transactions") },
                { id: "vendors", label: t("products.tab.vendors") },
                { id: "attachments", label: t("products.tab.attachments"), count: product.Attachments?.length || undefined },
              ]}
            />
            <div className="mt-5">
              {tab === "barcodes" && <BarcodesTab itemcode={itemcode} />}
              {tab === "transactions" && (
                <TransactionsTable
                  pathFor={(p, c) => `/product/${enc}/transaction/${p}/${c}`}
                  queryKey={["product", itemcode, "transactions"]}
                  showItemCode={false}
                  emptyTitle={t("products.noTransactions")}
                  emptyBody={t("products.noTransactionsProductBody")}
                />
              )}
              {tab === "vendors" && <VendorLinksTab itemcode={itemcode} />}
              {tab === "attachments" && <AttachmentsTab itemcode={itemcode} attachments={product.Attachments} />}
            </div>
          </Card>

          <JsonView data={product} />
        </>
      )}

      <ProductFormDialog open={editOpen} onClose={() => setEditOpen(false)} product={product ?? null} />
    </div>
  );
}
