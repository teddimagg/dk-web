"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import type { VendorInvoice } from "@/lib/api/types/vendors";
import { invoiceAmount, invoiceId, invoiceNumber, invoiceVendorLabel } from "../_components/helpers";
import { approvalBadge, InvoiceDetailDialog } from "../_components/InvoiceDetailDialog";

const PAGE_SIZE = 25;

function invoiceColumns(): Column<VendorInvoice>[] {
  return [
    {
      key: "id",
      header: "ID",
      width: "90px",
      render: (inv) => <span className="font-mono text-xs text-fog">{invoiceId(inv) ?? "–"}</span>,
    },
    { key: "number", header: "Number", render: (inv) => <span className="font-medium">{invoiceNumber(inv)}</span> },
    { key: "vendor", header: "Vendor", render: (inv) => invoiceVendorLabel(inv) },
    { key: "date", header: "Date", width: "110px", render: (inv) => formatDate(inv.Date ?? inv.Created) },
    { key: "due", header: "Due date", width: "110px", render: (inv) => formatDate(inv.DueDate) },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (inv) => <span className="tnum font-medium">{formatAmount(invoiceAmount(inv), inv.Currency || "ISK")}</span>,
    },
    { key: "status", header: "Status", align: "right", render: (inv) => approvalBadge(inv.ApprovalStatus ?? inv.Status) },
  ];
}

export default function VendorInvoicesPage() {
  const [tab, setTab] = useState("processed");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedKind, setSelectedKind] = useState<"processed" | "unprocessed">("processed");
  const prefetch = usePrefetch();

  const processed = useDkQuery<VendorInvoice[]>(
    ["vendor-invoices", "processed", "page", page],
    `/vendor/invoice/processed/page/${page}/${PAGE_SIZE}`,
    { placeholderData: keepPreviousData, enabled: tab === "processed" },
  );
  const processedHasMore = (processed.data?.length ?? 0) === PAGE_SIZE;

  // NOTE: this endpoint has no paging or filter params and can return very
  // large payloads (base64 attachments inline) — we render summary columns
  // only and never touch attachment content here.
  const unprocessed = useDkQuery<VendorInvoice[]>(
    ["vendor-invoices", "unprocessed", "list"],
    "/vendor/invoice/unprocessed",
    { enabled: tab === "unprocessed" },
  );

  const active = tab === "processed" ? processed : unprocessed;
  const columns = invoiceColumns();

  function openInvoice(inv: VendorInvoice, kind: "processed" | "unprocessed") {
    const id = invoiceId(inv);
    if (id == null) return;
    setSelectedKind(kind);
    setSelected(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: "processed", label: "Processed" },
            { id: "unprocessed", label: "Unprocessed" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="flex items-center gap-3">
          {tab === "unprocessed" && (
            <span className="flex items-center gap-1.5 text-xs text-fog">
              <TriangleAlert className="size-3.5 text-amber" />
              Heavy endpoint — summary columns only
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => active.refetch()} aria-label="Refresh invoices">
            <RefreshCw className={active.isFetching ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </div>
      </div>

      {tab === "processed" && (
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={processed.data}
            rowKey={(inv, i) => invoiceId(inv) ?? i}
            loading={processed.isLoading || (processed.isFetching && !processed.data)}
            error={processed.error}
            onRetry={processed.refetch}
            emptyTitle="No processed invoices"
            emptyBody="Processed vendor invoices will appear here once they have been posted."
            onRowClick={(inv) => openInvoice(inv, "processed")}
            onRowHover={(inv) => {
              const id = invoiceId(inv);
              if (id != null)
                prefetch(["vendor-invoices", "processed", "detail", id], `/vendor/invoice/processed/${id}`);
            }}
            footer={
              <Pagination page={page} onPage={setPage} hasMore={processedHasMore} loading={processed.isFetching} />
            }
          />
        </Card>
      )}

      {tab === "unprocessed" && (
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={unprocessed.data}
            rowKey={(inv, i) => invoiceId(inv) ?? i}
            loading={unprocessed.isLoading || (unprocessed.isFetching && !unprocessed.data)}
            error={unprocessed.error}
            onRetry={unprocessed.refetch}
            emptyTitle="No unprocessed invoices"
            emptyBody="Incoming vendor invoices awaiting processing will appear here."
            onRowClick={(inv) => openInvoice(inv, "unprocessed")}
          />
        </Card>
      )}

      <InvoiceDetailDialog
        open={selected != null}
        onClose={() => setSelected(null)}
        invoiceId={selected}
        kind={selectedKind}
      />
    </div>
  );
}
