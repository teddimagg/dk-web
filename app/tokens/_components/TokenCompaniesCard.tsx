"use client";

import { Plus, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useDkQuery } from "@/lib/hooks/useDk";
import type { TokenCompany } from "@/lib/api/types/platform";
import { CreateTokenDialog } from "./CreateTokenDialog";

/** GET /token/companies — companies this token's user can mint tokens for. */
export function TokenCompaniesCard() {
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<TokenCompany[]>(
    ["token-companies"],
    "/token/companies",
  );

  const columns: Column<TokenCompany>[] = [
    {
      key: "name",
      header: "Company",
      render: (c) => <span className="font-medium text-ink">{c.Name ?? "Unnamed company"}</span>,
    },
    {
      key: "id",
      header: "ID",
      render: (c) => <span className="font-mono text-xs text-fog">{c.ID ?? "–"}</span>,
    },
  ];

  return (
    <Card className="p-6">
      <CardTitle
        icon={<Users />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="Refresh companies" onClick={() => refetch()}>
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Create token
            </Button>
          </div>
        }
      >
        Token&apos;s companies
      </CardTitle>
      <p className="mt-2 text-[13px] text-fog">
        Companies the current token&apos;s user has access to. Creating a token assigns it to one of
        these companies.
      </p>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={data}
          rowKey={(c, i) => c.ID ?? i}
          loading={isLoading}
          error={error}
          onRetry={() => refetch()}
          emptyTitle="No companies returned"
          emptyBody="dk answers this route with the companies your token's user may access — the list came back empty."
        />
      </div>

      <CreateTokenDialog open={creating} onClose={() => setCreating(false)} companies={data} />
    </Card>
  );
}
