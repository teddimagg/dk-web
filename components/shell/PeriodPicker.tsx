"use client";

import { clsx } from "clsx";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { usePeriod, usePeriodLabel, type Period } from "@/lib/stores/period";
import { useT } from "@/lib/i18n";

/**
 * Reporting-period chips for the stats pages: current year first, recent
 * years, all history, and a custom from/to range — so live companies default
 * to "this year" but any slice remains one click away.
 */
export function PeriodPicker() {
  const { period, setPeriod } = usePeriod();
  const t = useT();
  const pl = usePeriodLabel();
  const now = new Date().getFullYear();
  const years = [now, now - 1, now - 2];
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState(period.mode === "custom" ? period.from : "");
  const [to, setTo] = useState(period.mode === "custom" ? period.to : "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setCustomOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCustomOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [customOpen]);

  const chip = (active: boolean) =>
    clsx(
      "cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
      active ? "bg-ink text-white shadow-sm" : "bg-white border border-line text-fog hover:text-ink",
    );

  const isYear = (y: number) => period.mode === "year" && period.year === y;

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t("period.ariaLabel")}>
      {years.map((y) => (
        <button key={y} className={chip(isYear(y))} onClick={() => setPeriod({ mode: "year", year: y })}>
          {y}
        </button>
      ))}
      <button className={chip(period.mode === "all")} onClick={() => setPeriod({ mode: "all" })}>
        {t("period.allHistory")}
      </button>

      <div ref={ref} className="relative">
        <button
          className={clsx(chip(period.mode === "custom"), "flex items-center gap-1.5")}
          onClick={() => setCustomOpen((o) => !o)}
          aria-expanded={customOpen}
        >
          <CalendarDays className="size-3.5" />
          {period.mode === "custom" ? pl(period) : t("period.custom")}
          <ChevronDown className={clsx("size-3 transition-transform", customOpen && "rotate-180")} />
        </button>
        {customOpen && (
          <form
            className="fade-up absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-white p-4 shadow-pop"
            onSubmit={(e) => {
              e.preventDefault();
              const next: Period = { mode: "custom", from, to };
              setPeriod(next);
              setCustomOpen(false);
            }}
          >
            <div className="space-y-3">
              <Field label={t("period.from")} hint={t("period.fromHint")}>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label={t("period.to")} hint={t("period.toHint")}>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
              <Button type="submit" size="sm" className="w-full" disabled={!from && !to}>
                {t("period.apply")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
