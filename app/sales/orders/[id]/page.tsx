"use client";

import { clsx } from "clsx";
import {
  ArrowLeft,
  ClipboardList,
  Download,
  Eye,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate, formatNumber } from "@/lib/format";
import type { OrderDraft, OrderLineBody, SalesOrder, SalesOrderLine } from "@/lib/api/types/sales";
import { EmailDialog } from "../../_components/EmailDialog";
import { HtmlPreviewDialog } from "../../_components/HtmlPreviewDialog";
import { useRecentIds, RECENT_ORDERS_KEY } from "../../_components/recent";
import { usePdfDownload } from "../../_components/usePdfDownload";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const enc = encodeURIComponent(id);
  const router = useRouter();
  const toast = useToast();
  const pdf = usePdfDownload();
  const { remember, forget } = useRecentIds(RECENT_ORDERS_KEY);

  const [emailOpen, setEmailOpen] = useState(false);
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lineDialog, setLineDialog] = useState<{ line: SalesOrderLine | null } | null>(null);
  const [deletingLine, setDeletingLine] = useState<SalesOrderLine | null>(null);

  const { data: order, isLoading, error, refetch } = useDkQuery<SalesOrder>(
    ["sales-order", id],
    `/sales/order/${enc}`,
  );

  useEffect(() => {
    if (order) remember(id);
  }, [order, id, remember]);

  const deleteOrder = useDkMutation<unknown>({ invalidates: [["sales-order"]] });
  const deleteLine = useDkMutation<unknown>({ invalidates: [["sales-order", id]] });

  function doDeleteOrder() {
    deleteOrder.mutate(
      { path: `/sales/order/${enc}`, method: "DELETE" },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          forget(id);
          toast.success(`Order ${id} deleted`);
          router.push("/sales/orders");
        },
        onError: (e) => {
          setDeleteOpen(false);
          toast.error("Could not delete order", e.message);
        },
      },
    );
  }

  function doDeleteLine() {
    if (deletingLine?.SequenceNumber == null) return;
    deleteLine.mutate(
      { path: `/sales/order/${enc}/line/${deletingLine.SequenceNumber}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success("Order line deleted", `Item ${deletingLine.ItemCode ?? ""}`);
          setDeletingLine(null);
        },
        onError: (e) => {
          setDeletingLine(null);
          toast.error("Could not delete line", e.message);
        },
      },
    );
  }

  const currency = order?.Currency ?? "ISK";
  const lineColumns: Column<SalesOrderLine>[] = [
    { key: "seq", header: "#", width: "70px", render: (l) => <span className="tnum text-fog">{l.SequenceNumber ?? "–"}</span> },
    { key: "item", header: "Item", width: "110px", render: (l) => <span className="font-medium text-ink">{l.ItemCode}</span> },
    {
      key: "text",
      header: "Text",
      render: (l) => (
        <div className="min-w-0">
          <p className="truncate">{l.Text || "–"}</p>
          {l.Text2 && <p className="truncate text-xs text-fog">{l.Text2}</p>}
        </div>
      ),
    },
    { key: "qty", header: "Qty", align: "right", width: "70px", render: (l) => <span className="tnum">{formatNumber(l.Quantity)}</span> },
    {
      key: "price",
      header: "Unit price",
      align: "right",
      render: (l) => <span className="tnum">{formatAmount(l.UnitPrice ?? l.Price, currency)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (l) => (
        <span className={clsx("tnum font-medium", (l.TotalAmount ?? 0) < 0 ? "text-danger" : "text-ink")}>
          {formatAmount(l.TotalAmount, currency)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "90px",
      render: (l) => (
        <span className="flex justify-end gap-1">
          <button
            onClick={() => setLineDialog({ line: l })}
            disabled={l.SequenceNumber == null}
            aria-label={`Edit line ${l.SequenceNumber ?? ""}`}
            title={l.SequenceNumber == null ? "dk returned no line id (SequenceNumber) for this line" : "Edit line"}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-haze hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeletingLine(l)}
            disabled={l.SequenceNumber == null}
            aria-label={`Delete line ${l.SequenceNumber ?? ""}`}
            title={l.SequenceNumber == null ? "dk returned no line id (SequenceNumber) for this line" : "Delete line"}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/sales/orders"
            aria-label="Back to orders"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Order {id}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => pdf.download(`/sales/order/${enc}/pdf`, `order-${id}.pdf`)} loading={pdf.busy}>
            <Download className="size-4" /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setHtmlOpen(true)}>
            <Eye className="size-4" /> Preview
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            <Mail className="size-4" /> Email
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Update
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} />
        </Card>
      ) : order ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<UserRound />} className="mb-5">
                Customer
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Name", value: order.Customer?.Name },
                  { label: "Number", value: order.Customer?.Number },
                  {
                    label: "Address",
                    value: [order.Customer?.Address1, order.Customer?.Address2].filter(Boolean).join(", "),
                  },
                  { label: "Zip", value: order.Customer?.ZipCode },
                  { label: "Deliver to", value: order.DeliverTo?.Name },
                  {
                    label: "Delivery address",
                    value: [order.DeliverTo?.Address1, order.DeliverTo?.Address2].filter(Boolean).join(", "),
                  },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<ClipboardList />} className="mb-5">
                Order
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Order date", value: formatDate(order.OrderDate ?? order.Date) },
                  { label: "Reference", value: order.Reference },
                  { label: "Salesperson", value: order.SalePerson },
                  { label: "Payment term", value: order.PaymentTerm },
                  { label: "Currency", value: order.Currency },
                  {
                    label: "Exchange",
                    value: order.Exchange != null && order.Exchange !== 1 ? formatNumber(order.Exchange) : "",
                  },
                  { label: "Warehouse", value: order.Warehouse },
                  { label: "Total", value: order.TotalAmount != null ? formatAmount(order.TotalAmount, currency) : "" },
                  { label: "Text", value: order.Text1 },
                ]}
              />
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Lines</CardTitle>
              <Button size="sm" variant="secondary" onClick={() => setLineDialog({ line: null })}>
                <Plus className="size-4" /> Add line
              </Button>
            </div>
            <DataTable
              columns={lineColumns}
              rows={order.Lines ?? []}
              rowKey={(l, i) => `${l.SequenceNumber ?? "seq"}-${l.ItemCode ?? "item"}-${i}`}
              emptyTitle="No lines on this order"
              emptyBody="Add the first line with the button above."
            />
          </Card>

          {order.Payments && order.Payments.length > 0 && (
            <Card className="p-6">
              <CardTitle className="mb-5">Payments</CardTitle>
              <KV
                columns={2}
                items={order.Payments.map((p) => ({
                  label: p.Name ?? `Payment ${p.ID ?? ""}`,
                  value: formatAmount(p.Amount, currency),
                }))}
              />
            </Card>
          )}

          <JsonView data={order} />
        </>
      ) : null}

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        path={`/sales/order/${enc}/email`}
        entity={`Order ${id}`}
        defaultSubject={`Order ${id}`}
      />
      <HtmlPreviewDialog
        open={htmlOpen}
        onClose={() => setHtmlOpen(false)}
        path={`/sales/order/${enc}/html`}
        title={`Order ${id}`}
      />
      {order && (
        <OrderUpdateDialog open={editOpen} onClose={() => setEditOpen(false)} orderId={id} order={order} />
      )}
      {lineDialog && (
        <OrderLineDialog
          open
          onClose={() => setLineDialog(null)}
          orderId={id}
          line={lineDialog.line}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete order ${id}?`}
        body={
          <>
            Order <strong>{id}</strong> and all its lines will be deleted in dkPlus. This cannot be
            undone.
          </>
        }
        loading={deleteOrder.isPending}
        onConfirm={doDeleteOrder}
      />
      <ConfirmDialog
        open={!!deletingLine}
        onClose={() => setDeletingLine(null)}
        title="Delete order line?"
        body={
          <>
            Line <strong>{deletingLine?.SequenceNumber}</strong>
            {deletingLine?.ItemCode ? (
              <>
                {" "}
                (item <strong>{deletingLine.ItemCode}</strong>)
              </>
            ) : null}{" "}
            will be removed from order <strong>{id}</strong>. This cannot be undone.
          </>
        }
        confirmLabel="Delete line"
        loading={deleteLine.isPending}
        onConfirm={doDeleteLine}
      />
    </div>
  );
}

