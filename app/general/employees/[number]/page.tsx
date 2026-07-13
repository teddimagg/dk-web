"use client";

import { ArrowLeft, Briefcase, Clock, IdCard, Landmark, Mail, Pencil, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatDateTime } from "@/lib/format";
import type { DkRecord, Employee } from "@/lib/api/types/general";
import { EmployeeFormDialog } from "../../_components/EmployeeFormDialog";
import { ProjectsTable } from "../../_components/ProjectsTable";
import { RecordsTable } from "../../_components/RecordsTable";
import { WorkEntryDialog } from "../../_components/WorkEntryDialog";

const TIMECLOCK_COUNT = 25;

const genderLabel = (g?: number) =>
  g === 1 ? "Male" : g === 2 ? "Female" : g === 0 ? "Unspecified" : undefined;

function TimeClockTab({ employeeNumber }: { employeeNumber: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<DkRecord[]>(
    ["general", "employee", employeeNumber, "timeclock", page],
    `/general/employee/${encodeURIComponent(employeeNumber)}/timeclock/page/${page}/${TIMECLOCK_COUNT}`,
    { placeholderData: keepPreviousData, retry: false },
  );
  const hasMore = (data?.length ?? 0) === TIMECLOCK_COUNT;

  return (
    <RecordsTable
      rows={data}
      loading={isLoading || isFetching}
      error={error}
      onRetry={() => refetch()}
      emptyTitle="No time clock entries"
      emptyBody="This employee has no time clock entries on this page."
      footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
    />
  );
}

export default function EmployeeDetailPage() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const [editing, setEditing] = useState(false);
  const [loggingWork, setLoggingWork] = useState(false);
  const [tab, setTab] = useState("timeclock");

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Employee>(
    ["general", "employee", number],
    `/general/employee/${encodeURIComponent(number)}`,
  );

  if (error) {
    return (
      <Card>
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/general/employees"
          className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
          aria-label="Back to employees"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="mr-auto">
          {isLoading ? (
            <Skeleton className="h-8 w-56" />
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-medium tracking-tight text-ink">{data?.Name || number}</h2>
              <span className="font-mono text-xs text-mist">{number}</span>
              {data?.Status != null && (
                <Badge tone={data.Status === 0 ? "green" : "neutral"}>
                  {data.Status === 0 ? "Active" : `Status ${data.Status}`}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh employee">
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)} disabled={!data}>
          <Pencil className="size-4" /> Edit
        </Button>
        <Button size="sm" onClick={() => setLoggingWork(true)}>
          <Clock className="size-4" /> Register work entry
        </Button>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<IdCard />} className="mb-5">
                Profile
              </CardTitle>
              <KV
                items={[
                  { label: "Number", value: <span className="font-mono text-xs">{data.Number}</span> },
                  { label: "Name", value: data.Name },
                  { label: "Short name", value: data.ShortName },
                  { label: "SSN", value: data.SSNumber },
                  { label: "Gender", value: genderLabel(data.Gender) },
                  { label: "Spouse", value: data.SpouseName },
                  { label: "Group", value: data.Group },
                  { label: "Supervisor", value: data.Supervisor },
                  { label: "Tag", value: data.Tag },
                  { label: "Comment", value: data.Comment },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Mail />} className="mb-5">
                Contact
              </CardTitle>
              <KV
                items={[
                  { label: "Address", value: data.Address1 },
                  { label: "Address 2", value: data.Address2 },
                  { label: "Address 3", value: data.Address3 },
                  { label: "Zip / city", value: [data.ZipCode, data.City].filter(Boolean).join(" ") },
                  { label: "Country", value: data.CountryCode },
                  { label: "Phone", value: data.Phone },
                  { label: "Phone (local)", value: data.PhoneLocal },
                  { label: "Mobile", value: data.PhoneMobile },
                  { label: "Fax", value: data.Fax },
                  { label: "Email", value: data.Email },
                  { label: "Website", value: data.Url },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Briefcase />} className="mb-5">
                Employment &amp; meta
              </CardTitle>
              <KV
                items={[
                  { label: "Stamp status", value: data.StampStatus != null ? String(data.StampStatus) : undefined },
                  { label: "Stamp type", value: data.StampType != null ? String(data.StampType) : undefined },
                  { label: "Dimension 1", value: data.Dim1 },
                  { label: "Dimension 2", value: data.Dim2 },
                  { label: "Dimension 3", value: data.Dim3 },
                  { label: "Created", value: formatDateTime(data.Created) },
                  { label: "Modified", value: formatDateTime(data.Modified) },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Landmark />} className="mb-5">
                Bank account
              </CardTitle>
              {data.BankAccount ? (
                <KV
                  items={[
                    { label: "Bank", value: data.BankAccount.Code },
                    { label: "Account group", value: data.BankAccount.AccountGroup },
                    { label: "Account", value: data.BankAccount.Account },
                    { label: "Account type", value: data.BankAccount.AccountType },
                    { label: "Owner", value: data.BankAccount.Owner },
                    { label: "Owner name", value: data.BankAccount.OwnerName },
                  ]}
                />
              ) : (
                <p className="text-sm text-fog">No bank account registered.</p>
              )}
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <CardTitle icon={<Clock />} className="mr-auto">
                Activity &amp; projects
              </CardTitle>
              <Tabs
                tabs={[
                  { id: "timeclock", label: "Time clock" },
                  { id: "worker", label: "Project worker" },
                  { id: "supervisor", label: "Supervisor" },
                ]}
                active={tab}
                onChange={setTab}
              />
            </div>
            {tab === "timeclock" && <TimeClockTab employeeNumber={number} />}
            {tab === "worker" && <ProjectsTable employeeNumber={number} role="worker" />}
            {tab === "supervisor" && <ProjectsTable employeeNumber={number} role="supervisor" />}
          </Card>

          <JsonView data={data} />
        </>
      )}

      {data && <EmployeeFormDialog open={editing} onClose={() => setEditing(false)} employee={data} />}
      <WorkEntryDialog
        open={loggingWork}
        onClose={() => setLoggingWork(false)}
        employeeNumber={number}
        employeeName={data?.Name}
      />
    </div>
  );
}
