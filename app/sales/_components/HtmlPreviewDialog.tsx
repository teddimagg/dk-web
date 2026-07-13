"use client";

import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";

/**
 * Renders a dk HTML document route into a sandboxed iframe. The endpoint may
 * answer with raw HTML or a JSON-encoded string — the API client parses JSON
 * when possible and falls back to raw text, so both arrive here as a string.
 */
export function HtmlPreviewDialog({
  open,
  onClose,
  path,
  title,
}: {
  open: boolean;
  onClose: () => void;
  /** e.g. `/sales/invoice/1000/html` */
  path: string;
  title: string;
}) {
  const { data, isLoading, error, refetch } = useDkQuery<unknown>(["sales-html", path], path, {
    enabled: open,
  });

  const html =
    typeof data === "string" ? data : data == null ? "" : JSON.stringify(data, null, 2);

  return (
    <Dialog open={open} onClose={onClose} title={title} subtitle="Rendered by dkPlus" wide>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <iframe
          title={title}
          sandbox=""
          srcDoc={html}
          className="h-[65vh] w-full rounded-xl border border-line bg-white"
        />
      )}
    </Dialog>
  );
}
