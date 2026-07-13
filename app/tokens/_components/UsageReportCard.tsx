"use client";

import { Download, FileText, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import type { UsageEmailBody } from "@/lib/api/types/platform";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PRIORITIES = [
  { value: 3, label: "Normal" },
  { value: 1, label: "Highest" },
  { value: 2, label: "High" },
  { value: 4, label: "Low" },
  { value: 5, label: "Lowest" },
  { value: 0, label: "None" },
];

/**
 * Token usage report — GET /token/report/usage/pdf?from&to (download) and
 * POST /token/report/usage/email?from&to (send as email).
 */
export function UsageReportCard() {
  const toast = useToast();
  const company = useActiveCompany();

  const now = new Date();
  const [from, setFrom] = useState(isoDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(isoDate(now));
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  const [toAddr, setToAddr] = useState("");
  const [subject, setSubject] = useState("Token usage report");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [priority, setPriority] = useState(3);
  const [emailErrors, setEmailErrors] = useState<{ to?: string; subject?: string }>({});

  const rangeValid = !!from && !!to && from <= to;
  const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const sendEmail = useDkMutation<unknown>();

  async function downloadPdf() {
    if (!company || !rangeValid) return;
    setDownloading(true);
    try {
      const blob = await dkFetchBlob(`/token/report/usage/pdf${query}`, { token: company.token });
      downloadBlob(blob, `token-usage-${from}-to-${to}.pdf`);
      toast.success("Usage report downloaded", `Daily usage statistics ${from} → ${to}.`);
    } catch (e) {
      toast.error("Could not download report", e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  }

  function submitEmail() {
    const next: typeof emailErrors = {};
    if (!toAddr.trim()) next.to = "Recipient is required";
    if (!subject.trim()) next.subject = "Subject is required";
    setEmailErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: UsageEmailBody = {
      To: toAddr.trim(),
      Subject: subject.trim(),
      ...(cc.trim() ? { Cc: cc.trim() } : {}),
      ...(bcc.trim() ? { Bcc: bcc.trim() } : {}),
      Priority: priority,
    };
    sendEmail.mutate(
      { path: `/token/report/usage/email${query}`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Usage report emailed", `Sent to ${toAddr.trim()} (HTML body + PDF attachment).`);
          setEmailing(false);
        },
        onError: (e) => toast.error("Could not email report", e.message),
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<FileText />}>Usage report</CardTitle>
      <p className="mt-2 text-[13px] text-fog">
        API usage statistics per day for this token. Download the PDF or have dk email it — the
        report lands as an HTML body with a PDF attachment.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="From" required>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To" required error={from && to && from > to ? "Must be after From" : undefined}>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={downloadPdf} loading={downloading} disabled={!rangeValid}>
          {!downloading && <Download className="size-4" />} Download PDF
        </Button>
        <Button onClick={() => setEmailing(true)} disabled={!rangeValid}>
          <Mail className="size-4" /> Email usage report
        </Button>
      </div>

      <Dialog
        open={emailing}
        onClose={() => setEmailing(false)}
        title="Email usage report"
        subtitle={`Report period ${from} → ${to}. Separate multiple addresses with , or ;`}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitEmail();
          }}
        >
          <Field label="To" required error={emailErrors.to}>
            <Input
              value={toAddr}
              onChange={(e) => setToAddr(e.target.value)}
              placeholder="name@example.com"
              inputMode="email"
              autoFocus
            />
          </Field>
          <Field label="Subject" required error={emailErrors.subject}>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cc" hint="optional">
              <Input value={cc} onChange={(e) => setCc(e.target.value)} />
            </Field>
            <Field label="Bcc" hint="optional">
              <Input value={bcc} onChange={(e) => setBcc(e.target.value)} />
            </Field>
          </div>
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
            <Button type="button" variant="secondary" onClick={() => setEmailing(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={sendEmail.isPending}>
              {!sendEmail.isPending && <Send className="size-4" />} Send report
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
