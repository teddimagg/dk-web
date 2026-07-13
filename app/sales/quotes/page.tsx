"use client";

import { ChevronRight, FileText, History, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { usePrefetch } from "@/lib/hooks/useDk";
import { DocumentCreateDialog } from "../_components/DocumentCreateDialog";
import { useRecentIds, RECENT_QUOTES_KEY } from "../_components/recent";

export default function QuotesPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const { ids, remember } = useRecentIds(RECENT_QUOTES_KEY);
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function open(e: React.FormEvent) {
    e.preventDefault();
    const id = lookup.trim();
    if (!id) return setLookupError("Enter a quote number");
    setLookupError(null);
    remember(id);
    router.push(`/sales/quotes/${encodeURIComponent(id)}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardTitle icon={<Search />} className="mb-4">
          Open a quote
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">
          Quotes have no list endpoint either, and the dkPlus API fetches a quote&apos;s data{" "}
          <em>through the sales order endpoint</em> (GET /sales/order/:id) — PDF, HTML preview and
          email use quote-specific routes. Quotes you open here are remembered on this device.
        </p>
        <form onSubmit={open} className="flex items-end gap-2">
          <Field label="Quote number" className="flex-1" error={lookupError ?? undefined}>
            <Input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="e.g. 1080"
              autoFocus
            />
          </Field>
          <Button type="submit" className="mb-[1px]">
            Open <ChevronRight className="size-4" />
          </Button>
        </form>

        {ids.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-mist">
              <History className="size-3.5" /> Recently opened
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
          Create a quote
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">
          Posts a new quote with a customer and lines (POST /sales/quote) — the body matches the
          order shape with a <span className="font-mono text-xs">Date</span> field.
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> New quote
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
