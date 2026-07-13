"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { ProjectCreateBody } from "@/lib/api/types/projects";

export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    if (!number.trim()) errs.number = "Project number is required";
    if (!name.trim()) errs.name = "Project name is required";
    setErrors(errs);
    if (errs.number || errs.name) return;

    const body: ProjectCreateBody = { Number: number.trim(), Name: name.trim() };
    create.mutate(
      { path: "/project", method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Project created", `${body.Number} — ${body.Name}`);
          setNumber("");
          setName("");
          close();
        },
        onError: (err) => toast.error("Could not create project", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="New project"
      subtitle="Creates a project in dkPlus (POST /project)"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Project number" required error={errors.number}>
          <Input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 4568877"
            autoFocus
          />
        </Field>
        <Field label="Name" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Test Job" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
