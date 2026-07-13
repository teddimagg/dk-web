"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { WorkEntryLine } from "@/lib/api/types/general";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Register a work journal line for an employee:
 * POST /General/Employee/:employee/work?post=<bool> with an array body.
 */
export function WorkEntryDialog({
  open,
  onClose,
  employeeNumber,
  employeeName,
}: {
  open: boolean;
  onClose: () => void;
  employeeNumber: string;
  employeeName?: string;
}) {
  const toast = useToast();
  const [date, setDate] = useState(today());
  const [text, setText] = useState("");
  const [project, setProject] = useState("");
  const [phase, setPhase] = useState("");
  const [task, setTask] = useState("");
  const [dayTime, setDayTime] = useState("");
  const [overTime, setOverTime] = useState("");
  const [billable, setBillable] = useState(true);
  const [post, setPost] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; text?: string; project?: string }>({});

  useEffect(() => {
    if (open) {
      setDate(today());
      setText("");
      setProject("");
      setPhase("");
      setTask("");
      setDayTime("");
      setOverTime("");
      setBillable(true);
      setPost(false);
      setErrors({});
    }
  }, [open]);

  const mutation = useDkMutation<unknown>({
    invalidates: [["general", "employee", employeeNumber]],
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!date) errs.date = "Date is required";
    if (!text.trim()) errs.text = "A description is required";
    if (!project.trim()) errs.project = "Project number is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const line: WorkEntryLine = {
      Date: date,
      Text: text.trim(),
      Project: project.trim(),
    };
    if (phase.trim()) line.Phase = phase.trim();
    if (task.trim()) line.Task = task.trim();
    if (dayTime !== "" && !Number.isNaN(Number(dayTime))) line.DayTime = Number(dayTime);
    if (overTime !== "" && !Number.isNaN(Number(overTime))) line.OverTime = Number(overTime);
    line.Billable = billable;

    mutation.mutate(
      {
        path: `/General/Employee/${encodeURIComponent(employeeNumber)}/work?post=${post}`,
        method: "POST",
        body: [line],
      },
      {
        onSuccess: () => {
          toast.success(
            "Work entry registered",
            `${line.DayTime ?? 0} h on project ${line.Project} for ${employeeName || employeeNumber}.`,
          );
          onClose();
        },
        onError: (err) => toast.error("Could not register work entry", err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Register work entry"
      subtitle={`POST /General/Employee/${employeeNumber}/work — work journal for ${employeeName || employeeNumber}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" required error={errors.date}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Project" required error={errors.project} hint="project number">
            <Input value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. 0035" />
          </Field>
        </div>
        <Field label="Description" required error={errors.text}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="What was worked on?" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phase" hint="optional">
            <Input value={phase} onChange={(e) => setPhase(e.target.value)} placeholder="e.g. 004" />
          </Field>
          <Field label="Task" hint="optional">
            <Input value={task} onChange={(e) => setTask(e.target.value)} />
          </Field>
          <Field label="Day time (hours)">
            <Input
              type="number"
              step="0.25"
              min="0"
              value={dayTime}
              onChange={(e) => setDayTime(e.target.value)}
              placeholder="e.g. 4"
            />
          </Field>
          <Field label="Overtime (hours)">
            <Input
              type="number"
              step="0.25"
              min="0"
              value={overTime}
              onChange={(e) => setOverTime(e.target.value)}
              placeholder="e.g. 1,5"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
            <input
              type="checkbox"
              checked={billable}
              onChange={(e) => setBillable(e.target.checked)}
              className="size-4 accent-ink"
            />
            Billable
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
            <input
              type="checkbox"
              checked={post}
              onChange={(e) => setPost(e.target.checked)}
              className="size-4 accent-ink"
            />
            Post immediately <span className="text-xs text-mist">(post=true)</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Register entry
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
