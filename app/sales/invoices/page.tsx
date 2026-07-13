"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Loader2, Plus, RefreshCw, Search, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { SalesInvoice } from "@/lib/api/types/sales";
import { InvoiceCreateDialog } from "../_components/InvoiceCreateDialog";
import { SettledBadge } from "../_components/SettledBadge";

const SIZE = 40;

export default function InvoicesPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const t = useT();

  const [page, setPage] = useState(1);
  const [date, setDate] = useState("");
  const [refInput, setRefInput] = useState("");
  const [refActive, setRefActive] = useState("");
  const [spInput, setSpInput] = useState("");
  const [spActive, setSpActive] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Three list sources, most specific wins: reference lookup > date filter > plain page.
  let path: string;
  let key: readonly unknown[];
  let source: string;
  if (refActive) {
    path = `/sales/invoice/reference/${encodeURIComponent(refActive)}/${page}/${SIZE}`;
    key = ["sales-invoices", "reference", refActive, page];
    source = t("sales.invoices.sourceReference", { ref: refActive });
  } else if (date) {
    path = `/sales/invoice/date/${date}/${page}/${SIZE}`;
    key = ["sales-invoices", "date", date, page];
    source = t("sales.invoices.sourceDate", { date: formatDate(date) });
  } else {
    const q = spActive ? `?salesPerson=${encodeURIComponent(spActive)}` : "";
    path = `/sales/invoice/page/${page}/${SIZE}${q}`;
    key = ["sales-invoices", "page", page, spActive];
    source = spActive ? t("sales.invoices.sourceSalesperson", { sp: spActive }) : "";
  }

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<SalesInvoice[]>(key, path, {
    placeholderData: keepPreviousData,
  });
  const hasMore = (data?.length ?? 0) === SIZE;

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setRefActive(refInput.trim());
    setSpActive(spInput.trim());
    setPage(1);
  }

  function clearFilters() {
    setDate("");
    setRefInput("");
    setRefActive("");
    setSpInput("");
    setSpActive("");
    setPage(1);
  }

  const columns: Column<SalesInvoice>[] = [
    { key: "number", header: t("sales.col.number"), width: "90px", render: (r) => <span className="font-medium text-ink tnum">{r.Number}</span> },
    { key: "date", header: t("sales.col.date"), width: "110px", render: (r) => <span className="tnum">{formatDate(r.InvoiceDate)}</span> },
    {
      key: "customer",
      header: t("sales.col.customer"),
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.CName || "–"}</p>
          <p className="text-xs text-fog tnum">{r.CNumber}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: t("sales.col.totalWithTax"),
      align: "right",
      render: (r) => (
        <span className={clsx("tnum font-medium", (r.TotalAmountWithTax ?? 0) < 0 ? "text-danger" : "text-ink")}>
          {formatAmount(r.TotalAmountWithTax, r.Currency ?? "ISK")}
        </span>
      ),
    },
    { key: "settled", header: t("sales.col.settled"), align: "center", render: (r) => <SettledBadge invoice={r} /> },
    { key: "sp", header: t("sales.col.salesperson"), width: "110px", render: (r) => r.SalePerson || "–" },
    { key: "voucher", header: t("sales.col.voucher"), width: "100px", render: (r) => <span className="tnum">{r.Voucher || "–"}</span> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            aria-label={t("sales.invoices.dateAria")}
            title={t("sales.invoices.dateTitle")}
            className="w-40"
          />
          <Input
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder={t("sales.invoices.refPlaceholder")}
            aria-label={t("sales.invoices.refAria")}
            className="w-40"
          />
          <Input
            value={spInput}
            onChange={(e) => setSpInput(e.target.value)}
            placeholder={t("sales.invoices.spPlaceholder")}
            aria-label={t("sales.invoices.spAria")}
            className="w-36"
          />
          <Button type="submit" variant="secondary" size="sm">
            <Search className="size-4" /> {t("sales.filters.apply")}
          </Button>
          {(date || refActive || spActive) && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              {t("sales.filters.clear")}
            </Button>
          )}
          <span className="ml-auto flex items-center gap-2">
            {isFetching && <Loader2 className="size-4 animate-spin text-mist" aria-label={t("sales.refreshing")} />}
            <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} aria-label={t("sales.refreshList")}>
              <RefreshCw className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" /> {t("sales.invoices.deleteByReference")}
            </Button>
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> {t("sales.invoices.new")}
            </Button>
          </span>
        </form>

        {source && <p className="border-b border-line px-4 py-2 text-[13px] text-fog">{source}</p>}

        <DataTable
          columns={columns}
          rows={data}
          rowKey={(r, i) => r.Number ?? r.RecordID ?? i}
          loading={isLoading || isFetching}
          error={error}
          onRetry={refetch}
          onRowClick={(r) => r.Number && router.push(`/sales/invoices/${encodeURIComponent(r.Number)}`)}
          onRowHover={(r) =>
            r.Number && prefetch(["sales-invoice", r.Number], `/sales/invoice/${encodeURIComponent(r.Number)}`)
          }
          emptyTitle={t("sales.invoices.emptyTitle")}
          emptyBody={refActive ? t("sales.invoices.emptyRef") : t("sales.invoices.emptyBody")}
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>

      <InvoiceCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <DeleteByReferenceDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}

/**
 * The dkPlus collection defines "Delete By Reference" through the reference
 * lookup endpoint (GET /sales/invoice/reference/:ref with delete=true).
 * Destructive and bulk — double guarded.
 */
function DeleteByReferenceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const t = useT();
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const del = useDkMutation<unknown>({ invalidates: [["sales-invoices"]] });

  function requestDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return setError(t("sales.deleteRef.required"));
    setError(null);
    setConfirming(true);
  }

  function doDelete() {
    del.mutate(
      { path: `/sales/invoice/reference/${encodeURIComponent(ref.trim())}?delete=true`, method: "GET" },
      {
        onSuccess: () => {
          toast.success(t("sales.deleteRef.deleted", { ref: ref.trim() }));
          setConfirming(false);
          setRef("");
          onClose();
        },
        onError: (e) => {
          setConfirming(false);
          toast.error(t("sales.deleteRef.failed"), e.message);
        },
      },
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={t("sales.deleteRef.title")}
        subtitle={t("sales.deleteRef.subtitle")}
      >
        <form onSubmit={requestDelete} className="space-y-4">
          <div className="flex items-start gap-2 rounded-2xl border border-amber/30 bg-amber-soft p-3 text-[13px] leading-relaxed text-soot">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber" />
            <span>{t("sales.deleteRef.warning")}</span>
          </div>
          <Field label={t("sales.kv.reference")} required error={error ?? undefined}>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={t("sales.deleteRef.placeholder")} autoFocus />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("ui.cancel")}
            </Button>
            <Button type="submit" variant="danger" loading={del.isPending}>
              <Trash2 className="size-4" /> {t("sales.deleteRef.deleteBtn")}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("sales.deleteRef.confirmTitle", { ref: ref.trim() })}
        body={t("sales.deleteRef.confirmBody", { ref: ref.trim() })}
        confirmLabel={t("sales.deleteRef.confirmAction")}
        loading={del.isPending}
        onConfirm={doDelete}
      />
    </>
  );
}
