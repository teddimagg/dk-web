"use client";

import { ModuleFrame } from "@/components/shell/ModuleFrame";
import { useT } from "@/lib/i18n";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <ModuleFrame
      href="/members"
      title={t("members.title")}
      tabs={[{ href: "/members", label: t("module.members.label") }]}
    >
      {children}
    </ModuleFrame>
  );
}
