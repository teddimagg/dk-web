"use client";

import type { ReactNode } from "react";
import { Inbox, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { useT } from "@/lib/i18n";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-haze text-mist [&>svg]:size-6">
        {icon ?? <Inbox />}
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        {body && <p className="mx-auto mt-1 max-w-sm text-sm text-fog">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: { message: string; status?: number };
  onRetry?: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger">
        <TriangleAlert className="size-6" />
      </span>
      <div>
        <p className="font-medium text-ink">
          {error.status
            ? t("ui.requestFailedStatus", { status: error.status })
            : t("ui.requestFailed")}
        </p>
        <p className="mx-auto mt-1 max-w-md break-words text-sm text-fog">{error.message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("ui.tryAgain")}
        </Button>
      )}
    </div>
  );
}
