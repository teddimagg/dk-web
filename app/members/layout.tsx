"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Members module" title="Members" />
      <NavTabs tabs={[{ href: "/members", label: "Members" }]} />
      {children}
    </div>
  );
}
