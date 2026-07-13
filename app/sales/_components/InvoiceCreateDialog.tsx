"use client";

import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { formatAmount } from "@/lib/format";
import type { InvoiceCalculateBody, InvoiceDraft, SalesInvoice } from "@/lib/api/types/sales";
import { LineEditor, emptyLine, type DraftLine } from "./LineEditor";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * POST /sales/invoice with a PATCH /sales/invoice/calculate preview step so
 * totals can be checked before anything is posted (error prevention).
 */
export function InvoiceCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [customer, setCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [errors, setErrors] = useState<{ customer?: string; lines?: string }>({});
  const [preview, setPreview] = useState<SalesInvoice | null>(null);

  const calculate = useDkMutation<SalesInvoice>();
  const create = useDkMutation<SalesInvoice>({ invalidates: [["sales-invoices"]] });

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!customer.trim()) errs.customer = "Customer number is required";
    const usable = lines.filter((l) => l.ItemCode.trim());
    if (usable.length === 0) errs.lines = "At least one line with an item code is required";
    else if (usable.some((l) => !(Number(l.Quantity) > 0))) errs.lines = "Every line needs a quantity above zero";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function draftLines() {
    return lines
      .filter((l) => l.ItemCode.trim())
      .map((l) => ({
        ItemCode: l.ItemCode.trim(),
        Quantity: Number(l.Quantity) || 0,
        ...(l.UnitPrice.trim() !== "" ? { Price: Number(l.UnitPrice) } : {}),
        ...(l.Text.trim() ? { Text: l.Text.trim() } : {}),
      }));
  }

  function previewTotals() {
    if (!validate()) return;
    const body: InvoiceCalculateBody = {
      Customer: { Number: customer.trim() },
      Date: invoiceDate || undefined,
      Lines: lines
        .filter((l) => l.ItemCode.trim())
        .map((l) => ({ ItemCode: l.ItemCode.trim(), Quantity: Number(l.Quantity) || 0 })),
    };
    calculate.mutate(
      { path: "/sales/invoice/calculate", method: "PATCH", body },
      {
        onSuccess: (data) => setPreview(data),
        onError: (e) => toast.error("Could not calculate totals", e.message),
      },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body: InvoiceDraft = {
      Customer: { Number: customer.trim() },
      Reference: reference.trim() || undefined,
      Date: invoiceDate || undefined,
      InvoiceDate: invoiceDate || undefined,
      Lines: draftLines(),
    };
    create.mutate(
      { path: "/sales/invoice", method: "POST", body },
      {
        onSuccess: (inv) => {
          toast.success(
            inv?.Number ? `Invoice ${inv.Number} created` : "Invoice created",
            inv?.TotalAmountWithTax != null
              ? `Total ${formatAmount(inv.TotalAmountWithTax, inv.Currency ?? "ISK")}`
              : undefined,
          );
          reset();
          onClose();
          if (inv?.Number) router.push(`/sales/invoices/${encodeURIComponent(inv.Number)}`);
        },
        onError: (e) => toast.error("Could not create invoice", e.message),
      },
    );
  }

  function reset() {
    setCustomer("");
    setInvoiceDate(today());
    setReference("");
    setLines([emptyLine()]);
    setPreview(null);
    setErrors({});
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New invoice"
      subtitle="Posts a debit invoice via POST /sales/invoice"
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Customer number" required error={errors.customer}>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. 1710794709"
              autoFocus
            />
          </Field>
          <Field label="Invoice date">
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </Field>
          <Field label="Reference">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. TST-0001" />
          </Field>
        </div>

        <Field label="Lines" required error={errors.lines} hint="Leave unit price empty to use dk price rules">
          <LineEditor lines={lines} onChange={setLines} />
        </Field>

        {preview && (
          <div className="rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
            <p className="text-[13px] font-medium text-ink">
              Preview from dk price, customer and discount rules
            </p>
            <div className="mt-2 space-y-1 text-[13px] text-fog">
              {(preview.Lines ?? []).map((l, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span className="truncate">
                    {l.ItemCode} × {l.Quantity}
                  </span>
                  <span className="tnum shrink-0">
                    {formatAmount(l.TotalAmountWithTax, preview.Currency ?? "ISK")}
                  </span>
                </div>
              ))}
              <div className="mt-1 flex justify-between gap-4 border-t border-line pt-1 font-medium text-ink">
                <span>Total without tax</span>
                <span className="tnum">{formatAmount(preview.TotalAmount, preview.Currency ?? "ISK")}</span>
              </div>
              <div className="flex justify-between gap-4 font-semibold text-ink">
                <span>Total with tax</span>
                <span className="tnum">
                  {formatAmount(preview.TotalAmountWithTax, preview.Currency ?? "ISK")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={previewTotals} loading={calculate.isPending}>
            <Sparkles className="size-4" /> Preview totals
          </Button>
          <Button type="submit" loading={create.isPending}>
            <Plus className="size-4" /> Create invoice
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
