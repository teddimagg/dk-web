"use client";

import { FolderKanban } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatDate, formatDateTime } from "@/lib/format";
import type { EmployeeProject } from "@/lib/api/types/general";

/**
 * Projects where the employee is registered as worker or supervisor.
 * These endpoints 404 for non-project employees — that renders as a
 * friendly empty state rather than an error.
 */
export function ProjectsTable({
  employeeNumber,
  role,
}: {
  employeeNumber: string;
  role: "worker" | "supervisor";
}) {
  const t = useT();
  const { data, isLoading, error, refetch } = useDkQuery<EmployeeProject[]>(
    ["general", "employee", employeeNumber, role],
    `/general/employee/${encodeURIComponent(employeeNumber)}/${role}`,
    { retry: false },
  );

  const columns: Column<EmployeeProject>[] = [
    {
      key: "Number",
      header: t("general.projects.colProject"),
      render: (p) => <span className="font-mono text-xs text-fog">{p.Number}</span>,
      width: "110px",
    },
    {
      key: "Name",
      header: t("general.field.name"),
      render: (p) => <span className="font-medium text-ink">{p.Name || "–"}</span>,
    },
    {
      key: "Group",
      header: t("general.field.group"),
      render: (p) => p.Group || <span className="text-mist">–</span>,
    },
    {
      key: "CustomerNameToBill",
      header: t("general.projects.colCustomerToBill"),
      render: (p) => p.CustomerNameToBill || <span className="text-mist">–</span>,
    },
    {
      key: "FoundingDate",
      header: t("general.projects.colFounded"),
      render: (p) => <span className="tnum">{formatDate(p.FoundingDate)}</span>,
      align: "right",
    },
    {
      key: "Modified",
      header: t("general.field.modified"),
      render: (p) => <span className="tnum">{formatDateTime(p.Modified)}</span>,
      align: "right",
    },
  ];

  if (error && error.status === 404) {
    return (
      <EmptyState
        icon={<FolderKanban />}
        title={t(role === "worker" ? "general.projects.workerEmpty" : "general.projects.supervisorEmpty")}
        body={t(
          role === "worker"
            ? "general.projects.workerEmptyBody"
            : "general.projects.supervisorEmptyBody",
        )}
      />
    );
  }

  return (
    <DataTable<EmployeeProject>
      columns={columns}
      rows={data}
      rowKey={(p, i) => p.Number ?? i}
      loading={isLoading}
      error={error}
      onRetry={() => refetch()}
      emptyTitle={t(role === "worker" ? "general.projects.workerEmpty" : "general.projects.supervisorEmpty")}
      emptyBody={t("general.projects.emptyBody")}
    />
  );
}
