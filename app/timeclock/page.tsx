"use client";

import { Clock, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatDateTime, formatHours } from "@/lib/format";
import type { TimeClockEntry } from "@/lib/api/types/platform";
import { RegisterEntryDialog } from "./_components/RegisterEntryDialog";

type T = ReturnType<typeof useT>;

function employeeName(e: TimeClockEntry, t: T): string {
  return e.Name ?? e.EmployeeName ?? t("timeclock.unnamedEmployee");
}

function employeeNumber(e: TimeClockEntry): string {
  const n = e.Employee ?? e.EmployeeNumber;
  return n != null ? String(n) : "–";
}

function entryType(e: TimeClockEntry, t: T): string {
  if (e.TypeName) return e.TypeName;
  if (e.EntryTypeName) return e.EntryTypeName;
  if (e.Type != null) return t("timeclock.entryTypeN", { n: e.Type });
  return t("timeclock.entryFallback");
}

export default function TimeclockPage() {
  const t = useT();
  const [tab, setTab] = useState<"in" | "out">("in");
  const [registering, setRegistering] = useState(false);

  // Live data — always bypass the proxy cache and offer an explicit Refresh.
  const inQ = useDkQuery<TimeClockEntry[]>(["timeclock", "in"], "/timeclock/in", { fresh: true });
  const outQ = useDkQuery<TimeClockEntry[]>(["timeclock", "out"], "/timeclock/out", { fresh: true });
  const active = tab === "in" ? inQ : outQ;
  const fetching = inQ.isFetching || outQ.isFetching;

  const columns: Column<TimeClockEntry>[] = [
    {
      key: "employee",
      header: t("timeclock.col.employee"),
      render: (e) => (
        <div>
          <p className="font-medium text-ink">{employeeName(e, t)}</p>
          <p className="text-xs text-fog tnum">{t("timeclock.employeeNo", { n: employeeNumber(e) })}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: t("timeclock.col.entryType"),
      render: (e) => <Badge tone={tab === "in" ? "green" : "neutral"}>{entryType(e, t)}</Badge>,
    },
    {
      key: "start",
      header: t("timeclock.col.start"),
      render: (e) => <span className="tnum">{formatDateTime(e.Start)}</span>,
    },
    ...(tab === "out"
      ? [
          {
            key: "end",
            header: t("timeclock.col.end"),
            render: (e) => <span className="tnum">{formatDateTime(e.End)}</span>,
          } satisfies Column<TimeClockEntry>,
        ]
      : []),
    {
      key: "hours",
      header: t("timeclock.col.hours"),
      align: "right",
      render: (e) => <span className="tnum font-medium">{formatHours(e.TotalHours)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle
          icon={<Clock />}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  inQ.refetch();
                  outQ.refetch();
                }}
                disabled={fetching}
              >
                <RefreshCw className={`size-4 ${fetching ? "animate-spin" : ""}`} /> {t("ui.refresh")}
              </Button>
              <Button size="sm" onClick={() => setRegistering(true)}>
                <Plus className="size-4" /> {t("timeclock.registerEntry")}
              </Button>
            </div>
          }
        >
          {t("timeclock.cardTitle")}
        </CardTitle>

        <div className="mt-5">
          <Tabs
            tabs={[
              { id: "in", label: t("timeclock.clockedIn"), count: inQ.data?.length },
              { id: "out", label: t("timeclock.clockedOut"), count: outQ.data?.length },
            ]}
            active={tab}
            onChange={(id) => setTab(id as "in" | "out")}
          />
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={active.data}
            rowKey={(e, i) => `${employeeNumber(e)}-${e.Start ?? i}`}
            loading={active.isLoading || active.isFetching}
            error={active.error}
            onRetry={() => active.refetch()}
            emptyTitle={tab === "in" ? t("timeclock.emptyInTitle") : t("timeclock.emptyOutTitle")}
            emptyBody={tab === "in" ? t("timeclock.emptyInBody") : t("timeclock.emptyOutBody")}
          />
        </div>
      </Card>

      <RegisterEntryDialog open={registering} onClose={() => setRegistering(false)} />
    </div>
  );
}
