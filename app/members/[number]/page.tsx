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
  { id: "applications", label: "Applications" },
  { id: "fund", label: "Funds" },
  { id: "membership", label: "Membership" },
  { id: "subgroups", label: "Subgroups" },
  { id: "career", label: "Career" },
  { id: "education", label: "Education" },
];

function statusBadges(m: Member) {
  const badges: { key: string; tone: "red" | "ink" | "amber" | "neutral" | "green"; label: string }[] = [];
  if (m.Status?.Blocked) badges.push({ key: "blocked", tone: "red", label: "Blocked" });
  if (m.Status?.Dead) badges.push({ key: "dead", tone: "ink", label: "Deceased" });
  if (m.Status?.Retired) badges.push({ key: "retired", tone: "amber", label: "Retired" });
  if (m.Status?.Disabled) badges.push({ key: "disabled", tone: "neutral", label: "Disabled" });
  if (badges.length === 0) badges.push({ key: "active", tone: "green", label: "Active" });
  return badges.map((b) => (
    <Badge key={b.key} tone={b.tone}>
      {b.label}
    </Badge>
  ));
}

function genderLabel(g: number | undefined): string | undefined {
  if (g === 1) return "Male";
  if (g === 2) return "Female";
  return undefined;
}

export default function MemberDetailPage() {
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
          aria-label="Back to members"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-fog shadow-card transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold tracking-tight text-ink">
            {member?.Name || number}
          </h2>
          <p className="mt-0.5 text-[13px] text-fog tnum">
            Member № {member?.Number ?? number}
            {member?.SSNumber && member.SSNumber !== member.Number
              ? ` · SSN ${member.SSNumber}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            aria-label="Refresh member"
          >
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFeeOpen(true)}>
            <Banknote className="size-4" /> Create fee
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)} disabled={!member}>
            <Pencil className="size-4" /> Edit
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
            <CardTitle icon={<IdCard />} action={<span className="flex gap-1.5">{statusBadges(member)}</span>}>
              Member card
            </CardTitle>
            <KV
              items={[
                { label: "Number", value: member.Number },
                { label: "SSN", value: member.SSNumber },
                { label: "Group", value: member.Group },
                { label: "Tag", value: member.Tag },
                { label: "Salesperson", value: member.SalesPerson },
                { label: "Ledger code", value: member.LedgerCode },
                { label: "Payment type", value: member.PaymentType },
                { label: "Payment mode", value: member.PaymentMode },
                { label: "Currency", value: member.CurrencyCode },
                {
                  label: "Discount",
                  value: member.Discount ? formatNumber(member.Discount) : undefined,
                },
                { label: "Points", value: formatInt(member.Points) },
                { label: "No VAT", value: member.NoVat ? "Yes" : "No" },
                { label: "Gender", value: genderLabel(member.Gender) },
                {
                  label: "Member age",
                  value:
                    member.Statistics?.MemberAge != null
                      ? `${formatNumber(member.Statistics.MemberAge)} yrs`
                      : undefined,
                },
                {
                  label: "Career age",
                  value:
                    member.Statistics?.CareerAge != null
                      ? `${formatNumber(member.Statistics.CareerAge)} yrs`
                      : undefined,
                },
                {
                  label: "Confirmed terms",
                  value: member.HasConfirmedTerms
                    ? `Yes${member.ConfirmedTermId ? ` (#${member.ConfirmedTermId})` : ""}`
                    : "No",
                },
                { label: "Created", value: formatDateTime(member.Created) },
                { label: "Modified", value: formatDateTime(member.Modified) },
              ]}
            />
          </Card>

          <Card className="space-y-5 p-6">
            <CardTitle icon={<UserRound />}>Contact &amp; address</CardTitle>
            <KV
              items={[
                { label: "Address", value: member.Address?.Address1 },
                { label: "Address 2", value: member.Address?.Address2 },
                { label: "Address 3", value: member.Address?.Address3 },
                { label: "Address 4", value: member.Address?.Address4 },
                {
                  label: "Zip / city",
                  value: [member.Address?.ZipCode, member.Address?.City].filter(Boolean).join(" "),
                },
                {
                  label: "Country",
                  value: member.Address?.CountryName || member.Address?.CountryCode,
                },
                { label: "Phone", value: member.ContactDetail?.Phone },
                { label: "Mobile", value: member.ContactDetail?.Mobile },
                { label: "Direct", value: member.ContactDetail?.Direct },
                { label: "Fax", value: member.ContactDetail?.Fax },
                { label: "Email", value: member.ContactDetail?.Email },
                { label: "URL", value: member.ContactDetail?.URL },
              ]}
            />
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <Tabs tabs={TAB_DEFS} active={tab} onChange={setTab} />
        <Card className="overflow-hidden">
          {tab === "applications" && <ApplicationsTab number={number} />}
          {tab === "fund" && <FundTab number={number} />}
          {tab === "membership" && <MembershipTab number={number} />}
          {tab === "subgroups" && <SubGroupsTab number={number} />}
          {tab === "career" && <CareerTab number={number} />}
          {tab === "education" && <EducationTab number={number} />}
        </Card>
      </div>

      {member && <JsonView data={member} label="Raw member payload" />}

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
