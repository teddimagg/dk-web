"use client";

import { ArrowRightLeft, ClipboardList, Layers, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
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
  const t = useT();
  const update = (i: number, patch: Partial<EditableLine>) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_90px_80px_28px] gap-2 text-xs font-medium uppercase tracking-wide text-mist">
        <span>{t("products.itemCode")}</span>
        <span>{t("products.warehouse")}</span>
        <span className="text-right">{amountLabel}</span>
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_90px_80px_28px] items-center gap-2">
          <Input
            value={l.itemCode}
            onChange={(e) => update(i, { itemCode: e.target.value })}
            placeholder={t("products.itemCodePlaceholder")}
            aria-label={t("products.lineItemCodeAria", { n: i + 1 })}
            className="h-9 font-mono text-xs"
          />
          <Input
            value={l.warehouse}
            onChange={(e) => update(i, { warehouse: e.target.value })}
            placeholder="bg1"
            aria-label={t("products.lineWarehouseAria", { n: i + 1 })}
            className="h-9 text-xs"
          />
          <Input
            value={l.amount}
            onChange={(e) => update(i, { amount: e.target.value })}
            placeholder="0"
            inputMode="decimal"
            aria-label={t("products.lineAmountAria", { n: i + 1, label: amountLabel })}
            className="h-9 text-right text-xs tnum"
          />
          <button
            type="button"
            onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
            disabled={lines.length === 1}
            aria-label={t("products.removeLineAria", { n: i + 1 })}
            className="grid size-7 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-haze hover:text-danger disabled:pointer-events-none disabled:opacity-30"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...lines, { ...EMPTY_LINE }])}>
        <Plus className="size-4" /> {t("products.addLine")}
      </Button>
    </div>
  );
}

/** POST /product/register/journal */
function JournalCard() {
  const toast = useToast();
  const t = useT();
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const register = useDkMutation({ invalidates: INVALIDATES });

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setFormError(t("products.descriptionRequired"));
    if (!linesValid(lines)) return setFormError(t("products.linesInvalidQty"));
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
          toast.success(t("products.journalRegistered"), t("products.journalRegisteredDetail", { n: body.Lines.length }));
          setDescription("");
          setLines([{ ...EMPTY_LINE }]);
          setConfirming(false);
        },
        onError: (err) => {
          toast.error(t("products.journalFailed"), err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<ClipboardList />} className="mb-3">
        {t("products.journalTitle")}
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">{t("products.journalIntro")}</p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label={t("products.description")} required>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("products.journalDescPlaceholder")}
          />
        </Field>
        <LinesEditor lines={lines} onChange={setLines} amountLabel={t("products.qty")} />
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          {t("products.registerJournal")}
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title={t("products.journalConfirmTitle")}
        body={
          <>
            {t("products.journalConfirmIntro")} <strong>{t("products.nLines", { n: lines.length })}</strong>{" "}
            {t("products.journalConfirmRest", { desc: description.trim() })}
          </>
        }
        confirmLabel={t("products.register")}
        loading={register.isPending}
      />
    </Card>
  );
}

/** POST /Product/register/transfer */
function TransferCard() {
  const toast = useToast();
  const t = useT();
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
      return setFormError(t("products.transferMissing"));
    if (quantity.trim() === "" || Number.isNaN(parseNum(quantity)))
      return setFormError(t("products.quantityNumeric"));
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
            t("products.transferRegistered"),
            t("products.transferRegisteredDetail", {
              qty: quantity,
              code: itemCode.trim(),
              from: from.trim(),
              to: to.trim(),
            }),
          );
          setItemCode("");
          setFrom("");
          setTo("");
          setQuantity("");
          setComment("");
          setConfirming(false);
        },
        onError: (err) => {
          toast.error(t("products.transferFailed"), err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<ArrowRightLeft />} className="mb-3">
        {t("products.transferTitle")}
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">{t("products.transferIntro")}</p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label={t("products.itemCode")} required>
          <Input
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            placeholder={t("products.itemCodePlaceholder")}
            className="font-mono"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("products.fromWarehouse")} required>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="bg1" />
          </Field>
          <Field label={t("products.toWarehouse")} required>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="ak" />
          </Field>
        </div>
        <Field label={t("products.quantity")} required>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="text-right tnum"
          />
        </Field>
        <Field label={t("products.comment")} hint={t("products.optional")}>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("products.commentPlaceholder")}
          />
        </Field>
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          {t("products.registerTransfer")}
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title={t("products.transferConfirmTitle")}
        body={
          <>
            {t("products.transferConfirmIntro")}{" "}
            <strong>
              {quantity || "0"} × {itemCode.trim() || "?"}
            </strong>{" "}
            {t("products.transferConfirmFrom")} <strong>{from.trim() || "?"}</strong>{" "}
            {t("products.transferConfirmTo")} <strong>{to.trim() || "?"}</strong>.{" "}
            {t("products.transferConfirmRest")}
          </>
        }
        confirmLabel={t("products.register")}
        loading={register.isPending}
      />
    </Card>
  );
}

/** POST /product/register/Inventorying */
function InventoryingCard() {
  const toast = useToast();
  const t = useT();
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<EditableLine[]>([{ ...EMPTY_LINE }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const register = useDkMutation({ invalidates: INVALIDATES });

  function requestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setFormError(t("products.descriptionRequired"));
    if (!linesValid(lines)) return setFormError(t("products.linesInvalidCount"));
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
          toast.success(t("products.stocktakeRegistered"), t("products.stocktakeRegisteredDetail", { n: body.Lines.length }));
          setDescription("");
          setLines([{ ...EMPTY_LINE }]);
          setConfirming(false);
        },
        onError: (err) => {
          toast.error(t("products.stocktakeFailed"), err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<Layers />} className="mb-3">
        {t("products.stocktakeTitle")}
      </CardTitle>
      <p className="mb-4 text-[13px] leading-relaxed text-fog">{t("products.stocktakeIntro")}</p>
      <form onSubmit={requestSubmit} className="space-y-4">
        <Field label={t("products.description")} required>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("products.stocktakeDescPlaceholder")}
          />
        </Field>
        <LinesEditor lines={lines} onChange={setLines} amountLabel={t("products.counted")} />
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" loading={register.isPending} className="w-full">
          {t("products.registerStocktake")}
        </Button>
      </form>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        title={t("products.stocktakeConfirmTitle")}
        body={
          <>
            {t("products.stocktakeConfirmIntro")} <strong>{t("products.nLines", { n: lines.length })}</strong>{" "}
            {t("products.stocktakeConfirmRest", { desc: description.trim() })}
          </>
        }
        confirmLabel={t("products.register")}
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
