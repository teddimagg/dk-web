"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/projects"
      title={t("projects.title")}
      tabs={[
        { href: "/projects", label: t("projects.tabs.projects"), exact: true },
        { href: "/projects/transactions", label: t("projects.tabs.transactions") },
      ]}
    >
      {children}
    </ModuleFrame>
  );
}
