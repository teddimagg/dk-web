"use client";

import {
  Activity,
  ArrowUpRight,
  Boxes,
  CircleCheckBig,
  Clock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BarSpark, Gauge, StripMeter } from "@/components/ui/charts";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import { usePeriod, usePeriodLabel } from "@/lib/stores/period";
import { usePeriodInvoices } from "@/lib/hooks/usePeriodInvoices";
import { PeriodPicker } from "@/components/shell/PeriodPicker";
import { formatAmount, formatCompact, formatInt, formatPercent, timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale";
import { MODULES } from "@/lib/modules";
import type {
  CustomerSummary,
  InvoiceSummary,
  LedgerAccount,
  ProductSummary,
  ProjectSummary,
  EmployeeSummary,
  TimeClockEntry,
} from "@/lib/api/types/overview";

const isSettled = (i: InvoiceSummary) =>
  i.SettledType === 2 ||
  (Math.abs(i.SettledAmount ?? 0) >= Math.abs(i.TotalAmountWithTax) && i.TotalAmountWithTax !== 0);

const isOverdue = (i: InvoiceSummary) =>
  !isSettled(i) && !!i.DueDate && new Date(i.DueDate).getTime() < Date.now();

const monthLabel = (d: Date, locale: string) =>
  d.toLocaleDateString(locale === "is" ? "is-IS" : "en-GB", { month: "long", year: "numeric" });

export default function OverviewPage() {
  const company = useActiveCompany();
  const qc = useQueryClient();
  const { period, setPeriod } = usePeriod();
  const t = useT();
  const pl = usePeriodLabel();
  const locale = useLocale((s) => s.locale);

  // Every invoice of the period, all pages (shared with Analytics).
  const { invoices: inv, truncated, query: invoices } = usePeriodInvoices();
  const customers = useDkQuery<CustomerSummary[]>(["overview", "customers"], "/customer/page/1/100");
  const products = useDkQuery<ProductSummary[]>(["overview", "products"], "/Product/page/1/100");
  const clockedIn = useDkQuery<TimeClockEntry[]>(["overview", "timeclock"], "/timeclock/in");
  const projects = useDkQuery<ProjectSummary[]>(["overview", "projects"], "/project/page/1/50");
  const employees = useDkQuery<EmployeeSummary[]>(["overview", "employees"], "/general/employee");
  const accounts = useDkQuery<LedgerAccount[]>(["overview", "accounts"], "/generalLedger/account");
  const vendors = useDkQuery<{ Number?: string }[]>(["overview", "vendors"], "/vendor/page/1/50");

  const m = useMemo(() => {
    if (!inv || inv.length === 0) return null;
    const settled = inv.filter(isSettled);
    const open = inv.filter((i) => !isSettled(i));
    const overdue = inv.filter(isOverdue);
    const totalAbs = inv.reduce((s, i) => s + Math.abs(i.TotalAmountWithTax), 0);
    const settledAbs = inv.reduce((s, i) => s + Math.min(Math.abs(i.SettledAmount ?? 0), Math.abs(i.TotalAmountWithTax)), 0);
    const openAbs = open.reduce((s, i) => s + Math.abs(i.TotalAmountWithTax), 0);
    const overdueAbs = overdue.reduce((s, i) => s + Math.abs(i.TotalAmountWithTax), 0);

    // Latest month present in the data (demo data is historical).
    const dates = inv.map((i) => new Date(i.InvoiceDate)).filter((d) => !Number.isNaN(d.getTime()));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    const monthOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    const latestKey = monthOf(latest);
    const prev = new Date(latest.getFullYear(), latest.getMonth() - 1, 1);
    const prevKey = monthOf(prev);
    const inMonth = inv.filter((i) => monthOf(new Date(i.InvoiceDate)) === latestKey);
    const inPrev = inv.filter((i) => monthOf(new Date(i.InvoiceDate)) === prevKey);
    const monthTotal = inMonth.reduce((s, i) => s + i.TotalAmountWithTax, 0);
    const prevTotal = inPrev.reduce((s, i) => s + i.TotalAmountWithTax, 0);
    const monthDelta = prevTotal !== 0 ? ((monthTotal - prevTotal) / Math.abs(prevTotal)) * 100 : null;

    // Daily volume for the sparkline: last 42 calendar days ending at the latest date.
    const dayMs = 86_400_000;
    const spark = Array.from({ length: 42 }, (_, k) => {
      const dayStart = latest.getTime() - (41 - k) * dayMs;
      return inv
        .filter((i) => {
          const t = new Date(i.InvoiceDate).getTime();
          return t >= dayStart - dayMs / 2 && t < dayStart + dayMs / 2;
        })
        .reduce((s, i) => s + Math.abs(i.TotalAmountWithTax), 0);
    });

    const biggest = [...inv].sort(
      (a, b) => Math.abs(b.TotalAmountWithTax) - Math.abs(a.TotalAmountWithTax),
    )[0];
    const latestInvoice = [...inv].sort(
      (a, b) => new Date(b.InvoiceDate).getTime() - new Date(a.InvoiceDate).getTime(),
    )[0];

    return {
      settled,
      open,
      overdue,
      settledPct: (settled.length / inv.length) * 100,
      collectionPct: totalAbs > 0 ? (settledAbs / totalAbs) * 100 : 0,
      overduePctOfOpen: openAbs > 0 ? (overdueAbs / openAbs) * 100 : 0,
      overdueAbs,
      openAbs,
      monthName: monthLabel(latest, locale),
      monthTotal,
      monthCount: inMonth.length,
      monthDelta,
      spark,
      biggest,
      latestInvoice,
      onTimePct: inv.length > 0 ? (inv.filter((i) => isSettled(i) || !isOverdue(i)).length / inv.length) * 100 : 0,
    };
  }, [inv, locale]);

  const cust = useMemo(() => {
    const list = customers.data;
    if (!list || list.length === 0) return null;
    const blocked = list.filter((c) => c.Blocked).length;
    const grouped = list.filter((c) => c.Group).length;
    const balance = list.reduce((s, c) => s + (c.BalanceAmount ?? 0), 0);
    const latestModified = [...list].sort(
      (a, b) => new Date(b.Modified ?? 0).getTime() - new Date(a.Modified ?? 0).getTime(),
    )[0];
    return {
      count: list.length,
      blocked,
      activePct: ((list.length - blocked) / list.length) * 100,
      groupedPct: (grouped / list.length) * 100,
      balance,
      latestModified,
    };
  }, [customers.data]);

  const prod = useMemo(() => {
    const list = products.data;
    if (!list || list.length === 0) return null;
    const priced = list.filter((p) => (p.UnitPrice1 ?? 0) > 0 || (p.UnitPrice1WithTax ?? 0) > 0).length;
    const described = list.filter((p) => (p.Description ?? "").trim().length > 0).length;
    return {
      count: list.length,
      pricedPct: (priced / list.length) * 100,
      describedPct: (described / list.length) * 100,
    };
  }, [products.data]);

  const loading = invoices.isLoading;
  const anyFetching =
    invoices.isFetching || customers.isFetching || products.isFetching || clockedIn.isFetching;

  const counts: Record<string, string> = {
    "/customers": customers.data ? (customers.data.length >= 100 ? "100+" : formatInt(customers.data.length)) : "…",
    "/sales": inv ? (inv.length >= 100 ? "100+" : formatInt(inv.length)) : "…",
    "/products": products.data ? (products.data.length >= 100 ? "100+" : formatInt(products.data.length)) : "…",
    "/vendors": vendors.data ? formatInt(vendors.data.length) : "…",
    "/projects": projects.data ? formatInt(projects.data.length) : "…",
    "/ledger": accounts.data ? formatInt(accounts.data.length) : "…",
    "/general": employees.data ? formatInt(employees.data.length) : "…",
    "/timeclock": clockedIn.data ? formatInt(clockedIn.data.length) : "…",
  };

  const avgAccountStats =
    cust && prod ? (cust.activePct + prod.pricedPct + prod.describedPct + cust.groupedPct) / 4 : null;

  return (
    <div className="space-y-8">
      {/* ── Header + insight stack ─────────────────────────────────── */}
      <section className="grid items-end gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <PageHeader eyebrow={t("overview.eyebrow", { company: company?.name ?? "…" })} title={t("overview.title")} />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-fog">
            <PeriodPicker />
            <span className="rounded-full border border-line bg-white px-3 py-1 tnum">
              {inv ? t("overview.invoicesIn", { n: formatInt(inv.length), period: pl(period) }) : "…"}
            </span>
            <span className="rounded-full border border-line bg-white px-3 py-1">
              {t("overview.updated", { ago: invoices.dataUpdatedAt ? timeAgo(new Date(invoices.dataUpdatedAt).toISOString()) : "…" })}
            </span>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: [company?.id] })}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`size-3.5 ${anyFetching ? "animate-spin" : ""}`} />
              {t("ui.refresh")}
            </button>
          </div>
          {truncated && (
            <p className="mt-2 text-xs text-[#9a6a10]">{t("overview.truncated")}</p>
          )}
        </div>

        {/* Stacked glass insight cards */}
        <div className="relative h-44">
          <div className="glass-green-soft absolute -right-2 top-4 h-36 w-[92%] rotate-2 rounded-card" aria-hidden />
          <div className="glass-green-soft absolute right-1 top-2 h-38 w-[96%] rotate-1 rounded-card" aria-hidden />
          <div className="glass-green relative h-full rounded-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Zap className="size-4" /> {t("overview.insights")}
              </span>
              <Link href="/analytics" aria-label={t("overview.openAnalytics")}>
                <ArrowUpRight className="size-4 text-ink/70 transition-transform hover:translate-x-0.5 hover:-translate-y-0.5" />
              </Link>
            </div>
            {m ? (
              <>
                <p className="mt-3 text-[1.35rem] font-medium leading-snug text-ink">
                  {t("overview.insightMonth", {
                    month: m.monthName,
                    amount: formatCompact(m.monthTotal) + " ISK",
                    count: m.monthCount,
                  })}
                </p>
                {m.monthDelta != null && (
                  <p className="mt-2 text-[13px] font-medium text-ink/70 tnum">
                    {t("overview.insightDelta", {
                      arrow: m.monthDelta >= 0 ? "▲" : "▼",
                      pct: formatPercent(Math.abs(m.monthDelta)),
                    })}
                  </p>
                )}
              </>
            ) : inv && inv.length === 0 ? (
              <p className="mt-3 text-[1.35rem] font-medium leading-snug text-ink/70">
                {t("overview.insightEmpty", { period: pl(period) })}
              </p>
            ) : invoices.error ? (
              <p className="mt-3 text-[1.35rem] font-medium leading-snug text-ink/70">
                {t("overview.insightError")}
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-4/5 bg-white/50" />
                <Skeleton className="h-6 w-3/5 bg-white/50" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Invoice query failed (bad token, dkPlus down) ──────────── */}
      {invoices.error && (
        <Card>
          <ErrorState error={invoices.error} onRetry={() => invoices.refetch()} />
        </Card>
      )}

      {/* ── Empty period ───────────────────────────────────────────── */}
      {inv && inv.length === 0 && (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-haze text-mist">
            <Activity className="size-6" />
          </span>
          <div>
            <p className="font-medium text-ink">{t("overview.emptyTitle", { period: pl(period) })}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-fog">{t("overview.emptyBody")}</p>
          </div>
          <button
            onClick={() => setPeriod({ mode: "all" })}
            className="cursor-pointer rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            {t("overview.showAll")}
          </button>
        </Card>
      )}

      {/* ── Primary stat row ───────────────────────────────────────── */}
      <section
        className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${(inv && inv.length === 0) || invoices.error ? "hidden" : ""}`}
      >
        {loading || !m ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <StatSkeleton />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={<CircleCheckBig />}
              title={t("overview.settledInvoices")}
              value={formatPercent(m.settledPct, 2).replace("%", "")}
              unit="%"
              left={{ value: formatInt(m.settled.length), label: t("overview.settled") }}
              right={{ value: formatInt(m.open.length), label: t("overview.open") }}
              meter={m.settledPct}
            />

            <Card className="flex flex-col gap-2 p-5">
              <CardTitle icon={<Activity />}>{t("overview.collectionRate")}</CardTitle>
              <div className="flex items-start justify-between px-1 text-[13px]">
                <span>
                  <span className="stat-numeral block text-lg tnum">{formatCompact(Math.abs(m.openAbs))}</span>
                  <span className="text-fog">{t("overview.outstanding")}</span>
                </span>
                <span className="text-right">
                  <span className="stat-numeral block text-lg tnum">{formatInt(m.settled.length)}</span>
                  <span className="text-fog">{t("overview.collected")}</span>
                </span>
              </div>
              <Gauge
                value={m.collectionPct}
                size={148}
                className="mx-auto -mt-2"
                label={
                  <span className="stat-numeral mt-3 text-[1.7rem] tnum">
                    {formatPercent(m.collectionPct, 2).replace("%", "")}
                    <sup className="ml-0.5 text-sm font-normal text-fog">%</sup>
                  </span>
                }
              />
            </Card>

            <StatCard
              icon={<ShieldAlert />}
              title={t("overview.overdueExposure")}
              value={formatPercent(m.overduePctOfOpen, 2).replace("%", "")}
              unit="%"
              left={{ value: formatInt(m.overdue.length), label: t("overview.overdue") }}
              right={{ value: formatCompact(m.overdueAbs), label: t("overview.atRisk") }}
              meter={m.overduePctOfOpen}
            />
          </>
        )}
      </section>

      {/* ── Secondary row: utilization, closures, pulse ────────────── */}
      <section className={`grid gap-4 lg:grid-cols-3 ${invoices.error ? "hidden" : ""}`}>
        {cust && prod ? (
          <Card className="flex flex-col gap-4 p-5">
            <CardTitle icon={<Boxes />}>{t("overview.dataHealth")}</CardTitle>
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-3 text-[13px]">
                <p>
                  <span className="stat-numeral block text-lg tnum">{formatPercent(cust.activePct, 0)}</span>
                  <span className="text-fog">{t("overview.activeCustomers")}</span>
                </p>
                <p>
                  <span className="stat-numeral block text-lg tnum">{formatPercent(prod.pricedPct, 0)}</span>
                  <span className="text-fog">{t("overview.pricedItems")}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="stat-numeral text-[2.6rem] leading-none tnum">
                  {avgAccountStats != null ? formatPercent(avgAccountStats, 1).replace("%", "") : "–"}
                  <sup className="ml-0.5 text-base font-normal text-fog">%</sup>
                </p>
                <p className="mt-1 text-xs text-fog">{t("overview.avgAccountStats")}</p>
              </div>
              <div className="space-y-3 text-right text-[13px]">
                <p>
                  <span className="stat-numeral block text-lg tnum">{formatPercent(cust.groupedPct, 0)}</span>
                  <span className="text-fog">{t("overview.groupedClients")}</span>
                </p>
                <p>
                  <span className="stat-numeral block text-lg tnum">{formatInt(cust.blocked)}</span>
                  <span className="text-fog">{t("overview.blockedAccounts")}</span>
                </p>
              </div>
            </div>
            <StripMeter value={avgAccountStats ?? 0} />
          </Card>
        ) : (
          <Card className="p-5">
            <StatSkeleton />
          </Card>
        )}

        {inv && inv.length === 0 ? (
          <Card className="grid place-items-center p-5 text-sm text-fog">
            {t("overview.noInvoiceData", { period: pl(period) })}
          </Card>
        ) : m ? (
          <Card className="flex flex-col gap-3 p-5">
            <CardTitle icon={<Timer />}>{t("overview.timelyClosures")}</CardTitle>
            <div className="flex items-end justify-between">
              <div className="space-y-2 text-[13px]">
                <p>
                  <span className="stat-numeral block text-lg tnum">{formatInt(m.settled.length)}</span>
                  <span className="text-fog">{t("overview.done")}</span>
                </p>
                <p>
                  <span className="stat-numeral block text-lg tnum">
                    {formatPercent((m.open.length / Math.max(1, m.settled.length + m.open.length)) * 100, 0)}
                  </span>
                  <span className="text-fog">{t("overview.active")}</span>
                </p>
              </div>
              <p className="stat-numeral text-[2.6rem] leading-none tnum">
                {formatPercent(m.onTimePct, 1).replace("%", "")}
                <sup className="ml-0.5 text-base font-normal text-fog">%</sup>
              </p>
            </div>
            <BarSpark values={m.spark} highlightFrom={35} height={64} />
            <p className="text-right text-[11px] text-mist">{t("overview.sparkCaption")}</p>
          </Card>
        ) : (
          <Card className="p-5">
            <StatSkeleton />
          </Card>
        )}

        {/* Pulse feed — chat-style activity digest */}
        <Card className="flex flex-col p-5">
          <CardTitle icon={<Sparkles />} className="mb-4">
            {t("overview.pulse")}
          </CardTitle>
          <div className="space-y-3 text-[13px]">
            {m?.latestInvoice && (
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-ink">
                  <Zap className="size-3.5" />
                </span>
                <p className="leading-snug">
                  {t("overview.latestInvoice")} <strong>#{m.latestInvoice.Number}</strong> —{" "}
                  <span className="tnum">{formatAmount(m.latestInvoice.TotalAmountWithTax)}</span>
                  {m.latestInvoice.CName ? ` · ${m.latestInvoice.CName}` : ""}
                  <span className="mt-0.5 block text-xs text-mist">{timeAgo(m.latestInvoice.InvoiceDate)}</span>
                </p>
              </div>
            )}
            {m?.biggest && (
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-white">
                  <Activity className="size-3.5" />
                </span>
                <p className="leading-snug">
                  {t("overview.largestInvoice")} <strong>#{m.biggest.Number}</strong> {t("overview.largestAt")}{" "}
                  <span className="tnum">{formatAmount(m.biggest.TotalAmountWithTax)}</span>
                  <span className="mt-0.5 block text-xs text-mist">{m.biggest.CName ?? ""}</span>
                </p>
              </div>
            )}
            {clockedIn.data && (
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-white">
                  <Clock className="size-3.5" />
                </span>
                <p className="leading-snug">
                  <strong className="tnum">{clockedIn.data.length}</strong>{" "}
                  {clockedIn.data.length === 1 ? t("overview.clockedIn1") : t("overview.clockedInN")}
                  <Link href="/timeclock" className="mt-0.5 block text-xs text-accent-dark hover:underline">
                    {t("overview.openTimeclock")}
                  </Link>
                </p>
              </div>
            )}
            {cust?.latestModified && (
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-white">
                  <Users className="size-3.5" />
                </span>
                <p className="leading-snug">
                  {t("overview.customerUpdated", { name: cust.latestModified.Name })}
                  <span className="mt-0.5 block text-xs text-mist">{timeAgo(cust.latestModified.Modified)}</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* ── Module launcher tiles ──────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-fog">{t("overview.modules")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group relative rounded-card border border-white bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              <ArrowUpRight className="absolute right-3.5 top-3.5 size-4 text-mist transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              <span
                className="grid size-9 place-items-center rounded-xl text-ink [&>svg]:size-4.5"
                style={{ background: mod.accent }}
              >
                <mod.icon />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">{t(`module.${mod.key}.label`)}</p>
              <p className="text-xs text-fog tnum">{counts[mod.href] ?? "–"}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
