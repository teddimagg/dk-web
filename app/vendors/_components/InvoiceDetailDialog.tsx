"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatAmount, formatDate, formatDateTime } from "@/lib/format";
import type { VendorInvoice, VendorInvoiceLine } from "@/lib/api/types/vendors";
import { downloadAttachment, invoiceAmount, invoiceNumber, invoiceVendorLabel } from "./helpers";

export function approvalBadge(status: number | string | undefined) {
  if (status === 0 || status === "0" || status === "Approved") return <Badge tone="green">Approved</Badge>;
  if (status === 2 || status === "2" || status === "Denied" || status === "Deny") return <Badge tone="red">Denied</Badge>;
  if (status === 1 || status === "1" || status === "UnApproved") return <Badge tone="amber">Pending</Badge>;
  if (status == null || status === "") return null;
  return <Badge tone="neutral">{String(status)}</Badge>;
}

/**
 * Detail drawer for a vendor invoice. `kind` picks the fetch + attachment
 * routes: processed → /vendor/invoice/processed/:id + /vendor/invoice/:id/attachment,
 * unprocessed → /vendor/invoice/unprocessed/:id (+ its own attachment route).
 */
export function InvoiceDetailDialog({
  open,
  onClose,
  invoiceId,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: number | null;
  kind: "processed" | "unprocessed";
}) {
  const company = useActiveCompany();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const detailPath =
    kind === "processed" ? `/vendor/invoice/processed/${invoiceId}` : `/vendor/invoice/unprocessed/${invoiceId}`;
  const attachmentPath =
    kind === "processed" ? `/vendor/invoice/${invoiceId}/attachment` : `/vendor/invoice/unprocessed/${invoiceId}/attachment`;

  const { data, isLoading, error, refetch } = useDkQuery<VendorInvoice>(
    ["vendor-invoices", kind, "detail", invoiceId],
    detailPath,
    { enabled: open && invoiceId != null },
  );

  async function download() {
    if (invoiceId == null || !company) return;
    setDownloading(true);
    try {
      await downloadAttachment(attachmentPath, company.token, `vendor-invoice-${invoiceId}-attachment`);
      toast.success("Attachment downloaded", `Attachment for invoice #${invoiceId} was saved.`);
    } catch (e) {
      toast.error("Could not download attachment", e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  }

  const lineColumns: Column<VendorInvoiceLine>[] = [
    { key: "account", header: "Account", render: (l) => <span className="font-mono text-xs">{l.Account ?? "–"}</span> },
    { key: "type", header: "Type", render: (l) => (l.Type != null ? String(l.Type) : "–") },
    { key: "text", header: "Text", render: (l) => <span className="text-fog">{l.Text ?? l.Description ?? "–"}</span> },
    { key: "reference", header: "Reference", render: (l) => l.Reference ?? "–" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (l) => <span className="tnum font-medium">{formatAmount(l.Amount)}</span>,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={data ? `Invoice ${invoiceNumber(data)}` : `Invoice #${invoiceId ?? ""}`}
      subtitle={kind === "processed" ? "Processed vendor invoice" : "Unprocessed vendor invoice"}
      wide
    >
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {approvalBadge(data.ApprovalStatus ?? data.Status)}
              <span className="text-sm text-fog">{invoiceVendorLabel(data)}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={download} loading={downloading}>
              <Download className="size-4" /> Download attachment
            </Button>
          </div>

          <KV
            items={[
              { label: "Invoice number", value: invoiceNumber(data) },
              { label: "Internal ID", value: invoiceId },
              { label: "Vendor", value: invoiceVendorLabel(data) },
              { label: "Reference", value: data.Reference },
              { label: "Voucher", value: data.Voucher },
              { label: "Journal", value: data.Journal },
              { label: "Date", value: formatDate(data.Date) },
              { label: "Due date", value: formatDate(data.DueDate) },
              {
                label: "Received",
                value: formatDateTime(data.ReceivedDate) === "–" ? null : formatDateTime(data.ReceivedDate),
              },
              { label: "Currency", value: data.Currency },
              {
                label: "Amount",
                value: (
                  <span className="font-semibold">{formatAmount(invoiceAmount(data), data.Currency || "ISK")}</span>
                ),
              },
              { label: "Description", value: data.Description ?? data.Text },
            ]}
          />

          {(data.Lines?.length ?? 0) > 0 && (
            <div className="overflow-hidden rounded-2xl border border-line">
              <DataTable
                columns={lineColumns}
                rows={data.Lines}
                rowKey={(l, i) => l.ID ?? l.Sequence ?? i}
                emptyTitle="No lines"
              />
            </div>
          )}

          <JsonView data={data} />
        </div>
      )}
    </Dialog>
  );
}
