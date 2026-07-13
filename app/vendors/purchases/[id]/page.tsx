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
          toast.success("Purchase order updated", `Order #${id} was saved.`);
          setEditingOrder(false);
        },
        onError: (err) => toast.error("Could not update order", err.message),
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
          toast.success("Line updated", `Line ${seq} of order #${id} was saved.`);
          setEditingLine(null);
        },
        onError: (err) => toast.error("Could not update line", err.message),
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
          toast.success("Line removed", `Line ${seq} was removed from order #${id}.`);
          setDeletingLine(null);
        },
        onError: (err) => toast.error("Could not remove line", err.message),
      },
    );
  }

  function confirmOrderDelete() {
    deleteOrder.mutate(
      { path: `/purchase/${encodeURIComponent(id)}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success("Purchase order deleted", `Order #${id} was removed.`);
          setConfirmDeleteOrder(false);
          router.push("/vendors/purchases");
        },
        onError: (err) => toast.error("Could not delete order", err.message),
      },
    );
  }

  const lineColumns: Column<PurchaseOrderLine>[] = [
    {
      key: "seq",
      header: "Seq",
      width: "80px",
      render: (l) => <span className="font-mono text-xs text-fog">{lineSeq(l) ?? "–"}</span>,
    },
    { key: "warehouse", header: "Warehouse", render: (l) => l.Warehouse ?? "–" },
    { key: "code", header: "Code", render: (l) => <span className="font-medium">{lineCode(l)}</span> },
    { key: "external", header: "External code", render: (l) => l.ExternalCode ?? "–" },
    { key: "text", header: "Description", render: (l) => <span className="text-fog">{l.Description ?? l.Text ?? "–"}</span> },
    { key: "reference", header: "Reference", render: (l) => l.Reference ?? "–" },
    { key: "qty", header: "Qty", align: "right", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    {
      key: "amount",
      header: "Amount",
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
          <Button variant="ghost" size="sm" aria-label={`Edit line ${lineSeq(l)}`} onClick={() => openLineEdit(l)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove line ${lineSeq(l)}`}
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
            aria-label="Back to purchase orders"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            {order ? (
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                Purchase order {order.Number ?? `#${id}`}
                {order.Status != null && order.Status !== "" && <Badge tone="blue">{String(order.Status)}</Badge>}
              </h2>
            ) : (
              <Skeleton className="h-6 w-64" />
            )}
            <p className="text-[13px] text-fog tnum">Record ID {id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openOrderEdit} disabled={!order}>
            <Pencil className="size-4" /> Update order
          </Button>
          <Button variant="danger" onClick={() => setConfirmDeleteOrder(true)} disabled={!order}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <CardTitle icon={<Truck />} className="mb-5">
          Order head
        </CardTitle>
        {order ? (
          <KV
            columns={2}
            items={[
              { label: "Record ID", value: id },
              { label: "Number", value: order.Number },
              { label: "Reference", value: order.Reference },
              { label: "Vendor", value: purchaseVendorLabel(order) },
              { label: "Order date", value: formatDate(order.OrderDate ?? order.Created) },
              { label: "Delivery date", value: formatDate(order.DeliveryDate) === "–" ? null : formatDate(order.DeliveryDate) },
              { label: "Modified", value: formatDate(order.Modified) === "–" ? null : formatDate(order.Modified) },
              {
                label: "Total",
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
          <CardTitle icon={<ClipboardList />}>Order lines</CardTitle>
        </div>
        <DataTable
          columns={lineColumns}
          rows={order?.Lines}
          rowKey={(l, i) => lineSeq(l) ?? i}
          loading={isLoading}
          emptyTitle="No lines"
          emptyBody="This purchase order has no lines."
        />
      </Card>

      {order && <JsonView data={order} />}

      <Dialog
        open={editingOrder}
        onClose={() => setEditingOrder(false)}
        title={`Update order #${id}`}
        subtitle="Sends a PATCH with just the fields below"
      >
        <form onSubmit={submitOrderEdit} className="space-y-4">
          <Field label="Reference">
            <Input
              value={orderDraft.Reference}
              onChange={(e) => setOrderDraft((d) => ({ ...d, Reference: e.target.value }))}
              autoFocus
            />
          </Field>
          <Field label="Vendor number">
            <Input
              value={orderDraft.VendorNumber}
              onChange={(e) => setOrderDraft((d) => ({ ...d, VendorNumber: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingOrder(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateOrder.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editingLine != null}
        onClose={() => setEditingLine(null)}
        title={`Edit line ${editingLine ? (lineSeq(editingLine) ?? "") : ""}`}
        subtitle={`Order #${id}`}
      >
        <form onSubmit={submitLineEdit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Warehouse">
              <Input
                value={lineDraft.Warehouse}
                onChange={(e) => setLineDraft((d) => ({ ...d, Warehouse: e.target.value }))}
              />
            </Field>
            <Field label="Item code">
              <Input
                value={lineDraft.ItemCode}
                onChange={(e) => setLineDraft((d) => ({ ...d, ItemCode: e.target.value }))}
              />
            </Field>
            <Field label="External code">
              <Input
                value={lineDraft.ExternalCode}
                onChange={(e) => setLineDraft((d) => ({ ...d, ExternalCode: e.target.value }))}
              />
            </Field>
            <Field label="Reference">
              <Input
                value={lineDraft.Reference}
                onChange={(e) => setLineDraft((d) => ({ ...d, Reference: e.target.value }))}
              />
            </Field>
            <Field label="Quantity">
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
              Cancel
            </Button>
            <Button type="submit" loading={updateLine.isPending}>
              Save line
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deletingLine != null}
        onClose={() => setDeletingLine(null)}
        title={`Remove line ${deletingLine ? (lineSeq(deletingLine) ?? "") : ""}?`}
        body={
          <>
            This removes line <strong>{deletingLine ? lineCode(deletingLine) : ""}</strong> (qty{" "}
            {formatNumber(deletingLine?.Quantity)}) from purchase order #{id}. This cannot be undone.
          </>
        }
        confirmLabel="Remove line"
        loading={deleteLine.isPending}
        onConfirm={confirmLineDelete}
      />

      <ConfirmDialog
        open={confirmDeleteOrder}
        onClose={() => setConfirmDeleteOrder(false)}
        title={`Delete purchase order #${id}?`}
        body={
          <>
            This permanently deletes purchase order <strong>{String(order?.Number ?? id)}</strong>
            {order ? ` for ${purchaseVendorLabel(order)}` : ""} and all of its lines. This cannot be undone.
          </>
        }
        confirmLabel="Delete order"
        loading={deleteOrder.isPending}
        onConfirm={confirmOrderDelete}
      />
    </div>
  );
}
