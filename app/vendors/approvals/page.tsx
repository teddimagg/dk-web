"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate } from "@/lib/format";
import type { VendorInvoice, VendorInvoiceApprovalBody } from "@/lib/api/types/vendors";
import { invoiceAmount, invoiceId, invoiceNumber, invoiceVendorLabel } from "../_components/helpers";
import { approvalBadge, InvoiceDetailDialog } from "../_components/InvoiceDetailDialog";

interface PendingAction {
  invoice: VendorInvoice;
  /** Approved(0) or Denied(2) */
  action: 0 | 2;
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState("pending");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [comment, setComment] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const toast = useToast();
  const prefetch = usePrefetch();
  const t = useT();

  const pending = useDkQuery<VendorInvoice[]>(
    ["vendor-invoices", "my", "unapproved"],
    "/vendor/invoice/my/unapproved",
    { enabled: tab === "pending" },
  );
  const approved = useDkQuery<VendorInvoice[]>(
    ["vendor-invoices", "my", "approved"],
    "/vendor/invoice/my/approved",
    { enabled: tab === "approved" },
  );

  const setApproval = useDkMutation<unknown>({ invalidates: [["vendor-invoices", "my"]] });

  function submitApproval() {
    if (!pendingAction) return;
    const id = invoiceId(pendingAction.invoice);
    if (id == null) return;
    const approving = pendingAction.action === 0;
    const body: VendorInvoiceApprovalBody = {
      ApprovalAction: pendingAction.action,
      Description: comment.trim() || null,
      Reference: null,
      Dim1: null,
      Dim2: null,
      Dim3: null,
    };
    setApproval.mutate(
      { path: `/vendor/invoice/my/approval/${id}`, method: "PUT", body },
      {
        onSuccess: () => {
          toast.success(
            approving ? t("vendors.approvals.approvedToast") : t("vendors.approvals.rejectedToast"),
            approving
              ? t("vendors.approvals.approvedDetail", { number: invoiceNumber(pendingAction.invoice) })
              : t("vendors.approvals.rejectedDetail", { number: invoiceNumber(pendingAction.invoice) }),
          );
          setPendingAction(null);
          setComment("");
        },
        onError: (err) =>
          toast.error(
            approving ? t("vendors.approvals.approveFailed") : t("vendors.approvals.rejectFailed"),
            err.message,
          ),
      },
    );
  }

  const baseColumns: Column<VendorInvoice>[] = [
    {
      key: "id",
      header: t("vendors.col.id"),
      width: "90px",
      render: (inv) => <span className="font-mono text-xs text-fog">{invoiceId(inv) ?? "–"}</span>,
    },
    { key: "number", header: t("vendors.col.number"), render: (inv) => <span className="font-medium">{invoiceNumber(inv)}</span> },
    { key: "vendor", header: t("vendors.col.vendor"), render: (inv) => invoiceVendorLabel(inv) },
    { key: "date", header: t("vendors.col.date"), width: "110px", render: (inv) => formatDate(inv.Date ?? inv.Created) },
    { key: "due", header: t("vendors.col.due"), width: "110px", render: (inv) => formatDate(inv.DueDate) },
    {
      key: "amount",
      header: t("vendors.col.amount"),
      align: "right",
      render: (inv) => <span className="tnum font-medium">{formatAmount(invoiceAmount(inv), inv.Currency || "ISK")}</span>,
    },
  ];

