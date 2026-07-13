"use client";

import { Clock, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatDateTime, formatHours } from "@/lib/format";
import type { TimeClockEntry } from "@/lib/api/types/platform";
import { RegisterEntryDialog } from "./_components/RegisterEntryDialog";

function employeeName(e: TimeClockEntry): string {
  return e.Name ?? e.EmployeeName ?? "Unnamed employee";
}

function employeeNumber(e: TimeClockEntry): string {
  const n = e.Employee ?? e.EmployeeNumber;
  return n != null ? String(n) : "–";
}

function entryType(e: TimeClockEntry): string {
  if (e.TypeName) return e.TypeName;
  if (e.EntryTypeName) return e.EntryTypeName;
  if (e.Type != null) return `Type ${e.Type}`;
  return "Entry";
}

export default function TimeclockPage() {
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
      header: "Employee",
      render: (e) => (
        <div>
          <p className="font-medium text-ink">{employeeName(e)}</p>
          <p className="text-xs text-fog tnum">Nº {employeeNumber(e)}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Entry type",
      render: (e) => <Badge tone={tab === "in" ? "green" : "neutral"}>{entryType(e)}</Badge>,
    },
    {
      key: "start",
      header: "Start",
      render: (e) => <span className="tnum">{formatDateTime(e.Start)}</span>,
    },
    ...(tab === "out"
      ? [
          {
            key: "end",
            header: "End",
            render: (e) => <span className="tnum">{formatDateTime(e.End)}</span>,
          } satisfies Column<TimeClockEntry>,
        ]
      : []),
    {
      key: "hours",
      header: "Hours",
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
                <RefreshCw className={`size-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button size="sm" onClick={() => setRegistering(true)}>
                <Plus className="size-4" /> Register entry
              </Button>
            </div>
          }
        >
          Time clock — live registrations
        </CardTitle>

        <div className="mt-5">
          <Tabs
            tabs={[
              { id: "in", label: "Clocked in", count: inQ.data?.length },
              { id: "out", label: "Clocked out", count: outQ.data?.length },
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
            emptyTitle={tab === "in" ? "Nobody is clocked in" : "No clocked-out entries"}
            emptyBody={
              tab === "in"
                ? "Employees who clock in appear here in real time — hit Refresh to re-check."
                : "Completed registrations show up here once employees clock out."
            }
          />
        </div>
      </Card>

      <RegisterEntryDialog open={registering} onClose={() => setRegistering(false)} />
    </div>
  );
}
