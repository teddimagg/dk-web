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
      header: "Warehouse",
      render: (w) => <span className="font-medium uppercase">{w.Warehouse || "–"}</span>,
    },
    {
      key: "qty",
      header: "In stock",
      align: "right",
      render: (w) => <span className="tnum font-medium">{formatNumber(w.QuantityInStock)}</span>,
    },
    {
      key: "back",
      header: "Back orders",
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.QuantityOnBackOrders)}</span>,
    },
    {
      key: "po",
      header: "On PO",
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.QuantityPoOrders)}</span>,
    },
    {
      key: "min",
      header: "Min",
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.MinimumStock)}</span>,
    },
    {
      key: "max",
      header: "Max",
      align: "right",
      render: (w) => <span className="tnum">{formatNumber(w.MaximumStock)}</span>,
    },
    { key: "loc", header: "Location", render: (w) => w.LocationInWarehouse || "–" },
    { key: "mod", header: "Modified", render: (w) => <span className="text-fog">{timeAgo(w.Modified)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Back to catalogue"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {product?.Description?.trim() || itemcode}
              </h2>
              {product?.Inactive && <Badge tone="red">Inactive</Badge>}
              {product?.Group && <Badge>{product.Group}</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-[13px] text-fog">{itemcode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)} disabled={!product}>
            <Pencil className="size-4" /> Edit
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
                Overview
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Item code", value: <span className="font-mono">{product.ItemCode}</span> },
                  { label: "Description", value: product.Description },
                  { label: "Description 2", value: product.Description2 },
                  { label: "Alias", value: product.AliasItemCode },
                  { label: "Group", value: product.Group },
                  { label: "Unit", value: product.UnitCode },
                  {
                    label: "Status",
                    value: product.Inactive ? <Badge tone="red">Inactive</Badge> : <Badge tone="green">Active</Badge>,
                  },
                  { label: "In web shop", value: product.ShowItemInWebShop ? "Yes" : "No" },
                  { label: "Created", value: formatDateTime(product.RecordCreated) },
                  { label: "Modified", value: formatDateTime(product.RecordModified) },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Coins />} className="mb-5">
                Pricing
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Unit price 1", value: formatAmount(product.UnitPrice1, currency) },
                  { label: "Unit price 1 (incl. tax)", value: formatAmount(product.UnitPrice1WithTax, currency) },
                  {
                    label: "Unit price 2",
                    value: product.UnitPrice2 ? formatAmount(product.UnitPrice2, currency) : "",
                  },
                  {
                    label: "Unit price 3",
                    value: product.UnitPrice3 ? formatAmount(product.UnitPrice3, currency) : "",
                  },
                  {
                    label: "Purchase price",
                    value: product.PurchasePrice ? formatAmount(product.PurchasePrice, currency) : "",
                  },
                  {
                    label: "Cost price",
                    value: product.CostPrice ? formatAmount(product.CostPrice, currency) : "",
                  },
                  { label: "Tax", value: formatPercent(product.TaxPercent, 0) },
                  {
                    label: "Profit ratio",
                    value: product.ProfitRatio1 ? formatPercent(product.ProfitRatio1) : "",
                  },
                  { label: "Discount allowed", value: product.AllowDiscount ? "Yes" : "No" },
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
                  Total in stock: {formatNumber(product.TotalQuantityInWarehouse)}
                </span>
              }
            >
              Warehouse stock
            </CardTitle>
            <DataTable
              columns={whColumns}
              rows={product.Warehouses ?? []}
              rowKey={(w, i) => w.Warehouse ?? i}
              emptyTitle="No warehouse records"
              emptyBody="This product is not stocked in any warehouse."
            />
          </Card>

          <Card className="p-6">
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "barcodes", label: "Barcodes" },
                { id: "transactions", label: "Transactions" },
                { id: "vendors", label: "Vendor links" },
                { id: "attachments", label: "Attachments", count: product.Attachments?.length || undefined },
              ]}
            />
            <div className="mt-5">
              {tab === "barcodes" && <BarcodesTab itemcode={itemcode} />}
              {tab === "transactions" && (
                <TransactionsTable
                  pathFor={(p, c) => `/product/${enc}/transaction/${p}/${c}`}
                  queryKey={["product", itemcode, "transactions"]}
                  showItemCode={false}
                  emptyTitle="No transactions"
                  emptyBody="Inventory and sales movements for this product will appear here."
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
