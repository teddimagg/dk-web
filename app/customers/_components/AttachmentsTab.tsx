"use client";

import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatDate } from "@/lib/format";
import {
  attachmentId,
  attachmentName,
  type CustomerAttachment,
} from "@/lib/api/types/customers";

/**
 * Attachments listed on the customer card, each downloadable via
 * GET /customer/:number/attachment/:id (file content is only fetched on click,
 * never in the list itself).
 */
export function AttachmentsTab({
  customerNumber,
  attachments,
  loading,
}: {
  customerNumber: string;
  attachments: CustomerAttachment[] | undefined;
  loading?: boolean;
}) {
  const company = useActiveCompany();
  const toast = useToast();
  const [downloading, setDownloading] = useState<number | null>(null);

  async function download(a: CustomerAttachment) {
    const id = attachmentId(a);
    if (id == null || !company) return;
    setDownloading(id);
    try {
      const blob = await dkFetchBlob(
        `/customer/${encodeURIComponent(customerNumber)}/attachment/${id}`,
        { token: company.token },
      );
      downloadBlob(blob, attachmentName(a));
      toast.success("Attachment downloaded", attachmentName(a));
    } catch (e) {
      toast.error("Could not download attachment", e instanceof Error ? e.message : undefined);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <DataTable<CustomerAttachment>
      columns={[
        {
          key: "id",
          header: "ID",
          width: "80px",
          render: (a) => (
            <span className="font-mono text-xs text-soot">{attachmentId(a) ?? "–"}</span>
          ),
        },
        {
          key: "name",
          header: "File",
          render: (a) => (
            <span className="flex items-center gap-2 font-medium text-ink">
              <FileText className="size-4 text-mist" /> {attachmentName(a)}
            </span>
          ),
        },
        {
          key: "type",
          header: "Type",
          render: (a) => a.ContentType || <span className="text-mist">–</span>,
        },
        {
          key: "date",
          header: "Date",
          align: "right",
          render: (a) => formatDate(a.Date ?? a.Created ?? a.Modified),
        },
        {
          key: "download",
          header: "",
          align: "right",
          width: "60px",
          render: (a) => (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Download ${attachmentName(a)}`}
              loading={downloading != null && downloading === attachmentId(a)}
              disabled={attachmentId(a) == null}
              onClick={() => download(a)}
            >
              <Download className="size-4" />
            </Button>
          ),
        },
      ]}
      rows={attachments}
      rowKey={(a, i) => attachmentId(a) ?? i}
      loading={loading}
      error={null}
      emptyTitle="No attachments"
      emptyBody="No files are attached to this customer."
    />
  );
}
