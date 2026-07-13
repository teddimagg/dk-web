"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Briefcase, GraduationCap, HeartHandshake, Layers, RefreshCw, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { JsonView } from "@/components/ui/JsonView";
import { useDkQuery } from "@/lib/hooks/useDk";
import type { DkError } from "@/lib/api/client";
import { formatAmount, formatDate, formatInt, formatPercent } from "@/lib/format";
import type {
  MemberCareer,
  MemberEducation,
  MemberFund,
  MemberMembership,
  MemberSubGroup,
} from "@/lib/api/types/members";

/** Shared frame: header + refresh, table, raw payload. */
function TabFrame<T>({
  icon,
  title,
  note,
  q,
  columns,
  rowKey,
  emptyTitle,
  emptyBody,
}: {
  icon: ReactNode;
  title: string;
  note?: string;
  q: UseQueryResult<T[], DkError>;
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string | number;
  emptyTitle: string;
  emptyBody?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <CardTitle icon={icon}>{title}</CardTitle>
        <Button
          className="ml-auto"
          variant="ghost"
          size="sm"
          onClick={() => q.refetch()}
          aria-label={`Refresh ${title.toLowerCase()}`}
        >
          <RefreshCw className={clsx("size-4", q.isFetching && "animate-spin")} />
        </Button>
      </div>
      {note && <p className="-mt-2 px-5 pb-3 text-[13px] text-fog">{note}</p>}
      <DataTable<T>
        columns={columns}
        rows={q.data}
        rowKey={rowKey}
        loading={q.isLoading}
        error={q.error ?? null}
        onRetry={() => q.refetch()}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
      {q.data && q.data.length > 0 && (
        <div className="px-5 pb-5 pt-2">
          <JsonView data={q.data} label={`Raw ${title.toLowerCase()} payload`} />
        </div>
      )}
    </div>
  );
}

function useMemberList<T>(number: string, segment: string, keySegment: string) {
  return useDkQuery<T[]>(
    ["member", number, keySegment],
    `/member/${encodeURIComponent(number)}/${segment}`,
  );
}

/** GET /member/:number/subgroup */
export function SubGroupsTab({ number }: { number: string }) {
  const q = useMemberList<MemberSubGroup>(number, "subgroup", "subgroups");
  const columns: Column<MemberSubGroup>[] = [
    {
      key: "group",
      header: "Group",
      render: (r) => <span className="font-medium text-ink">{r.Group ?? r.Code ?? "–"}</span>,
    },
    { key: "subgroup", header: "Subgroup", render: (r) => r.SubGroup ?? "–" },
    { key: "name", header: "Name", render: (r) => r.Name ?? r.Description ?? "–" },
    { key: "from", header: "From", render: (r) => <span className="tnum">{formatDate(r.Period?.From)}</span> },
    { key: "to", header: "To", render: (r) => <span className="tnum">{formatDate(r.Period?.To)}</span> },
  ];
  return (
    <TabFrame
      icon={<Layers />}
      title="Subgroups"
      q={q}
      columns={columns}
      rowKey={(r, i) => r.ID ?? i}
      emptyTitle="No subgroups"
      emptyBody="This member does not belong to any subgroup."
    />
  );
}

/** GET /member/:number/Career */
export function CareerTab({ number }: { number: string }) {
  const q = useMemberList<MemberCareer>(number, "Career", "career");
  const columns: Column<MemberCareer>[] = [
    {
      key: "company",
      header: "Company",
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.CompanyName || r.Company || "–"}</p>
          {r.CompanyName && r.Company && <p className="text-xs text-mist tnum">{r.Company}</p>}
        </div>
      ),
    },
    { key: "job", header: "Job title", render: (r) => r.JobTitle || r.JobTitleCode || "–" },
    { key: "from", header: "From", render: (r) => <span className="tnum">{formatDate(r.Period?.From)}</span> },
    { key: "to", header: "To", render: (r) => <span className="tnum">{formatDate(r.Period?.To)}</span> },
    {
      key: "pct",
      header: "Work %",
      align: "right",
      render: (r) => (
        <span className="tnum">{r.WorkPercentage != null ? formatPercent(r.WorkPercentage, 0) : "–"}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="block max-w-72 truncate">
          {r.Description || r.WorkplaceName || r.Workplace || "–"}
        </span>
      ),
    },
  ];
  return (
    <TabFrame
      icon={<Briefcase />}
      title="Career"
      q={q}
      columns={columns}
      rowKey={(r, i) => r.ID ?? i}
      emptyTitle="No career records"
      emptyBody="No employment history has been registered for this member."
    />
  );
}

