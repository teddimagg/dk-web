"use client";

import { Plus, RefreshCw, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { Employee } from "@/lib/api/types/general";
import { EmployeeFormDialog } from "../_components/EmployeeFormDialog";

export default function EmployeesPage() {
  const t = useT();
  const router = useRouter();
  const prefetch = usePrefetch();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Employee[]>(
    ["general", "employees"],
    "/general/employee",
  );

  const rows = useMemo(() => {
    if (!data) return data;
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((e) =>
      [e.Number, e.Name, e.Email, e.Group, e.SSNumber, e.ShortName].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [data, query]);

  const columns: Column<Employee>[] = [
    {
      key: "Number",
      header: t("general.field.number"),
      render: (e) => <span className="font-mono text-xs text-fog">{e.Number}</span>,
      width: "130px",
    },
    {
      key: "Name",
      header: t("general.field.name"),
      render: (e) => <span className="font-medium text-ink">{e.Name || "–"}</span>,
    },
    {
      key: "Email",
      header: t("general.field.email"),
      render: (e) => e.Email || <span className="text-mist">–</span>,
    },
    {
      key: "Phone",
      header: t("general.field.phone"),
      render: (e) => (
        <span className="tnum">{e.PhoneMobile || e.Phone || <span className="text-mist">–</span>}</span>
      ),
    },
    {
      key: "Group",
      header: t("general.field.group"),
      render: (e) => (e.Group ? <Badge tone="neutral">{e.Group}</Badge> : <span className="text-mist">–</span>),
    },
    {
      key: "Status",
      header: t("general.field.status"),
      render: (e) =>
        e.Status == null ? (
          <span className="text-mist">–</span>
        ) : (
          <Badge tone={e.Status === 0 ? "green" : "neutral"}>
            {e.Status === 0 ? t("general.status.active") : t("general.status.other", { status: e.Status })}
          </Badge>
        ),
    },
    {
      key: "Modified",
      header: t("general.field.modified"),
      render: (e) => <span className="tnum">{formatDate(e.Modified)}</span>,
      align: "right",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <CardTitle icon={<Users />} className="mr-auto">
            {t("general.tabs.employees")}
            {data ? <span className="ml-1.5 tnum text-mist">{rows?.length ?? 0}</span> : null}
          </CardTitle>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("general.employees.searchPlaceholder")}
              className="w-64 pl-9"
              aria-label={t("general.employees.searchAria")}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label={t("ui.refresh")}>
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> {t("general.employees.new")}
          </Button>
        </div>
        <DataTable<Employee>
          columns={columns}
          rows={rows}
          rowKey={(e, i) => e.Number ?? i}
          loading={isLoading}
          error={error}
          onRetry={() => refetch()}
          onRowClick={(e) => router.push(`/general/employees/${encodeURIComponent(e.Number)}`)}
          onRowHover={(e) =>
            prefetch(["general", "employee", e.Number], `/general/employee/${encodeURIComponent(e.Number)}`)
          }
          emptyTitle={query ? t("general.employees.emptyFiltered") : t("general.employees.empty")}
          emptyBody={
            query ? t("general.employees.emptyFilteredBody") : t("general.employees.emptyBody")
          }
          emptyAction={
            !query ? (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> {t("general.employees.new")}
              </Button>
            ) : undefined
          }
        />
      </Card>

      <EmployeeFormDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
