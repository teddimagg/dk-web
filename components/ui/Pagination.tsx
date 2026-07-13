"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { useT } from "@/lib/i18n";

/**
 * Simple pager for dk's page/count endpoints. `hasMore` is inferred from a
 * full page of results when the API gives no total.
 */
export function Pagination({
  page,
  onPage,
  hasMore,
  totalPages,
  loading,
}: {
  page: number;
  onPage: (p: number) => void;
  hasMore?: boolean;
  totalPages?: number;
  loading?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3">
      <span className="text-[13px] text-fog tnum">
        {totalPages ? t("ui.pageOf", { page, total: totalPages }) : t("ui.page", { page })}
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPage(page - 1)}
          aria-label={t("ui.prevPage")}
        >
          <ChevronLeft className="size-4" /> {t("ui.prev")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={(totalPages ? page >= totalPages : !hasMore) || loading}
          onClick={() => onPage(page + 1)}
          aria-label={t("ui.nextPage")}
        >
          {t("ui.next")} <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
