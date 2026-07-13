"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { ChevronRight, Globe2, Package, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { usePrefetch, useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatAmount } from "@/lib/format";
import type { CustomerSearchHit, ProductSearchHit, SearchHit } from "@/lib/api/types/platform";

/** Global-search hit types per the Root doc. */
const TYPE_META: Record<number, { label: string; tone: "green" | "blue" | "amber" | "neutral" }> = {
  0: { label: "Customer", tone: "green" },
  1: { label: "Vendor", tone: "amber" },
  2: { label: "Product", tone: "blue" },
  3: { label: "Employee", tone: "neutral" },
};

/** Where a global hit can link to inside dkPanel. */
function hitHref(hit: SearchHit): string | null {
  if (hit.ID == null) return null;
  const id = encodeURIComponent(String(hit.ID));
  if (hit.Type === 0) return `/customers/${id}`;
  if (hit.Type === 2) return `/products/${id}`;
  return null;
}

const MIN_CHARS = 2;

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = useActiveCompany();
  const prefetch = usePrefetch();

  const q = (searchParams.get("q") ?? "").trim();
  const [input, setInput] = useState(q);
  // The last q this component itself pushed — lets us tell our own URL
  // updates apart from external ones (header search, Back/Forward).
  const selfQ = useRef(q);

  // Adopt external q changes instead of letting the debounce revert them.
  useEffect(() => {
    if (q !== selfQ.current) {
      selfQ.current = q;
      setInput(q);
    }
  }, [q]);

  // Debounced search-as-you-type → keeps the URL shareable via router.replace.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = input.trim();
      if (next === q) return;
      selfQ.current = next;
      router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
    }, 350);
    return () => clearTimeout(t);
  }, [input, q, router]);

  const ready = !!company && q.length >= MIN_CHARS;
  const enc = encodeURIComponent(q);

  // Three result groups fetched in parallel.
  const globalQ = useDkQuery<unknown>(["global-search", q], `/search/${enc}`, {
    enabled: ready,
    placeholderData: keepPreviousData,
  });
  const customersQ = useDkQuery<CustomerSearchHit[]>(
    ["customer-search", q],
    `/customer/search/${enc}`,
    { enabled: ready, placeholderData: keepPreviousData },
  );
  const productsQ = useDkQuery<ProductSearchHit[]>(
    ["product-search", q],
    `/Product/search/${enc}`,
    { enabled: ready, placeholderData: keepPreviousData },
  );

  const globalRows = Array.isArray(globalQ.data) ? (globalQ.data as SearchHit[]) : undefined;
  const globalIsOpaque = !Array.isArray(globalQ.data) && globalQ.data != null;

  const globalColumns: Column<SearchHit>[] = [
    {
      key: "type",
      header: "Type",
      width: "120px",
      render: (h) => {
        const meta = h.Type != null ? TYPE_META[h.Type] : undefined;
        return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? `Type ${h.Type ?? "?"}`}</Badge>;
      },
    },
    {
      key: "id",
      header: "ID",
      width: "160px",
      render: (h) => <span className="font-mono text-xs tnum">{h.ID != null ? String(h.ID) : "–"}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (h) => <span className="font-medium text-ink">{h.Name ?? "–"}</span>,
    },
    {
      key: "open",
      header: "",
      align: "right",
      width: "48px",
      render: (h) => (hitHref(h) ? <ChevronRight className="ml-auto size-4 text-mist" /> : null),
    },
  ];

  const customerColumns: Column<CustomerSearchHit>[] = [
    {
      key: "number",
      header: "Number",
      width: "140px",
      render: (c) => (
        <span className="font-mono text-xs tnum">{c.Number != null ? String(c.Number) : "–"}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="font-medium text-ink">{c.Name ?? "–"}</span>,
    },
    { key: "email", header: "Email", render: (c) => c.Email ?? "–" },
    { key: "phone", header: "Phone", render: (c) => <span className="tnum">{c.Phone ?? "–"}</span> },
    {
      key: "open",
      header: "",
      align: "right",
      width: "48px",
      render: () => <ChevronRight className="ml-auto size-4 text-mist" />,
    },
  ];

  const productColumns: Column<ProductSearchHit>[] = [
    {
      key: "code",
      header: "Item code",
      width: "160px",
      render: (p) => <span className="font-mono text-xs">{p.ItemCode ?? "–"}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (p) => (
        <span className="font-medium text-ink">{p.Description ?? p.Description2 ?? "–"}</span>
      ),
    },
    {
      key: "price",
      header: "Unit price",
      align: "right",
      render: (p) => <span className="tnum">{formatAmount(p.UnitPrice1WithTax ?? p.UnitPrice1)}</span>,
    },
    {
      key: "open",
      header: "",
      align: "right",
      width: "48px",
      render: () => <ChevronRight className="ml-auto size-4 text-mist" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-mist" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search customers, vendors, products, employees…"
            className="h-12 pl-12 text-base"
            aria-label="Global search"
            autoFocus
          />
        </div>
        <p className="mt-2 text-xs text-fog">
          Search-as-you-type across the whole company — results update as you type (min {MIN_CHARS}{" "}
          characters). The URL stays shareable.
        </p>
      </Card>

      {q.length < MIN_CHARS ? (
        <Card>
          <EmptyState
            icon={<Search />}
            title="Type to search dkPlus"
            body="Matches customers, vendors, products and employees. Customer and product hits link straight to their detail pages."
          />
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <CardTitle icon={<Globe2 />}>
              All results{globalRows ? ` · ${globalRows.length}` : ""}
            </CardTitle>
            <div className="mt-4">
              {globalQ.error?.status === 405 ? (
                <p className="rounded-2xl bg-haze px-4 py-3 text-[13px] leading-relaxed text-fog">
                  The combined <code className="font-mono text-xs">/search</code> endpoint is not
                  enabled on this dkPlus company — the customer and product results below are live.
                </p>
              ) : globalIsOpaque ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-fog">
                    dk returned a non-list payload for this search — raw response below.
                  </p>
                  <JsonView data={globalQ.data} label="Raw search response" />
                </div>
              ) : (
                <DataTable
                  columns={globalColumns}
                  rows={globalRows}
                  rowKey={(h, i) => `${h.Type ?? "?"}-${h.ID ?? i}`}
                  loading={globalQ.isLoading || globalQ.isFetching}
                  error={globalQ.error}
                  onRetry={() => globalQ.refetch()}
                  onRowClick={(h) => {
                    const href = hitHref(h);
                    if (href) router.push(href);
                  }}
                  onRowHover={(h) => {
                    if (h.Type === 0 && h.ID != null)
                      prefetch(["customer", String(h.ID)], `/customer/${encodeURIComponent(String(h.ID))}`);
                    if (h.Type === 2 && h.ID != null)
                      prefetch(["product", String(h.ID)], `/Product/${encodeURIComponent(String(h.ID))}`);
                  }}
                  emptyTitle={`No results for “${q}”`}
                  emptyBody="Nothing across customers, vendors, products or employees matched."
                />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <CardTitle icon={<Users />}>
              Customers{customersQ.data ? ` · ${customersQ.data.length}` : ""}
            </CardTitle>
            <div className="mt-4">
              <DataTable
                columns={customerColumns}
                rows={customersQ.data}
                rowKey={(c, i) => (c.Number != null ? String(c.Number) : i)}
                loading={customersQ.isLoading || customersQ.isFetching}
                error={customersQ.error}
                onRetry={() => customersQ.refetch()}
                onRowClick={(c) => {
                  if (c.Number != null)
                    router.push(`/customers/${encodeURIComponent(String(c.Number))}`);
                }}
                onRowHover={(c) => {
                  if (c.Number != null)
                    prefetch(
                      ["customer", String(c.Number)],
                      `/customer/${encodeURIComponent(String(c.Number))}`,
                    );
                }}
                emptyTitle={`No customers match “${q}”`}
              />
            </div>
          </Card>

          <Card className="p-6">
            <CardTitle icon={<Package />}>
              Products{productsQ.data ? ` · ${productsQ.data.length}` : ""}
            </CardTitle>
            <div className="mt-4">
              <DataTable
                columns={productColumns}
                rows={productsQ.data}
                rowKey={(p, i) => p.ItemCode ?? i}
                loading={productsQ.isLoading || productsQ.isFetching}
                error={productsQ.error}
                onRetry={() => productsQ.refetch()}
                onRowClick={(p) => {
                  if (p.ItemCode) router.push(`/products/${encodeURIComponent(p.ItemCode)}`);
                }}
                onRowHover={(p) => {
                  if (p.ItemCode)
                    prefetch(["product", p.ItemCode], `/Product/${encodeURIComponent(p.ItemCode)}`);
                }}
                emptyTitle={`No products match “${q}”`}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
