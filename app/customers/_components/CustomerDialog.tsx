"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { Customer, CustomerUpsertBody } from "@/lib/api/types/customers";

interface FormState {
  Number: string;
  Name: string;
  SSNumber: string;
  Address1: string;
  Address2: string;
  City: string;
  ZipCode: string;
  Phone: string;
  PhoneMobile: string;
  Email: string;
}

const empty: FormState = {
  Number: "",
  Name: "",
  SSNumber: "",
  Address1: "",
  Address2: "",
  City: "",
  ZipCode: "",
  Phone: "",
  PhoneMobile: "",
  Email: "",
};

function fromCustomer(c: Customer): FormState {
  return {
    Number: c.Number ?? "",
    Name: c.Name ?? "",
    SSNumber: c.SSNumber ?? "",
    Address1: c.Address1 ?? "",
    Address2: c.Address2 ?? "",
    City: c.City ?? "",
    ZipCode: c.ZipCode ?? "",
    Phone: c.Phone ?? "",
    PhoneMobile: c.PhoneMobile ?? "",
    Email: c.Email ?? "",
  };
}

/**
 * Create (POST /customer) or edit (PUT /customer/:number) a customer.
 * Pass `customer` to switch into edit mode.
 */
export function CustomerDialog({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer;
}) {
  const editing = !!customer;
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const toast = useToast();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (open) {
      setForm(customer ? fromCustomer(customer) : empty);
      setErrors({});
    }
  }, [open, customer]);

  const save = useDkMutation<unknown>({
    invalidates: editing
      ? [["customers"], ["customer", customer!.Number]]
      : [["customers"]],
  });

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!editing && !form.Number.trim()) errs.Number = t("customers.dialog.numberRequired");
    if (!form.Name.trim()) errs.Name = t("customers.dialog.nameRequired");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: CustomerUpsertBody = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      if (editing && k === "Number") return; // number is the path segment
      const v = form[k].trim();
      if (v) body[k] = v;
    });
    if (!editing) body.Number = form.Number.trim();

    save.mutate(
      editing
        ? { path: `/customer/${encodeURIComponent(customer!.Number)}`, method: "PUT", body }
        : { path: "/customer", method: "POST", body },
      {
        onSuccess: () => {
          if (editing) {
            toast.success(t("customers.toast.updated"), t("customers.toast.updatedDetail", { name: form.Name }));
          } else {
            toast.success(
              t("customers.toast.created"),
              t("customers.toast.createdDetail", { name: form.Name, number: form.Number }),
            );
            router.push(`/customers/${encodeURIComponent(form.Number.trim())}`);
          }
          onClose();
        },
        onError: (err) =>
          toast.error(
            editing ? t("customers.toast.updateFailed") : t("customers.toast.createFailed"),
            err.message,
          ),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        editing
          ? t("customers.dialog.editTitle", { name: customer?.Name || customer?.Number || "" })
          : t("customers.dialog.newTitle")
      }
      subtitle={
        editing
          ? t("customers.dialog.editSubtitle", { number: customer?.Number ?? "" })
          : t("customers.dialog.newSubtitle")
      }
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("customers.field.number")} required error={errors.Number}>
            <Input
              value={form.Number}
              onChange={set("Number")}
              placeholder={t("customers.dialog.numberPlaceholder")}
              disabled={editing}
              autoFocus={!editing}
            />
          </Field>
          <Field label={t("customers.field.name")} required error={errors.Name}>
            <Input
              value={form.Name}
              onChange={set("Name")}
              placeholder={t("customers.dialog.namePlaceholder")}
              autoFocus={editing}
            />
          </Field>
          <Field label={t("customers.field.ssn")} hint={t("customers.dialog.ssnHint")}>
            <Input value={form.SSNumber} onChange={set("SSNumber")} />
          </Field>
          <Field label={t("customers.field.email")}>
            <Input type="email" value={form.Email} onChange={set("Email")} />
          </Field>
          <Field label={t("customers.field.address")}>
            <Input value={form.Address1} onChange={set("Address1")} />
          </Field>
          <Field label={t("customers.field.address2")}>
            <Input value={form.Address2} onChange={set("Address2")} />
          </Field>
          <Field label={t("customers.field.city")}>
            <Input value={form.City} onChange={set("City")} />
          </Field>
          <Field label={t("customers.field.zip")}>
            <Input value={form.ZipCode} onChange={set("ZipCode")} />
          </Field>
          <Field label={t("customers.field.phone")}>
            <Input value={form.Phone} onChange={set("Phone")} />
          </Field>
          <Field label={t("customers.field.mobile")}>
            <Input value={form.PhoneMobile} onChange={set("PhoneMobile")} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? t("customers.dialog.saveChanges") : t("customers.dialog.create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
