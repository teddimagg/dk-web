"use client";

import { Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { formatAmount } from "@/lib/format";
import type {
  VendorInvoiceCreateBody,
  VendorInvoiceCreateLine,
  VendorInvoiceLineType,
} from "@/lib/api/types/vendors";

interface LineDraft {
  Account: string;
  Type: VendorInvoiceLineType;
  Text: string;
  Amount: string;
  Reference: string;
}

const EMPTY_LINE: LineDraft = { Account: "", Type: "Expenses", Text: "", Amount: "", Reference: "" };

/** Creates a vendor invoice via POST /Vendor/:number/Invoice for the given vendor. */
export function NewVendorInvoiceForm({ vendorNumber, vendorName }: { vendorNumber: string; vendorName?: string }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [number, setNumber] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useDkMutation<unknown>({
    invalidates: [["vendor-invoices"], ["vendor-transactions"]],
  });

  const setLine = (i: number, patch: Partial<LineDraft>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const total = lines.reduce((sum, l) => sum + (Number(l.Amount) || 0), 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!number.trim()) errs.number = "Invoice number is required";
    if (!date) errs.date = "Invoice date is required";
    lines.forEach((l, i) => {
      if (!l.Account.trim()) errs[`line-${i}-account`] = "Required";
      if (!l.Amount.trim() || Number.isNaN(Number(l.Amount))) errs[`line-${i}-amount`] = "Numeric amount required";
    });
    if (lines.length === 0) errs.lines = "At least one line is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: VendorInvoiceCreateBody = {
      Number: number.trim(),
      Date: `${date}T00:00:00`,
      Lines: lines.map((l): VendorInvoiceCreateLine => {
        const line: VendorInvoiceCreateLine = {
          Account: l.Account.trim(),
          Type: l.Type,
          Amount: Number(l.Amount),
        };
        if (l.Text.trim()) line.Text = l.Text.trim();
        if (l.Reference.trim()) line.Reference = l.Reference.trim();
        return line;
      }),
    };
    if (reference.trim()) body.Reference = reference.trim();
    if (description.trim()) body.Description = description.trim();
    if (text.trim()) body.Text = text.trim();
    if (dueDate) body.DueDate = `${dueDate}T00:00:00`;
    if (currency.trim()) body.Currency = currency.trim().toUpperCase();

    create.mutate(
      { path: `/Vendor/${encodeURIComponent(vendorNumber)}/Invoice`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            "Vendor invoice created",
            `Invoice ${body.Number} for ${vendorName ?? vendorNumber} was registered.`,
          );
          setNumber("");
          setReference("");
          setDescription("");
          setText("");
          setDueDate("");
          setCurrency("");
          setLines([{ ...EMPTY_LINE }]);
          setErrors({});
        },
        onError: (err) => toast.error("Could not create invoice", err.message),
      },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Invoice number" required error={errors.number}>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. SR-12345" />
        </Field>
        <Field label="Invoice date" required error={errors.date}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Due date">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="Reference">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. F96354-ABCD" />
        </Field>
        <Field label="Currency" hint="blank = ISK">
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="ISK" maxLength={3} />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </Field>
      </div>
      <Field label="Text" hint="optional, shown on the invoice">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-medium text-soot">Lines</p>
          {errors.lines && <span className="text-xs text-danger">{errors.lines}</span>}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}
          >
            <Plus className="size-4" /> Add line
          </Button>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div
              key={i}
              className="grid items-start gap-2 rounded-2xl border border-line bg-haze/40 p-3 sm:grid-cols-[110px_130px_1fr_120px_110px_36px]"
            >
              <Field label="Account" required error={errors[`line-${i}-account`]}>
                <Input value={l.Account} onChange={(e) => setLine(i, { Account: e.target.value })} placeholder="1100" />
              </Field>
              <Field label="Type">
                <Select
                  value={l.Type}
                  onChange={(e) => setLine(i, { Type: e.target.value as VendorInvoiceLineType })}
                >
                  <option value="Expenses">Expenses</option>
                  <option value="Payment">Payment</option>
                </Select>
              </Field>
              <Field label="Text">
                <Input value={l.Text} onChange={(e) => setLine(i, { Text: e.target.value })} />
              </Field>
              <Field label="Amount" required error={errors[`line-${i}-amount`]}>
                <Input
                  inputMode="decimal"
                  value={l.Amount}
                  onChange={(e) => setLine(i, { Amount: e.target.value })}
                  placeholder="0"
                  className="text-right tnum"
                />
              </Field>
              <Field label="Reference">
                <Input value={l.Reference} onChange={(e) => setLine(i, { Reference: e.target.value })} />
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

      <div className="flex items-center justify-between border-t border-line pt-4">
        <p className="text-sm text-fog">
          Total <span className="ml-1 font-semibold text-ink tnum">{formatAmount(total, currency.trim().toUpperCase() || "ISK")}</span>
        </p>
        <Button type="submit" loading={create.isPending}>
          <Send className="size-4" /> Create invoice
        </Button>
      </div>
    </form>
  );
}
