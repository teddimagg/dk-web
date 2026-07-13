"use client";

import { BarChart3, CreditCard, Crown, PieChart, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SplitBar } from "@/components/ui/charts";
import { Button } from "@/components/ui/Button";
import { PeriodPicker } from "@/components/shell/PeriodPicker";
import { useActiveCompany } from "@/lib/stores/companies";
import { usePeriod, periodLabel } from "@/lib/stores/period";
import { usePeriodInvoices } from "@/lib/hooks/usePeriodInvoices";
import { formatAmount, formatCompact, formatDate, formatInt, formatPercent } from "@/lib/format";
import type { InvoiceSummary } from "@/lib/api/types/overview";

const isSettled = (i: InvoiceSummary) =>
  i.SettledType === 2 ||
  (Math.abs(i.SettledAmount ?? 0) >= Math.abs(i.TotalAmountWithTax) && i.TotalAmountWithTax !== 0);

/** Vertical bar chart with month labels — pure SVG, reference aesthetic. */
function MonthChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 720;
  const H = 240;
  const pad = { l: 8, r: 8, t: 24, b: 26 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = (W - pad.l - pad.r) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Invoiced amount by month">
      {data.map((d, i) => {
        const h = Math.max(3, ((H - pad.t - pad.b) * d.value) / max);
        const x = pad.l + i * bw;
        const y = H - pad.b - h;
        const isLast = i === data.length - 1;
        return (
          <g key={d.label}>
            <rect
              x={x + bw * 0.18}
              y={y}
              width={bw * 0.64}
              height={h}
              rx={6}
              fill={isLast ? "var(--color-accent)" : "var(--color-ink)"}
            />
            <text
              x={x + bw / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-fog)"
              className="tnum"
            >
              {formatCompact(d.value)}
            </text>
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-mist)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RankBar({
  rank,
  label,
  sub,
  value,
  max,
}: {
  rank: number;
  label: string;
  sub?: string;
  value: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-haze text-xs font-semibold text-fog tnum">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-medium text-ink">{label}</p>
          <p className="shrink-0 text-sm font-medium text-ink tnum">{formatCompact(value)} ISK</p>
        </div>
        {sub && <p className="text-xs text-mist">{sub}</p>}
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(value / max) * 100}%`,
              background: rank === 1 ? "var(--color-accent)" : "var(--color-ink)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const company = useActiveCompany();
  const { period, setPeriod } = usePeriod();

  // Every invoice of the period, all pages (shared with Overview).
  const { invoices: inv, truncated, query } = usePeriodInvoices();

  const agg = useMemo(() => {
    if (!inv || inv.length === 0) return null;

    const byMonth = new Map<string, { label: string; value: number; t: number }>();
    const byCustomer = new Map<string, { name: string; total: number; count: number }>();
    const bySeller = new Map<string, { total: number; count: number }>();
    const byMode = new Map<string, number>();
    let settledCount = 0;
    let minD = Infinity;
    let maxD = -Infinity;

    for (const i of inv) {
      const d = new Date(i.InvoiceDate);
      if (!Number.isNaN(d.getTime())) {
        minD = Math.min(minD, d.getTime());
        maxD = Math.max(maxD, d.getTime());
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }).replace(" ", " ’");
        const e = byMonth.get(key) ?? { label, value: 0, t: d.getTime() };
        e.value += Math.abs(i.TotalAmountWithTax);
        byMonth.set(key, e);
      }
      const cKey = i.CNumber ?? "?";
      const c = byCustomer.get(cKey) ?? { name: i.CName ?? cKey, total: 0, count: 0 };
      c.total += Math.abs(i.TotalAmountWithTax);
      c.count += 1;
      byCustomer.set(cKey, c);

      const sKey = i.SalePerson || "—";
      const s = bySeller.get(sKey) ?? { total: 0, count: 0 };
      s.total += Math.abs(i.TotalAmountWithTax);
      s.count += 1;
      bySeller.set(sKey, s);

      const mKey = i.PaymentMode || "other";
      byMode.set(mKey, (byMode.get(mKey) ?? 0) + 1);

      if (isSettled(i)) settledCount++;
    }

    const months = [...byMonth.values()].sort((a, b) => a.t - b.t).slice(-12);
    const topCustomers = [...byCustomer.entries()]
      .map(([number, v]) => ({ number, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    const sellers = [...bySeller.entries()]
      .map(([number, v]) => ({ number, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    const modes = [...byMode.entries()].sort((a, b) => b[1] - a[1]);
    const total = inv.reduce((s, i) => s + Math.abs(i.TotalAmountWithTax), 0);

    return {
      months,
      topCustomers,
      sellers,
      modes,
      total,
      settledCount,
      openCount: inv.length - settledCount,
      span: { from: new Date(minD).toISOString(), to: new Date(maxD).toISOString() },
    };
  }, [inv]);

  const MODE_COLORS = ["var(--color-accent)", "var(--color-ink)", "var(--color-mist)", "var(--color-amber)", "var(--color-info)", "var(--color-line)"];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`Data based on ${company?.name ?? "…"}`} title="Analytics">
        <p className="mt-2 text-sm text-fog">
          Aggregated from invoices in {periodLabel(period)}
          {agg ? ` · ${formatDate(agg.span.from)} – ${formatDate(agg.span.to)}` : ""}.
        </p>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodPicker />
        {agg && (
          <p className="text-sm text-fog tnum">
            {formatInt(inv?.length ?? 0)} invoices · {formatAmount(agg.total)} invoiced
            {truncated && (
              <span className="ml-2 text-[#9a6a10]">· truncated at 40.000 fetched — narrow the range</span>
            )}
          </p>
        )}
      </div>

      {query.error ? (
        <Card>
          <ErrorState error={query.error as { message: string }} onRetry={() => query.refetch()} />
        </Card>
      ) : inv && inv.length === 0 ? (
        <Card>
          <EmptyState
            title={`No invoices in ${periodLabel(period)}`}
            body="This company has no invoice activity in the selected period — pick another year or browse everything."
            action={
              <Button variant="secondary" size="sm" onClick={() => setPeriod({ mode: "all" })}>
                Show all history
              </Button>
            }
          />
        </Card>
      ) : !agg ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-48 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Card className="p-5">
            <CardTitle icon={<BarChart3 />} className="mb-4" action={
              <span className="text-xs text-mist tnum">{formatCompact(agg.total)} ISK total</span>
            }>
              Invoiced Volume by Month
            </CardTitle>
            <MonthChart data={agg.months} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <CardTitle icon={<Crown />} className="mb-5">
                Top Customers
              </CardTitle>
              <div className="space-y-4">
                {agg.topCustomers.map((c, i) => (
                  <RankBar
                    key={c.number}
                    rank={i + 1}
                    label={c.name}
                    sub={`${formatInt(c.count)} invoices · ${c.number}`}
                    value={c.total}
                    max={agg.topCustomers[0].total}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <CardTitle icon={<TrendingUp />} className="mb-5">
                Salesperson Leaderboard
              </CardTitle>
              <div className="space-y-4">
                {agg.sellers.map((s, i) => (
                  <RankBar
                    key={s.number}
                    rank={i + 1}
                    label={s.number}
                    sub={`${formatInt(s.count)} invoices`}
                    value={s.total}
                    max={agg.sellers[0].total}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <CardTitle icon={<CreditCard />} className="mb-5">
                Payment Modes
              </CardTitle>
              <SplitBar
                className="h-3"
                segments={agg.modes.map(([, count], i) => ({
                  value: count,
                  color: MODE_COLORS[i % MODE_COLORS.length],
                }))}
              />
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {agg.modes.map(([mode, count], i) => (
                  <p key={mode} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: MODE_COLORS[i % MODE_COLORS.length] }}
                    />
                    <span className="font-medium text-ink">{mode}</span>
                    <span className="ml-auto text-fog tnum">
                      {formatPercent((count / (inv?.length ?? 1)) * 100, 0)}
                    </span>
                  </p>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <CardTitle icon={<PieChart />} className="mb-5">
                Settlement Status
              </CardTitle>
              <div className="flex items-center justify-around py-2">
                <div className="text-center">
                  <p className="stat-numeral text-4xl text-ink tnum">{formatInt(agg.settledCount)}</p>
                  <p className="mt-1 text-sm text-fog">Settled</p>
                </div>
                <div className="text-center">
                  <p className="stat-numeral text-4xl text-ink tnum">
                    {formatPercent((agg.settledCount / (inv?.length ?? 1)) * 100, 1).replace("%", "")}
                    <sup className="text-base font-normal text-fog">%</sup>
                  </p>
                  <p className="mt-1 text-sm text-fog">Settle rate</p>
                </div>
                <div className="text-center">
                  <p className="stat-numeral text-4xl text-ink tnum">{formatInt(agg.openCount)}</p>
                  <p className="mt-1 text-sm text-fog">Open</p>
                </div>
              </div>
              <SplitBar
                className="mt-3 h-3"
                segments={[
                  { value: agg.settledCount, color: "var(--color-accent)" },
                  { value: agg.openCount, color: "var(--color-ink)" },
                ]}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
