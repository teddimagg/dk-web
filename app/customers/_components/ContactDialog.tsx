"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { ContactUpsertBody, CustomerContact } from "@/lib/api/types/customers";

interface FormState {
  Number: string;
  Name: string;
  Title: string;
  Department: string;
  Email: string;
  Phone: string;
  PhoneMobile: string;
}

const empty: FormState = {
  Number: "",
  Name: "",
  Title: "",
  Department: "",
  Email: "",
  Phone: "",
  PhoneMobile: "",
};

/**
 * Create (POST /customer/:number/Contact) or edit
 * (PUT /customer/:number/contact/:contactNumber) a customer contact.
 */
export function ContactDialog({
  open,
  onClose,
  customerNumber,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  customerNumber: string;
  contact?: CustomerContact;
}) {
  const editing = !!contact;
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm(
        contact
          ? {
              Number: contact.Number ?? "",
              Name: contact.Name ?? "",
              Title: contact.Title ?? "",
              Department: contact.Department ?? "",
              Email: contact.Email ?? "",
              Phone: contact.Phone ?? "",
              PhoneMobile: contact.PhoneMobile ?? "",
            }
          : empty,
      );
      setErrors({});
    }
  }, [open, contact]);

  const save = useDkMutation<unknown>({
    invalidates: [["customer", customerNumber]],
  });

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!editing && !form.Number.trim()) errs.Number = "Contact number is required";
    if (!form.Name.trim()) errs.Name = "Name is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: ContactUpsertBody = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      if (editing && k === "Number") return;
      const v = form[k].trim();
      if (v) body[k] = v;
    });
    if (!editing) body.Number = form.Number.trim();

    const cust = encodeURIComponent(customerNumber);
    save.mutate(
      editing
        ? {
            path: `/customer/${cust}/contact/${encodeURIComponent(contact!.Number)}`,
            method: "PUT",
            body,
          }
        : { path: `/customer/${cust}/Contact`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            editing ? "Contact updated" : "Contact added",
            `${form.Name} was saved on customer ${customerNumber}.`,
          );
          onClose();
        },
        onError: (err) =>
          toast.error(editing ? "Could not update contact" : "Could not add contact", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Edit contact ${contact?.Name || contact?.Number}` : "New contact"}
      subtitle={`Customer ${customerNumber}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number" required error={errors.Number}>
            <Input
              value={form.Number}
              onChange={set("Number")}
              placeholder="e.g. 0002"
              disabled={editing}
              autoFocus={!editing}
            />
          </Field>
          <Field label="Name" required error={errors.Name}>
            <Input value={form.Name} onChange={set("Name")} autoFocus={editing} />
          </Field>
          <Field label="Title">
            <Input value={form.Title} onChange={set("Title")} placeholder="e.g. Ms" />
          </Field>
          <Field label="Department">
            <Input value={form.Department} onChange={set("Department")} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.Email} onChange={set("Email")} />
          </Field>
          <Field label="Phone">
            <Input value={form.Phone} onChange={set("Phone")} />
          </Field>
          <Field label="Mobile">
            <Input value={form.PhoneMobile} onChange={set("PhoneMobile")} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
