"use client";

import { CalendarDays, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { PaymentPlanBody, PaymentPlanCancelBody } from "@/lib/api/types/sales";

const today = () => new Date().toISOString().slice(0, 10);

interface TxRow {
  Date: string;
  Amount: string;
}

/**
 * Payment plans for an invoice: create (POST .../paymentplan) and cancel
 * (PUT .../paymentplan/:planNumber). dk exposes no "list plans" route, so
 * cancelling asks for the plan number.
 */
export function PaymentPlanDialog({
  open,
  onClose,
  invoiceNumber,
}: {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
}) {
  const toast = useToast();
  const [tab, setTab] = useState("create");

  // Create plan state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [txs, setTxs] = useState<TxRow[]>([{ Date: today(), Amount: "" }]);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // Cancel plan state
  const [planNumber, setPlanNumber] = useState("");
  const [cancelUser, setCancelUser] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelErr, setCancelErr] = useState<string | null>(null);

  const createPlan = useDkMutation<unknown>();
  const cancelPlan = useDkMutation<unknown>();

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const rows = txs.filter((t) => t.Date && t.Amount.trim() !== "");
    if (!description.trim()) return setCreateErr("Description is required");
    if (!(Number(amount) > 0)) return setCreateErr("Plan amount must be above zero");
    if (rows.length === 0) return setCreateErr("Add at least one transaction with a date and amount");
    setCreateErr(null);

    const body: PaymentPlanBody = {
      Description: description.trim(),
      Amount: Number(amount),
      Transactions: rows.map((t) => ({ Date: t.Date, Amount: Number(t.Amount) })),
      ...(reference.trim() ? { Reference: reference.trim() } : {}),
    };
    createPlan.mutate(
      { path: `/sales/invoice/${encodeURIComponent(invoiceNumber)}/paymentplan`, method: "POST", body },
      {
        onSuccess: () => {
          toast.success(`Payment plan created for invoice ${invoiceNumber}`, description.trim());
          onClose();
        },
        onError: (err) => toast.error("Could not create payment plan", err.message),
      },
    );
  }

  function requestCancel() {
    if (!planNumber.trim()) return setCancelErr("Plan number is required");
    setCancelErr(null);
    setConfirmCancel(true);
  }

  function doCancel() {
    const body: PaymentPlanCancelBody = {
      ...(cancelUser.trim() ? { User: cancelUser.trim() } : {}),
      ...(cancelReason.trim() ? { Reason: cancelReason.trim() } : {}),
    };
    cancelPlan.mutate(
      {
        path: `/sales/invoice/${encodeURIComponent(invoiceNumber)}/paymentplan/${encodeURIComponent(planNumber.trim())}`,
        method: "PUT",
        body,
      },
      {
        onSuccess: () => {
          toast.success(`Payment plan ${planNumber.trim()} cancelled`, `Invoice ${invoiceNumber}`);
          setConfirmCancel(false);
          onClose();
        },
        onError: (err) => {
          setConfirmCancel(false);
          toast.error("Could not cancel payment plan", err.message);
        },
      },
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={`Payment plan — invoice ${invoiceNumber}`}
        subtitle="Split the invoice amount into scheduled transactions"
        wide
      >
        <div className="space-y-5">
          <Tabs
            tabs={[
              { id: "create", label: "Create plan" },
              { id: "cancel", label: "Cancel plan" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === "create" ? (
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Description" required>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="My payment plan"
                  />
                </Field>
                <Field label="Total amount" required>
                  <Input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                  />
                </Field>
                <Field label="Reference">
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                </Field>
              </div>

              <Field label="Transactions" required hint="One row per scheduled payment">
                <div className="space-y-2">
                  {txs.map((t, i) => (
                    <div key={i} className="grid grid-cols-[160px_1fr_32px] items-center gap-2">
                      <Input
                        type="date"
                        value={t.Date}
                        onChange={(e) =>
                          setTxs(txs.map((x, idx) => (idx === i ? { ...x, Date: e.target.value } : x)))
                        }
                        aria-label={`Transaction ${i + 1} date`}
                      />
                      <Input
                        type="number"
                        step="any"
                        value={t.Amount}
                        placeholder="Amount"
                        onChange={(e) =>
                          setTxs(txs.map((x, idx) => (idx === i ? { ...x, Amount: e.target.value } : x)))
                        }
                        aria-label={`Transaction ${i + 1} amount`}
                      />
                      <button
                        type="button"
                        onClick={() => setTxs(txs.filter((_, idx) => idx !== i))}
                        disabled={txs.length === 1}
                        aria-label={`Remove transaction ${i + 1}`}
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTxs([...txs, { Date: today(), Amount: "" }])}
                  >
                    <Plus className="size-4" /> Add transaction
                  </Button>
                </div>
              </Field>

              {createErr && <p className="text-xs text-danger">{createErr}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" loading={createPlan.isPending}>
                  <CalendarDays className="size-4" /> Create plan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] leading-relaxed text-fog">
                dk exposes no route to list an invoice&apos;s payment plans, so enter the plan number
                to cancel (plans are numbered from 1 per invoice).
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Plan number" required error={cancelErr ?? undefined}>
                  <Input
                    value={planNumber}
                    onChange={(e) => setPlanNumber(e.target.value)}
                    placeholder="e.g. 1"
                  />
                </Field>
                <Field label="User">
                  <Input value={cancelUser} onChange={(e) => setCancelUser(e.target.value)} />
                </Field>
                <Field label="Reason">
                  <Input
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Returned items"
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" variant="danger" onClick={requestCancel} loading={cancelPlan.isPending}>
                  <X className="size-4" /> Cancel plan…
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={`Cancel payment plan ${planNumber.trim()}?`}
        body={
          <>
            This cancels payment plan <strong>{planNumber.trim()}</strong> on invoice{" "}
            <strong>{invoiceNumber}</strong>. The invoice itself is not changed.
          </>
        }
        confirmLabel="Cancel plan"
        loading={cancelPlan.isPending}
        onConfirm={doCancel}
      />
    </>
  );
}
