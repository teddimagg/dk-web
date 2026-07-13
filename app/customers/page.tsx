"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Download, Hash, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Field, Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import {
  customerGroupLabel,
  type Customer,
  type CustomerGroup,
} from "@/lib/api/types/customers";
import { customerColumns, useCustomerRowNav } from "./_components/customerColumns";
import { CustomerDialog } from "./_components/CustomerDialog";
import { PhoneLookupDialog } from "./_components/PhoneLookupDialog";

const COUNT = 40;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState(""); // debounced
  const [group, setGroup] = useState("");
  const [creating, setCreating] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const company = useActiveCompany();
  const toast = useToast();
  const nav = useCustomerRowNav();

  // Debounce the search box; the search endpoint kicks in from 2 characters.
  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const searching = term.length >= 2;
  const groupMode = !searching && group !== "";

  const groups = useDkQuery<CustomerGroup[]>(["customergroups"], "/customergroup");

  const paged = useDkQuery<Customer[]>(
    ["customers", "page", page],
    `/customer/page/${page}/${COUNT}`,
    { placeholderData: keepPreviousData, enabled: !searching && !groupMode },
  );
  const searched = useDkQuery<Customer[]>(
    ["customers", "search", term],
    `/customer/search/${encodeURIComponent(term)}`,
    { placeholderData: keepPreviousData, enabled: searching },
  );
  const byGroup = useDkQuery<Customer[]>(
    ["customers", "group", group],
    `/customer/group/${encodeURIComponent(group)}`,
    { placeholderData: keepPreviousData, enabled: groupMode },
  );

  const active = searching ? searched : groupMode ? byGroup : paged;
  const hasMore = (paged.data?.length ?? 0) === COUNT;

  /** "Fetch All" route — GET /customer/:objects with objects=false, saved as a JSON file. */
  async function exportJson() {
    if (!company) return;
    setExporting(true);
    try {
      const blob = await dkFetchBlob("/customer/false", { token: company.token });
      downloadBlob(blob, "customers.json");
      toast.success("Export ready", "customers.json is downloading.");
    } catch (e) {
      toast.error("Export failed", e instanceof Error ? e.message : undefined);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label="Search" className="w-64" hint="min. 2 characters">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, number, SSN…"
                className="pl-9"
              />
            </div>
          </Field>
          <Field label="Group" className="w-48">
            <Select
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All groups</option>
              {(groups.data ?? []).map((g) => (
                <option key={g.Number} value={g.Number}>
                  {customerGroupLabel(g) ? `${g.Number} — ${customerGroupLabel(g)}` : g.Number}
                </option>
              ))}
            </Select>
          </Field>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setPhoneOpen(true)}>
              <Hash className="size-4" /> Phone lookup
            </Button>
            <Button variant="secondary" onClick={exportJson} loading={exporting}>
              <Download className="size-4" /> Export JSON
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New customer
            </Button>
          </div>
        </div>

        <DataTable<Customer>
          columns={customerColumns}
          rows={active.data}
          rowKey={(c) => c.Number}
          onRowClick={nav.onRowClick}
          onRowHover={nav.onRowHover}
          loading={active.isLoading || active.isFetching}
          error={active.error}
          onRetry={() => active.refetch()}
          emptyTitle={
            searching
              ? `No customers match “${term}”`
              : groupMode
                ? "No customers in this group"
                : "No customers yet"
          }
          emptyBody={
            searching || groupMode
              ? "Try a different search term or clear the filters."
              : "Create your first customer to get started."
          }
          footer={
            !searching && !groupMode ? (
              <Pagination page={page} onPage={setPage} hasMore={hasMore} loading={paged.isFetching} />
            ) : undefined
          }
        />
      </Card>

      <CustomerDialog open={creating} onClose={() => setCreating(false)} />
      <PhoneLookupDialog open={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </div>
  );
}
