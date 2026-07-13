"use client";

import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useT } from "@/lib/i18n";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatDateTime } from "@/lib/format";
import { attachmentId, attachmentName, type ProductAttachment } from "@/lib/api/types/products";

/**
 * Attachments listed from the product payload; content is only fetched on
 * demand via GET /Product/:itemcode/attachment/:id (never in the list).
 */
export function AttachmentsTab({
  itemcode,
  attachments,
}: {
  itemcode: string;
  attachments: ProductAttachment[] | undefined;
}) {
  const company = useActiveCompany();
  const toast = useToast();
  const t = useT();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function download(a: ProductAttachment) {
    const id = attachmentId(a);
    if (id == null || !company) return;
    setBusyId(id);
    try {
      const blob = await dkFetchBlob(`/Product/${encodeURIComponent(itemcode)}/attachment/${id}`, {
        token: company.token,
      });
      downloadBlob(blob, attachmentName(a));
      toast.success(t("products.attachmentDownloaded"), attachmentName(a));
    } catch (err) {
      toast.error(t("products.downloadFailed"), err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<ProductAttachment>[] = [
    {
      key: "name",
      header: t("products.file"),
      render: (a) => (
        <span className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-mist" />
          <span className="font-medium">{attachmentName(a)}</span>
        </span>
      ),
    },
    {
      key: "id",
      header: t("products.id"),
      render: (a) => <span className="font-mono text-xs">{attachmentId(a) ?? "–"}</span>,
    },
    { key: "linked", header: t("products.linked"), render: (a) => formatDateTime(a.Linked ?? a.Created) },
    {
      key: "download",
      header: "",
      align: "right",
      render: (a) => (
        <Button
          variant="secondary"
          size="sm"
          loading={busyId === attachmentId(a)}
          disabled={attachmentId(a) == null}
          onClick={() => download(a)}
        >
          <Download className="size-4" /> {t("products.download")}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={attachments ?? []}
      rowKey={(a, i) => attachmentId(a) ?? i}
      emptyTitle={t("products.noAttachments")}
      emptyBody={t("products.noAttachmentsBody")}
    />
  );
}
