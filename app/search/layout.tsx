"use client";

import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Platform · Root module" title="Search" />
      <NavTabs
        tabs={[
          { href: "/timeclock", label: "Time clock" },
          { href: "/webhooks", label: "Webhooks" },
          { href: "/tokens", label: "Tokens & access" },
          { href: "/search", label: "Search" },
        ]}
      />
      {children}
    </div>
  );
}
