"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Layers, Loader2, Pencil, Plus, RefreshCw, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { formatDate } from "@/lib/format";
import type { SalesDeleteResult, SalesPerson, SalesPersonBody } from "@/lib/api/types/sales";

const SIZE = 25;

export default function SalespeoplePage() {
  const prefetch = usePrefetch();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SalesPerson | null>(null);
  const [deleting, setDeleting] = useState<SalesPerson | null>(null);

  // "Show all" uses the doc's fixed Fetch All route (page/1/100).
  const path = showAll ? "/sales/person/page/1/100" : `/sales/person/page/${page}/${SIZE}`;
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<SalesPerson[]>(
    ["sales-people", showAll ? "all" : page],
    path,
    { placeholderData: keepPreviousData },
  );
  const hasMore = !showAll && (data?.length ?? 0) === SIZE;

  const del = useDkMutation<SalesDeleteResult>({ invalidates: [["sales-people"]] });

  function doDelete() {
    if (!deleting) return;
    del.mutate(
      { path: `/sales/person/${encodeURIComponent(deleting.Number)}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success(`Salesperson ${deleting.Number} deleted`, deleting.NameOnSalesOrders);
          if (selected === deleting.Number) setSelected(null);
          setDeleting(null);
        },
        onError: (e) => {
          setDeleting(null);
          toast.error("Could not delete salesperson", e.message);
        },
      },
    );
  }

  const columns: Column<SalesPerson>[] = [
    { key: "number", header: "Number", width: "90px", render: (r) => <span className="font-medium text-ink">{r.Number}</span> },
    { key: "name", header: "Name on sales orders", render: (r) => r.NameOnSalesOrders || "–" },
    { key: "employee", header: "Employee", width: "120px", render: (r) => r.Employee || "–" },
    {
      key: "pg",
      header: "Price group",
      align: "center",
      width: "100px",
      render: (r) => <span className="tnum">{r.PriceGroup ?? "–"}</span>,
    },
    { key: "created", header: "Created", width: "110px", render: (r) => <span className="tnum">{formatDate(r.Created)}</span> },
    { key: "modified", header: "Modified", width: "110px", render: (r) => <span className="tnum">{formatDate(r.Modified)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "90px",
      render: (r) => (
        <span className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(r);
            }}
            aria-label={`Edit salesperson ${r.Number}`}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-haze hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleting(r);
            }}
            aria-label={`Delete salesperson ${r.Number}`}
            className="grid size-8 cursor-pointer place-items-center rounded-full text-mist transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <Button
            variant={showAll ? "accent" : "secondary"}
            size="sm"
            onClick={() => {
              setShowAll((s) => !s);
              setPage(1);
            }}
          >
            <Layers className="size-4" /> {showAll ? "Paged view" : "Show all"}
          </Button>
          {showAll && <span className="text-[13px] text-fog">Fetch All — first 100 salespeople</span>}
          <span className="ml-auto flex items-center gap-2">
            {isFetching && <Loader2 className="size-4 animate-spin text-mist" aria-label="Refreshing" />}
            <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh list">
              <RefreshCw className="size-4" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> New salesperson
            </Button>
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={data}
          rowKey={(r, i) => r.Number ?? i}
          loading={isLoading || isFetching}
          error={error}
          onRetry={refetch}
          onRowClick={(r) => setSelected(r.Number)}
          onRowHover={(r) => prefetch(["sales-person", r.Number], `/sales/person/${encodeURIComponent(r.Number)}`)}
          emptyTitle="No salespeople"
          emptyBody="Create the first salesperson with the button above."
          footer={
            showAll ? undefined : (
              <Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />
            )
          }
        />
      </Card>

      <PersonDetailDialog
        number={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => {
          setSelected(null);
          setEditing(p);
        }}
      />
      <PersonFormDialog open={createOpen} onClose={() => setCreateOpen(false)} person={null} />
      {editing && <PersonFormDialog open onClose={() => setEditing(null)} person={editing} />}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete salesperson ${deleting?.Number}?`}
        body={
          <>
            Salesperson <strong>{deleting?.Number}</strong>
            {deleting?.NameOnSalesOrders ? (
              <>
                {" "}
                (<strong>{deleting.NameOnSalesOrders}</strong>)
              </>
            ) : null}{" "}
            will be deleted in dkPlus. This cannot be undone.
          </>
        }
        loading={del.isPending}
        onConfirm={doDelete}
      />
    </div>
  );
}

/** Row-click detail via GET /sales/person/:number. */
function PersonDetailDialog({
  number,
  onClose,
  onEdit,
}: {
  number: string | null;
  onClose: () => void;
  onEdit: (p: SalesPerson) => void;
}) {
  const { data, isLoading, error, refetch } = useDkQuery<SalesPerson>(
    ["sales-person", number],
    `/sales/person/${encodeURIComponent(number ?? "")}`,
    { enabled: !!number },
  );

  const flag = (v: boolean | undefined) =>
    v ? <Badge tone="ink">Yes</Badge> : <Badge tone="neutral">No</Badge>;

  return (
    <Dialog
      open={!!number}
      onClose={onClose}
      title={`Salesperson ${number ?? ""}`}
      subtitle={data?.NameOnSalesOrders}
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data ? (
        <div className="space-y-5">
          <KV
            columns={1}
            items={[
              { label: "Number", value: data.Number },
              { label: "Employee", value: data.Employee },
              { label: "Name on sales orders", value: data.NameOnSalesOrders },
              { label: "Warehouse", value: data.Warehouse },
              { label: "Price group", value: data.PriceGroup != null ? String(data.PriceGroup) : "" },
              { label: "Price 1 closed", value: flag(data.Price1Closed) },
              { label: "Price 2 closed", value: flag(data.Price2Closed) },
              { label: "Price 3 closed", value: flag(data.Price3Closed) },
              { label: "Can change due date", value: flag(data.CanChangeDueDate) },
              { label: "Filter on customer", value: flag(data.FilterOnCustomer) },
              { label: "Created", value: formatDate(data.Created) },
              { label: "Modified", value: formatDate(data.Modified) },
            ]}
          />
          <JsonView data={data} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(data)}>
              <Pencil className="size-4" /> Edit
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

/** Create (POST /sales/person) or update (PUT /sales/person/:number). */
function PersonFormDialog({
  open,
  onClose,
  person,
}: {
  open: boolean;
  onClose: () => void;
  person: SalesPerson | null;
}) {
  const toast = useToast();
  const editing = person != null;
  const [number, setNumber] = useState(person?.Number ?? "");
  const [employee, setEmployee] = useState(person?.Employee ?? "");
  const [name, setName] = useState(person?.NameOnSalesOrders ?? "");
  const [warehouse, setWarehouse] = useState(person?.Warehouse ?? "");
  const [priceGroup, setPriceGroup] = useState(person?.PriceGroup != null ? String(person.PriceGroup) : "");
  const [price1, setPrice1] = useState(person?.Price1Closed ?? false);
  const [price2, setPrice2] = useState(person?.Price2Closed ?? false);
  const [price3, setPrice3] = useState(person?.Price3Closed ?? false);
  const [canChangeDueDate, setCanChangeDueDate] = useState(person?.CanChangeDueDate ?? false);
  const [filterOnCustomer, setFilterOnCustomer] = useState(person?.FilterOnCustomer ?? false);
  const [error, setError] = useState<string | null>(null);
  const save = useDkMutation<unknown>({ invalidates: [["sales-people"], ["sales-person"]] });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) return setError("Number is required");
    setError(null);
    const body: SalesPersonBody = {
      ...(editing ? {} : { Number: number.trim() }),
      Employee: employee.trim() || undefined,
      NameOnSalesOrders: name.trim() || undefined,
      Warehouse: warehouse.trim() || undefined,
      ...(priceGroup.trim() !== "" ? { PriceGroup: Number(priceGroup) } : {}),
      Price1Closed: price1,
      Price2Closed: price2,
      Price3Closed: price3,
      CanChangeDueDate: canChangeDueDate,
      FilterOnCustomer: filterOnCustomer,
    };
    save.mutate(
      editing
        ? { path: `/sales/person/${encodeURIComponent(person.Number)}`, method: "PUT", body }
        : { path: "/sales/person", method: "POST", body },
      {
        onSuccess: () => {
          toast.success(
            editing ? `Salesperson ${person.Number} updated` : `Salesperson ${number.trim()} created`,
            name.trim() || undefined,
          );
          onClose();
        },
        onError: (err) =>
          toast.error(editing ? "Could not update salesperson" : "Could not create salesperson", err.message),
      },
    );
  }

  const check = (
    label: string,
    checked: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-soot">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-ink"
      />
      {label}
    </label>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? `Edit salesperson ${person.Number}` : "New salesperson"}
      subtitle={editing ? "PUT /sales/person/:number" : "POST /sales/person"}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number" required error={error ?? undefined}>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={editing}
              placeholder="e.g. webster"
              autoFocus={!editing}
            />
          </Field>
          <Field label="Employee">
            <Input value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="e.g. 1710794709" />
          </Field>
          <Field label="Name on sales orders">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vefverslun" />
          </Field>
          <Field label="Warehouse">
            <Input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} placeholder="e.g. bg1" />
          </Field>
          <Field label="Price group">
            <Input
              type="number"
              value={priceGroup}
              onChange={(e) => setPriceGroup(e.target.value)}
              placeholder="e.g. 0"
            />
          </Field>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {check("Price 1 closed", price1, setPrice1)}
          {check("Price 2 closed", price2, setPrice2)}
          {check("Price 3 closed", price3, setPrice3)}
          {check("Can change due date", canChangeDueDate, setCanChangeDueDate)}
          {check("Filter on customer", filterOnCustomer, setFilterOnCustomer)}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : <><UserRound className="size-4" /> Create</>}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
