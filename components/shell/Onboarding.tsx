"use client";

import { Building2, Gauge, Layers, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";
import { ConnectCompanyForm } from "./ConnectCompanyForm";

/** First-run hero shown until at least one company is connected. */
export function Onboarding() {
  const t = useT();
  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div>
        <p className="mb-2 text-[13px] text-fog">{t("onboard.eyebrow")}</p>
        <h1 className="text-5xl font-medium leading-[1.05] tracking-tight text-ink">
          {t("onboard.title1")}
          <br />
          {t("onboard.title2")} <span className="rounded-2xl bg-accent px-2">{t("onboard.title3")}</span>.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-fog">{t("onboard.body")}</p>
        <ul className="mt-6 space-y-3 text-sm text-soot">
          <li className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-xl bg-accent text-ink">
              <Layers className="size-4" />
            </span>
            {t("onboard.point1")}
          </li>
          <li className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-xl bg-ink text-white">
              <Zap className="size-4" />
            </span>
            {t("onboard.point2")}
          </li>
          <li className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-xl bg-ink text-white">
              <Gauge className="size-4" />
            </span>
            {t("onboard.point3")}
          </li>
        </ul>
      </div>

      <Card className="p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-ink text-white">
            <Building2 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-ink">{t("onboard.cardTitle")}</h2>
            <p className="text-[13px] text-fog">{t("onboard.cardSubtitle")}</p>
          </div>
        </div>
        <ConnectCompanyForm />
      </Card>
    </div>
  );
}
