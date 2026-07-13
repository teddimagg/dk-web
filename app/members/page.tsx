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

function statusBadge(m: Member) {
  if (m.Status?.Blocked) return <Badge tone="red">Blocked</Badge>;
  if (m.Status?.Dead) return <Badge tone="ink">Deceased</Badge>;
  if (m.Status?.Retired) return <Badge tone="amber">Retired</Badge>;
  if (m.Status?.Disabled) return <Badge tone="neutral">Disabled</Badge>;
  return <Badge tone="green">Active</Badge>;
}

export default function MembersPage() {
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
      header: "Number",
      render: (m) => <span className="font-medium text-ink tnum">{m.Number}</span>,
    },
    { key: "name", header: "Name", render: (m) => m.Name || "–" },
    { key: "city", header: "City", render: (m) => m.Address?.City || "–" },
    { key: "email", header: "Email", render: (m) => m.ContactDetail?.Email || "–" },
    { key: "group", header: "Group", render: (m) => m.Group || "–" },
    {
      key: "points",
      header: "Points",
      align: "right",
      render: (m) => <span className="tnum">{formatInt(m.Points)}</span>,
    },
    { key: "status", header: "Status", render: statusBadge },
    {
      key: "modified",
      header: "Modified",
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
              placeholder="Search loaded page…"
              aria-label="Search members"
              className="pl-9"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="size-4" />
            Filters{appliedCount ? ` (${appliedCount})` : ""}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh members">
            <RefreshCw className={clsx("size-4", isFetching && "animate-spin")} />
          </Button>
          <div className="ml-auto">
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New member
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-line bg-haze/50 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <Field label="Group">
                <Input value={draft.group} onChange={setDraftField("group")} placeholder="a1" />
              </Field>
              <Field label="Zip code">
                <Input value={draft.zipcode} onChange={setDraftField("zipcode")} placeholder="101" />
              </Field>
              <Field label="Country">
                <Input value={draft.country} onChange={setDraftField("country")} placeholder="IS" />
              </Field>
              <Field label="Salesperson">
                <Input value={draft.salesperson} onChange={setDraftField("salesperson")} placeholder="001" />
              </Field>
              <Field label="Payment mode">
                <Input value={draft.paymentmode} onChange={setDraftField("paymentmode")} placeholder="bm" />
              </Field>
              <Field label="Modified since">
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
                Blocked only
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-soot">
                <input
                  type="checkbox"
                  checked={draft.novat}
                  onChange={setDraftField("novat")}
                  className="size-4 accent-ink"
                />
                No VAT only
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
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setApplied(draft);
                    setPage(1);
                  }}
                >
                  Apply filters
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
          emptyTitle="No members found"
          emptyBody={
            search
              ? "No members on this page match your search."
              : "Adjust the filters or create the first member for this company."
          }
          emptyAction={
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New member
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
