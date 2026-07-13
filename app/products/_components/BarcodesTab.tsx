"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";
import { timeAgo } from "@/lib/format";
import { barcodeValue, type ProductBarcode } from "@/lib/api/types/products";

/**
 * Barcode list (GET /Product/:number/barcode); clicking a row opens the
 * single-barcode detail (GET /Product/:number/barcode/:code).
 */
export function BarcodesTab({ itemcode }: { itemcode: string }) {
  const enc = encodeURIComponent(itemcode);
  const [selected, setSelected] = useState<string | null>(null);

  const list = useDkQuery<ProductBarcode[]>(["product", itemcode, "barcodes"], `/Product/${enc}/barcode`);

  const detail = useDkQuery<ProductBarcode>(
    ["product", itemcode, "barcode", selected],
    `/Product/${enc}/barcode/${encodeURIComponent(selected ?? "")}`,
    { enabled: selected !== null },
  );

  const columns: Column<ProductBarcode>[] = [
    {
      key: "code",
      header: "Barcode",
      render: (b) => <span className="font-mono text-xs font-medium">{barcodeValue(b) || "–"}</span>,
    },
    { key: "desc", header: "Description", render: (b) => b.Description || "–" },
    { key: "unit", header: "Unit", render: (b) => b.UnitCode || "–" },
    { key: "mod", header: "Modified", render: (b) => <span className="text-fog">{timeAgo(b.Modified)}</span> },
  ];

  const detailEntries = detail.data
    ? Object.entries(detail.data as Record<string, unknown>).filter(([, v]) =>
        ["string", "number", "boolean"].includes(typeof v),
      )
    : [];

  return (
    <>
      <DataTable
        columns={columns}
        rows={list.data}
        rowKey={(b, i) => barcodeValue(b) || i}
        onRowClick={(b) => {
          const code = barcodeValue(b);
          if (code) setSelected(code);
        }}
        loading={list.isFetching}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="No barcodes"
        emptyBody="This product has no barcodes registered in dkPlus."
      />
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Barcode ${selected ?? ""}`}
        subtitle={`On product ${itemcode}`}
      >
        {detail.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : detail.error ? (
          <ErrorState error={detail.error} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="space-y-4">
            <KV
              columns={1}
              items={detailEntries.map(([k, v]) => ({ label: k, value: String(v) }))}
            />
            <JsonView data={detail.data} />
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
