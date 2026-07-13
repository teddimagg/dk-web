"use client";

import { Copy, History, Pencil, RefreshCw, Search, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { formatDateTime, formatInt } from "@/lib/format";
import type { DeletedRecord, DkRecord, TableChanges } from "@/lib/api/types/general";
import { RecordsTable, toApiDateTime } from "./RecordsTable";

function WarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber-soft px-4 py-3 text-[13px] leading-relaxed text-[#9a6a10]">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Records browser: GET /general/table/:name?output&modified&fields&count */
/* ------------------------------------------------------------------ */

export function RecordsPanel({ table }: { table: string }) {
  const [output, setOutput] = useState("");
  const [modified, setModified] = useState("");
  const [fields, setFields] = useState("");
  const [count, setCount] = useState("25");
  const [applied, setApplied] = useState<string | null>(null);

  const query = useDkQuery<DkRecord[] | DkRecord>(
    ["general", "table", table, "records", applied],
    `/general/table/${encodeURIComponent(table)}${applied ? `?${applied}` : ""}`,
    { enabled: applied !== null, fresh: true, retry: false },
  );

  const rows: DkRecord[] | undefined =
    query.data === undefined ? undefined : Array.isArray(query.data) ? query.data : [query.data];

  function fetchRecords(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (output) p.set("output", output);
    if (modified) p.set("modified", toApiDateTime(modified));
    if (fields.trim()) p.set("fields", fields.trim());
    const n = Number(count);
    if (count !== "" && Number.isFinite(n) && n > 0) p.set("count", String(Math.floor(n)));
    setApplied(p.toString());
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-fog">
        Direct polling into dkSystem, bypassing all cache layers. Limit the field list and count to
        keep responses small.
      </p>
      <form onSubmit={fetchRecords} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Output format">
          <Select value={output} onChange={(e) => setOutput(e.target.value)}>
            <option value="">Default (Legacy)</option>
            <option value="Legacy">Legacy (0)</option>
            <option value="KeyValue">KeyValue (1)</option>
          </Select>
        </Field>
        <Field label="Modified since" hint="default 1.1.1900">
          <Input type="datetime-local" value={modified} onChange={(e) => setModified(e.target.value)} />
        </Field>
        <Field label="Fields" hint="comma separated">
          <Input
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            placeholder="e.g. ITEMCODE,DESCRIPTION,UNITPRICE1"
          />
        </Field>
        <Field label="Count" hint="default 200">
          <Input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} />
        </Field>
        <Button type="submit" loading={query.isFetching} aria-label="Fetch records">
          <Search className="size-4" /> Fetch
        </Button>
      </form>

      {applied === null ? (
        <EmptyState
          icon={<Search />}
          title="Set the query and fetch"
          body={`Records from ${table} will appear here. The returned count may exceed the limit when more records changed in the same millisecond.`}
        />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[13px] text-fog">
            <Badge tone="ink">{table}</Badge>
            <span className="tnum">{rows ? `${formatInt(rows.length)} record${rows.length === 1 ? "" : "s"}` : "Loading…"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => query.refetch()}
              aria-label="Refresh records"
            >
              <RefreshCw className={query.isFetching ? "size-4 animate-spin" : "size-4"} /> Refresh
            </Button>
          </div>
          <RecordsTable
            rows={rows}
            loading={query.isLoading}
            onRetry={() => query.refetch()}
            emptyTitle="No records returned"
            emptyBody="Try widening the modified filter or removing the field list."
          />
          {rows && rows.length > 0 && <JsonView data={query.data} label="Raw response" />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------ */
/* Fields: GET /general/table/:name/fields     */
/* ------------------------------------------ */

export function FieldsPanel({ table }: { table: string }) {
  const toast = useToast();
  const query = useDkQuery<unknown>(
    ["general", "table", table, "fields"],
    `/general/table/${encodeURIComponent(table)}/fields`,
    { retry: false },
  );

  const data = query.data;
  const stringFields =
    Array.isArray(data) && data.every((f) => typeof f === "string") ? (data as string[]) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <p className="mr-auto text-sm text-fog">
          All field names available on <span className="font-mono text-xs">{table}</span> — useful for
          the records browser&apos;s field list.
        </p>
        {stringFields && stringFields.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(stringFields.join(","));
              toast.success("Field list copied", `${stringFields.length} fields as a comma-separated list.`);
            }}
          >
            <Copy className="size-4" /> Copy as list
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => query.refetch()} aria-label="Refresh fields">
          <RefreshCw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </div>

      {query.isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : stringFields ? (
        stringFields.length === 0 ? (
          <EmptyState title="No fields returned" body="The API returned an empty field list for this table." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {stringFields.map((f) => (
              <Badge key={f} tone="neutral" className="font-mono">
                {f}
              </Badge>
            ))}
          </div>
        )
      ) : Array.isArray(data) ? (
        <RecordsTable
          rows={data.filter((r): r is DkRecord => !!r && typeof r === "object")}
          emptyTitle="No fields returned"
        />
      ) : (
        <JsonView data={data} label="Raw response" />
      )}
    </div>
  );
}

/* ------------------------------------------------- */
/* Deleted records: GET /general/table/:name/deleted  */
/* ------------------------------------------------- */

const deletedColumns: Column<DeletedRecord>[] = [
  {
    key: "Id",
    header: "Id",
    render: (r) => <span className="font-mono text-xs text-ink">{r.Id || "–"}</span>,
  },
  { key: "Name", header: "Name", render: (r) => r.Name || <span className="text-mist">–</span> },
  {
    key: "Created",
    header: "Deleted / created",
    render: (r) => <span className="tnum">{formatDateTime(r.Created)}</span>,
    align: "right",
  },
  {
    key: "UniqeId",
    header: "Unique id",
    render: (r) => <span className="tnum">{r.UniqeId != null ? formatInt(r.UniqeId) : "–"}</span>,
    align: "right",
  },
];

export function DeletedPanel({ table }: { table: string }) {
  const [from, setFrom] = useState("");
  const [applied, setApplied] = useState("");

  const query = useDkQuery<DeletedRecord[]>(
    ["general", "table", table, "deleted", applied],
    `/general/table/${encodeURIComponent(table)}/deleted${applied ? `?from=${encodeURIComponent(applied)}` : ""}`,
    { fresh: true, retry: false },
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-fog">
        Records removed from the dkERP system — lets integrations clean up mirrored data. Defaults to
        the last 15 days.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(from ? toApiDateTime(from) : "");
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <Field label="Deleted since" hint="optional — default 15 days" className="w-64">
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Button type="submit" variant="secondary" loading={query.isFetching}>
          <Search className="size-4" /> Fetch deleted
        </Button>
      </form>
      <DataTable<DeletedRecord>
        columns={deletedColumns}
        rows={query.data}
        rowKey={(r, i) => r.UniqeId ?? r.Id ?? i}
        loading={query.isLoading || query.isFetching}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No deleted records"
        emptyBody={`Nothing has been deleted from ${table} in the selected window.`}
      />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Changes count: GET /general/table/:name/changes?modified=…  */
/* ---------------------------------------------------------- */

const defaultModified = () => {
  const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function ChangesPanel({ table }: { table: string }) {
  const [modified, setModified] = useState(defaultModified);
  const [applied, setApplied] = useState<string | null>(null);

  const query = useDkQuery<TableChanges>(
    ["general", "table", table, "changes", applied],
    `/general/table/${encodeURIComponent(table)}/changes?modified=${encodeURIComponent(applied ?? "")}`,
    { enabled: applied !== null, fresh: true, retry: false },
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-fog">
        Counts records inserted or updated since the supplied timestamp — a cheap poll before pulling
        full records.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (modified) setApplied(toApiDateTime(modified));
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <Field label="Modified since" required className="w-64">
          <Input type="datetime-local" value={modified} onChange={(e) => setModified(e.target.value)} />
        </Field>
        <Button type="submit" variant="secondary" loading={query.isFetching}>
          <History className="size-4" /> Count changes
        </Button>
      </form>

      {applied === null ? (
        <EmptyState
          icon={<History />}
          title="Pick a timestamp"
          body="The number of inserted or updated records since then will be shown here."
        />
      ) : query.isLoading ? (
        <Skeleton className="h-24 w-64" />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="rounded-2xl border border-line bg-haze/50 px-6 py-5 w-fit">
          <p className="text-[13px] text-fog">
            Changed records in <span className="font-mono text-xs">{table}</span> since{" "}
            <span className="tnum">{formatDateTime(applied)}</span>
          </p>
          <p className="mt-1 text-4xl font-medium tracking-tight text-ink tnum">
            {formatInt(query.data?.Count ?? 0)}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------ */
/* Update record: PUT /general/table/:name/:key (danger!)  */
/* ------------------------------------------------------ */

export function UpdatePanel({ table }: { table: string }) {
  const toast = useToast();
  const [recordKey, setRecordKey] = useState("");
  const [body, setBody] = useState('{\n  "Name": "New value"\n}');
  const [keyError, setKeyError] = useState<string | undefined>();
  const [jsonError, setJsonError] = useState<string | undefined>();
  const [confirming, setConfirming] = useState(false);

  const mutation = useDkMutation<unknown>({ invalidates: [["general", "table", table]] });

  function requestUpdate(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!recordKey.trim()) {
      setKeyError("The record key is required");
      ok = false;
    } else setKeyError(undefined);
    try {
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("The body must be a JSON object");
        ok = false;
      } else setJsonError(undefined);
    } catch {
      setJsonError("Invalid JSON — fix the syntax before writing");
      ok = false;
    }
    if (ok) setConfirming(true);
  }

  function confirmUpdate() {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    mutation.mutate(
      {
        path: `/general/table/${encodeURIComponent(table)}/${encodeURIComponent(recordKey.trim())}`,
        method: "PUT",
        body: parsed,
      },
      {
        onSuccess: () => {
          toast.success("Record written", `PUT ${table}/${recordKey.trim()} succeeded.`);
          setConfirming(false);
        },
        onError: (err) => {
          toast.error("Write failed", err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <WarningBanner>
        <strong>Direct write into dkSystem.</strong> This bypasses all business logic and validation —
        dk warns it must be fully tested before use on production data. There is no undo.
      </WarningBanner>
      <form onSubmit={requestUpdate} className="space-y-4 max-w-2xl">
        <Field label="Record key" required error={keyError} hint="the id of the record to update">
          <Input
            value={recordKey}
            onChange={(e) => setRecordKey(e.target.value)}
            placeholder="e.g. 0001"
          />
        </Field>
        <Field label="JSON body" required error={jsonError} hint="fields to write">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            spellCheck={false}
            className="font-mono text-xs min-h-40"
          />
        </Field>
        <Button type="submit" variant="danger" loading={mutation.isPending}>
          <Pencil className="size-4" /> Update record…
        </Button>
      </form>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirmUpdate}
        title={`Write to ${table}?`}
        confirmLabel="Write record"
        loading={mutation.isPending}
        body={
          <>
            You are about to <strong>PUT /general/table/{table}/{recordKey.trim()}</strong> — a direct
            write into the dkSystem table that skips every validation and cache layer. This change is
            applied immediately to live company data and <strong>cannot be undone</strong>.
          </>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delete record: DELETE /general/table/:name?key=<field>&value=<val>  */
/* ------------------------------------------------------------------ */

export function DeletePanel({ table }: { table: string }) {
  const toast = useToast();
  const [keyField, setKeyField] = useState("RecordId");
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState<{ key?: string; value?: string }>({});
  const [confirming, setConfirming] = useState(false);

  const mutation = useDkMutation<unknown>({ invalidates: [["general", "table", table]] });

  function requestDelete(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!keyField.trim()) errs.key = "Key field is required";
    if (!value.trim()) errs.value = "A record value is required";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setConfirming(true);
  }

  function confirmDelete() {
    mutation.mutate(
      {
        path: `/general/table/${encodeURIComponent(table)}?key=${encodeURIComponent(keyField.trim())}&value=${encodeURIComponent(value.trim())}`,
        method: "DELETE",
      },
      {
        onSuccess: () => {
          toast.success("Record deleted", `${table} where ${keyField.trim()} = ${value.trim()}.`);
          setConfirming(false);
          setValue("");
        },
        onError: (err) => {
          toast.error("Delete failed", err.message);
          setConfirming(false);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <WarningBanner>
        <strong>Permanent deletion.</strong> The record is removed straight from the dkSystem table,
        bypassing all cache layers. Some records refuse deletion (&quot;Cannot be deleted!&quot;), but
        when it succeeds there is no way back.
      </WarningBanner>
      <form onSubmit={requestDelete} className="flex flex-wrap items-end gap-3 max-w-2xl">
        <Field label="Key field" required error={errors.key} className="w-52">
          <Input value={keyField} onChange={(e) => setKeyField(e.target.value)} placeholder="RecordId" />
        </Field>
        <Field label="Value" required error={errors.value} className="w-52">
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 6241" />
        </Field>
        <Button type="submit" variant="danger" loading={mutation.isPending}>
          <Trash2 className="size-4" /> Delete record…
        </Button>
      </form>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirmDelete}
        title={`Delete from ${table}?`}
        confirmLabel="Delete record"
        loading={mutation.isPending}
        body={
          <>
            This sends <strong>DELETE /general/table/{table}?key={keyField.trim()}&amp;value={value.trim()}</strong>{" "}
            and permanently removes the matching record from live dkSystem data. This action{" "}
            <strong>cannot be undone</strong>.
          </>
        }
      />
    </div>
  );
}
