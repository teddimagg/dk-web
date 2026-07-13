"use client";

import { clsx } from "clsx";
import { ClipboardList, FileText, Pencil, Plus, RefreshCw, Send } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDate } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { MemberApplication, MemberFund } from "@/lib/api/types/members";
import { APPLICATION_STATUSES, applicationId, applicationStatusInfo } from "./applicationStatus";
import { AttachmentsDialog } from "./AttachmentsDialog";

function StatusBadge({ app }: { app: MemberApplication }) {
  const t = useT();
  const info = applicationStatusInfo(app.Status ?? app.StatusText);
  if (!info) return <span className="text-mist">–</span>;
  return <Badge tone={info.tone}>{info.labelKey ? t(info.labelKey) : info.label}</Badge>;
}

/** Applications tab — GET /member/:number/application plus all per-application actions. */
export function ApplicationsTab({ number }: { number: string }) {
  const t = useT();
  const enc = encodeURIComponent(number);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<MemberApplication[]>(
    ["member", number, "applications"],
    `/member/${enc}/application`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusFor, setStatusFor] = useState<MemberApplication | null>(null);
  const [attachmentsFor, setAttachmentsFor] = useState<MemberApplication | null>(null);

  const columns: Column<MemberApplication>[] = [
    {
      key: "id",
      header: t("members.field.id"),
      width: "70px",
      render: (a) => <span className="font-medium text-ink tnum">{applicationId(a) ?? "–"}</span>,
    },
    { key: "fund", header: t("members.field.fund"), render: (a) => a.Fund ?? a.FundName ?? "–" },
    { key: "grant", header: t("members.field.grant"), render: (a) => a.Grant ?? a.GrantName ?? "–" },
    {
      key: "description",
      header: t("members.field.description"),
      render: (a) => <span className="block max-w-72 truncate">{a.Description || "–"}</span>,
    },
    {
      key: "amount",
      header: t("members.field.amount"),
      align: "right",
      render: (a) =>
        typeof a.Amount === "number" ? <span className="tnum">{formatAmount(a.Amount)}</span> : "–",
    },
    { key: "status", header: t("members.field.status"), render: (a) => <StatusBadge app={a} /> },
    {
      key: "date",
      header: t("members.field.date"),
      render: (a) => <span className="tnum">{formatDate(a.Created ?? a.Date ?? a.Modified)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (a) => {
        const id = applicationId(a);
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" disabled={id == null} onClick={() => setStatusFor(a)}>
              <Pencil className="size-4" /> {t("members.field.status")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={id == null}
              onClick={() => setAttachmentsFor(a)}
            >
              <FileText className="size-4" /> {t("members.attach.label")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <CardTitle icon={<ClipboardList />}>{t("members.tabs.applications")}</CardTitle>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            aria-label={t("members.tab.refreshAria", { section: t("members.tabs.applications") })}
          >
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSubmitting(true)}>
            <Plus className="size-4" /> {t("members.apps.submit")}
          </Button>
        </div>
      </div>

      <DataTable<MemberApplication>
        columns={columns}
        rows={data}
        rowKey={(a, i) => applicationId(a) ?? i}
        loading={isLoading}
        error={error ?? null}
        onRetry={() => refetch()}
        emptyTitle={t("members.apps.emptyTitle")}
        emptyBody={t("members.apps.emptyBody")}
        emptyAction={
          <Button size="sm" variant="secondary" onClick={() => setSubmitting(true)}>
            <Plus className="size-4" /> {t("members.apps.submit")}
          </Button>
        }
      />

      {data && data.length > 0 && (
        <div className="px-5 pb-5 pt-2">
          <JsonView data={data} />
        </div>
      )}

      <SubmitApplicationDialog
        number={number}
        open={submitting}
        onClose={() => setSubmitting(false)}
      />
      {statusFor && (
        <UpdateStatusDialog
          number={number}
          application={statusFor}
          onClose={() => setStatusFor(null)}
        />
      )}
      {attachmentsFor && (
        <AttachmentsDialog
          number={number}
          application={attachmentsFor}
          open
          onClose={() => setAttachmentsFor(null)}
        />
      )}
    </div>
  );
}

/** POST /member/:number/application — body per docs/api/members.md. */
function SubmitApplicationDialog({
  number,
  open,
  onClose,
}: {
  number: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const enc = encodeURIComponent(number);
  const [form, setForm] = useState({
    fund: "",
    grant: "",
    description: "",
    bankCode: "",
    bankGroup: "",
    bankAccount: "",
  });
  const [fundError, setFundError] = useState<string | undefined>(undefined);

  const fundsQuery = useDkQuery<MemberFund[]>(["member", number, "fund"], `/member/${enc}/fund`, {
    enabled: open,
  });
  const fundSuggestions = (fundsQuery.data ?? [])
    .map((f) => f.Fund ?? f.Code ?? f.Number)
    .filter((v): v is string => !!v);

  const submit = useDkMutation<unknown>({ invalidates: [["member", number, "applications"]] });

  const set =
    (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function send() {
    if (!form.fund.trim()) {
      setFundError(t("members.apps.fundRequired"));
      return;
    }
    setFundError(undefined);
    const body: Record<string, unknown> = { Fund: form.fund.trim() };
    if (form.grant.trim()) body.Grant = form.grant.trim();
    if (form.description.trim()) body.Description = form.description.trim();
    if (form.bankCode.trim() || form.bankGroup.trim() || form.bankAccount.trim()) {
      body.BankAccount = {
        ...(form.bankCode.trim() ? { Code: form.bankCode.trim() } : {}),
        ...(form.bankGroup.trim() ? { Group: form.bankGroup.trim() } : {}),
        ...(form.bankAccount.trim() ? { Account: form.bankAccount.trim() } : {}),
      };
    }
    submit.mutate(
      { path: `/member/${enc}/application`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            t("members.apps.submitted"),
            t("members.apps.submittedDetail", { fund: form.fund.trim(), number }),
          );
          setForm({ fund: "", grant: "", description: "", bankCode: "", bankGroup: "", bankAccount: "" });
          onClose();
        },
        onError: (e) => toast.error(t("members.apps.submitFailed"), e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("members.apps.submit")}
      subtitle={t("members.apps.submitSubtitle", { number })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("members.field.fund")} required error={fundError}>
            <Input
              list="application-fund-suggestions"
              value={form.fund}
              onChange={set("fund")}
              placeholder={t("members.fundPlaceholder")}
              autoFocus
            />
          </Field>
          <datalist id="application-fund-suggestions">
            {fundSuggestions.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <Field label={t("members.field.grant")} hint={t("members.optional")}>
            <Input value={form.grant} onChange={set("grant")} />
          </Field>
        </div>
        <Field label={t("members.field.description")} hint={t("members.optional")}>
          <Textarea value={form.description} onChange={set("description")} />
        </Field>
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-fog">{t("members.apps.bankSection")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("members.field.bank")}>
              <Input value={form.bankCode} onChange={set("bankCode")} placeholder="111" />
            </Field>
            <Field label={t("members.field.ledger")}>
              <Input value={form.bankGroup} onChange={set("bankGroup")} placeholder="26" />
            </Field>
            <Field label={t("members.field.account")}>
              <Input value={form.bankAccount} onChange={set("bankAccount")} placeholder="790" />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={submit.isPending}>
            <Send className="size-4" /> {t("members.apps.submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** PUT /member/:number/application/:id?fund=…&status=… */
function UpdateStatusDialog({
  number,
  application,
  onClose,
}: {
  number: string;
  application: MemberApplication;
  onClose: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const enc = encodeURIComponent(number);
  const appId = applicationId(application);

  const current = APPLICATION_STATUSES.find(
    (s) =>
      s.code === application.Status ||
      s.value.toLowerCase() === String(application.Status ?? "").toLowerCase(),
  );
  const [status, setStatus] = useState(current?.value ?? "InProgress");
  const [fund, setFund] = useState(application.Fund ?? "");
  const [fundError, setFundError] = useState<string | undefined>(undefined);

  const update = useDkMutation<unknown>({ invalidates: [["member", number, "applications"]] });

  function save() {
    if (!fund.trim()) {
      setFundError(t("members.appStatus.fundRequired"));
      return;
    }
    setFundError(undefined);
    const labelKey = APPLICATION_STATUSES.find((s) => s.value === status)?.labelKey;
    const label = labelKey ? t(labelKey) : status;
    update.mutate(
      {
        path: `/member/${enc}/application/${appId}?fund=${encodeURIComponent(fund.trim())}&status=${encodeURIComponent(status)}`,
        method: "PUT",
      },
      {
        onSuccess: () => {
          toast.success(t("members.appStatus.updated"), `#${appId} → ${label}`);
          onClose();
        },
        onError: (e) => toast.error(t("members.appStatus.updateFailed"), e.message),
      },
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("members.appStatus.title", { id: appId ?? "?" })}
      subtitle={t("members.appStatus.subtitle")}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-4"
      >
        <Field label={t("members.field.fund")} required error={fundError} hint={t("members.appStatus.fundHint")}>
          <Input
            value={fund}
            onChange={(e) => setFund(e.target.value)}
            placeholder={t("members.fundPlaceholder")}
          />
        </Field>
        <Field label={t("members.field.status")} required>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.labelKey)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("ui.cancel")}
          </Button>
          <Button type="submit" loading={update.isPending}>
            {t("members.appStatus.update")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
