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
import { useT } from "@/lib/i18n";
import {
  customerGroupLabel,
  type Customer,
  type CustomerGroup,
} from "@/lib/api/types/customers";
import { useCustomerColumns, useCustomerRowNav } from "./_components/customerColumns";
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
  const t = useT();
  const nav = useCustomerRowNav();
  const columns = useCustomerColumns();

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
      toast.success(t("customers.list.exportReady"), t("customers.list.exportReadyDetail"));
    } catch (e) {
      toast.error(t("customers.list.exportFailed"), e instanceof Error ? e.message : undefined);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label={t("customers.list.searchLabel")} className="w-64" hint={t("customers.list.searchHint")}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("customers.list.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          </Field>
          <Field label={t("customers.list.groupLabel")} className="w-48">
            <Select
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("customers.list.allGroups")}</option>
              {(groups.data ?? []).map((g) => (
                <option key={g.Number} value={g.Number}>
                  {customerGroupLabel(g) ? `${g.Number} — ${customerGroupLabel(g)}` : g.Number}
                </option>
              ))}
            </Select>
          </Field>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setPhoneOpen(true)}>
              <Hash className="size-4" /> {t("customers.phone.title")}
            </Button>
            <Button variant="secondary" onClick={exportJson} loading={exporting}>
              <Download className="size-4" /> {t("customers.list.exportJson")}
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {t("customers.list.newCustomer")}
            </Button>
          </div>
        </div>

        <DataTable<Customer>
          columns={columns}
          rows={active.data}
          rowKey={(c) => c.Number}
          onRowClick={nav.onRowClick}
          onRowHover={nav.onRowHover}
          loading={active.isLoading || active.isFetching}
          error={active.error}
          onRetry={() => active.refetch()}
          emptyTitle={
            searching
              ? t("customers.list.emptySearchTitle", { term })
              : groupMode
                ? t("customers.list.emptyGroupTitle")
                : t("customers.list.emptyTitle")
          }
          emptyBody={
            searching || groupMode
              ? t("customers.list.emptyFilteredBody")
              : t("customers.list.emptyBody")
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
