"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { ProjectCreateBody } from "@/lib/api/types/projects";

export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ number?: string; name?: string }>({});
  const toast = useToast();
  const create = useDkMutation<unknown>({ invalidates: [["projects"]] });

  function close() {
    setErrors({});
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { number?: string; name?: string } = {};
    if (!number.trim()) errs.number = t("projects.new.numberRequired");
    if (!name.trim()) errs.name = t("projects.new.nameRequired");
    setErrors(errs);
    if (errs.number || errs.name) return;

    const body: ProjectCreateBody = { Number: number.trim(), Name: name.trim() };
    create.mutate(
      { path: "/project", method: "POST", body },
      {
        onSuccess: () => {
          toast.success(t("projects.new.created"), `${body.Number} — ${body.Name}`);
          setNumber("");
          setName("");
          close();
        },
        onError: (err) => toast.error(t("projects.new.createFailed"), err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("projects.new.title")}
      subtitle={t("projects.new.subtitle")}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("projects.new.numberLabel")} required error={errors.number}>
          <Input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={t("projects.new.numberPlaceholder")}
            autoFocus
          />
        </Field>
        <Field label={t("projects.new.nameLabel")} required error={errors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("projects.new.namePlaceholder")}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={create.isPending}>
            {t("projects.new.submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
