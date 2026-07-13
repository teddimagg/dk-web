"use client";

import { ArrowLeft, ClipboardList, Pencil, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatAmount, formatDate, formatNumber } from "@/lib/format";
import type {
  PurchaseLineUpdateBody,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseUpdateBody,
} from "@/lib/api/types/vendors";
import { asArray, purchaseVendorLabel } from "../../_components/helpers";

function lineSeq(line: PurchaseOrderLine): number | undefined {
  return line.ID ?? line.Sequence ?? line.LineID;
}

function lineCode(line: PurchaseOrderLine): string {
  return line.ItemCode ?? line.Code ?? "–";
}

interface LineDraft {
  Warehouse: string;
  ItemCode: string;
  ExternalCode: string;
  Reference: string;
  Quantity: string;
}

export default function PurchaseDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const toast = useToast();
  const t = useT();

  const [editingOrder, setEditingOrder] = useState(false);
  const [orderDraft, setOrderDraft] = useState({ Reference: "", VendorNumber: "" });
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(false);
  const [editingLine, setEditingLine] = useState<PurchaseOrderLine | null>(null);
  const [lineDraft, setLineDraft] = useState<LineDraft>({
    Warehouse: "",
    ItemCode: "",
    ExternalCode: "",
    Reference: "",
    Quantity: "",
  });
  const [deletingLine, setDeletingLine] = useState<PurchaseOrderLine | null>(null);

  const { data, isLoading, error, refetch } = useDkQuery<PurchaseOrder | PurchaseOrder[]>(
    ["purchase", id],
    `/purchase/id/${encodeURIComponent(id)}`,
  );
  const order = asArray(data)[0];

  const invalidates: unknown[][] = [["purchase", id], ["purchases"]];
  const updateOrder = useDkMutation<unknown>({ invalidates });
  const deleteOrder = useDkMutation<unknown>({ invalidates: [["purchases"]] });
  const updateLine = useDkMutation<unknown>({ invalidates });
  const deleteLine = useDkMutation<unknown>({ invalidates });

  function openOrderEdit() {
    setOrderDraft({
      Reference: order?.Reference ?? "",
      VendorNumber: order?.Vendor?.Number ?? order?.VendorNumber ?? "",
    });
    setEditingOrder(true);
  }

  function submitOrderEdit(e: React.FormEvent) {
    e.preventDefault();
    const body: PurchaseUpdateBody = {};
    if (orderDraft.Reference.trim()) body.Reference = orderDraft.Reference.trim();
    if (orderDraft.VendorNumber.trim()) body.Vendor = { Number: orderDraft.VendorNumber.trim() };
    updateOrder.mutate(
      { path: `/purchase/${encodeURIComponent(id)}`, method: "PATCH", body },
      {
        onSuccess: () => {
          toast.success(t("vendors.purchaseDetail.updated"), t("vendors.purchaseDetail.updatedDetail", { id }));
          setEditingOrder(false);
        },
        onError: (err) => toast.error(t("vendors.purchaseDetail.updateFailed"), err.message),
      },
    );
  }

  function openLineEdit(line: PurchaseOrderLine) {
    setLineDraft({
      Warehouse: line.Warehouse ?? "",
      ItemCode: line.ItemCode ?? line.Code ?? "",
      ExternalCode: line.ExternalCode ?? "",
      Reference: line.Reference ?? "",
      Quantity: line.Quantity != null ? String(line.Quantity) : "",
    });
    setEditingLine(line);
  }

  function submitLineEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLine) return;
    const seq = lineSeq(editingLine);
    if (seq == null) return;
    const body: PurchaseLineUpdateBody = {};
    if (lineDraft.Warehouse.trim()) body.Warehouse = lineDraft.Warehouse.trim();
    if (lineDraft.ItemCode.trim()) body.ItemCode = lineDraft.ItemCode.trim();
    if (lineDraft.ExternalCode.trim()) body.ExternalCode = lineDraft.ExternalCode.trim();
    if (lineDraft.Reference.trim()) body.Reference = lineDraft.Reference.trim();
    const qty = Number(lineDraft.Quantity);
    if (lineDraft.Quantity.trim() && !Number.isNaN(qty)) body.Quantity = qty;
    updateLine.mutate(
      { path: `/purchase/${encodeURIComponent(id)}/line/${seq}`, method: "PATCH", body },
      {
        onSuccess: () => {
          toast.success(
            t("vendors.purchaseDetail.lineUpdated"),
            t("vendors.purchaseDetail.lineUpdatedDetail", { seq, id }),
          );
          setEditingLine(null);
        },
        onError: (err) => toast.error(t("vendors.purchaseDetail.lineUpdateFailed"), err.message),
      },
    );
  }

  function confirmLineDelete() {
    if (!deletingLine) return;
    const seq = lineSeq(deletingLine);
    if (seq == null) return;
    deleteLine.mutate(
      { path: `/purchase/${encodeURIComponent(id)}/line/${seq}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success(
            t("vendors.purchaseDetail.lineRemoved"),
            t("vendors.purchaseDetail.lineRemovedDetail", { seq, id }),
          );
          setDeletingLine(null);
        },
        onError: (err) => toast.error(t("vendors.purchaseDetail.lineRemoveFailed"), err.message),
      },
    );
  }

  function confirmOrderDelete() {
    deleteOrder.mutate(
      { path: `/purchase/${encodeURIComponent(id)}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success(t("vendors.purchaseDetail.deleted"), t("vendors.purchaseDetail.deletedDetail", { id }));
          setConfirmDeleteOrder(false);
          router.push("/vendors/purchases");
        },
        onError: (err) => toast.error(t("vendors.purchaseDetail.deleteFailed"), err.message),
      },
    );
  }

  const lineColumns: Column<PurchaseOrderLine>[] = [
    {
      key: "seq",
      header: t("vendors.col.seq"),
      width: "80px",
      render: (l) => <span className="font-mono text-xs text-fog">{lineSeq(l) ?? "–"}</span>,
    },
    { key: "warehouse", header: t("vendors.col.warehouse"), render: (l) => l.Warehouse ?? "–" },
    { key: "code", header: t("vendors.col.code"), render: (l) => <span className="font-medium">{lineCode(l)}</span> },
    { key: "external", header: t("vendors.col.externalCode"), render: (l) => l.ExternalCode ?? "–" },
    { key: "text", header: t("vendors.field.description"), render: (l) => <span className="text-fog">{l.Description ?? l.Text ?? "–"}</span> },
    { key: "reference", header: t("vendors.col.reference"), render: (l) => l.Reference ?? "–" },
    { key: "qty", header: t("vendors.col.qty"), align: "right", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    {
      key: "amount",
      header: t("vendors.col.amount"),
      align: "right",
      render: (l) =>
        l.Amount != null || l.TotalAmount != null || l.UnitPrice != null || l.Price != null ? (
          <span className="tnum">{formatAmount(l.Amount ?? l.TotalAmount ?? l.UnitPrice ?? l.Price)}</span>
        ) : (
          "–"
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "100px",
      render: (l) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("vendors.lines.edit", { n: lineSeq(l) ?? "" })}
            onClick={() => openLineEdit(l)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("vendors.lines.remove", { n: lineSeq(l) ?? "" })}
            onClick={() => setDeletingLine(l)}
          >
            <Trash2 className="size-4 text-danger" />
          </Button>
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <ErrorState error={error} onRetry={refetch} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/vendors/purchases"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
            aria-label={t("vendors.purchaseDetail.back")}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            {order ? (
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                {t("vendors.purchaseDetail.title", { number: order.Number ?? `#${id}` })}
                {order.Status != null && order.Status !== "" && <Badge tone="blue">{String(order.Status)}</Badge>}
              </h2>
            ) : (
              <Skeleton className="h-6 w-64" />
            )}
            <p className="text-[13px] text-fog tnum">{t("vendors.purchaseDetail.recordId", { id })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openOrderEdit} disabled={!order}>
            <Pencil className="size-4" /> {t("vendors.purchaseDetail.update")}
          </Button>
          <Button variant="danger" onClick={() => setConfirmDeleteOrder(true)} disabled={!order}>
            <Trash2 className="size-4" /> {t("ui.delete")}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <CardTitle icon={<Truck />} className="mb-5">
          {t("vendors.purchaseDetail.head")}
        </CardTitle>
        {order ? (
          <KV
            columns={2}
            items={[
              { label: t("vendors.purchases.recordId"), value: id },
              { label: t("vendors.col.number"), value: order.Number },
              { label: t("vendors.col.reference"), value: order.Reference },
              { label: t("vendors.col.vendor"), value: purchaseVendorLabel(order) },
              { label: t("vendors.col.orderDate"), value: formatDate(order.OrderDate ?? order.Created) },
              {
                label: t("vendors.field.deliveryDate"),
                value: formatDate(order.DeliveryDate) === "–" ? null : formatDate(order.DeliveryDate),
              },
              {
                label: t("vendors.field.modified"),
                value: formatDate(order.Modified) === "–" ? null : formatDate(order.Modified),
              },
              {
                label: t("vendors.field.total"),
                value: order.TotalAmount != null ? formatAmount(order.TotalAmount, order.Currency || "ISK") : null,
              },
            ]}
          />
        ) : (
          <Skeleton className="h-40" />
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <CardTitle icon={<ClipboardList />}>{t("vendors.purchaseDetail.lines")}</CardTitle>
        </div>
        <DataTable
          columns={lineColumns}
          rows={order?.Lines}
          rowKey={(l, i) => lineSeq(l) ?? i}
          loading={isLoading}
          emptyTitle={t("vendors.lines.emptyTitle")}
          emptyBody={t("vendors.purchaseDetail.linesEmptyBody")}
        />
      </Card>

      {order && <JsonView data={order} />}

      <Dialog
        open={editingOrder}
        onClose={() => setEditingOrder(false)}
        title={t("vendors.purchaseDetail.updateTitle", { id })}
        subtitle={t("vendors.purchaseDetail.updateSubtitle")}
      >
        <form onSubmit={submitOrderEdit} className="space-y-4">
          <Field label={t("vendors.col.reference")}>
            <Input
              value={orderDraft.Reference}
              onChange={(e) => setOrderDraft((d) => ({ ...d, Reference: e.target.value }))}
              autoFocus
            />
          </Field>
          <Field label={t("vendors.field.number")}>
            <Input
              value={orderDraft.VendorNumber}
              onChange={(e) => setOrderDraft((d) => ({ ...d, VendorNumber: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingOrder(false)}>
              {t("ui.cancel")}
            </Button>
            <Button type="submit" loading={updateOrder.isPending}>
              {t("vendors.form.save")}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editingLine != null}
        onClose={() => setEditingLine(null)}
        title={t("vendors.lines.edit", { n: editingLine ? (lineSeq(editingLine) ?? "") : "" })}
        subtitle={t("vendors.purchaseDetail.orderNo", { id })}
      >
        <form onSubmit={submitLineEdit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("vendors.col.warehouse")}>
              <Input
                value={lineDraft.Warehouse}
                onChange={(e) => setLineDraft((d) => ({ ...d, Warehouse: e.target.value }))}
              />
            </Field>
            <Field label={t("vendors.field.itemCode")}>
              <Input
                value={lineDraft.ItemCode}
                onChange={(e) => setLineDraft((d) => ({ ...d, ItemCode: e.target.value }))}
              />
            </Field>
            <Field label={t("vendors.col.externalCode")}>
              <Input
                value={lineDraft.ExternalCode}
                onChange={(e) => setLineDraft((d) => ({ ...d, ExternalCode: e.target.value }))}
              />
            </Field>
            <Field label={t("vendors.col.reference")}>
              <Input
                value={lineDraft.Reference}
                onChange={(e) => setLineDraft((d) => ({ ...d, Reference: e.target.value }))}
              />
            </Field>
            <Field label={t("vendors.field.quantity")}>
              <Input
                inputMode="decimal"
                value={lineDraft.Quantity}
                onChange={(e) => setLineDraft((d) => ({ ...d, Quantity: e.target.value }))}
                className="text-right tnum"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingLine(null)}>
              {t("ui.cancel")}
            </Button>
            <Button type="submit" loading={updateLine.isPending}>
              {t("vendors.purchaseDetail.saveLine")}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deletingLine != null}
        onClose={() => setDeletingLine(null)}
        title={t("vendors.lines.removeTitle", { n: deletingLine ? (lineSeq(deletingLine) ?? "") : "" })}
        body={t("vendors.purchaseDetail.removeLineBody", {
          code: deletingLine ? lineCode(deletingLine) : "",
          qty: formatNumber(deletingLine?.Quantity),
          id,
        })}
        confirmLabel={t("vendors.purchaseDetail.removeLineConfirm")}
        loading={deleteLine.isPending}
        onConfirm={confirmLineDelete}
      />

      <ConfirmDialog
        open={confirmDeleteOrder}
        onClose={() => setConfirmDeleteOrder(false)}
        title={t("vendors.purchaseDetail.deleteTitle", { id })}
        body={
          order
            ? t("vendors.purchaseDetail.deleteBodyVendor", {
                number: String(order.Number ?? id),
                vendor: purchaseVendorLabel(order),
              })
            : t("vendors.purchaseDetail.deleteBody", { number: id })
        }
        confirmLabel={t("vendors.purchaseDetail.deleteConfirm")}
        loading={deleteOrder.isPending}
        onConfirm={confirmOrderDelete}
      />
    </div>
  );
}
