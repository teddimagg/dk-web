"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Filter, Plus, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatDate, formatInt } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Member } from "@/lib/api/types/members";
import { MemberFormDialog } from "./_components/MemberFormDialog";

const COUNT = 40;

interface Filters {
  group: string;
  zipcode: string;
  country: string;
  salesperson: string;
  paymentmode: string;
  modified: string;
  blocked: boolean;
  novat: boolean;
}

const EMPTY_FILTERS: Filters = {
  group: "",
  zipcode: "",
  country: "",
  salesperson: "",
  paymentmode: "",
  modified: "",
  blocked: false,
  novat: false,
};

function buildQuery(f: Filters): string {
  const qs = new URLSearchParams();
  if (f.group.trim()) qs.set("group", f.group.trim());
  if (f.zipcode.trim()) qs.set("zipcode", f.zipcode.trim());
  if (f.country.trim()) qs.set("country", f.country.trim());
  if (f.salesperson.trim()) qs.set("salesperson", f.salesperson.trim());
  if (f.paymentmode.trim()) qs.set("paymentmode", f.paymentmode.trim());
  if (f.modified) qs.set("modified", f.modified);
  if (f.blocked) qs.set("blocked", "true");
  if (f.novat) qs.set("novat", "true");
  return qs.toString();
}

function statusBadge(m: Member, t: ReturnType<typeof useT>) {
  if (m.Status?.Blocked) return <Badge tone="red">{t("members.status.blocked")}</Badge>;
  if (m.Status?.Dead) return <Badge tone="ink">{t("members.status.deceased")}</Badge>;
  if (m.Status?.Retired) return <Badge tone="amber">{t("members.status.retired")}</Badge>;
  if (m.Status?.Disabled) return <Badge tone="neutral">{t("members.status.disabled")}</Badge>;
  return <Badge tone="green">{t("members.status.active")}</Badge>;
}

export default function MembersPage() {
  const t = useT();
  const router = useRouter();
  const prefetch = usePrefetch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [creating, setCreating] = useState(false);

  const query = buildQuery(applied);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Member[]>(
    ["members", "page", page, query],
    `/member/${page}/${COUNT}${query ? `?${query}` : ""}`,
    { placeholderData: keepPreviousData },
  );
  const hasMore = (data?.length ?? 0) === COUNT;
  const appliedCount = query ? query.split("&").length : 0;

  const rows = useMemo(() => {
    if (!data) return data;
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((m) =>
      [m.Number, m.Name, m.SSNumber, m.ContactDetail?.Email, m.Address?.City, m.Group].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const columns: Column<Member>[] = [
    {
      key: "number",
      header: t("members.field.number"),
      render: (m) => <span className="font-medium text-ink tnum">{m.Number}</span>,
    },
    { key: "name", header: t("members.field.name"), render: (m) => m.Name || "–" },
    { key: "city", header: t("members.field.city"), render: (m) => m.Address?.City || "–" },
    { key: "email", header: t("members.field.email"), render: (m) => m.ContactDetail?.Email || "–" },
    { key: "group", header: t("members.field.group"), render: (m) => m.Group || "–" },
    {
      key: "points",
      header: t("members.field.points"),
      align: "right",
      render: (m) => <span className="tnum">{formatInt(m.Points)}</span>,
    },
    { key: "status", header: t("members.field.status"), render: (m) => statusBadge(m, t) },
    {
      key: "modified",
      header: t("members.field.modified"),
      render: (m) => <span className="tnum">{formatDate(m.Modified)}</span>,
    },
  ];

  const setDraftField =
    (k: keyof Filters) => (e: ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({
        ...d,
        [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="relative min-w-52 max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("members.list.searchPlaceholder")}
              aria-label={t("members.list.searchAria")}
              className="pl-9"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="size-4" />
            {t("members.list.filters")}
            {appliedCount ? ` (${appliedCount})` : ""}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            aria-label={t("members.list.refreshAria")}
          >
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} />
          </Button>
          <div className="ml-auto">
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {t("members.list.new")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-line bg-haze/50 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <Field label={t("members.field.group")}>
                <Input value={draft.group} onChange={setDraftField("group")} placeholder="a1" />
              </Field>
              <Field label={t("members.field.zipcode")}>
                <Input value={draft.zipcode} onChange={setDraftField("zipcode")} placeholder="101" />
              </Field>
              <Field label={t("members.field.country")}>
                <Input value={draft.country} onChange={setDraftField("country")} placeholder="IS" />
              </Field>
              <Field label={t("members.field.salesperson")}>
                <Input value={draft.salesperson} onChange={setDraftField("salesperson")} placeholder="001" />
              </Field>
              <Field label={t("members.field.paymentMode")}>
                <Input value={draft.paymentmode} onChange={setDraftField("paymentmode")} placeholder="bm" />
              </Field>
              <Field label={t("members.filters.modifiedSince")}>
                <Input type="date" value={draft.modified} onChange={setDraftField("modified")} />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-soot">
                <input
                  type="checkbox"
                  checked={draft.blocked}
                  onChange={setDraftField("blocked")}
                  className="size-4 accent-ink"
                />
                {t("members.filters.blockedOnly")}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-soot">
                <input
                  type="checkbox"
                  checked={draft.novat}
                  onChange={setDraftField("novat")}
                  className="size-4 accent-ink"
                />
                {t("members.filters.noVatOnly")}
              </label>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(EMPTY_FILTERS);
                    setApplied(EMPTY_FILTERS);
                    setPage(1);
                  }}
                >
                  {t("members.filters.clear")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setApplied(draft);
                    setPage(1);
                  }}
                >
                  {t("members.filters.apply")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DataTable<Member>
          columns={columns}
          rows={rows}
          rowKey={(m, i) => m.Number || i}
          onRowClick={(m) => router.push(`/members/${encodeURIComponent(m.Number)}`)}
          onRowHover={(m) => prefetch(["member", m.Number], `/member/${encodeURIComponent(m.Number)}`)}
          loading={isLoading || isFetching}
          error={error ?? null}
          onRetry={() => refetch()}
          emptyTitle={t("members.list.emptyTitle")}
          emptyBody={search ? t("members.list.emptySearch") : t("members.list.emptyBody")}
          emptyAction={
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {t("members.list.new")}
            </Button>
          }
          footer={<Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />}
        />
      </Card>

      <MemberFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(m) => router.push(`/members/${encodeURIComponent(m.Number)}`)}
      />
    </div>
  );
}
