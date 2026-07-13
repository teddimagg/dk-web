"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { PurchaseCodeType, PurchaseCreateBody, PurchaseCreateLine } from "@/lib/api/types/vendors";

interface LineDraft {
  Warehouse: string;
  Code: string;
  CodeType: PurchaseCodeType;
  Reference: string;
  Quantity: string;
}

const EMPTY_LINE: LineDraft = { Warehouse: "", Code: "", CodeType: "ItemCode", Reference: "", Quantity: "1" };

/** New purchase order via POST /purchase (body is an array of orders — we send one). */
export function PurchaseFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [vendorNumber, setVendorNumber] = useState("");
  const [reference, setReference] = useState("");
  const [orderDate, setOrderDate] = useState(today);
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setVendorNumber("");
      setReference("");
      setOrderDate(today);
      setLines([{ ...EMPTY_LINE }]);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const create = useDkMutation<unknown>({ invalidates: [["purchases"]] });

  const setLine = (i: number, patch: Partial<LineDraft>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!vendorNumber.trim()) errs.vendor = "Vendor number is required";
    lines.forEach((l, i) => {
      if (!l.Code.trim()) errs[`line-${i}-code`] = "Required";
      const qty = Number(l.Quantity);
      if (!l.Quantity.trim() || Number.isNaN(qty) || qty <= 0) errs[`line-${i}-qty`] = "Positive number";
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const order: PurchaseCreateBody = {
      Vendor: { Number: vendorNumber.trim() },
      Lines: lines.map((l): PurchaseCreateLine => {
        const line: PurchaseCreateLine = {
          Code: l.Code.trim(),
          CodeType: l.CodeType,
          Quantity: Number(l.Quantity),
        };
        if (l.Warehouse.trim()) line.Warehouse = l.Warehouse.trim();
        if (l.Reference.trim()) line.Reference = l.Reference.trim();
        return line;
      }),
    };
    if (reference.trim()) order.Reference = reference.trim();
    if (orderDate) order.OrderDate = `${orderDate}T00:00:00`;

    create.mutate(
      { path: "/purchase", method: "POST", body: [order] },
      {
        onSuccess: () => {
          toast.success(
            "Purchase order created",
            `Order for vendor ${order.Vendor.Number} with ${order.Lines.length} line${order.Lines.length === 1 ? "" : "s"} was created.`,
          );
          onClose();
        },
        onError: (err) => toast.error("Could not create purchase order", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New purchase order"
      subtitle="Creates an order via POST /purchase"
      wide
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Vendor number" required error={errors.vendor}>
            <Input
              value={vendorNumber}
              onChange={(e) => setVendorNumber(e.target.value)}
              placeholder="e.g. 6611982499"
              autoFocus
            />
          </Field>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. LDR-14143" />
          </Field>
          <Field label="Order date">
            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium text-soot">Lines</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}>
              <Plus className="size-4" /> Add line
            </Button>
          </div>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div
                key={i}
                className="grid items-start gap-2 rounded-2xl border border-line bg-haze/40 p-3 sm:grid-cols-[110px_1fr_150px_130px_90px_36px]"
              >
                <Field label="Warehouse" hint="opt.">
                  <Input value={l.Warehouse} onChange={(e) => setLine(i, { Warehouse: e.target.value })} placeholder="bg1" />
                </Field>
                <Field label="Code" required error={errors[`line-${i}-code`]}>
                  <Input value={l.Code} onChange={(e) => setLine(i, { Code: e.target.value })} placeholder="00001" />
                </Field>
                <Field label="Code type">
                  <Select
                    value={l.CodeType}
                    onChange={(e) => setLine(i, { CodeType: e.target.value as PurchaseCodeType })}
                  >
                    <option value="ItemCode">Item code</option>
                    <option value="Barcode">Barcode</option>
                    <option value="VendorItemCode">Vendor item code</option>
                  </Select>
                </Field>
                <Field label="Reference">
                  <Input value={l.Reference} onChange={(e) => setLine(i, { Reference: e.target.value })} />
                </Field>
                <Field label="Qty" required error={errors[`line-${i}-qty`]}>
                  <Input
                    inputMode="decimal"
                    value={l.Quantity}
                    onChange={(e) => setLine(i, { Quantity: e.target.value })}
                    className="text-right tnum"
                  />
                </Field>
                <div className="pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove line ${i + 1}`}
                    disabled={lines.length === 1}
                    onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create order
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
