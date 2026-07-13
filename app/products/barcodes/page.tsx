"use client";

import { Barcode, ChevronRight, Search, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatAmount, formatNumber } from "@/lib/format";
import type { Product } from "@/lib/api/types/products";

/** Barcode lookup tool (GET /barcode/:code). */
export default function BarcodeSearchPage() {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();
  const prefetch = usePrefetch();

  const { data, isFetching, error } = useDkQuery<Product | Product[]>(
    ["barcode-search", code],
    `/barcode/${encodeURIComponent(code)}`,
    { enabled: code !== "", retry: false },
  );
  // Re-annotate before narrowing: tanstack's result-union `data` resists
  // Array.isArray narrowing when accessed directly.
  const raw: Product | Product[] | undefined = data;
  const product = Array.isArray(raw) ? raw[0] : raw;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setCode(input.trim());
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-white">
          <Barcode className="size-7" />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Barcode lookup</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-fog">
          Scan or type any barcode to find the product it belongs to.
        </p>
        <form onSubmit={submit} className="mx-auto mt-5 flex max-w-md gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1234567890"
            className="h-12 text-center font-mono text-base"
            autoFocus
            aria-label="Barcode"
          />
          <Button type="submit" size="lg" disabled={!input.trim()} loading={isFetching}>
            <Search className="size-4" /> Look up
          </Button>
        </form>
      </Card>

      {code !== "" && error && (
        <Card className="flex items-center gap-3 p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
            <TriangleAlert className="size-5" />
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-medium text-ink">No product found for barcode “{code}”</p>
            <p className="break-words text-fog">{error.message}</p>
          </div>
        </Card>
      )}

      {code !== "" && !error && isFetching && !product && (
        <Card className="space-y-3 p-6">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </Card>
      )}

      {product && !error && (
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-ink">{product.Description || product.ItemCode}</h3>
                {product.Inactive ? <Badge tone="red">Inactive</Badge> : <Badge tone="green">Active</Badge>}
                {product.Group && <Badge>{product.Group}</Badge>}
              </div>
              <p className="mt-0.5 font-mono text-[13px] text-fog">
                {product.ItemCode} · matched barcode {code}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/products/${encodeURIComponent(product.ItemCode)}`)}
              onMouseEnter={() =>
                prefetch(["product", product.ItemCode], `/Product/${encodeURIComponent(product.ItemCode)}`)
              }
            >
              Open product <ChevronRight className="size-4" />
            </Button>
          </div>
          <KV
            className="mt-5"
            items={[
              {
                label: "Unit price (incl. tax)",
                value: formatAmount(product.UnitPrice1WithTax, product.CurrencyCode || "ISK"),
              },
              {
                label: "Unit price (excl. tax)",
                value: formatAmount(product.UnitPrice1, product.CurrencyCode || "ISK"),
              },
              { label: "In stock", value: formatNumber(product.TotalQuantityInWarehouse) },
              { label: "Unit", value: product.UnitCode },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
