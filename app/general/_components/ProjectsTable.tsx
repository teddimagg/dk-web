"use client";

import { FolderKanban } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatDate, formatDateTime } from "@/lib/format";
import type { EmployeeProject } from "@/lib/api/types/general";

const columns: Column<EmployeeProject>[] = [
  {
    key: "Number",
    header: "Project",
    render: (p) => <span className="font-mono text-xs text-fog">{p.Number}</span>,
    width: "110px",
  },
  { key: "Name", header: "Name", render: (p) => <span className="font-medium text-ink">{p.Name || "–"}</span> },
  { key: "Group", header: "Group", render: (p) => p.Group || <span className="text-mist">–</span> },
  {
    key: "CustomerNameToBill",
    header: "Customer to bill",
    render: (p) => p.CustomerNameToBill || <span className="text-mist">–</span>,
  },
  {
    key: "FoundingDate",
    header: "Founded",
    render: (p) => <span className="tnum">{formatDate(p.FoundingDate)}</span>,
    align: "right",
  },
  {
    key: "Modified",
    header: "Modified",
    render: (p) => <span className="tnum">{formatDateTime(p.Modified)}</span>,
    align: "right",
  },
];

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
  const { data, isLoading, error, refetch } = useDkQuery<EmployeeProject[]>(
    ["general", "employee", employeeNumber, role],
    `/general/employee/${encodeURIComponent(employeeNumber)}/${role}`,
    { retry: false },
  );

  if (error && error.status === 404) {
    return (
      <EmptyState
        icon={<FolderKanban />}
        title={role === "worker" ? "No project worker registrations" : "No supervisor registrations"}
        body={`This employee is not registered as a project ${role} — the API has no project data for them.`}
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
      emptyTitle={role === "worker" ? "No project worker registrations" : "No supervisor registrations"}
      emptyBody="The API returned an empty list for this employee."
    />
  );
}
