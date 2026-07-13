"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";
import { TableSkeleton } from "./Skeleton";
import { EmptyState, ErrorState } from "./EmptyState";
import { useT } from "@/lib/i18n";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
}

/**
 * The one table used across every module — consistent headers, hover states,
 * loading skeletons, empty and error states (Shneiderman #1, consistency).
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  onRowHover,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyBody,
  emptyAction,
  footer,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  onRowHover?: (row: T) => void;
  loading?: boolean;
  error?: { message: string; status?: number } | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: ReactNode;
  footer?: ReactNode;
}) {
  const t = useT();
  if (loading && !rows) return <TableSkeleton cols={columns.length} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0)
    return <EmptyState title={emptyTitle ?? t("ui.emptyDefault")} body={emptyBody} action={emptyAction} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={clsx(
                  "whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-mist",
                  c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={clsx(loading && "opacity-60 transition-opacity")}>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onMouseEnter={onRowHover ? () => onRowHover(row) : undefined}
              className={clsx(
                "border-b border-line/60 last:border-0",
                onRowClick && "cursor-pointer transition-colors hover:bg-haze",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={clsx(
                    "px-4 py-3 align-middle",
                    c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left",
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </div>
  );
}
