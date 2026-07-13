"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";

interface FeeForm {
  from: string;
  to: string;
  amount: string;
  itemCode: string;
  interval: string;
  payMode: string;
  payTerm: string;
  campaign: string;
  salesPerson: string;
  discount: string;
  memo: string;
}

const EMPTY: FeeForm = {
  from: "",
  to: "",
  amount: "",
  itemCode: "",
  interval: "OneTime",
  payMode: "",
  payTerm: "",
  campaign: "",
  salesPerson: "",
  discount: "",
  memo: "",
};

function parseNumber(v: string): number {
  return Number(v.replace(/\./g, "").replace(",", "."));
}

/** Create a one-time or recurring member fee — POST /member/:number/fee. */
export function FeeDialog({
  number,
  memberName,
  open,
  onClose,
}: {
  number: string;
  memberName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [form, setForm] = useState<FeeForm>(EMPTY);
  const [errors, setErrors] = useState<{ from?: string; amount?: string; itemCode?: string }>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open]);

  const create = useDkMutation<unknown>({ invalidates: [["member", number]] });

  const set =
    (k: keyof FeeForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    const errs: typeof errors = {};
    const amount = parseNumber(form.amount);
    if (!form.from) errs.from = t("members.fee.fromRequired");
    if (!form.amount.trim() || Number.isNaN(amount)) errs.amount = t("members.fee.amountInvalid");
    if (!form.itemCode.trim()) errs.itemCode = t("members.fee.itemRequired");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: Record<string, unknown> = {
      Period: { From: form.from, ...(form.to ? { To: form.to } : {}) },
      Amount: amount,
      ItemCode: form.itemCode.trim(),
    };
    if (form.interval.trim()) body.Interval = form.interval.trim();
    if (form.campaign.trim()) body.Campaign = form.campaign.trim();
    if (form.memo.trim()) body.Memo = form.memo.trim();
    if (form.discount.trim()) {
      const d = parseNumber(form.discount);
      if (!Number.isNaN(d)) body.Discount = d;
    }
    if (form.payMode.trim() || form.payTerm.trim()) {
      body.Payment = {
        ...(form.payMode.trim() ? { Mode: form.payMode.trim() } : {}),
        ...(form.payTerm.trim() ? { Term: form.payTerm.trim() } : {}),
      };
    }
    if (form.salesPerson.trim()) {
      // The API doc lists "SalesPerson" but its example body uses "Saleperson" —
      // send both spellings so either server-side key is satisfied.
      body.SalesPerson = form.salesPerson.trim();
      body.Saleperson = form.salesPerson.trim();
    }

    create.mutate(
      { path: `/member/${encodeURIComponent(number)}/fee`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            t("members.fee.created"),
            t("members.fee.createdDetail", { item: form.itemCode.trim(), number }),
          );
          onClose();
        },
        onError: (e) => toast.error(t("members.fee.createFailed"), e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("members.fee.title")}
      subtitle={t("members.fee.subtitle", {
        who: memberName || t("members.fee.memberFallback", { number }),
      })}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("members.fee.from")} required error={errors.from}>
            <Input type="date" value={form.from} onChange={set("from")} autoFocus />
          </Field>
          <Field label={t("members.fee.to")} hint={t("members.optional")}>
            <Input type="date" value={form.to} onChange={set("to")} />
          </Field>
          <Field label={t("members.field.amount")} required error={errors.amount} hint={t("members.fee.amountHint")}>
            <Input inputMode="decimal" value={form.amount} onChange={set("amount")} placeholder="5000" />
          </Field>
          <Field label={t("members.field.itemCode")} required error={errors.itemCode}>
            <Input value={form.itemCode} onChange={set("itemCode")} placeholder="D001" />
          </Field>
          <Field label={t("members.field.interval")} hint={t("members.optional")}>
            <Input list="fee-interval-options" value={form.interval} onChange={set("interval")} placeholder="OneTime" />
          </Field>
          <datalist id="fee-interval-options">
            <option value="OneTime" />
            <option value="Monthly" />
            <option value="Yearly" />
          </datalist>
          <Field label={t("members.field.campaign")} hint={t("members.optional")}>
            <Input value={form.campaign} onChange={set("campaign")} placeholder="c2020d" />
          </Field>
          <Field label={t("members.field.paymentMode")} hint={t("members.optional")}>
            <Input value={form.payMode} onChange={set("payMode")} placeholder="GKR" />
          </Field>
          <Field label={t("members.fee.payTerm")} hint={t("members.optional")}>
            <Input value={form.payTerm} onChange={set("payTerm")} placeholder="D20" />
          </Field>
          <Field label={t("members.field.salesperson")} hint={t("members.optional")}>
            <Input value={form.salesPerson} onChange={set("salesPerson")} placeholder="WEB" />
          </Field>
          <Field label={t("members.field.discount")} hint={t("members.optional")}>
            <Input inputMode="decimal" value={form.discount} onChange={set("discount")} placeholder="0" />
          </Field>
        </div>
        <Field label={t("members.field.memo")} hint={t("members.optional")}>
          <Textarea value={form.memo} onChange={set("memo")} placeholder={t("members.fee.memoPlaceholder")} />
        </Field>
        <p className="text-xs text-mist">{t("members.fee.cardNote")}</p>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={create.isPending}>
            {t("members.fee.create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
