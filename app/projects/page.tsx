"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { CalendarDays, Layers, Plus, RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { useDkQuery, usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { Project } from "@/lib/api/types/projects";
import { NewProjectDialog } from "./_components/NewProjectDialog";

const COUNT = 50;

export default function ProjectsPage() {
  const t = useT();
  const router = useRouter();
  const prefetch = usePrefetch();
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [modified, setModified] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  // Three list routes: /project (all), /project/modified/:date/:page/:size, /project/page/:page/:size
  const path = showAll
    ? "/project"
    : modified
      ? `/project/modified/${encodeURIComponent(modified)}/${page}/${COUNT}`
      : `/project/page/${page}/${COUNT}`;
  const key = showAll
    ? ["projects", "all"]
    : modified
      ? ["projects", "modified", modified, page]
      : ["projects", "page", page];

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Project[]>(key, path, {
    placeholderData: keepPreviousData,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data?.filter((p) =>
      [p.Number, p.Name, p.Description].some((v) => v != null && String(v).toLowerCase().includes(q)),
    );
  }, [data, search]);

  const hasMore = (data?.length ?? 0) === COUNT;

  const columns: Column<Project>[] = [
    {
      key: "number",
      header: t("projects.field.number"),
      width: "130px",
      render: (p) => <span className="font-mono text-xs text-soot">{String(p.Number)}</span>,
    },
    {
      key: "name",
      header: t("projects.field.name"),
      render: (p) => <span className="font-medium text-ink">{p.Name || "–"}</span>,
    },
    {
      key: "description",
      header: t("projects.field.description"),
      render: (p) => (
        <span className="block max-w-md truncate text-fog">{p.Description || "–"}</span>
      ),
    },
    {
      key: "modified",
      header: t("projects.field.modified"),
      width: "120px",
      render: (p) => <span className="tnum">{formatDate(p.Modified)}</span>,
    },
    {
      key: "status",
      header: t("projects.field.status"),
      width: "100px",
      render: (p) =>
        p.Closed == null ? (
          <span className="text-mist">–</span>
        ) : p.Closed ? (
          <Badge tone="red">{t("projects.status.closed")}</Badge>
        ) : (
          <Badge tone="green">{t("projects.status.open")}</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.list.filterPlaceholder")}
              className="w-56 pl-9"
              aria-label={t("projects.list.filterAria")}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-mist" />
            <Input
              type="date"
              value={modified}
              onChange={(e) => {
                setModified(e.target.value);
                setShowAll(false);
                setPage(1);
              }}
              className="w-40"
              aria-label={t("projects.list.modifiedSince")}
              title={t("projects.list.modifiedTitle")}
            />
            {modified && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("projects.list.clearModified")}
                onClick={() => {
                  setModified("");
                  setPage(1);
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <Button
            variant={showAll ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setShowAll((v) => !v);
              setModified("");
              setPage(1);
            }}
          >
            <Layers className="size-4" />{" "}
            {showAll ? t("projects.list.showingAll") : t("projects.list.showAll")}
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              aria-label={t("projects.list.refreshAria")}
            >
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {t("projects.list.new")}
            </Button>
          </div>
        </div>

        <DataTable<Project>
          columns={columns}
          rows={filtered}
          rowKey={(p, i) => `${String(p.Number)}-${i}`}
          loading={isLoading || isFetching}
          error={error}
          onRetry={() => refetch()}
          onRowClick={(p) => router.push(`/projects/${encodeURIComponent(String(p.Number))}`)}
          onRowHover={(p) =>
            prefetch(
              ["project", String(p.Number)],
              `/project/${encodeURIComponent(String(p.Number))}`,
            )
          }
          emptyTitle={t("projects.list.emptyTitle")}
          emptyBody={
            search
              ? t("projects.list.emptySearch")
              : modified
                ? t("projects.list.emptyModified")
                : t("projects.list.emptyNone")
          }
          emptyAction={
            !search ? (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> {t("projects.list.new")}
              </Button>
            ) : undefined
          }
          footer={
            !showAll ? (
              <Pagination page={page} onPage={setPage} hasMore={hasMore} loading={isFetching} />
            ) : (
              <div className="border-t border-line px-4 py-3 text-[13px] text-fog tnum">
                {t("projects.list.loadedCount", { n: data?.length ?? 0 })}
              </div>
            )
          }
        />
      </Card>

      <NewProjectDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
