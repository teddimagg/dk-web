"use client";

import { Building2, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { ConnectCompanyForm } from "@/components/shell/ConnectCompanyForm";
import { useCompanies, type Company } from "@/lib/stores/companies";
import { timeAgo } from "@/lib/format";
import { useT } from "@/lib/i18n";

function maskToken(t: string) {
  return t.length > 12 ? `${t.slice(0, 6)}…${t.slice(-4)}` : "••••••";
}

export default function CompaniesPage() {
  const { companies, activeId, setActive, remove } = useCompanies();
  const [confirming, setConfirming] = useState<Company | null>(null);
  const toast = useToast();
  const t = useT();

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("companies.eyebrow")} title={t("companies.title")}>
        <p className="mt-2 max-w-lg text-sm text-fog">{t("companies.body")}</p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          {companies.length === 0 && (
            <Card className="p-8 text-center text-sm text-fog">
              No companies connected yet — add your first token on the right.
            </Card>
          )}
          {companies.map((c) => {
            const active = c.id === activeId;
            return (
              <Card
                key={c.id}
                className={`flex flex-wrap items-center gap-4 p-5 transition-shadow ${active ? "ring-2 ring-accent" : ""}`}
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-semibold text-ink"
                  style={{
                    background: `linear-gradient(135deg, hsl(${c.hue} 90% 72%), hsl(${c.hue + 40} 85% 82%))`,
                  }}
                >
                  {c.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join("") || <Building2 className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-ink">{c.name}</p>
                    {active && <Badge tone="green">Active</Badge>}
                  </div>
                  <p className="mt-0.5 text-[13px] text-fog">
                    Nº {c.number}
                    {c.ssn ? ` · SSN ${c.ssn}` : ""} · token{" "}
                    <span className="font-mono text-xs">{maskToken(c.token)}</span> · added{" "}
                    {timeAgo(new Date(c.addedAt).toISOString())}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!active && (
                    <Button variant="secondary" size="sm" onClick={() => setActive(c.id)}>
                      <Check className="size-4" /> Make active
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Disconnect ${c.name}`}
                    onClick={() => setConfirming(c)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit p-6">
          <CardTitle icon={<Building2 />} className="mb-5">
            Connect another company
          </CardTitle>
          <ConnectCompanyForm />
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title={`Disconnect ${confirming?.name}?`}
        body={
          <>
            This removes the token for <strong>{confirming?.name}</strong> from this browser. No
            data is deleted in dkPlus, and you can reconnect with the same token at any time.
          </>
        }
        confirmLabel="Disconnect"
        onConfirm={() => {
          if (confirming) {
            remove(confirming.id);
            toast.success(`Disconnected ${confirming.name}`, "Reconnect any time with the same token.");
          }
          setConfirming(null);
        }}
      />
    </div>
  );
}
