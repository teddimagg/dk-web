"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function WebhooksLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame href="/webhooks" title={t("webhooks.title")}>
      {children}
    </ModuleFrame>
  );
}
