"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { OrderDraft, QuoteDraft } from "@/lib/api/types/sales";
import { LineEditor, emptyLine, type DraftLine } from "./LineEditor";

const today = () => new Date().toISOString().slice(0, 10);

/** Pull a document number out of whatever shape dk answers a create with. */
export function extractDocNumber(d: unknown): string | null {
  if (d == null) return null;
  if (typeof d === "number") return String(d);
  if (typeof d === "string") return d.trim() || null;
  if (typeof d === "object") {
    const o = d as Record<string, unknown>;
    for (const k of ["Number", "ID", "Id", "OrderNumber"]) {
      const v = o[k];
      if (typeof v === "number") return String(v);
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

/**
 * Create dialog shared by orders (POST /sales/order) and quotes
 * (POST /sales/quote) — the two bodies differ only in the date field name
 * (OrderDate vs Date) and the payment-term field.
 */
export function DocumentCreateDialog({
  open,
  onClose,
  kind,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  kind: "order" | "quote";
  /** Called with the new document number when dk returns one. */
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [customer, setCustomer] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(today());
  const [reference, setReference] = useState("");
  const [salePerson, setSalePerson] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [errors, setErrors] = useState<{ customer?: string; lines?: string }>({});

  const create = useDkMutation<unknown>({
    invalidates: [[kind === "order" ? "sales-order" : "sales-quote"]],
  });

  const label = kind === "order" ? "Order" : "Quote";

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!customer.trim()) errs.customer = "Customer number is required";
    const usable = lines.filter((l) => l.ItemCode.trim());
    if (usable.length === 0) errs.lines = "At least one line with an item code is required";
    else if (usable.some((l) => !(Number(l.Quantity) > 0))) errs.lines = "Every line needs a quantity above zero";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const draftLines = lines
      .filter((l) => l.ItemCode.trim())
      .map((l) => ({
        ItemCode: l.ItemCode.trim(),
        Quantity: Number(l.Quantity) || 0,
        ...(l.UnitPrice.trim() !== "" ? { UnitPrice: Number(l.UnitPrice) } : {}),
        ...(l.Text.trim() ? { Text: l.Text.trim() } : {}),
      }));

    const common = {
      Customer: { Number: customer.trim(), ...(customerName.trim() ? { Name: customerName.trim() } : {}) },
      ...(reference.trim() ? { Reference: reference.trim() } : {}),
      ...(salePerson.trim() ? { SalePerson: salePerson.trim() } : {}),
      Lines: draftLines,
    };
    const body: OrderDraft | QuoteDraft =
      kind === "order"
        ? {
            ...common,
            ...(date ? { OrderDate: date } : {}),
            ...(paymentTerm.trim() ? { PaymentTerm: paymentTerm.trim() } : {}),
          }
        : { ...common, ...(date ? { Date: date } : {}) };

    create.mutate(
      { path: kind === "order" ? "/sales/order" : "/sales/quote", method: "POST", body },
      {
        onSuccess: (data) => {
          const id = extractDocNumber(data);
          toast.success(
            id ? `${label} ${id} created` : `${label} created`,
            id ? undefined : `dk did not return a number — look it up by number when known.`,
          );
          reset();
          onClose();
          if (id) {
            onCreated?.(id);
            router.push(`/sales/${kind === "order" ? "orders" : "quotes"}/${encodeURIComponent(id)}`);
          }
        },
        onError: (e) => toast.error(`Could not create ${label.toLowerCase()}`, e.message),
      },
    );
  }

  function reset() {
    setCustomer("");
    setCustomerName("");
    setDate(today());
    setReference("");
    setSalePerson("");
    setPaymentTerm("");
    setLines([emptyLine()]);
    setErrors({});
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`New ${label.toLowerCase()}`}
      subtitle={`POST /sales/${kind} with customer and lines`}
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer number" required error={errors.customer}>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. 1710794709"
              autoFocus
            />
          </Field>
          <Field label="Customer name" hint="Optional override">
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </Field>
        </div>
        <div className={`grid gap-4 ${kind === "order" ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
          <Field label={kind === "order" ? "Order date" : "Quote date"}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ABCD" />
          </Field>
          <Field label="Salesperson">
            <Input value={salePerson} onChange={(e) => setSalePerson(e.target.value)} placeholder="e.g. web" />
          </Field>
          {kind === "order" && (
            <Field label="Payment term">
              <Input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} placeholder="e.g. IB" />
            </Field>
          )}
        </div>

        <Field label="Lines" required error={errors.lines} hint="Leave unit price empty to use dk price rules">
          <LineEditor lines={lines} onChange={setLines} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            <Plus className="size-4" /> Create {label.toLowerCase()}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
