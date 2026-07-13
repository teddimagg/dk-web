"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  return (
    <Card className="mx-auto mt-16 flex max-w-lg flex-col items-center gap-4 p-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent-dark">
        <Compass className="size-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold text-ink">{t("notfound.title")}</h1>
        <p className="mt-2 text-sm text-fog">{t("notfound.body")}</p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        {t("notfound.back")}
      </Link>
    </Card>
  );
}
