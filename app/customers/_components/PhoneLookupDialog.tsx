"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { asCustomerRows } from "@/lib/api/types/customers";

/**
 * Phone lookup tool: GET /customer/phone/:number finds the customer behind a
 * phone number (searches contacts and receivers too) and
 * GET /customer/phone/:number/display returns switchboard-ready display text.
 */
export function PhoneLookupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState("");
  const t = useT();

  const lookup = useDkQuery<unknown>(
    ["customer-phone", submitted],
    `/customer/phone/${encodeURIComponent(submitted)}`,
    { enabled: open && !!submitted, retry: false },
  );
  const display = useDkQuery<unknown>(
    ["customer-phone-display", submitted],
    `/customer/phone/${encodeURIComponent(submitted)}/display`,
    { enabled: open && !!submitted, retry: false },
  );

  const matches = asCustomerRows(lookup.data);
  const displayText =
    typeof display.data === "string" ? display.data : display.data != null ? JSON.stringify(display.data) : "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(phone.trim());
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("customers.phone.title")}
      subtitle={t("customers.phone.subtitle")}
    >
      <form onSubmit={submit} className="flex items-end gap-2">
        <Field label={t("customers.phone.label")} className="flex-1">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("customers.phone.placeholder")}
            inputMode="tel"
            autoFocus
          />
        </Field>
        <Button type="submit" loading={lookup.isFetching || display.isFetching} disabled={!phone.trim()}>
          <Search className="size-4" /> {t("customers.phone.submit")}
        </Button>
      </form>

      {submitted && (
        <div className="mt-5 space-y-4">
          {(lookup.isLoading || display.isLoading) && <Skeleton className="h-16 w-full" />}

          {lookup.error && (
            <p className="text-sm text-fog">
              {t("customers.phone.noMatchPrefix")}{" "}
              <span className="font-medium text-ink">{submitted}</span>
              {lookup.error.status ? ` (${lookup.error.status})` : ""}.
            </p>
          )}

          {matches.length > 0 && (
            <ul className="space-y-2">
              {matches.map((c) => (
                <li key={c.Number}>
                  <Link
                    href={`/customers/${encodeURIComponent(c.Number)}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:bg-haze"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">{c.Name || c.Number}</span>
                      <span className="block text-xs text-fog">{t("customers.meta", { number: c.Number })}</span>
                    </span>
                    <Badge tone="green">{t("customers.badge.match")}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!display.isLoading && !display.error && displayText && (
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-soot">{t("customers.phone.displayText")}</p>
              <pre className="overflow-x-auto rounded-xl bg-haze px-4 py-3 text-xs leading-relaxed text-soot whitespace-pre-wrap">
                {displayText}
              </pre>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
