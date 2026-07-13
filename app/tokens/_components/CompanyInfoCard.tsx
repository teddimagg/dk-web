"use client";

import { ArrowRightLeft, Building2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { dkFetch } from "@/lib/api/client";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import type { CompanyInfoResponse } from "@/lib/api/types/platform";

const MODULE_FLAGS = [
  ["Customer", "Customers"],
  ["Product", "Products"],
  ["Vendor", "Vendors"],
  ["Sale", "Sales"],
  ["Project", "Projects"],
  ["Member", "Members"],
] as const;

/** GET /company — owner, license & company master data + GET /company/connection latency test. */
export function CompanyInfoCard() {
  const toast = useToast();
  const company = useActiveCompany();
  const { data, isLoading, error, refetch } = useDkQuery<CompanyInfoResponse>(
    ["company-info"],
    "/company",
  );
  const [testing, setTesting] = useState(false);

  async function testConnection() {
    if (!company) return;
    setTesting(true);
    const t0 = performance.now();
    try {
      await dkFetch<unknown>("/company/connection", { token: company.token, fresh: true });
      const ms = Math.round(performance.now() - t0);
      toast.success("Connection OK", `dkPlus answered in ${ms} ms (round trip, measured in the browser).`);
    } catch (e) {
      toast.error("Connection test failed", e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }

  const info = data?.Information;
  const c = info?.Company;
  const bank = [c?.BankCode, c?.BankAccGroup, c?.BankAccount].filter(Boolean).join("-");

  return (
    <Card className="p-6">
      <CardTitle
        icon={<Building2 />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
            <Button size="sm" onClick={testConnection} loading={testing}>
              {!testing && <ArrowRightLeft className="size-4" />} Test connection
            </Button>
          </div>
        }
      >
        Company & license
      </CardTitle>

      <div className="mt-5 space-y-6">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        )}
        {error && <ErrorState error={error} onRetry={() => refetch()} />}
        {data && !error && (
          <>
            <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist">License</p>
                <KV
                  columns={1}
                  items={[
                    { label: "Owner", value: info?.Owner },
                    { label: "Owner name", value: info?.OwnerName },
                    { label: "License", value: <span className="font-mono text-xs">{info?.License}</span> },
                    { label: "Default currency", value: data.General?.DefaultCurrency },
                    {
                      label: "Default warehouse",
                      value: data.Product?.Warehouse?.Default,
                    },
                  ]}
                />
                <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-wide text-mist">
                  Enabled modules
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MODULE_FLAGS.map(([key, label]) => {
                    const section = data[key];
                    const enabled =
                      !!section &&
                      typeof section === "object" &&
                      (section as { Enabled?: boolean }).Enabled === true;
                    return (
                      <Badge key={key} tone={enabled ? "green" : "neutral"}>
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist">Company</p>
                <KV
                  columns={1}
                  items={[
                    { label: "Number", value: c?.Number },
                    { label: "Name", value: c?.Name },
                    { label: "SSN", value: c?.SSNumber },
                    { label: "VAT number", value: c?.VATNumber },
                    { label: "Address", value: c?.Address1 },
                    { label: "Zip / city", value: [c?.ZipCode, c?.City].filter(Boolean).join(" ") },
                    { label: "Country", value: c?.Country },
                    { label: "Phone", value: c?.Phone },
                    { label: "Email", value: c?.Email },
                    { label: "Bank", value: bank },
                    { label: "IBAN", value: c?.IBAN },
                    { label: "Swift", value: c?.Swift },
                  ]}
                />
              </div>
            </div>
            <JsonView data={data} />
          </>
        )}
      </div>
    </Card>
  );
}
