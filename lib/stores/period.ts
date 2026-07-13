"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useT } from "@/lib/i18n";

/**
 * Reporting period for the stats pages (Overview + Analytics). Defaults to the
 * current year; the dkPlus paged invoice endpoint filters server-side via
 * ?createdAfter / ?createdBefore (both inclusive, compared to invoice date).
 */
export type Period =
  | { mode: "year"; year: number }
  | { mode: "all" }
  | { mode: "custom"; from: string; to: string }; // ISO dates yyyy-mm-dd

interface PeriodState {
  period: Period;
  setPeriod: (p: Period) => void;
}

export const usePeriod = create<PeriodState>()(
  persist(
    (set) => ({
      period: { mode: "year", year: new Date().getFullYear() },
      setPeriod: (period) => set({ period }),
    }),
    { name: "dk-period" },
  ),
);

/** Inclusive invoice-date bounds of the period (nulls = unbounded). */
export function periodBounds(p: Period): { from: string | null; to: string | null } {
  if (p.mode === "year") return { from: `${p.year}-01-01`, to: `${p.year}-12-31` };
  if (p.mode === "custom") return { from: p.from || null, to: p.to || null };
  return { from: null, to: null };
}

/**
 * Query-string fragment for dk's paged invoice endpoints ("" for all history).
 * dk's createdAfter/createdBefore compare the record CREATION date, while the
 * period means the INVOICE date — records can be backdated (created later than
 * dated) or, around year ends, entered slightly before their invoice date. So
 * the server window is widened by a grace margin on both sides and callers
 * must still filter rows with inPeriod() for exact invoice-date semantics.
 */
export function periodQuery(p: Period): string {
  const { from, to } = periodBounds(p);
  const parts: string[] = [];
  if (from) {
    const d = new Date(from);
    d.setMonth(d.getMonth() - 1); // catch pre-entered invoices
    parts.push(`createdAfter=${d.toISOString().slice(0, 10)}`);
  }
  if (to) {
    const d = new Date(to);
    d.setMonth(d.getMonth() + 6); // catch late/backdated entries
    parts.push(`createdBefore=${d.toISOString().slice(0, 10)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

/** True when the invoice date falls inside the period (invoice-date semantics). */
export function inPeriod(invoiceDateIso: string | null | undefined, p: Period): boolean {
  const { from, to } = periodBounds(p);
  if (!from && !to) return true;
  if (!invoiceDateIso) return false;
  const t = new Date(invoiceDateIso).getTime();
  if (Number.isNaN(t)) return false;
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
  return true;
}

/** Stable cache-key token for the period. */
export function periodKey(p: Period): string {
  if (p.mode === "year") return `y${p.year}`;
  if (p.mode === "custom") return `c${p.from}_${p.to}`;
  return "all";
}

export function periodLabel(p: Period): string {
  if (p.mode === "year") return String(p.year);
  if (p.mode === "custom") {
    if (p.from && p.to) return `${p.from} → ${p.to}`;
    if (p.from) return `from ${p.from}`;
    if (p.to) return `until ${p.to}`;
    return "custom";
  }
  return "All history";
}

/** Locale-aware period label (hook form — use in components instead of periodLabel). */
export function usePeriodLabel(): (p: Period) => string {
  const t = useT();
  return (p) => {
    if (p.mode === "year") return String(p.year);
    if (p.mode === "custom") {
      if (p.from && p.to) return `${p.from} → ${p.to}`;
      if (p.from) return t("period.fromDate", { date: p.from });
      if (p.to) return t("period.untilDate", { date: p.to });
      return t("period.custom");
    }
    return t("period.allHistory");
  };
}
