"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Projects module" title="Projects" />
      <NavTabs
        tabs={[
          { href: "/projects", label: "Projects", exact: true },
          { href: "/projects/transactions", label: "Transactions" },
        ]}
      />
      {children}
    </div>
  );
}