  const pendingColumns: Column<VendorInvoice>[] = [
    ...baseColumns,
    {
      key: "actions",
      header: "",
      align: "right",
      width: "190px",
      render: (inv) => (
        <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setComment("");
              setPendingAction({ invoice: inv, action: 0 });
            }}
          >
            <Check className="size-4" /> {t("vendors.approvals.approve")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setComment("");
              setPendingAction({ invoice: inv, action: 2 });
            }}
          >
            <X className="size-4" /> {t("vendors.approvals.reject")}
          </Button>
        </span>
      ),
    },
  ];

  const approvedColumns: Column<VendorInvoice>[] = [
    ...baseColumns,
    {
      key: "status",
      header: t("vendors.col.status"),
      align: "right",
      render: (inv) => approvalBadge(inv.ApprovalStatus ?? inv.Status ?? 0, t),
    },
  ];

  const active = tab === "pending" ? pending : approved;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: "pending", label: t("vendors.approvals.myPending"), count: pending.data?.length },
            { id: "approved", label: t("vendors.approvals.myApproved"), count: approved.data?.length },
          ]}
          active={tab}
          onChange={setTab}
        />
        <Button variant="ghost" size="sm" onClick={() => active.refetch()} aria-label={t("vendors.approvals.refreshAria")}>
          <RefreshCw className={active.isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      {tab === "pending" && (
        <Card className="overflow-hidden">
          <DataTable
            columns={pendingColumns}
            rows={pending.data}
            rowKey={(inv, i) => invoiceId(inv) ?? i}
            loading={pending.isLoading || (pending.isFetching && !pending.data)}
            error={pending.error}
            onRetry={pending.refetch}
            emptyTitle={t("vendors.approvals.pendingEmptyTitle")}
            emptyBody={t("vendors.approvals.pendingEmptyBody")}
            onRowClick={(inv) => {
              const id = invoiceId(inv);
              if (id != null) setSelected(id);
            }}
            onRowHover={(inv) => {
              const id = invoiceId(inv);
              if (id != null)
                prefetch(["vendor-invoices", "unprocessed", "detail", id], `/vendor/invoice/unprocessed/${id}`);
            }}
          />
        </Card>
      )}

      {tab === "approved" && (
        <Card className="overflow-hidden">
          <DataTable
            columns={approvedColumns}
            rows={approved.data}
            rowKey={(inv, i) => invoiceId(inv) ?? i}
            loading={approved.isLoading || (approved.isFetching && !approved.data)}
            error={approved.error}
            onRetry={approved.refetch}
            emptyTitle={t("vendors.approvals.approvedEmptyTitle")}
            emptyBody={t("vendors.approvals.approvedEmptyBody")}
            onRowClick={(inv) => {
              const id = invoiceId(inv);
              if (id != null) setSelected(id);
            }}
            onRowHover={(inv) => {
              const id = invoiceId(inv);
              if (id != null)
                prefetch(["vendor-invoices", "unprocessed", "detail", id], `/vendor/invoice/unprocessed/${id}`);
            }}
          />
        </Card>
      )}

      <Dialog
        open={pendingAction != null}
        onClose={() => setPendingAction(null)}
        title={
          pendingAction?.action === 0
            ? t("vendors.approvals.approveTitle", { number: pendingAction ? invoiceNumber(pendingAction.invoice) : "" })
            : t("vendors.approvals.rejectTitle", { number: pendingAction ? invoiceNumber(pendingAction.invoice) : "" })
        }
        subtitle={pendingAction ? invoiceVendorLabel(pendingAction.invoice) : undefined}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitApproval();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-fog">
            {pendingAction?.action === 0 ? t("vendors.approvals.approveBody") : t("vendors.approvals.rejectBody")}{" "}
            {t("vendors.approvals.amount")}{" "}
            <span className="font-semibold text-ink tnum">
              {pendingAction
                ? formatAmount(invoiceAmount(pendingAction.invoice), pendingAction.invoice.Currency || "ISK")
                : ""}
            </span>
          </p>
          <Field label={t("vendors.field.comment")} hint={t("vendors.form.optional")}>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={
                pendingAction?.action === 0
                  ? t("vendors.approvals.approvePlaceholder")
                  : t("vendors.approvals.rejectPlaceholder")
              }
              autoFocus
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPendingAction(null)}>
              {t("ui.cancel")}
            </Button>
            <Button
              type="submit"
              variant={pendingAction?.action === 0 ? "primary" : "danger"}
              loading={setApproval.isPending}
            >
              {pendingAction?.action === 0 ? t("vendors.approvals.approveConfirm") : t("vendors.approvals.rejectConfirm")}
            </Button>
          </div>
        </form>
      </Dialog>

      <InvoiceDetailDialog
        open={selected != null}
        onClose={() => setSelected(null)}
        invoiceId={selected}
        kind="unprocessed"
      />
    </div>
  );
}
