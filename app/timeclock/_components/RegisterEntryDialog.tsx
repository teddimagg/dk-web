"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { RegisterTimeClockBody } from "@/lib/api/types/platform";

/** POST /timeclock/register — manual time-clock entry per the Time Clock doc. */
export function RegisterEntryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [employee, setEmployee] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState<{ employee?: string; start?: string; end?: string }>({});

  useEffect(() => {
    if (open) {
      setEmployee("");
      setStart("");
      setEnd("");
      setErrors({});
    }
  }, [open]);

  const register = useDkMutation<unknown>({ invalidates: [["timeclock"]] });

  function submit() {
    const next: typeof errors = {};
    if (!employee.trim()) next.employee = "Employee number is required";
    if (!start) next.start = "Start time is required";
    if (start && end && new Date(end).getTime() < new Date(start).getTime())
      next.end = "End must be after start";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: RegisterTimeClockBody = {
      Employee: employee.trim(),
      Start: new Date(start).toISOString(),
      ...(end ? { End: new Date(end).toISOString() } : {}),
    };
    register.mutate(
      { path: "/timeclock/register", method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            "Time entry registered",
            `Employee ${employee.trim()}${end ? " — clocked in and out" : " — clocked in"}.`,
          );
          onClose();
        },
        onError: (e) => toast.error("Could not register entry", e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Register time entry"
      subtitle="Creates a time-clock registration for an employee. Leave end empty to clock the employee in."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Employee number" required error={errors.employee}>
          <Input
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            placeholder="e.g. 1710794709"
            autoFocus
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start" required error={errors.start}>
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="End" hint="optional" error={errors.end}>
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={register.isPending}>
            Register entry
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
