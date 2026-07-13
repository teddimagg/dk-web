"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  return (
    <Card className="mx-auto mt-16 flex max-w-lg flex-col items-center gap-4 p-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
        <TriangleAlert className="size-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold text-ink">{t("error.title")}</h1>
        <p className="mx-auto mt-2 max-w-sm break-words text-sm text-fog">
          {error.message || t("error.fallback")}
        </p>
      </div>
      <Button onClick={reset}>{t("ui.tryAgain")}</Button>
    </Card>
  );
}
