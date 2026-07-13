"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { Member } from "@/lib/api/types/members";

interface FormState {
  Number: string;
  Name: string;
  Address1: string;
  Address2: string;
  ZipCode: string;
  City: string;
  CountryCode: string;
  Phone: string;
  Mobile: string;
  Email: string;
  Tag: string;
}

function toForm(m?: Member): FormState {
  return {
    Number: m?.Number ?? "",
    Name: m?.Name ?? "",
    Address1: m?.Address?.Address1 ?? "",
    Address2: m?.Address?.Address2 ?? "",
    ZipCode: m?.Address?.ZipCode ?? "",
    City: m?.Address?.City ?? "",
    CountryCode: m?.Address?.CountryCode ?? "",
    Phone: m?.ContactDetail?.Phone ?? "",
    Mobile: m?.ContactDetail?.Mobile ?? "",
    Email: m?.ContactDetail?.Email ?? "",
    Tag: m?.Tag ?? "",
  };
}

/**
 * Create (POST /member) or edit (PUT /member/:number) a member —
 * body shape per docs/api/members.md.
 */
export function MemberFormDialog({
  open,
  onClose,
  member,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** When set the dialog edits this member (PUT), otherwise it creates one (POST). */
  member?: Member;
  onSaved?: (m: Member) => void;
}) {
  const isEdit = !!member;
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => toForm(member));
  const [errors, setErrors] = useState<{ Number?: string; Name?: string }>({});

  useEffect(() => {
    if (open) {
      setForm(toForm(member));
      setErrors({});
    }
  }, [open, member]);

  const save = useDkMutation<Member | null>({
    invalidates: member ? [["members"], ["member", member.Number]] : [["members"]],
  });

  const set = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    const errs: typeof errors = {};
    if (!isEdit && !form.Number.trim()) errs.Number = "Member number is required";
    if (!form.Name.trim()) errs.Name = "Name is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: Record<string, unknown> = {
      Name: form.Name.trim(),
      Address: {
        Address1: form.Address1,
        Address2: form.Address2,
        ZipCode: form.ZipCode,
        City: form.City,
        CountryCode: form.CountryCode,
      },
      ContactDetail: {
        Phone: form.Phone,
        Mobile: form.Mobile,
        Email: form.Email,
      },
    };
    if (form.Tag) body.Tag = form.Tag;
    if (!member) body.Number = form.Number.trim();

    save.mutate(
      member
        ? { path: `/member/${encodeURIComponent(member.Number)}`, method: "PUT", body }
        : { path: "/member", method: "POST", body },
      {
        onSuccess: (m) => {
          const saved: Member =
            m && m.Number
              ? m
              : { Number: member ? member.Number : form.Number.trim(), Name: form.Name.trim() };
          toast.success(isEdit ? "Member updated" : "Member created", saved.Name ?? saved.Number);
          onClose();
          onSaved?.(saved);
        },
        onError: (e) =>
          toast.error(isEdit ? "Could not update member" : "Could not create member", e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={member ? `Edit ${member.Name || member.Number}` : "New member"}
      subtitle={
        member
          ? `Updates member ${member.Number} in dkPlus.`
          : "Creates a new member in the active dkPlus company."
      }
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {!isEdit && (
            <Field label="Member number" required error={errors.Number}>
              <Input
                value={form.Number}
                onChange={set("Number")}
                placeholder="e.g. 1122334455"
                autoFocus
              />
            </Field>
          )}
          <Field label="Name" required error={errors.Name}>
            <Input value={form.Name} onChange={set("Name")} placeholder="Full name" />
          </Field>
          <Field label="Tag" hint="optional">
            <Input value={form.Tag} onChange={set("Tag")} placeholder="e.g. IKE" />
          </Field>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium text-fog">Address</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address 1">
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
            <Field label="Country code" hint="ISO, e.g. IS">
              <Input value={form.CountryCode} onChange={set("CountryCode")} maxLength={2} />
            </Field>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium text-fog">Contact</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              <Input value={form.Phone} onChange={set("Phone")} />
            </Field>
            <Field label="Mobile">
              <Input value={form.Mobile} onChange={set("Mobile")} />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <Input type="email" value={form.Email} onChange={set("Email")} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {isEdit ? "Save changes" : "Create member"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
