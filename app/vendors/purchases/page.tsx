"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input, Select } from "@/components/ui/Input";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatDate, formatInt } from "@/lib/format";
import type { PurchaseOrder } from "@/lib/api/types/vendors";
import { asArray, isoDaysAgo, purchaseId, purchaseVendorLabel } from "../_components/helpers";
import { PurchaseFormDialog } from "../_components/PurchaseFormDialog";

type LookupMode = "id" | "number" | "reference";

interface Lookup {
  mode: LookupMode;
  value: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const [modifiedSince, setModifiedSince] = useState(() => isoDaysAgo(30));
  const [lookupMode, setLookupMode] = useState<LookupMode>("number");
  const [lookupValue, setLookupValue] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [creating, setCreating] = useState(false);

  const modifiedQuery = useDkQuery<PurchaseOrder[]>(
    ["purchases", "modified", modifiedSince],
    `/purchase?modified=${encodeURIComponent(`${modifiedSince}T00:00:00`)}`,
    { placeholderData: keepPreviousData, enabled: !lookup },
  );

  const lookupQuery = useDkQuery<PurchaseOrder | PurchaseOrder[]>(
    ["purchases", "lookup", lookup?.mode, lookup?.value],
    lookup?.mode === "reference"
      ? `/purchase/reference/${encodeURIComponent(lookup.value)}`
      : `/purchase/number/${encodeURIComponent(lookup?.value ?? "")}`,
    { enabled: !!lookup && lookup.mode !== "id" },
  );

  const activeQuery = lookup ? lookupQuery : modifiedQuery;
  const rows = lookup
    ? lookupQuery.data === undefined
      ? undefined // keep DataTable in its skeleton state while the lookup is in flight
      : asArray(lookupQuery.data)
    : (modifiedQuery.data ?? undefined);

  function runLookup(e: React.FormEvent) {
    e.preventDefault();
    const value = lookupValue.trim();
    if (!value) return;
    if (lookupMode === "id") {
      // /purchase/id/:id is the detail page's fetch route — jump straight there.
      router.push(`/vendors/purchases/${encodeURIComponent(value)}`);
      return;
    }
    setLookup({ mode: lookupMode, value });
  }

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "id",
      header: "ID",
      width: "90px",
      render: (o) => <span className="font-mono text-xs text-fog">{purchaseId(o) ?? "–"}</span>,
    },
    { key: "number", header: "Number", render: (o) => <span className="font-medium">{o.Number ?? "–"}</span> },
    { key: "reference", header: "Reference", render: (o) => o.Reference ?? "–" },
    { key: "vendor", header: "Vendor", render: (o) => purchaseVendorLabel(o) },
    { key: "ordered", header: "Order date", width: "110px", render: (o) => formatDate(o.OrderDate ?? o.Created) },
    { key: "modified", header: "Modified", width: "110px", render: (o) => formatDate(o.Modified) },
    {
      key: "lines",
      header: "Lines",
      align: "right",
      render: (o) => <span className="tnum">{o.Lines ? formatInt(o.Lines.length) : "–"}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (o) => (o.Status != null && o.Status !== "" ? <Badge tone="blue">{String(o.Status)}</Badge> : "–"),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardTitle icon={<Search />} className="mb-4" action={
          lookup && (
            <Button variant="ghost" size="sm" onClick={() => setLookup(null)}>
              <X className="size-4" /> Clear lookup
            </Button>
          )
        }>
          Find a purchase order
        </CardTitle>
        <form onSubmit={runLookup} className="flex flex-wrap items-end gap-3">
          <Field label="Look up by" className="w-44">
            <Select value={lookupMode} onChange={(e) => setLookupMode(e.target.value as LookupMode)}>
              <option value="number">Order number</option>
              <option value="reference">Reference</option>
              <option value="id">Record ID</option>
            </Select>
          </Field>
          <Field label={lookupMode === "id" ? "Record ID" : lookupMode === "number" ? "Order number" : "Reference"} className="w-56">
            <Input
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              placeholder={lookupMode === "id" ? "e.g. 3" : lookupMode === "number" ? "e.g. 100045" : "e.g. ABCD1234"}
            />
          </Field>
          <Button type="submit" variant="secondary" disabled={!lookupValue.trim()}>
            <Search className="size-4" /> {lookupMode === "id" ? "Open order" : "Look up"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-line px-4 py-3">
          {lookup ? (
            <p className="text-sm text-fog">
              Lookup results for {lookup.mode === "number" ? "order number" : "reference"}{" "}
              <span className="font-medium text-ink">{lookup.value}</span>
            </p>
          ) : (
            <Field label="Modified after" className="w-48">
              <Input
                type="date"
                value={modifiedSince}
                onChange={(e) => setModifiedSince(e.target.value)}
                aria-label="Show orders modified after"
              />
            </Field>
          )}
          <div className="ml-auto flex items-center gap-2 pb-0.5">
            <Button variant="ghost" size="sm" onClick={() => activeQuery.refetch()} aria-label="Refresh orders">
              <RefreshCw className={activeQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New purchase order
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(o, i) => purchaseId(o) ?? `${o.Number ?? ""}-${i}`}
          loading={activeQuery.isLoading || (activeQuery.isFetching && !rows)}
          error={activeQuery.error}
          onRetry={activeQuery.refetch}
          emptyTitle={lookup ? "No matching orders" : "No purchase orders"}
          emptyBody={
            lookup
              ? "Nothing matched that lookup — try another value or clear the lookup."
              : `No purchase orders were created or modified after ${formatDate(modifiedSince)}. Move the date back to see older orders.`
          }
          onRowClick={(o) => {
            const id = purchaseId(o);
            if (id != null) router.push(`/vendors/purchases/${id}`);
          }}
          onRowHover={(o) => {
            const id = purchaseId(o);
            if (id != null) prefetch(["purchase", String(id)], `/purchase/id/${id}`);
          }}
          footer={
            <div className="border-t border-line px-4 py-3 text-[13px] text-fog tnum">
              {rows?.length ?? 0} order{(rows?.length ?? 0) === 1 ? "" : "s"}
            </div>
          }
        />
      </Card>

      <PurchaseFormDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
