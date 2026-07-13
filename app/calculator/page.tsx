"use client";

import { Calculator, Equal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonView } from "@/components/ui/JsonView";
import { useToast } from "@/components/ui/Toast";
import {
  CustomerPicker,
  ProductPicker,
  SalespersonPicker,
  WarehousePicker,
} from "@/components/shell/pickers";
import { useDkMutation } from "@/lib/hooks/useDk";
import { formatAmount, formatNumber, formatPercent } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { CalcRequest, CalcResult } from "@/lib/api/types/overview";

interface LineDraft {
  id: number;
  ItemCode: string;
  Quantity: string;
  Warehouse: string;
}

let nextLineId = 1;
const newLine = (): LineDraft => ({ id: nextLineId++, ItemCode: "", Quantity: "1", Warehouse: "" });

/**
 * Live pricing calculator — runs drafts through PATCH /sales/invoice/calculate,
 * the same engine dkPlus uses to price real invoices (product, customer and
 * discount rules included), without creating anything.
 */
export default function CalculatorPage() {
  const toast = useToast();
  const t = useT();
  const [customer, setCustomer] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const calc = useDkMutation<CalcResult>();

  function patchLine(id: number, patch: Partial<LineDraft>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  const validLines = lines.filter((l) => l.ItemCode.trim() && Number(l.Quantity) !== 0);
  // dk's calculate endpoint rejects drafts without a customer.
  const canCalc = validLines.length > 0 && customer.trim().length > 0 && !calc.isPending;

  function run() {
    const body: CalcRequest = {
      Customer: { Number: customer.trim() },
      ...(salesPerson.trim() ? { SalesPerson: salesPerson.trim() } : {}),
      Lines: validLines.map((l) => ({
        ItemCode: l.ItemCode.trim(),
        Quantity: Number(l.Quantity) || 1,
        ...(l.Warehouse.trim() ? { Warehouse: l.Warehouse.trim() } : {}),
      })),
    };
    const started = performance.now();
    calc.mutate(
      { path: "/sales/invoice/calculate", method: "PATCH", body },
      {
        onSuccess: (data) => {
          setResult(data);
          setElapsed(Math.round(performance.now() - started));
        },
        onError: (e) =>
          toast.error(
            t("calc.failed"),
            e.status === 404 ? t("calc.checkItems") : e.message,
          ),
      },
    );
  }

  const vat =
    result?.TotalAmountWithTax != null && result?.TotalAmount != null
      ? result.TotalAmountWithTax - result.TotalAmount
      : null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("calc.eyebrow")} title={t("calc.title")}>
        <p className="mt-2 max-w-xl text-sm text-fog">{t("calc.body")}</p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <CardTitle icon={<Calculator />} className="mb-5">
            {t("calc.draftLines")}
          </CardTitle>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <Field
              label={t("calc.customer")}
              hint={t("calc.customerHint")}
              help={t("calc.customerHelp")}
              required
            >
              <CustomerPicker value={customer} onChange={setCustomer} placeholder="1710794709" />
            </Field>
            <Field label={t("calc.salesperson")} hint={t("calc.optional")}>
              <SalespersonPicker value={salesPerson} onChange={setSalesPerson} placeholder="web" />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_110px_150px_36px] gap-2 px-1 text-xs font-medium uppercase tracking-wide text-mist">
              <span>{t("calc.itemCode")}</span>
              <span>{t("calc.qty")}</span>
              <span>{t("calc.warehouse")}</span>
              <span />
            </div>
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr_110px_150px_36px] gap-2">
                <ProductPicker
                  value={l.ItemCode}
                  onChange={(v) => patchLine(l.id, { ItemCode: v })}
                  placeholder="007059"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={l.Quantity}
                  onChange={(e) => patchLine(l.id, { Quantity: e.target.value })}
                  className="text-right tnum"
                  aria-label={t("calc.qty")}
                />
                <WarehousePicker
                  value={l.Warehouse}
                  onChange={(v) => patchLine(l.id, { Warehouse: v })}
                  placeholder={t("calc.optional")}
                />
                <button
                  onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.id !== l.id) : ls))}
                  aria-label={t("calc.removeLine")}
                  className="grid cursor-pointer place-items-center rounded-xl text-mist transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setLines((ls) => [...ls, newLine()])}>
              <Plus className="size-4" /> {t("calc.addLine")}
            </Button>
            <Button className="ml-auto" onClick={run} disabled={!canCalc} loading={calc.isPending}>
              <Equal className="size-4" /> {t("calc.calculate")}
            </Button>
          </div>
          {(validLines.length === 0 || !customer.trim()) && (
            <p className="mt-3 text-right text-xs text-mist">
              {!customer.trim() ? t("calc.needCustomer") : t("calc.needItem")} {t("calc.toCalculate")}
            </p>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="glass-green p-6">
            <p className="text-[13px] font-semibold text-ink">{t("calc.result")}</p>
            {result ? (
              <>
                <p className="stat-numeral mt-3 text-[2.8rem] leading-none text-ink tnum">
                  {formatAmount(result.TotalAmountWithTax, result.Currency ?? "ISK")}
                </p>
                <div className="mt-4 space-y-1.5 text-sm text-ink/80">
                  <p className="flex justify-between">
                    <span>{t("calc.beforeTax")}</span>
                    <span className="font-medium tnum">{formatAmount(result.TotalAmount, result.Currency ?? "ISK")}</span>
                  </p>
                  {vat != null && (
                    <p className="flex justify-between">
                      <span>{t("calc.vat")}</span>
                      <span className="font-medium tnum">{formatAmount(vat, result.Currency ?? "ISK")}</span>
                    </p>
                  )}
                  {elapsed != null && (
                    <p className="pt-2 text-xs text-ink/60 tnum">{t("calc.pricedIn", { ms: elapsed })}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink/70">{t("calc.resultHint")}</p>
            )}
          </Card>

          {result?.Lines && result.Lines.length > 0 && (
            <Card className="p-5">
              <p className="mb-3 text-[13px] font-medium text-fog">{t("calc.lineBreakdown")}</p>
              <div className="space-y-3">
                {result.Lines.map((l, i) => (
                  <div key={i} className="border-b border-line pb-2 text-sm last:border-0">
                    <div className="flex justify-between font-medium text-ink">
                      <span>
                        {l.ItemCode}
                        {l.Text ? ` · ${l.Text}` : ""}
                      </span>
                      <span className="tnum">{formatAmount(l.TotalAmountWithTax)}</span>
                    </div>
                    <p className="mt-0.5 flex justify-between text-xs text-fog tnum">
                      <span>
                        {formatNumber(l.Quantity)} × {formatAmount(l.UnitPriceWithTax)}
                        {l.Discount ? ` − ${formatPercent(l.Discount, 0)} ${t("calc.discount")}` : ""}
                      </span>
                      {l.DiscountAmountWithTax ? <span>−{formatAmount(l.DiscountAmountWithTax)}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result && <JsonView data={result} label={t("calc.rawResult")} />}
        </div>
      </div>
    </div>
  );
}
