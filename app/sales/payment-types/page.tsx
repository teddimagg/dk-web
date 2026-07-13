"use client";

import { Banknote, Coins, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatDateTime } from "@/lib/format";
import type { SalesPaymentType } from "@/lib/api/types/sales";

export default function PaymentTypesPage() {
  const prefetch = usePrefetch();
  const [selected, setSelected] = useState<number | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<SalesPaymentType[]>(
    ["sales-payment-types"],
    "/sales/payment/type/",
  );

  const columns: Column<SalesPaymentType>[] = [
    { key: "id", header: "ID", width: "70px", render: (r) => <span className="tnum font-medium text-ink">{r.PaymentId}</span> },
    { key: "name", header: "Name", render: (r) => r.Name || "–" },
    { key: "type", header: "Type", align: "center", width: "80px", render: (r) => <span className="tnum">{r.Type ?? "–"}</span> },
    { key: "gl", header: "GL account", width: "110px", render: (r) => <span className="tnum">{r.GLAccountNumber || "–"}</span> },
    {
      key: "active",
      header: "Active",
      align: "center",
      width: "90px",
      render: (r) => (r.Active ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Inactive</Badge>),
    },
    { key: "modified", header: "Modified", width: "150px", render: (r) => <span className="tnum">{formatDateTime(r.Modified)}</span> },
  ];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <CardTitle icon={<Banknote />}>Payment types</CardTitle>
          <span className="flex items-center gap-2">
            {isFetching && <Loader2 className="size-4 animate-spin text-mist" aria-label="Refreshing" />}
            <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh list">
              <RefreshCw className="size-4" />
            </Button>
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={data}
          rowKey={(r) => r.PaymentId}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={(r) => setSelected(r.PaymentId)}
          onRowHover={(r) => prefetch(["sales-payment-type", r.PaymentId], `/sales/payment/type/${r.PaymentId}`)}
          emptyTitle="No payment types"
          emptyBody="This company has no payment types configured in dkPlus."
        />
      </Card>

      <PaymentTypePanel typeId={selected} />
    </div>
  );
}

/** Side panel: GET /sales/payment/type/:typeid for the clicked row. */
function PaymentTypePanel({ typeId }: { typeId: number | null }) {
  const { data, isLoading, error, refetch } = useDkQuery<SalesPaymentType>(
    ["sales-payment-type", typeId],
    `/sales/payment/type/${typeId ?? 0}`,
    { enabled: typeId != null },
  );

  return (
    <Card className="p-6">
      <CardTitle icon={<Coins />} className="mb-5">
        {typeId != null ? `Payment type ${typeId}` : "Payment type detail"}
      </CardTitle>
      {typeId == null ? (
        <EmptyState
          icon={<Coins />}
          title="Select a payment type"
          body="Click a row to load its detail from GET /sales/payment/type/:typeid."
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-5">
          <KV
            columns={1}
            items={[
              { label: "Payment ID", value: String(data.PaymentId) },
              { label: "Name", value: data.Name },
              { label: "Type", value: data.Type != null ? String(data.Type) : "" },
              { label: "GL account", value: data.GLAccountNumber },
              {
                label: "Active",
                value: data.Active ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Inactive</Badge>,
              },
              { label: "Modified", value: formatDateTime(data.Modified) },
            ]}
          />
          <JsonView data={data} />
        </div>
      ) : null}
    </Card>
  );
}
