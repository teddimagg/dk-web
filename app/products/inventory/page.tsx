"use client";

import { ArrowRightLeft, ClipboardList, Layers, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type {
  InventoryJournalBody,
  InventoryingBody,
  WarehouseTransferItem,
} from "@/lib/api/types/products";

const INVALIDATES: readonly unknown[][] = [["products"], ["product"], ["product-transactions"]];

function parseNum(v: string): number {
  return Number(v.replace(",", "."));
}

interface EditableLine {
  itemCode: string;
  warehouse: string;
  amount: string;
}

const EMPTY_LINE: EditableLine = { itemCode: "", warehouse: "", amount: "" };

function linesValid(lines: EditableLine[]): boolean {
  return (
    lines.length > 0 &&
    lines.every(
      (l) => l.itemCode.trim() !== "" && l.warehouse.trim() !== "" && l.amount.trim() !== "" && !Number.isNaN(parseNum(l.amount)),
    )
  );
}

/** Shared multi-line editor for journal and stocktake registrations. */
function LinesEditor({
  lines,
  onChange,
  amountLabel,
}: {
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
  amountLabel: string;
}) {
  const update = (i: number, patch: Partial<EditableLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_90px_80px_28px] gap-2 text-xs font-medium uppercase tracking-wide text-mist">
        <span>Item code</span>
        <span>Warehouse</span>
        <span className="text-right">{amountLabel}</span>
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_90px_80px_28px] items-center gap-2">
          <Input
            value={l.itemCode}
            onChange={(e) => update(i, { itemCode: e.target.value })}
            placeholder="item code"
            aria-label={`Line ${i + 1} item code`}
            className="h-9 font-mono text-xs"
          />
          <Input
            value={l.warehouse}
            onChange={(e) => update(i, { warehouse: e.target.value })}
            placeholder="bg1"
            aria-label={`Line ${i + 1} warehouse`}
            className="h-9 text-xs"
          />
          <Input
            value={l.amount}
            onChange={(e) => update(i, { amount: e.target.value })}
            placeholder="0"
            inputMode="decimal"
            aria-label={`Line ${i + 1} ${amountLabel}`}
            className="h-9 text-right text-xs tnum"
          />
          <button
            type="button"
            onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
            disabled={lines.length === 1}
            aria-label={`Remove line ${i + 1}`}
            className="grid size-7 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-haze hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...lines, { ...EMPTY_LINE }])}>
        <Plus className="size-4" /> Add line
      </Button>
    </div>
  );
}

