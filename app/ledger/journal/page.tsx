"use client";

import { BookOpenText, Check, ClipboardList, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { formatAmount } from "@/lib/format";
import {
  JOURNAL_LINE_TYPES,
  type JournalCreateBody,
  type JournalLineBody,
} from "@/lib/api/types/ledger";

interface LineDraft {
  id: number;
  account: string;
  amount: string;
  text: string;
  date: string;
  type: string;
}

let nextLineId = 1;
function blankLine(): LineDraft {
  return { id: nextLineId++, account: "", amount: "", text: "", date: "", type: "GeneralLedger" };
}

/** Icelandic keyboards type decimal commas — accept both. */
function parseAmount(s: string): number {
  const cleaned = s.trim().replace(/\s/g, "").replace(",", ".");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function extractJournalId(res: unknown): string | null {
  if (res == null) return null;
  if (typeof res === "number" || typeof res === "string") return String(res);
  if (typeof res === "object") {
    const r = res as Record<string, unknown>;
    for (const k of ["JournalId", "JournalID", "Id", "ID", "Journal", "Number", "Voucher", "Code"]) {
      const v = r[k];
      if (typeof v === "number" || (typeof v === "string" && v)) return String(v);
    }
  }
  return null;
}

export default function JournalPage() {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  const [post, setPost] = useState(false);
  const [generateVoucher, setGenerateVoucher] = useState(true);
  const [lines, setLines] = useState<LineDraft[]>([blankLine(), blankLine()]);
  const [confirmingPost, setConfirmingPost] = useState(false);
  const [lastResult, setLastResult] = useState<unknown>(undefined);

  const create = useDkMutation<unknown>({ invalidates: [["ledger"]] });

  const updateLine = (id: number, patch: Partial<LineDraft>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLine = (id: number) => setLines((ls) => ls.filter((l) => l.id !== id));

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    let invalid = false;
    for (const l of lines) {
      const amount = parseAmount(l.amount);
      if (!l.account.trim() || !Number.isFinite(amount) || amount === 0) {
        invalid = true;
        continue;
      }
      if (amount > 0) debit += amount;
      else credit += -amount;
    }
    const diff = debit - credit;
    return { debit, credit, diff, invalid, balanced: Math.abs(diff) < 0.005 };
  }, [lines]);

  const canSubmit =
    code.trim().length > 0 &&
    lines.length >= 2 &&
    !totals.invalid &&
    totals.balanced &&
    !create.isPending;

  function buildBody(): JournalCreateBody {
    const bodyLines: JournalLineBody[] = lines.map((l) => ({
      Account: l.account.trim(),
      Amount: parseAmount(l.amount),
      ...(l.text.trim() ? { Text: l.text.trim() } : {}),
      ...(l.date ? { Date: l.date } : {}),
      Type: l.type,
    }));
    return {
      Code: code.trim(),
      ...(description.trim() ? { Description: description.trim() } : {}),
      ...(period.trim() ? { Period: Number(period) } : {}),
      Options: { Post: post, GenerateVoucher: generateVoucher },
      Lines: bodyLines,
    };
  }

  function doSubmit() {
    create.mutate(
      { path: "/generalledger/journal", method: "POST", body: buildBody() },
      {
        onSuccess: (res) => {
          setLastResult(res ?? null);
          const id = extractJournalId(res);
          toast.success(
            post ? "Journal created and posted" : "Journal created",
            id ? `Journal id: ${id}` : "dkPlus accepted the journal.",
          );
          setCode("");
          setDescription("");
          setPeriod("");
          setPost(false);
          setGenerateVoucher(true);
          setLines([blankLine(), blankLine()]);
        },
        onError: (err) => toast.error("Could not create journal", err.message),
      },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (post) setConfirmingPost(true);
    else doSubmit();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
      <Card className="p-6">
        <CardTitle icon={<BookOpenText />} className="mb-5">
          Journal header
        </CardTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Code" required hint="short journal code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. ABCD" />
          </Field>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Manual correction"
            />
          </Field>
          <Field label="Period" hint="defaults to this year">
            <Input
              type="number"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. 2026"
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={post}
              onChange={(e) => setPost(e.target.checked)}
              className="size-4 accent-ink"
            />
            Post to ledger immediately
            {post && <Badge tone="amber">irreversible</Badge>}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={generateVoucher}
              onChange={(e) => setGenerateVoucher(e.target.checked)}
              className="size-4 accent-ink"
            />
            Generate voucher
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <CardTitle
          icon={<ClipboardList />}
          className="mb-5"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => setLines((ls) => [...ls, blankLine()])}>
              <Plus className="size-4" /> Add line
            </Button>
          }
        >
          Lines
        </CardTitle>

        <div className="space-y-3">
          <div className="hidden gap-3 px-1 text-xs font-medium uppercase tracking-wide text-mist md:grid md:grid-cols-[1.1fr_1fr_1.4fr_1fr_1fr_2.5rem]">
            <span>Account *</span>
            <span>Amount * (− = credit)</span>
            <span>Text</span>
            <span>Date</span>
            <span>Type</span>
            <span />
          </div>
          {lines.map((l) => {
            const amount = parseAmount(l.amount);
            const amountBad = l.amount !== "" && (!Number.isFinite(amount) || amount === 0);
            return (
              <div
                key={l.id}
                className="grid gap-3 rounded-2xl border border-line/70 p-3 md:grid-cols-[1.1fr_1fr_1.4fr_1fr_1fr_2.5rem] md:items-center md:border-0 md:p-0"
              >
                <Input
                  value={l.account}
                  onChange={(e) => updateLine(l.id, { account: e.target.value })}
                  placeholder="Account, e.g. 7810"
                  aria-label="Line account"
                />
                <div>
                  <Input
                    value={l.amount}
                    onChange={(e) => updateLine(l.id, { amount: e.target.value })}
                    placeholder="e.g. 1000 or -1000"
                    aria-label="Line amount"
                    className={amountBad ? "border-danger" : undefined}
                  />
                  {amountBad && (
                    <span className="mt-1 block text-xs text-danger">Enter a non-zero number</span>
                  )}
                </div>
                <Input
                  value={l.text}
                  onChange={(e) => updateLine(l.id, { text: e.target.value })}
                  placeholder="Text (optional)"
                  aria-label="Line text"
                />
                <Input
                  type="date"
                  value={l.date}
                  onChange={(e) => updateLine(l.id, { date: e.target.value })}
                  aria-label="Line date (defaults to today)"
                />
                <Select
                  value={l.type}
                  onChange={(e) => updateLine(l.id, { type: e.target.value })}
                  aria-label="Line journal type"
                >
                  {JOURNAL_LINE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Remove line"
                  disabled={lines.length <= 2}
                  onClick={() => removeLine(l.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-2xl bg-haze/60 px-4 py-3 text-sm">
          <span className="text-fog">
            Debit <span className="tnum font-medium text-ink">{formatAmount(totals.debit)}</span>
          </span>
          <span className="text-fog">
            Credit <span className="tnum font-medium text-ink">{formatAmount(totals.credit)}</span>
          </span>
          <span className="text-fog">
            Difference <span className="tnum font-medium text-ink">{formatAmount(totals.diff)}</span>
          </span>
          <span className="ml-auto">
            {totals.invalid ? (
              <Badge tone="amber">
                <TriangleAlert className="size-3" /> Every line needs an account and a non-zero amount
              </Badge>
            ) : totals.balanced ? (
              <Badge tone="green">
                <Check className="size-3" /> Balanced
              </Badge>
            ) : (
              <Badge tone="amber">
                <TriangleAlert className="size-3" /> Debits and credits must balance
              </Badge>
            )}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {!code.trim() && <span className="text-[13px] text-fog">A journal code is required.</span>}
          <Button type="submit" loading={create.isPending} disabled={!canSubmit}>
            {post ? "Create and post journal" : "Create journal"}
          </Button>
        </div>
        </Card>
      </form>

      {lastResult !== undefined && (
        <JsonView data={lastResult} label="Last journal response" />
      )}

      <ConfirmDialog
        open={confirmingPost}
        onClose={() => setConfirmingPost(false)}
        title="Post journal to the ledger?"
        body={
          <>
            <strong>Post to ledger immediately</strong> is enabled — journal{" "}
            <strong>{code.trim() || "(no code)"}</strong> with {lines.length} lines (
            {formatAmount(totals.debit)} debit / {formatAmount(totals.credit)} credit) will be posted
            to the general ledger right away. Posted journals cannot be unposted from here.
          </>
        }
        confirmLabel="Create and post"
        loading={create.isPending}
        onConfirm={() => {
          setConfirmingPost(false);
          doSubmit();
        }}
      />
    </div>
  );
}
