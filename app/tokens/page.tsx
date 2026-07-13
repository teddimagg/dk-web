"use client";

import { CompanyInfoCard } from "./_components/CompanyInfoCard";
import { MyPagesCard } from "./_components/MyPagesCard";
import { PermissionsCard } from "./_components/PermissionsCard";
import { RevokeTokenCard } from "./_components/RevokeTokenCard";
import { TokenCompaniesCard } from "./_components/TokenCompaniesCard";
import { UsageReportCard } from "./_components/UsageReportCard";

/**
 * Tokens & access — company/license info (GET /company, GET /company/connection),
 * token management (GET /token/companies, POST /token, DELETE /token/:token),
 * usage reports (GET /token/report/usage/pdf, POST /token/report/usage/email),
 * the permission matrix (GET /permission) and My Pages invites (/mypages/invites).
 */
export default function TokensPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <CompanyInfoCard />
      </div>
      <TokenCompaniesCard />
      <div className="flex flex-col gap-6">
        <RevokeTokenCard />
        <UsageReportCard />
      </div>
      <div className="xl:col-span-2">
        <PermissionsCard />
      </div>
      <div className="xl:col-span-2">
        <MyPagesCard />
      </div>
    </div>
  );
}
