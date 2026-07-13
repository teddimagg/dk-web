"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { Vendor, VendorWriteBody } from "@/lib/api/types/vendors";

interface FormState {
  Number: string;
  SSNumber: string;
  Name: string;
  Alias: string;
  Address1: string;
  Address2: string;
  City: string;
  ZipCode: string;
  Phone: string;
  Email: string;
  PaymentMode: string;
  LedgerCode: string;
  Comment: string;
}

const EMPTY: FormState = {
  Number: "",
  SSNumber: "",
  Name: "",
  Alias: "",
  Address1: "",
  Address2: "",
  City: "",
  ZipCode: "",
  Phone: "",
  Email: "",
  PaymentMode: "",
  LedgerCode: "",
  Comment: "",
};

function fromVendor(v: Vendor): FormState {
  return {
    Number: v.Number ?? "",
    SSNumber: v.SSNumber ?? "",
    Name: v.Name ?? "",
    Alias: v.Alias ?? "",
    Address1: v.Address1 ?? "",
    Address2: v.Address2 ?? "",
    City: v.City ?? "",
    ZipCode: v.ZipCode ?? "",
    Phone: v.Phone ?? "",
    Email: v.Email ?? "",
    PaymentMode: v.PaymentMode ?? "",
    LedgerCode: v.LedgerCode ?? "",
    Comment: v.Comment ?? "",
  };
}

/**
 * Create (POST /vendor) or edit (PUT /vendor/:number) a vendor.
 * Pass `vendor` to switch to edit mode.
 */
export function VendorFormDialog({
  open,
  onClose,
  vendor,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor;
  onCreated?: (number: string) => void;
}) {
  const editing = !!vendor;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm(vendor ? fromVendor(vendor) : EMPTY);
      setErrors({});
    }
  }, [open, vendor]);

  const save = useDkMutation<unknown>({ invalidates: [["vendors"], ["vendor"]] });

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!editing && !form.Number.trim()) errs.Number = "Vendor number is required";
    if (!form.Name.trim()) errs.Name = "Name is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: VendorWriteBody = {};
    if (!editing) body.Number = form.Number.trim();
    (
      ["SSNumber", "Name", "Alias", "Address1", "Address2", "City", "ZipCode", "Phone", "Email", "PaymentMode", "LedgerCode", "Comment"] as const
    ).forEach((k) => {
      const v = form[k].trim();
      if (editing || v) body[k] = v;
    });

    save.mutate(
      editing
        ? { path: `/vendor/${encodeURIComponent(vendor!.Number)}`, method: "PUT", body }
        : { path: "/vendor", method: "POST", body },
      {
        onSuccess: () => {
          if (editing) {
            toast.success("Vendor updated", `${form.Name || vendor!.Number} was saved.`);
          } else {
            toast.success("Vendor created", `${form.Name} (${form.Number}) is now in the register.`);
            onCreated?.(form.Number.trim());
          }
          onClose();
        },
        onError: (err) => toast.error(editing ? "Could not update vendor" : "Could not create vendor", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${vendor?.Name ?? vendor?.Number}` : "New vendor"}
      subtitle={editing ? `Vendor Nº ${vendor?.Number}` : "Registers a new vendor in dkPlus"}
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vendor number" required={!editing} error={errors.Number}>
            <Input
              value={form.Number}
              onChange={set("Number")}
              placeholder="e.g. 2510793319"
              disabled={editing}
              autoFocus={!editing}
            />
          </Field>
          <Field label="SSN (kennitala)">
            <Input value={form.SSNumber} onChange={set("SSNumber")} placeholder="e.g. 2510793319" />
          </Field>
          <Field label="Name" required error={errors.Name} className="sm:col-span-2">
            <Input value={form.Name} onChange={set("Name")} placeholder="Vendor name" autoFocus={editing} />
          </Field>
          <Field label="Alias">
            <Input value={form.Alias} onChange={set("Alias")} />
          </Field>
          <Field label="Ledger code" hint="e.g. 0001">
            <Input value={form.LedgerCode} onChange={set("LedgerCode")} />
          </Field>
          <Field label="Payment mode" hint="e.g. BM">
            <Input value={form.PaymentMode} onChange={set("PaymentMode")} />
          </Field>
          <Field label="Phone">
            <Input value={form.Phone} onChange={set("Phone")} />
          </Field>
          <Field label="Address">
            <Input value={form.Address1} onChange={set("Address1")} />
          </Field>
          <Field label="Address 2">
            <Input value={form.Address2} onChange={set("Address2")} />
          </Field>
          <Field label="Zip code">
            <Input value={form.ZipCode} onChange={set("ZipCode")} />
          </Field>
          <Field label="City">
            <Input value={form.City} onChange={set("City")} />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <Input type="email" value={form.Email} onChange={set("Email")} />
          </Field>
          <Field label="Comment" className="sm:col-span-2">
            <Textarea value={form.Comment} onChange={set("Comment")} rows={2} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Create vendor"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
