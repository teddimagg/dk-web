"use client";

import { KeyRound, Sparkles } from "lucide-react";
import { useState } from "react";
import { dkFetch } from "@/lib/api/client";
import { useCompanies } from "@/lib/stores/companies";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const DEMO_TOKEN = "3541031f-baf2-4737-a7e8-c66396e5a5e3";

interface CompanyInfo {
  Information?: {
    Company?: { Number?: string; Name?: string; SSNumber?: string };
  };
}

/**
 * Token → company connection. The token is validated against /company before
 * being stored, so a typo never produces a half-connected company
 * (Shneiderman #5 — prevent the error at the door).
 */
export function ConnectCompanyForm({ onConnected }: { onConnected?: (name: string) => void }) {
  const add = useCompanies((s) => s.add);
  const toast = useToast();
  const t = useT();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(t("connect.tokenRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const info = await dkFetch<CompanyInfo>("/company", { token: trimmed, fresh: true });
      const c = info?.Information?.Company;
      const name = c?.Name || "Unnamed company";
      add({ token: trimmed, name, number: c?.Number ?? "?", ssn: c?.SSNumber });
      setToken("");
      toast.success(t("connect.connected", { name }), t("connect.connectedDetail"));
      onConnected?.(name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("connect.unreachable");
      setError(
        msg.includes("401") || msg.toLowerCase().includes("unauthorized")
          ? t("connect.rejected")
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        connect(token);
      }}
      className="space-y-4"
    >
      <Field
        label={t("connect.tokenLabel")}
        help={t("connect.tokenHelp")}
        error={error ?? undefined}
        required
      >
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mist" />
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="pl-10 font-mono text-[13px]"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={busy}>
          {t("connect.submit")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => connect(DEMO_TOKEN)}
        >
          <Sparkles className="size-4 text-accent-deep" /> {t("connect.demo")}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-fog">{t("connect.help")}</p>
    </form>
  );
}
