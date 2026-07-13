"use client";

import { ChevronRight, FileText, History, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { usePrefetch } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { DocumentCreateDialog } from "../_components/DocumentCreateDialog";
import { useRecentIds, RECENT_QUOTES_KEY } from "../_components/recent";

export default function QuotesPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const t = useT();
  const { ids, remember } = useRecentIds(RECENT_QUOTES_KEY);
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function open(e: React.FormEvent) {
    e.preventDefault();
    const id = lookup.trim();
    if (!id) return setLookupError(t("sales.quotes.enterNumber"));
    setLookupError(null);
    remember(id);
    router.push(`/sales/quotes/${encodeURIComponent(id)}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardTitle icon={<Search />} className="mb-4">
          {t("sales.quotes.openTitle")}
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">{t("sales.quotes.openInfo")}</p>
        <form onSubmit={open} className="flex items-end gap-2">
          <Field label={t("sales.quotes.numberLabel")} className="flex-1" error={lookupError ?? undefined}>
            <Input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder={t("sales.quotes.numberPlaceholder")}
              autoFocus
            />
          </Field>
          <Button type="submit" className="mb-[1px]">
            {t("sales.actions.open")} <ChevronRight className="size-4" />
          </Button>
        </form>

        {ids.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-mist">
              <History className="size-3.5" /> {t("sales.recentlyOpened")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ids.map((id) => (
                <button
                  key={id}
                  onClick={() => router.push(`/sales/quotes/${encodeURIComponent(id)}`)}
                  onMouseEnter={() => prefetch(["sales-quote", id], `/sales/order/${encodeURIComponent(id)}`)}
                  className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-[13px] font-medium text-soot transition-colors hover:border-mist hover:text-ink tnum"
                >
                  #{id}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <CardTitle icon={<FileText />} className="mb-4">
          {t("sales.quotes.createTitle")}
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">{t("sales.quotes.createInfo")}</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> {t("sales.quotes.new")}
        </Button>
      </Card>

      <DocumentCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        kind="quote"
        onCreated={remember}
      />
    </div>
  );
}
