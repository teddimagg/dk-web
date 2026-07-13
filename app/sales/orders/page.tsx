"use client";

import { ChevronRight, ClipboardList, History, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { usePrefetch } from "@/lib/hooks/useDk";
import { DocumentCreateDialog } from "../_components/DocumentCreateDialog";
import { useRecentIds, RECENT_ORDERS_KEY } from "../_components/recent";

export default function OrdersPage() {
  const router = useRouter();
  const prefetch = usePrefetch();
  const { ids, remember } = useRecentIds(RECENT_ORDERS_KEY);
  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function open(e: React.FormEvent) {
    e.preventDefault();
    const id = lookup.trim();
    if (!id) return setLookupError("Enter an order number");
    setLookupError(null);
    remember(id);
    router.push(`/sales/orders/${encodeURIComponent(id)}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardTitle icon={<Search />} className="mb-4">
          Open an order
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">
          The dkPlus API has no order <em>list</em> endpoint — orders are fetched one at a time by
          number (GET /sales/order/:id). Orders you open here are remembered on this device.
        </p>
        <form onSubmit={open} className="flex items-end gap-2">
          <Field label="Order number" className="flex-1" error={lookupError ?? undefined}>
            <Input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="e.g. 329"
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
                  onClick={() => router.push(`/sales/orders/${encodeURIComponent(id)}`)}
                  onMouseEnter={() => prefetch(["sales-order", id], `/sales/order/${encodeURIComponent(id)}`)}
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
        <CardTitle icon={<ClipboardList />} className="mb-4">
          Create an order
        </CardTitle>
        <p className="mb-5 text-sm leading-relaxed text-fog">
          Posts a new sales order with a customer and lines (POST /sales/order). Lines, updates and
          deletion are managed from the order page afterwards.
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> New order
        </Button>
      </Card>

      <DocumentCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        kind="order"
        onCreated={remember}
      />
    </div>
  );
}
