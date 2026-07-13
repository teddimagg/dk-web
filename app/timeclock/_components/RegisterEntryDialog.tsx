"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import type { RegisterTimeClockBody } from "@/lib/api/types/platform";

/** POST /timeclock/register — manual time-clock entry per the Time Clock doc. */
export function RegisterEntryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
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
    if (!employee.trim()) next.employee = t("timeclock.form.employeeRequired");
    if (!start) next.start = t("timeclock.form.startRequired");
    if (start && end && new Date(end).getTime() < new Date(start).getTime())
      next.end = t("timeclock.form.endAfterStart");
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
            t("timeclock.toast.registered"),
            t(end ? "timeclock.toast.registeredInOut" : "timeclock.toast.registeredIn", {
              employee: employee.trim(),
            }),
          );
          onClose();
        },
        onError: (e) => toast.error(t("timeclock.toast.registerFailed"), e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("timeclock.dialog.title")}
      subtitle={t("timeclock.dialog.subtitle")}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label={t("timeclock.form.employeeNumber")} required error={errors.employee}>
          <Input
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            placeholder={t("timeclock.form.employeePlaceholder")}
            autoFocus
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("timeclock.form.start")} required error={errors.start}>
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label={t("timeclock.form.end")} hint={t("timeclock.form.optional")} error={errors.end}>
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={register.isPending}>
            {t("timeclock.registerEntry")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
