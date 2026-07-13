"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { SalesEmailBody } from "@/lib/api/types/sales";

const PRIORITIES = [
  { value: 3, label: "Normal" },
  { value: 1, label: "Highest" },
  { value: 2, label: "High" },
  { value: 4, label: "Low" },
  { value: 5, label: "Lowest" },
  { value: 0, label: "None" },
];

/**
 * Shared send-email dialog for invoices, orders and quotes. dk sends the
 * document as HTML body + PDF attachment; multiple addresses may be separated
 * with , or ;
 */
export function EmailDialog({
  open,
  onClose,
  path,
  entity,
  defaultSubject,
}: {
  open: boolean;
  onClose: () => void;
  /** e.g. `/sales/invoice/1000/email` */
  path: string;
  /** e.g. "Invoice 1000" — used in toasts. */
  entity: string;
  defaultSubject?: string;
}) {
  const toast = useToast();
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [priority, setPriority] = useState(3);
  const [errors, setErrors] = useState<{ to?: string; subject?: string }>({});
  const send = useDkMutation<unknown>();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!to.trim()) errs.to = "Recipient is required";
    if (!subject.trim()) errs.subject = "Subject is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body: SalesEmailBody = {
      To: to.trim(),
      Subject: subject.trim(),
      Priority: priority,
      ...(cc.trim() ? { Cc: cc.trim() } : {}),
      ...(bcc.trim() ? { Bcc: bcc.trim() } : {}),
    };
    send.mutate(
      { path, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(`${entity} emailed`, `Sent to ${to.trim()} as HTML with a PDF attachment.`);
          onClose();
        },
        onError: (err) => toast.error(`Could not email ${entity.toLowerCase()}`, err.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Email ${entity.toLowerCase()}`}
      subtitle="dkPlus sends the document as an HTML body with a PDF attachment."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="To" required error={errors.to} hint="Separate multiple addresses with , or ;">
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="name@example.is"
            autoFocus
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cc">
            <Input value={cc} onChange={(e) => setCc(e.target.value)} />
          </Field>
          <Field label="Bcc">
            <Input value={bcc} onChange={(e) => setBcc(e.target.value)} />
          </Field>
        </div>
        <Field label="Subject" required error={errors.subject}>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={send.isPending}>
            <Send className="size-4" /> Send email
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
