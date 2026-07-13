"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
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
  const t = useT();
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
    if (!isEdit && !form.Number.trim()) errs.Number = t("members.form.numberRequired");
    if (!form.Name.trim()) errs.Name = t("members.form.nameRequired");
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
          toast.success(
            isEdit ? t("members.form.updated") : t("members.form.created"),
            saved.Name ?? saved.Number,
          );
          onClose();
          onSaved?.(saved);
        },
        onError: (e) =>
          toast.error(
            isEdit ? t("members.form.updateFailed") : t("members.form.createFailed"),
            e.message,
          ),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        member
          ? t("members.form.editTitle", { name: member.Name || member.Number })
          : t("members.form.newTitle")
      }
      subtitle={
        member
          ? t("members.form.editSubtitle", { number: member.Number })
          : t("members.form.newSubtitle")
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
            <Field label={t("members.form.number")} required error={errors.Number}>
              <Input
                value={form.Number}
                onChange={set("Number")}
                placeholder={t("members.form.numberPlaceholder")}
                autoFocus
              />
            </Field>
          )}
          <Field label={t("members.field.name")} required error={errors.Name}>
            <Input value={form.Name} onChange={set("Name")} placeholder={t("members.form.namePlaceholder")} />
          </Field>
          <Field label={t("members.field.tag")} hint={t("members.optional")}>
            <Input value={form.Tag} onChange={set("Tag")} placeholder={t("members.form.tagPlaceholder")} />
          </Field>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium text-fog">{t("members.form.addressSection")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("members.field.address1")}>
              <Input value={form.Address1} onChange={set("Address1")} />
            </Field>
            <Field label={t("members.field.address2")}>
              <Input value={form.Address2} onChange={set("Address2")} />
            </Field>
            <Field label={t("members.field.zipcode")}>
              <Input value={form.ZipCode} onChange={set("ZipCode")} />
            </Field>
            <Field label={t("members.field.city")}>
              <Input value={form.City} onChange={set("City")} />
            </Field>
            <Field label={t("members.field.countryCode")} hint={t("members.form.countryHint")}>
              <Input value={form.CountryCode} onChange={set("CountryCode")} maxLength={2} />
            </Field>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium text-fog">{t("members.form.contactSection")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("members.field.phone")}>
              <Input value={form.Phone} onChange={set("Phone")} />
            </Field>
            <Field label={t("members.field.mobile")}>
              <Input value={form.Mobile} onChange={set("Mobile")} />
            </Field>
            <Field label={t("members.field.email")} className="sm:col-span-2">
              <Input type="email" value={form.Email} onChange={set("Email")} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {isEdit ? t("members.form.save") : t("members.form.create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