/** Header-field update via PUT /sales/order/:id. Lines are managed per-line below. */
function OrderUpdateDialog({
  open,
  onClose,
  orderId,
  order,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  order: SalesOrder;
}) {
  const toast = useToast();
  const [orderDate, setOrderDate] = useState((order.OrderDate ?? order.Date ?? "").slice(0, 10));
  const [reference, setReference] = useState(order.Reference ?? "");
  const [salePerson, setSalePerson] = useState(order.SalePerson ?? "");
  const [paymentTerm, setPaymentTerm] = useState(order.PaymentTerm ?? "");
  const [text1, setText1] = useState(order.Text1 ?? "");
  const update = useDkMutation<unknown>({ invalidates: [["sales-order", orderId]] });

  // The dialog stays mounted across open/close — reseed from the current
  // order on every open so cancelled edits never leak into the next save.
  useEffect(() => {
    if (!open) return;
    setOrderDate((order.OrderDate ?? order.Date ?? "").slice(0, 10));
    setReference(order.Reference ?? "");
    setSalePerson(order.SalePerson ?? "");
    setPaymentTerm(order.PaymentTerm ?? "");
    setText1(order.Text1 ?? "");
  }, [open, order]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = Number(orderId);
    const body: OrderDraft = {
      ...(Number.isFinite(numeric) ? { Number: numeric } : {}),
      Customer: { Number: order.Customer?.Number ?? "" },
      ...(orderDate ? { OrderDate: orderDate } : {}),
      ...(reference.trim() ? { Reference: reference.trim() } : {}),
      ...(salePerson.trim() ? { SalePerson: salePerson.trim() } : {}),
      ...(paymentTerm.trim() ? { PaymentTerm: paymentTerm.trim() } : {}),
      ...(text1.trim() ? { Text1: text1.trim() } : {}),
    };
    update.mutate(
      { path: `/sales/order/${encodeURIComponent(orderId)}`, method: "PUT", body },
      {
        onSuccess: () => {
          toast.success(`Order ${orderId} updated`);
          onClose();
        },
        onError: (err) => toast.error("Could not update order", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Update order ${orderId}`}
      subtitle="Header fields only — lines are edited inline on the order page"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order date">
            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </Field>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <Field label="Salesperson">
            <Input value={salePerson} onChange={(e) => setSalePerson(e.target.value)} />
          </Field>
          <Field label="Payment term">
            <Input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} />
          </Field>
        </div>
        <Field label="Text">
          <Input value={text1} onChange={(e) => setText1(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={update.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Add (POST .../line) or edit (PUT .../line/:lineid) a single order line. */
function OrderLineDialog({
  open,
  onClose,
  orderId,
  line,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  line: SalesOrderLine | null;
}) {
  const toast = useToast();
  const editing = line != null;
  const [itemCode, setItemCode] = useState(line?.ItemCode ?? "");
  const [quantity, setQuantity] = useState(line?.Quantity != null ? String(line.Quantity) : "1");
  const [unitPrice, setUnitPrice] = useState(
    line?.UnitPrice != null ? String(line.UnitPrice) : line?.Price != null ? String(line.Price) : "",
  );
  const [text, setText] = useState(line?.Text ?? "");
  const [error, setError] = useState<string | null>(null);
  const save = useDkMutation<unknown>({ invalidates: [["sales-order", orderId]] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemCode.trim()) return setError("Item code is required");
    if (!(Number(quantity) > 0)) return setError("Quantity must be above zero");
    setError(null);
    const body: OrderLineBody = {
      ItemCode: itemCode.trim(),
      Quantity: Number(quantity),
      ...(editing && line?.SequenceNumber != null ? { SequenceNumber: line.SequenceNumber } : {}),
      ...(unitPrice.trim() !== "" ? { UnitPrice: Number(unitPrice) } : {}),
      ...(text.trim() ? { Text: text.trim() } : {}),
    };
    const enc = encodeURIComponent(orderId);
    save.mutate(
      editing
        ? { path: `/sales/order/${enc}/line/${line!.SequenceNumber}`, method: "PUT", body }
        : { path: `/sales/order/${enc}/line`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(editing ? "Order line updated" : "Order line added", `Item ${itemCode.trim()}`);
          onClose();
        },
        onError: (err) =>
          toast.error(editing ? "Could not update line" : "Could not add line", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Edit line ${line?.SequenceNumber}` : "Add order line"}
      subtitle={`Order ${orderId}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Item code" required>
            <Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} autoFocus={!editing} />
          </Field>
          <Field label="Quantity" required>
            <Input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Field>
          <Field label="Unit price" hint="Empty = dk price rules">
            <Input type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </Field>
        </div>
        <Field label="Text">
          <Input value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save line" : "Add line"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