/** GET /member/:number/fund */
export function FundTab({ number }: { number: string }) {
  const q = useMemberList<MemberFund>(number, "fund", "fund");
  const columns: Column<MemberFund>[] = [
    {
      key: "fund",
      header: "Fund",
      render: (r) => (
        <span className="font-medium text-ink tnum">{r.Fund ?? r.Code ?? r.Number ?? r.ID ?? "–"}</span>
      ),
    },
    { key: "name", header: "Name", render: (r) => r.Name ?? r.FundName ?? r.Description ?? "–" },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (r) => {
        const v = r.Balance ?? r.Amount;
        return typeof v === "number" ? <span className="tnum">{formatAmount(v)}</span> : "–";
      },
    },
    {
      key: "points",
      header: "Points",
      align: "right",
      render: (r) => <span className="tnum">{r.Points != null ? formatInt(r.Points) : "–"}</span>,
    },
    { key: "from", header: "From", render: (r) => <span className="tnum">{formatDate(r.Period?.From)}</span> },
    { key: "to", header: "To", render: (r) => <span className="tnum">{formatDate(r.Period?.To)}</span> },
  ];
  return (
    <TabFrame
      icon={<Wallet />}
      title="Funds"
      note="Fund codes listed here are the ids used by the application-attachment routes."
      q={q}
      columns={columns}
      rowKey={(r, i) => r.Fund ?? r.Code ?? r.ID ?? i}
      emptyTitle="No funds"
      emptyBody="This member has no fund memberships."
    />
  );
}

/** GET /member/:number/education */
export function EducationTab({ number }: { number: string }) {
  const q = useMemberList<MemberEducation>(number, "education", "education");
  const columns: Column<MemberEducation>[] = [
    {
      key: "institution",
      header: "Institution",
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.InstitutionDesc || r.Institution || "–"}</p>
          {r.InstitutionDesc && r.Institution && (
            <p className="text-xs text-mist tnum">{r.Institution}</p>
          )}
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (r) => r.Course?.Description || r.Course?.Text || r.Course?.Code || "–",
    },
    { key: "from", header: "From", render: (r) => <span className="tnum">{formatDate(r.Period?.From)}</span> },
    { key: "to", header: "To", render: (r) => <span className="tnum">{formatDate(r.Period?.To)}</span> },
    {
      key: "description",
      header: "Description",
      render: (r) => <span className="block max-w-72 truncate">{r.Description || "–"}</span>,
    },
    { key: "country", header: "Country", render: (r) => r.CountryCode || "–" },
  ];
  return (
    <TabFrame
      icon={<GraduationCap />}
      title="Education"
      q={q}
      columns={columns}
      rowKey={(r, i) => r.ID ?? i}
      emptyTitle="No education records"
      emptyBody="No courses or institutions registered for this member."
    />
  );
}

/** GET /member/:number/membership */
export function MembershipTab({ number }: { number: string }) {
  const q = useMemberList<MemberMembership>(number, "membership", "membership");
  const columns: Column<MemberMembership>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <span className="font-medium text-ink">{r.Code ?? r.Group ?? r.Type ?? r.ID ?? "–"}</span>
      ),
    },
    { key: "name", header: "Name", render: (r) => r.Name ?? r.Description ?? "–" },
    { key: "from", header: "From", render: (r) => <span className="tnum">{formatDate(r.Period?.From)}</span> },
    { key: "to", header: "To", render: (r) => <span className="tnum">{formatDate(r.Period?.To)}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (r.Status != null && r.Status !== "" ? String(r.Status) : "–"),
    },
  ];
  return (
    <TabFrame
      icon={<HeartHandshake />}
      title="Membership"
      q={q}
      columns={columns}
      rowKey={(r, i) => r.ID ?? i}
      emptyTitle="No membership records"
      emptyBody="No membership periods registered for this member."
    />
  );
}
