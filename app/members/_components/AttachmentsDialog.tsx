"use client";

import { clsx } from "clsx";
import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkQuery } from "@/lib/hooks/useDk";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type {
  MemberApplication,
  MemberApplicationAttachment,
  MemberFund,
} from "@/lib/api/types/members";
import { applicationId } from "./applicationStatus";

function attachmentId(a: MemberApplicationAttachment): string | number | undefined {
  return a.ID ?? a.Id ?? a.AttachmentID;
}

function attachmentName(a: MemberApplicationAttachment): string {
  const id = attachmentId(a);
  return a.FileName ?? a.Name ?? (id != null ? `attachment-${id}` : "attachment");
}

function formatBytes(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "–";
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function extractApiMessage(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown>;
      for (const key of ["Message", "message", "error", "Error"]) {
        if (typeof p[key] === "string" && p[key]) return p[key] as string;
      }
    }
  } catch {
    // plain text
  }
  return text;
}

/**
 * Application attachments:
 * - list      GET  /member/fund/:fund/application/:id/attachments
 * - download  GET  /member/fund/:fund/application/:application/attachments/:id
 * - upload    POST /member/:number/application/:id/attachment (multipart file)
 *
 * The list/download routes are keyed by fund, not member — the fund id is taken
 * from the application row when present, otherwise entered inline (suggestions
 * come from the member's fund list).
 */
export function AttachmentsDialog({
  number,
  application,
  open,
  onClose,
}: {
  number: string;
  application: MemberApplication;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const company = useActiveCompany();
  const toast = useToast();
  const appId = applicationId(application);

  const initialFund = application.Fund ?? "";
  const [fundDraft, setFundDraft] = useState(initialFund);
  const [fund, setFund] = useState(initialFund);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fund suggestions when the application row carries no fund id.
  const fundsQuery = useDkQuery<MemberFund[]>(
    ["member", number, "fund"],
    `/member/${encodeURIComponent(number)}/fund`,
    { enabled: open && !initialFund },
  );
  const fundSuggestions = (fundsQuery.data ?? [])
    .map((f) => f.Fund ?? f.Code ?? f.Number)
    .filter((v): v is string => !!v);

  const attachments = useDkQuery<MemberApplicationAttachment[]>(
    ["member", "fund", fund, "application", appId, "attachments"],
    `/member/fund/${encodeURIComponent(fund)}/application/${appId}/attachments`,
    { enabled: open && !!fund && appId != null },
  );

  async function download(a: MemberApplicationAttachment) {
    const id = attachmentId(a);
    if (id == null || appId == null || !company || !fund) return;
    setDownloadingId(String(id));
    try {
      const blob = await dkFetchBlob(
        `/member/fund/${encodeURIComponent(fund)}/application/${appId}/attachments/${encodeURIComponent(String(id))}`,
        { token: company.token },
      );
      downloadBlob(blob, attachmentName(a));
      toast.success(t("members.attach.downloaded"), attachmentName(a));
    } catch (e) {
      toast.error(t("members.attach.downloadFailed"), e instanceof Error ? e.message : undefined);
    } finally {
      setDownloadingId(null);
    }
  }

  async function upload(file: File) {
    if (appId == null || !company) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await fetch(
        `/api/dk/member/${encodeURIComponent(number)}/application/${appId}/attachment`,
        { method: "POST", headers: { "x-dk-token": company.token }, body: fd },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(extractApiMessage(text) || `${res.status} ${res.statusText}`);
      }
      toast.success(t("members.attach.uploaded"), file.name);
      if (fund) void attachments.refetch();
    } catch (e) {
      toast.error(t("members.attach.uploadFailed"), e instanceof Error ? e.message : undefined);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const columns: Column<MemberApplicationAttachment>[] = [
    {
      key: "file",
      header: t("members.field.file"),
      render: (a) => (
        <span className="flex items-center gap-2 font-medium text-ink">
          <FileText className="size-4 shrink-0 text-mist" />
          <span className="truncate">{attachmentName(a)}</span>
        </span>
      ),
    },
    {
      key: "size",
      header: t("members.field.size"),
      align: "right",
      render: (a) => <span className="tnum">{formatBytes(a.Size ?? a.FileSize)}</span>,
    },
    {
      key: "date",
      header: t("members.field.date"),
      render: (a) => <span className="tnum">{formatDate(a.Created ?? a.Date ?? a.Modified)}</span>,
    },
    {
      key: "download",
      header: "",
      align: "right",
      render: (a) => {
        const id = attachmentId(a);
        return (
          <Button
            variant="ghost"
            size="sm"
            disabled={id == null}
            loading={id != null && downloadingId === String(id)}
            onClick={() => void download(a)}
          >
            <Download className="size-4" /> {t("members.attach.download")}
          </Button>
        );
      },
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        appId != null
          ? t("members.attach.dialogTitleId", { id: appId })
          : t("members.attach.dialogTitle")
      }
      subtitle={t("members.attach.subtitle")}
      wide
    >
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFund(fundDraft.trim());
          }}
          className="flex items-end gap-2"
        >
          <Field label={t("members.field.fund")} hint={t("members.attach.fundHint")} className="flex-1">
            <Input
              list="member-fund-suggestions"
              value={fundDraft}
              onChange={(e) => setFundDraft(e.target.value)}
              placeholder={t("members.fundPlaceholder")}
            />
          </Field>
          <datalist id="member-fund-suggestions">
            {fundSuggestions.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <Button type="submit" variant="secondary" disabled={!fundDraft.trim()}>
            {t("members.attach.load")}
          </Button>
        </form>

        {!fund && (
          <p className="text-[13px] leading-relaxed text-fog">{t("members.attach.fundNote")}</p>
        )}

        {fund && appId != null && (
          <DataTable<MemberApplicationAttachment>
            columns={columns}
            rows={attachments.data}
            rowKey={(a, i) => String(attachmentId(a) ?? i)}
            loading={attachments.isLoading || attachments.isFetching}
            error={attachments.error ?? null}
            onRetry={() => attachments.refetch()}
            emptyTitle={t("members.attach.emptyTitle")}
            emptyBody={t("members.attach.emptyBody")}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            aria-label={t("members.attach.chooseAria")}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={uploading}
            disabled={appId == null}
            onClick={() => fileRef.current?.click()}
          >
            <Plus className="size-4" /> {t("members.attach.upload")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!fund}
            onClick={() => attachments.refetch()}
            aria-label={t("members.tab.refreshAria", { section: t("members.attach.label") })}
          >
            <RefreshCw className={clsx("size-4", attachments.isFetching && "animate-spin")} />{" "}
            {t("ui.refresh")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
