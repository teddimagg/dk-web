"use client";

import { clsx } from "clsx";
import { ArrowLeft, Banknote, IdCard, Pencil, RefreshCw, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useDkQuery } from "@/lib/hooks/useDk";
import { formatDateTime, formatInt, formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Member } from "@/lib/api/types/members";
import { ApplicationsTab } from "../_components/ApplicationsTab";
import { FeeDialog } from "../_components/FeeDialog";
import { MemberFormDialog } from "../_components/MemberFormDialog";
import {
  CareerTab,
  EducationTab,
  FundTab,
  MembershipTab,
  SubGroupsTab,
} from "../_components/RelatedTabs";

const TAB_DEFS = [
  { id: "applications", labelKey: "members.tabs.applications" },
  { id: "fund", labelKey: "members.tabs.funds" },
  { id: "membership", labelKey: "members.tabs.membership" },
  { id: "subgroups", labelKey: "members.tabs.subgroups" },
  { id: "career", labelKey: "members.tabs.career" },
  { id: "education", labelKey: "members.tabs.education" },
];

function statusBadges(m: Member, t: ReturnType<typeof useT>) {
  const badges: { key: string; tone: "red" | "ink" | "amber" | "neutral" | "green"; label: string }[] = [];
  if (m.Status?.Blocked) badges.push({ key: "blocked", tone: "red", label: t("members.status.blocked") });
  if (m.Status?.Dead) badges.push({ key: "dead", tone: "ink", label: t("members.status.deceased") });
  if (m.Status?.Retired) badges.push({ key: "retired", tone: "amber", label: t("members.status.retired") });
  if (m.Status?.Disabled)
    badges.push({ key: "disabled", tone: "neutral", label: t("members.status.disabled") });
  if (badges.length === 0)
    badges.push({ key: "active", tone: "green", label: t("members.status.active") });
  return badges.map((b) => (
    <Badge key={b.key} tone={b.tone}>
      {b.label}
    </Badge>
  ));
}

export default function MemberDetailPage() {
  const t = useT();
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const [tab, setTab] = useState("applications");
  const [editOpen, setEditOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);

  const {
    data: member,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDkQuery<Member>(["member", number], `/member/${encodeURIComponent(number)}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/members"
          aria-label={t("members.detail.backAria")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-fog shadow-card transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold tracking-tight text-ink">
            {member?.Name || number}
          </h2>
          <p className="mt-0.5 text-[13px] text-fog tnum">
            {t("members.detail.memberNo", { number: member?.Number ?? number })}
            {member?.SSNumber && member.SSNumber !== member.Number
              ? ` · ${t("members.detail.ssnInline", { ssn: member.SSNumber })}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            aria-label={t("members.detail.refreshAria")}
          >
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFeeOpen(true)}>
            <Banknote className="size-4" /> {t("members.detail.createFee")}
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)} disabled={!member}>
            <Pencil className="size-4" /> {t("members.detail.edit")}
          </Button>
        </div>
      </div>

      {isLoading && !member && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="space-y-3 p-6">
              <Skeleton className="h-7 w-40" />
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </Card>
          ))}
        </div>
      )}

      {error && !member && (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      )}

      {member && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-5 p-6">
            <CardTitle icon={<IdCard />} action={<span className="flex gap-1.5">{statusBadges(member, t)}</span>}>
              {t("members.detail.cardTitle")}
            </CardTitle>
            <KV
              items={[
                { label: t("members.field.number"), value: member.Number },
                { label: t("members.field.ssn"), value: member.SSNumber },
                { label: t("members.field.group"), value: member.Group },
                { label: t("members.field.tag"), value: member.Tag },
                { label: t("members.field.salesperson"), value: member.SalesPerson },
                { label: t("members.field.ledgerCode"), value: member.LedgerCode },
                { label: t("members.field.paymentType"), value: member.PaymentType },
                { label: t("members.field.paymentMode"), value: member.PaymentMode },
                { label: t("members.field.currency"), value: member.CurrencyCode },
                {
                  label: t("members.field.discount"),
                  value: member.Discount ? formatNumber(member.Discount) : undefined,
                },
                { label: t("members.field.points"), value: formatInt(member.Points) },
                { label: t("members.field.noVat"), value: member.NoVat ? t("members.yes") : t("members.no") },
                {
                  label: t("members.field.gender"),
                  value:
                    member.Gender === 1
                      ? t("members.gender.male")
                      : member.Gender === 2
                        ? t("members.gender.female")
                        : undefined,
                },
                {
                  label: t("members.field.memberAge"),
                  value:
                    member.Statistics?.MemberAge != null
                      ? t("members.detail.years", { n: formatNumber(member.Statistics.MemberAge) })
                      : undefined,
                },
                {
                  label: t("members.field.careerAge"),
                  value:
                    member.Statistics?.CareerAge != null
                      ? t("members.detail.years", { n: formatNumber(member.Statistics.CareerAge) })
                      : undefined,
                },
                {
                  label: t("members.field.confirmedTerms"),
                  value: member.HasConfirmedTerms
                    ? `${t("members.yes")}${member.ConfirmedTermId ? ` (#${member.ConfirmedTermId})` : ""}`
                    : t("members.no"),
                },
                { label: t("members.field.created"), value: formatDateTime(member.Created) },
                { label: t("members.field.modified"), value: formatDateTime(member.Modified) },
              ]}
            />
          </Card>

          <Card className="space-y-5 p-6">
            <CardTitle icon={<UserRound />}>{t("members.detail.contactTitle")}</CardTitle>
            <KV
              items={[
                { label: t("members.field.address"), value: member.Address?.Address1 },
                { label: t("members.field.address2"), value: member.Address?.Address2 },
                { label: t("members.field.address3"), value: member.Address?.Address3 },
                { label: t("members.field.address4"), value: member.Address?.Address4 },
                {
                  label: t("members.field.zipCity"),
                  value: [member.Address?.ZipCode, member.Address?.City].filter(Boolean).join(" "),
                },
                {
                  label: t("members.field.country"),
                  value: member.Address?.CountryName || member.Address?.CountryCode,
                },
                { label: t("members.field.phone"), value: member.ContactDetail?.Phone },
                { label: t("members.field.mobile"), value: member.ContactDetail?.Mobile },
                { label: t("members.field.direct"), value: member.ContactDetail?.Direct },
                { label: t("members.field.fax"), value: member.ContactDetail?.Fax },
                { label: t("members.field.email"), value: member.ContactDetail?.Email },
                { label: t("members.field.url"), value: member.ContactDetail?.URL },
              ]}
            />
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <Tabs
          tabs={TAB_DEFS.map((d) => ({ id: d.id, label: t(d.labelKey) }))}
          active={tab}
          onChange={setTab}
        />
        <Card className="overflow-hidden">
          {tab === "applications" && <ApplicationsTab number={number} />}
          {tab === "fund" && <FundTab number={number} />}
          {tab === "membership" && <MembershipTab number={number} />}
          {tab === "subgroups" && <SubGroupsTab number={number} />}
          {tab === "career" && <CareerTab number={number} />}
          {tab === "education" && <EducationTab number={number} />}
        </Card>
      </div>

      {member && <JsonView data={member} />}

      {member && (
        <MemberFormDialog open={editOpen} onClose={() => setEditOpen(false)} member={member} />
      )}
      <FeeDialog
        number={number}
        memberName={member?.Name}
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
      />
    </div>
  );
}
