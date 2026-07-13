"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";

/**
 * dk's permission enum, assumed from the doc's option order
 * (Full, View, Modify, None, Deny) — raw value always shown alongside.
 */
const PERMISSION_LABELS: Record<number, string> = {
  0: "Full",
  1: "View",
  2: "Modify",
  3: "None",
  4: "Deny",
};

const PERMISSION_TONES: Record<number, "green" | "blue" | "amber" | "neutral" | "red"> = {
  0: "green",
  1: "blue",
  2: "amber",
  3: "neutral",
  4: "red",
};

function PermissionBadge({ value }: { value: unknown }) {
  if (typeof value === "number") {
    const label = PERMISSION_LABELS[value];
    return (
      <Badge tone={PERMISSION_TONES[value] ?? "neutral"}>
        {label ? `${label} · ${value}` : String(value)}
      </Badge>
    );
  }
  if (typeof value === "boolean") {
    return <Badge tone={value ? "green" : "neutral"}>{value ? "Allowed" : "Denied"}</Badge>;
  }
  if (typeof value === "string") return <Badge tone="neutral">{value}</Badge>;
  return <span className="font-mono text-xs text-fog">{JSON.stringify(value)}</span>;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** GET /permission — matrix of the token's module permissions. */
export function PermissionsCard() {
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<Record<string, unknown>>(
    ["permissions"],
    "/permission",
  );

  const entries = isPlainObject(data) ? Object.entries(data) : [];
  const groups = entries.filter(
    (e): e is [string, Record<string, unknown>] => /permission/i.test(e[0]) && isPlainObject(e[1]),
  );
  const rest = entries.filter(([k, v]) => !(/permission/i.test(k) && isPlainObject(v)));

  return (
    <Card className="p-6">
      <CardTitle
        icon={<ShieldCheck />}
        action={
          <Button variant="ghost" size="sm" aria-label="Refresh permissions" onClick={() => refetch()}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        }
      >
        Token permissions
      </CardTitle>
      <p className="mt-2 text-[13px] text-fog">
        What this token may do per module. Values follow dk&apos;s permission options in doc order —
        interpreted as 0 Full · 1 View · 2 Modify · 3 None · 4 Deny; the raw value is always shown.
      </p>

      <div className="mt-5 space-y-6">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        )}
        {error && <ErrorState error={error} onRetry={() => refetch()} />}
        {data != null && !error && groups.length === 0 && rest.length === 0 && (
          <EmptyState
            title="No permission data"
            body="dk returned an empty permission payload for this token."
          />
        )}

        {groups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map(([groupKey, values]) => (
              <div key={groupKey} className="rounded-2xl border border-line bg-haze/40 p-4">
                <p className="mb-3 text-[13px] font-semibold text-ink">
                  {groupKey.replace(/Permissions?$/i, "") || groupKey}
                </p>
                <div className="space-y-2">
                  {Object.entries(values).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-[13px] text-fog">{name}</span>
                      <PermissionBadge value={value} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="rounded-2xl border border-line bg-haze/40 p-4">
            <p className="mb-3 text-[13px] font-semibold text-ink">Other</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {rest.map(([name, value]) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] text-fog">{name}</span>
                  <PermissionBadge value={value} />
                </div>
              ))}
            </div>
          </div>
        )}

        {data != null && <JsonView data={data} label="Raw permission payload" />}
      </div>
    </Card>
  );
}
