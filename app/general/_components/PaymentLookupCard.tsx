"use client";

import { RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { PaymentItem } from "@/lib/api/types/general";
import { recordKvItems } from "./RecordsTable";

function itemId(item: PaymentItem): string {
  return String(item.Number ?? item.Code ?? item.Id ?? "");
}

/**
 * One lookup list (payment modes or payment terms). Clicking a row fetches
 * the single-item endpoint (`/general/payment/<kind>/:id`) into a dialog.
 */
export function PaymentLookupCard({
  kind,
  title,
  singular,
  icon,
}: {
  kind: "mode" | "term";
  title: string;
  singular: string;
  icon: ReactNode;
}) {
  const t = useT();
  const base = `/general/payment/${kind}`;
  const prefetch = usePrefetch();
  const [selected, setSelected] = useState<string | null>(null);

  const list = useDkQuery<PaymentItem[]>(["general", "payment", kind], base);
  const detail = useDkQuery<PaymentItem>(
    ["general", "payment", kind, selected],
    `${base}/${encodeURIComponent(selected ?? "")}`,
    { enabled: !!selected },
  );

  const columns: Column<PaymentItem>[] = [
    {
      key: "id",
      header: t("general.field.code"),
      render: (r) => <span className="font-mono text-xs text-fog">{itemId(r) || "–"}</span>,
      width: "110px",
    },
    {
      key: "Description",
      header: t("general.field.description"),
      render: (r) => (
        <span className="font-medium text-ink">{typeof r.Description === "string" && r.Description ? r.Description : "–"}</span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <CardTitle icon={icon} className="mr-auto">
          {title}
          {list.data ? <span className="ml-1.5 tnum text-mist">{list.data.length}</span> : null}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => list.refetch()}
          aria-label={t("ui.refresh")}
        >
          <RefreshCw className={list.isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>
      <DataTable<PaymentItem>
        columns={columns}
        rows={list.data}
        rowKey={(r, i) => itemId(r) || i}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        onRowClick={(r) => {
          const id = itemId(r);
          if (id) setSelected(id);
        }}
        onRowHover={(r) => {
          const id = itemId(r);
          if (id) prefetch(["general", "payment", kind, id], `${base}/${encodeURIComponent(id)}`);
        }}
        emptyTitle={t(kind === "mode" ? "general.payments.emptyModes" : "general.payments.emptyTerms")}
        emptyBody={t("general.payments.emptyBody")}
      />

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`${singular} ${selected ?? ""}`}
        subtitle={`GET ${base}/${selected ?? ""}`}
      >
        {detail.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        ) : detail.error ? (
          <ErrorState error={detail.error} onRetry={() => detail.refetch()} />
        ) : (
          <div className="space-y-4">
            <KV columns={1} items={recordKvItems(detail.data)} />
            <JsonView data={detail.data} />
          </div>
        )}
      </Dialog>
    </Card>
  );
}