/** POST /product/register/journal */
function JournalCard() {
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const register = useDkMutation({ invalidates: INVALIDATES });

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setFormError("A description is required.");
    if (!linesValid(lines)) return setFormError("Every line needs an item code, a warehouse and a numeric quantity.");
    setFormError(null);
    setConfirming(true);
  }

  function submit() {
    const body: InventoryJournalBody = {
      Description: description.trim(),
      Lines: lines.map((l) => ({
        ItemCode: l.itemCode.trim(),
        Warehouse: l.warehouse.trim(),
        Quantity: parseNum(l.amount),
      })),
    };
    register.mutate(
      { path: "/product/register/journal", method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Journal registered", `${body.Lines.length} line(s) posted to the inventory journal.`);
          setDescription("");
          setLines([{ ...EMPTY_LINE }]);
          setConfirming(false);
        },
        onError: (err) => {
          toast.error("Journal registration failed", err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<ClipboardList />} className="mb-3">
        Inventory journal
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">
        Post quantity adjustments straight into the inventory journal — positive quantities add stock, negative
        quantities remove it.
      </p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label="Description" required>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Damaged goods write-off"
          />
        </Field>
        <LinesEditor lines={lines} onChange={setLines} amountLabel="Qty" />
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          Register journal
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title="Register inventory journal?"
        body={
          <>
            This posts <strong>{lines.length} line(s)</strong> (&ldquo;{description.trim()}&rdquo;) to the inventory
            journal and adjusts stock levels. The registration cannot be undone from dkPanel.
          </>
        }
        confirmLabel="Register"
        loading={register.isPending}
      />
    </Card>
  );
}

/** POST /Product/register/transfer */
function TransferCard() {
  const toast = useToast();
  const [itemCode, setItemCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const register = useDkMutation({ invalidates: INVALIDATES });

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemCode.trim() || !from.trim() || !to.trim())
      return setFormError("Item code and both warehouses are required.");
    if (quantity.trim() === "" || Number.isNaN(parseNum(quantity)))
      return setFormError("Quantity must be a number.");
    setFormError(null);
    setConfirming(true);
  }

  function submit() {
    const body: WarehouseTransferItem[] = [
      {
        ItemCode: itemCode.trim(),
        From: from.trim(),
        To: to.trim(),
        Quantity: parseNum(quantity),
        ...(comment.trim() ? { Comment: comment.trim() } : {}),
      },
    ];
    register.mutate(
      { path: "/Product/register/transfer", method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            "Transfer registered",
            `${quantity} × ${itemCode.trim()} moved from ${from.trim()} to ${to.trim()}.`,
          );
          setItemCode("");
          setFrom("");
          setTo("");
          setQuantity("");
          setComment("");
          setConfirming(false);
        },
        onError: (err) => {
          toast.error("Transfer failed", err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<ArrowRightLeft />} className="mb-3">
        Warehouse transfer
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">
        Move stock of a product from one warehouse to another in a single registration.
      </p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label="Item code" required>
          <Input
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            placeholder="item code"
            className="font-mono"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From warehouse" required>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="bg1" />
          </Field>
          <Field label="To warehouse" required>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="ak" />
          </Field>
        </div>
        <Field label="Quantity" required>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="text-right tnum"
          />
        </Field>
        <Field label="Comment" hint="optional">
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reason for the move" />
        </Field>
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          Register transfer
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title="Register warehouse transfer?"
        body={
          <>
            This moves <strong>{quantity || "0"} × {itemCode.trim() || "?"}</strong> from{" "}
            <strong>{from.trim() || "?"}</strong> to <strong>{to.trim() || "?"}</strong>. The registration cannot be
            undone from dkPanel — you would need to transfer it back.
          </>
        }
        confirmLabel="Register"
        loading={register.isPending}
      />
    </Card>
  );
}

/** POST /product/register/Inventorying */
function InventoryingCard() {
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const register = useDkMutation({ invalidates: INVALIDATES });

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setFormError("A description is required.");
    if (!linesValid(lines)) return setFormError("Every line needs an item code, a warehouse and a numeric count.");
    setFormError(null);
    setConfirming(true);
  }

  function submit() {
    const body: InventoryingBody = {
      Description: description.trim(),
      Lines: lines.map((l) => ({
        ItemCode: l.itemCode.trim(),
        Warehouse: l.warehouse.trim(),
        Counted: parseNum(l.amount),
      })),
    };
    register.mutate(
      { path: "/product/register/Inventorying", method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Stocktake registered", `On-hand quantities corrected for ${body.Lines.length} line(s).`);
          setDescription("");
          setLines([{ ...EMPTY_LINE }]);
          setConfirming(false);
        },
        onError: (err) => {
          toast.error("Stocktake registration failed", err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<Layers />} className="mb-3">
        Inventorying (stocktake)
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">
        Record counted stock per warehouse — dkPlus corrects the on-hand quantity of each product to match the count.
      </p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label="Description" required>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. July stocktake"
          />
        </Field>
        <LinesEditor lines={lines} onChange={setLines} amountLabel="Counted" />
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          Register stocktake
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title="Register stocktake?"
        body={
          <>
            This corrects on-hand stock for <strong>{lines.length} line(s)</strong> (&ldquo;{description.trim()}
            &rdquo;) to the counted quantities. The correction cannot be undone from dkPanel.
          </>
        }
        confirmLabel="Register"
        loading={register.isPending}
      />
    </Card>
  );
}

export default function InventoryRegistrationsPage() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <JournalCard />
      <TransferCard />
      <InventoryingCard />
    </div>
  );
}
