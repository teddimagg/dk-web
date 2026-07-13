"use client";

import { ChevronRight, Layers, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDkQuery } from "@/lib/hooks/useDk";
import {
  customerGroupLabel,
  type Customer,
  type CustomerGroup,
} from "@/lib/api/types/customers";
import { customerColumns, useCustomerRowNav } from "../_components/customerColumns";

export default function CustomerGroupsPage() {
  const [selected, setSelected] = useState<CustomerGroup | null>(null);
  const nav = useCustomerRowNav();

  const groups = useDkQuery<CustomerGroup[]>(["customergroups"], "/customergroup");
  const members = useDkQuery<Customer[]>(
    ["customers", "group", selected?.Number],
    `/customer/group/${encodeURIComponent(selected?.Number ?? "")}`,
    { enabled: !!selected },
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-5">
        <CardTitle icon={<Layers />} className="mb-4">
          Customer groups
        </CardTitle>
        <DataTable<CustomerGroup>
          columns={[
            {
              key: "number",
              header: "Group",
              width: "90px",
              render: (g) => <Badge tone={selected?.Number === g.Number ? "ink" : "neutral"}>{g.Number}</Badge>,
            },
            {
              key: "label",
              header: "Description",
              render: (g) => (
                <span className={selected?.Number === g.Number ? "font-semibold text-ink" : "text-ink"}>
                  {customerGroupLabel(g) || <span className="text-mist">–</span>}
                </span>
              ),
            },
            {
              key: "chev",
              header: "",
              align: "right",
              width: "40px",
              render: () => <ChevronRight className="ml-auto size-4 text-mist" />,
            },
          ]}
          rows={groups.data}
          rowKey={(g) => g.Number}
          onRowClick={(g) => setSelected(g)}
          loading={groups.isLoading}
          error={groups.error}
          onRetry={() => groups.refetch()}
          emptyTitle="No customer groups"
          emptyBody="This company has no customer groups defined in dkPlus."
        />
      </Card>

      <Card className="p-5">
        <CardTitle icon={<Users />} className="mb-4">
          {selected
            ? `Customers in ${selected.Number}${customerGroupLabel(selected) ? ` — ${customerGroupLabel(selected)}` : ""}`
            : "Customers in group"}
        </CardTitle>
        {selected ? (
          <DataTable<Customer>
            columns={customerColumns}
            rows={members.data}
            rowKey={(c) => c.Number}
            onRowClick={nav.onRowClick}
            onRowHover={nav.onRowHover}
            loading={members.isLoading || members.isFetching}
            error={members.error}
            onRetry={() => members.refetch()}
            emptyTitle="No customers in this group"
            emptyBody="No customer is currently assigned to this group."
          />
        ) : (
          <EmptyState
            icon={<Layers />}
            title="Select a group"
            body="Pick a customer group on the left to list every customer assigned to it."
          />
        )}
      </Card>
    </div>
  );
}
