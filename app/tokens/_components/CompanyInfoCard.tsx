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
import { useT } from "@/lib/i18n";
import { useActiveCompany } from "@/lib/stores/companies";
import type { CompanyInfoResponse } from "@/lib/api/types/platform";

/** Response flag → module label key from the shared registry translations. */
const MODULE_FLAGS = [
  ["Customer", "module.customers.label"],
  ["Product", "module.products.label"],
  ["Vendor", "module.vendors.label"],
  ["Sale", "module.sales.label"],
  ["Project", "module.projects.label"],
  ["Member", "module.members.label"],
] as const;

/** GET /company — owner, license & company master data + GET /company/connection latency test. */
export function CompanyInfoCard() {
  const t = useT();
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
      toast.success(t("tokens.toast.connectionOk"), t("tokens.latency", { ms }));
    } catch (e) {
      toast.error(t("tokens.toast.connectionFailed"), e instanceof Error ? e.message : String(e));
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
              <RefreshCw className="size-4" /> {t("ui.refresh")}
            </Button>
            <Button size="sm" onClick={testConnection} loading={testing}>
              {!testing && <ArrowRightLeft className="size-4" />} {t("tokens.testConnection")}
            </Button>
          </div>
        }
      >
        {t("tokens.companyCard.title")}
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
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist">
                  {t("tokens.companyCard.license")}
                </p>
                <KV
                  columns={1}
                  items={[
                    { label: t("tokens.companyCard.owner"), value: info?.Owner },
                    { label: t("tokens.companyCard.ownerName"), value: info?.OwnerName },
                    {
                      label: t("tokens.companyCard.license"),
                      value: <span className="font-mono text-xs">{info?.License}</span>,
                    },
                    { label: t("tokens.companyCard.defaultCurrency"), value: data.General?.DefaultCurrency },
                    {
                      label: t("tokens.companyCard.defaultWarehouse"),
                      value: data.Product?.Warehouse?.Default,
                    },
                  ]}
                />
                <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-wide text-mist">
                  {t("tokens.companyCard.enabledModules")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MODULE_FLAGS.map(([key, labelKey]) => {
                    const section = data[key];
                    const enabled =
                      !!section &&
                      typeof section === "object" &&
                      (section as { Enabled?: boolean }).Enabled === true;
                    return (
                      <Badge key={key} tone={enabled ? "green" : "neutral"}>
                        {t(labelKey)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist">
                  {t("tokens.companyCard.company")}
                </p>
                <KV
                  columns={1}
                  items={[
                    { label: t("tokens.companyCard.number"), value: c?.Number },
                    { label: t("tokens.companyCard.name"), value: c?.Name },
                    { label: t("tokens.companyCard.ssn"), value: c?.SSNumber },
                    { label: t("tokens.companyCard.vat"), value: c?.VATNumber },
                    { label: t("tokens.companyCard.address"), value: c?.Address1 },
                    {
                      label: t("tokens.companyCard.zipCity"),
                      value: [c?.ZipCode, c?.City].filter(Boolean).join(" "),
                    },
                    { label: t("tokens.companyCard.country"), value: c?.Country },
                    { label: t("tokens.companyCard.phone"), value: c?.Phone },
                    { label: t("tokens.companyCard.email"), value: c?.Email },
                    { label: t("tokens.companyCard.bank"), value: bank },
                    { label: t("tokens.companyCard.iban"), value: c?.IBAN },
                    { label: t("tokens.companyCard.swift"), value: c?.Swift },
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
