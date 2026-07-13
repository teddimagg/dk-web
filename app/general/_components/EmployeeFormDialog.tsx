"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { Employee } from "@/lib/api/types/general";

interface FormState {
  number: string;
  name: string;
  email: string;
  phone: string;
  phoneMobile: string;
  address1: string;
  zipCode: string;
  city: string;
  group: string;
  shortName: string;
  gender: string;
}

const empty: FormState = {
  number: "",
  name: "",
  email: "",
  phone: "",
  phoneMobile: "",
  address1: "",
  zipCode: "",
  city: "",
  group: "",
  shortName: "",
  gender: "",
};

function fromEmployee(e?: Employee): FormState {
  if (!e) return empty;
  return {
    number: e.Number ?? "",
    name: e.Name ?? "",
    email: e.Email ?? "",
    phone: e.Phone ?? "",
    phoneMobile: e.PhoneMobile ?? "",
    address1: e.Address1 ?? "",
    zipCode: e.ZipCode ?? "",
    city: e.City ?? "",
    group: e.Group ?? "",
    shortName: e.ShortName ?? "",
    gender: e.Gender != null ? String(e.Gender) : "",
  };
}

/**
 * Create (POST /General/Employee) or edit (PUT /General/Employee/:number)
 * an employee. Edit mode is enabled by passing `employee`.
 */
export function EmployeeFormDialog({
  open,
  onClose,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
}) {
  const isEdit = !!employee;
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(fromEmployee(employee));
      setErrors({});
    }
  }, [open, employee]);

  const mutation = useDkMutation<Employee>({
    invalidates: [["general", "employees"], ["general", "employee"], ["overview", "employees"]],
  });

  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!isEdit && !form.number.trim()) errs.number = "Employee number is required";
    if (!form.name.trim()) errs.name = "Name is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: Record<string, unknown> = {
      Name: form.name.trim(),
      Email: form.email.trim(),
      Phone: form.phone.trim(),
      PhoneMobile: form.phoneMobile.trim(),
      Address1: form.address1.trim(),
      ZipCode: form.zipCode.trim(),
      City: form.city.trim(),
      Group: form.group.trim(),
      ShortName: form.shortName.trim(),
    };
    if (form.gender !== "") body.Gender = Number(form.gender);
    if (!isEdit) {
      body.Number = form.number.trim();
      // Only send fields the user actually filled in on create.
      for (const k of Object.keys(body)) {
        if (body[k] === "") delete body[k];
      }
    }

    mutation.mutate(
      {
        path: employee ? `/General/Employee/${encodeURIComponent(employee.Number)}` : "/General/Employee",
        method: employee ? "PUT" : "POST",
        body,
      },
      {
        onSuccess: () => {
          if (employee) {
            toast.success("Employee updated", `${form.name.trim()} (${employee.Number}) was saved.`);
          } else {
            toast.success("Employee created", `${form.number.trim()} — ${form.name.trim()}`);
            router.push(`/general/employees/${encodeURIComponent(form.number.trim())}`);
          }
          onClose();
        },
        onError: (err) =>
          toast.error(isEdit ? "Could not update employee" : "Could not create employee", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${employee?.Name || employee?.Number}` : "New employee"}
      subtitle={
        isEdit
          ? `PUT /General/Employee/${employee?.Number}`
          : "Creates an employee record in dkPlus"
      }
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!isEdit ? (
            <Field label="Employee number" required error={errors.number}>
              <Input
                value={form.number}
                onChange={(e) => set("number")(e.target.value)}
                placeholder="e.g. starfsm1"
                autoFocus
              />
            </Field>
          ) : (
            <Field label="Employee number" hint="read-only">
              <Input value={form.number} disabled />
            </Field>
          )}
          <Field label="Name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
          </Field>
          <Field label="Short name">
            <Input value={form.shortName} onChange={(e) => set("shortName")(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
          </Field>
          <Field label="Mobile">
            <Input value={form.phoneMobile} onChange={(e) => set("phoneMobile")(e.target.value)} />
          </Field>
          <Field label="Address">
            <Input value={form.address1} onChange={(e) => set("address1")(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Zip code">
              <Input value={form.zipCode} onChange={(e) => set("zipCode")(e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={(e) => set("city")(e.target.value)} />
            </Field>
          </div>
          <Field label="Group">
            <Input value={form.group} onChange={(e) => set("group")(e.target.value)} placeholder="e.g. VIST" />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => set("gender")(e.target.value)}>
              <option value="">Not set</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
              <option value="0">Unspecified</option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? "Save changes" : "Create employee"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
