"use client";

import { useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { DkRecord } from "@/lib/api/types/general";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Render a single raw dkSystem value with sensible formatting. */
export function renderValue(v: unknown): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-mist">–</span>;
  if (typeof v === "boolean")
    return <Badge tone={v ? "green" : "neutral"}>{v ? "Yes" : "No"}</Badge>;
  if (typeof v === "number") return <span className="tnum">{formatNumber(v)}</span>;
  if (typeof v === "string") {
    if (ISO_DATE.test(v)) return <span className="tnum">{formatDateTime(v)}</span>;
    if (v.length > 60) return <span title={v}>{v.slice(0, 57)}…</span>;
    return v;
  }
  const json = JSON.stringify(v);
  return (
    <span className="font-mono text-xs text-fog" title={json}>
      {json.length > 60 ? `${json.slice(0, 57)}…` : json}
    </span>
  );
}

/** KV items for every scalar field of a raw record (detail dialogs). */
export function recordKvItems(record: DkRecord | null | undefined): { label: string; value: ReactNode }[] {
  if (!record) return [];
  return Object.entries(record)
    .filter(([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v))
    .map(([k, v]) => ({ label: k, value: renderValue(v) }));
}

/** datetime-local values lack seconds — pad to what the dk API expects. */
export function toApiDateTime(v: string): string {
  return v.length === 16 ? `${v}:00` : v;
}

/**
 * Table over arbitrary records: columns are derived from the keys of the
 * first rows (dkSystem payload shapes vary per table).
 */
export function RecordsTable({
  rows,
  loading,
  error,
  onRetry,
  emptyTitle = "No records",
  emptyBody,
  footer,
  maxCols = 8,
}: {
  rows: DkRecord[] | undefined;
  loading?: boolean;
  error?: { message: string; status?: number } | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
  footer?: ReactNode;
  maxCols?: number;
}) {
  const columns = useMemo<Column<DkRecord>[]>(() => {
    const keys = new Set<string>();
    for (const row of rows?.slice(0, 5) ?? []) {
      if (row && typeof row === "object") for (const k of Object.keys(row)) keys.add(k);
    }
    const list = [...keys].slice(0, maxCols);
    if (list.length === 0)
      return [{ key: "_raw", header: "Value", render: (r) => renderValue(r) }];
    return list.map((k) => ({
      key: k,
      header: k,
      render: (r) => renderValue(r[k]),
      align: undefined,
    }));
  }, [rows, maxCols]);

  return (
    <DataTable<DkRecord>
      columns={columns}
      rows={rows}
      rowKey={(_, i) => i}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      footer={footer}
    />
  );
}
