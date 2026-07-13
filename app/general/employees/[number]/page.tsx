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
import { useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import type { DkRecord, Employee } from "@/lib/api/types/general";
import { EmployeeFormDialog } from "../../_components/EmployeeFormDialog";
import { ProjectsTable } from "../../_components/ProjectsTable";
import { RecordsTable } from "../../_components/RecordsTable";
import { WorkEntryDialog } from "../../_components/WorkEntryDialog";

const TIMECLOCK_COUNT = 25;

const genderLabel = (t: ReturnType<typeof useT>, g?: number) =>
  g === 1
    ? t("general.gender.male")
    : g === 2
      ? t("general.gender.female")
      : g === 0
        ? t("general.gender.unspecified")
        : undefined;

function TimeClockTab({ employeeNumber }: { employeeNumber: string }) {
  const t = useT();
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
      emptyTitle={t("general.employee.timeclockEmpty")}
      emptyBody={t("general.employee.timeclockEmptyBody")}
      footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
    />
  );
}

export default function EmployeeDetailPage() {
  const t = useT();
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
          aria-label={t("general.employee.back")}
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
                  {data.Status === 0
                    ? t("general.status.active")
                    : t("general.status.other", { status: data.Status })}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label={t("ui.refresh")}>
          <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)} disabled={!data}>
          <Pencil className="size-4" /> {t("general.employee.edit")}
        </Button>
        <Button size="sm" onClick={() => setLoggingWork(true)}>
          <Clock className="size-4" /> {t("general.employee.registerWork")}
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
                {t("general.employee.profile")}
              </CardTitle>
              <KV
                items={[
                  {
                    label: t("general.field.number"),
                    value: <span className="font-mono text-xs">{data.Number}</span>,
                  },
                  { label: t("general.field.name"), value: data.Name },
                  { label: t("general.field.shortName"), value: data.ShortName },
                  { label: t("general.field.ssn"), value: data.SSNumber },
                  { label: t("general.field.gender"), value: genderLabel(t, data.Gender) },
                  { label: t("general.field.spouse"), value: data.SpouseName },
                  { label: t("general.field.group"), value: data.Group },
                  { label: t("general.field.supervisor"), value: data.Supervisor },
                  { label: t("general.field.tag"), value: data.Tag },
                  { label: t("general.field.comment"), value: data.Comment },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Mail />} className="mb-5">
                {t("general.employee.contact")}
              </CardTitle>
              <KV
                items={[
                  { label: t("general.field.address"), value: data.Address1 },
                  { label: t("general.field.address2"), value: data.Address2 },
                  { label: t("general.field.address3"), value: data.Address3 },
                  {
                    label: t("general.field.zipCity"),
                    value: [data.ZipCode, data.City].filter(Boolean).join(" "),
                  },
                  { label: t("general.field.country"), value: data.CountryCode },
                  { label: t("general.field.phone"), value: data.Phone },
                  { label: t("general.field.phoneLocal"), value: data.PhoneLocal },
                  { label: t("general.field.mobile"), value: data.PhoneMobile },
                  { label: t("general.field.fax"), value: data.Fax },
                  { label: t("general.field.email"), value: data.Email },
                  { label: t("general.field.website"), value: data.Url },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Briefcase />} className="mb-5">
                {t("general.employee.employment")}
              </CardTitle>
              <KV
                items={[
                  {
                    label: t("general.field.stampStatus"),
                    value: data.StampStatus != null ? String(data.StampStatus) : undefined,
                  },
                  {
                    label: t("general.field.stampType"),
                    value: data.StampType != null ? String(data.StampType) : undefined,
                  },
                  { label: t("general.field.dim1"), value: data.Dim1 },
                  { label: t("general.field.dim2"), value: data.Dim2 },
                  { label: t("general.field.dim3"), value: data.Dim3 },
                  { label: t("general.field.created"), value: formatDateTime(data.Created) },
                  { label: t("general.field.modified"), value: formatDateTime(data.Modified) },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Landmark />} className="mb-5">
                {t("general.employee.bank")}
              </CardTitle>
              {data.BankAccount ? (
                <KV
                  items={[
                    { label: t("general.field.bank"), value: data.BankAccount.Code },
                    { label: t("general.field.accountGroup"), value: data.BankAccount.AccountGroup },
                    { label: t("general.field.account"), value: data.BankAccount.Account },
                    { label: t("general.field.accountType"), value: data.BankAccount.AccountType },
                    { label: t("general.field.owner"), value: data.BankAccount.Owner },
                    { label: t("general.field.ownerName"), value: data.BankAccount.OwnerName },
                  ]}
                />
              ) : (
                <p className="text-sm text-fog">{t("general.employee.noBank")}</p>
              )}
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <CardTitle icon={<Clock />} className="mr-auto">
                {t("general.employee.activity")}
              </CardTitle>
              <Tabs
                tabs={[
                  { id: "timeclock", label: t("general.employee.tabTimeclock") },
                  { id: "worker", label: t("general.employee.tabWorker") },
                  { id: "supervisor", label: t("general.employee.tabSupervisor") },
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
