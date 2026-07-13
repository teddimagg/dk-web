"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Draft line kept as strings while editing; parsed on submit. */
export interface DraftLine {
  ItemCode: string;
  Quantity: string;
  UnitPrice: string;
  Text: string;
}

export const emptyLine = (): DraftLine => ({ ItemCode: "", Quantity: "1", UnitPrice: "", Text: "" });

/** Add/remove row editor shared by the invoice, order and quote create dialogs. */
export function LineEditor({
  lines,
  onChange,
  disabled,
}: {
  lines: DraftLine[];
  onChange: (lines: DraftLine[]) => void;
  disabled?: boolean;
}) {
  function update(i: number, patch: Partial<DraftLine>) {
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_80px_110px_1fr_32px] gap-2 text-xs font-medium uppercase tracking-wide text-mist">
        <span>Item code</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span>Text</span>
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_80px_110px_1fr_32px] items-center gap-2">
          <Input
            value={l.ItemCode}
            onChange={(e) => update(i, { ItemCode: e.target.value })}
            placeholder="e.g. 0001"
            aria-label={`Line ${i + 1} item code`}
            disabled={disabled}
          />
          <Input
            type="number"
            step="any"
            value={l.Quantity}
            onChange={(e) => update(i, { Quantity: e.target.value })}
            aria-label={`Line ${i + 1} quantity`}
            disabled={disabled}
          />
          <Input
            type="number"
            step="any"
            value={l.UnitPrice}
            onChange={(e) => update(i, { UnitPrice: e.target.value })}
            placeholder="auto"
            aria-label={`Line ${i + 1} unit price`}
            disabled={disabled}
          />
          <Input
            value={l.Text}
            onChange={(e) => update(i, { Text: e.target.value })}
            placeholder="Optional"
            aria-label={`Line ${i + 1} text`}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
            disabled={disabled || lines.length === 1}
            aria-label={`Remove line ${i + 1}`}
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
        disabled={disabled}
        onClick={() => onChange([...lines, emptyLine()])}
      >
        <Plus className="size-4" /> Add line
      </Button>
    </div>
  );
}
