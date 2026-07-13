"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dkFetch, dkFetchPaged } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";
import { usePeriod, inPeriod, periodKey, periodQuery } from "@/lib/stores/period";
import type { InvoiceSummary } from "@/lib/api/types/overview";

const PAGE_SIZE = 1000;
/** Runaway guard — dk itself caps paging at 50k documents. */
const MAX_PAGES = 40;
/** Parallel page requests per batch (be kind to the upstream API). */
const BATCH = 5;

export interface PeriodInvoices {
  /** Every invoice whose invoice date falls inside the period. */
  invoices: InvoiceSummary[] | undefined;
  /** Raw rows fetched (before the invoice-date filter). */
  fetched: number;
  /** True when the safety ceiling cut the fetch short. */
  truncated: boolean;
}

/**
 * ALL invoices of the selected reporting period, shared by Overview and
 * Analytics (one cache entry). The first request reveals the total page count
 * via dk's RFC5988 Link header; remaining pages load in parallel batches.
 * The period is an invoice-date window, so rows are re-filtered client-side
 * (dk's createdAfter/Before compare the record-creation date instead).
 */
export function usePeriodInvoices() {
  const company = useActiveCompany();
  const { period } = usePeriod();

  const query = useQuery({
    queryKey: [company?.id, "invoices-period", periodKey(period)],
    queryFn: async ({ signal }): Promise<{ rows: InvoiceSummary[]; truncated: boolean }> => {
      const qs = periodQuery(period);
      const token = company!.token;
      const first = await dkFetchPaged<InvoiceSummary[]>(
        `/sales/invoice/page/1/${PAGE_SIZE}${qs}`,
        { token, signal },
      );
      const rows = [...(first.data ?? [])];
      if (rows.length < PAGE_SIZE) return { rows, truncated: false };

      // Full first page — walk the rest. Prefer the exact count from rel=last.
      const lastPage = first.lastPage;
      let truncated = false;
      if (lastPage && lastPage > 1) {
        const cappedLast = Math.min(lastPage, MAX_PAGES);
        truncated = lastPage > MAX_PAGES;
        for (let start = 2; start <= cappedLast; start += BATCH) {
          const pages = [];
          for (let p = start; p < start + BATCH && p <= cappedLast; p++) pages.push(p);
          const results = await Promise.all(
            pages.map((p) =>
              dkFetch<InvoiceSummary[]>(`/sales/invoice/page/${p}/${PAGE_SIZE}${qs}`, {
                token,
                signal,
              }),
            ),
          );
          for (const r of results) rows.push(...(r ?? []));
        }
      } else {
        // No Link header — fall back to sequential paging until a short page.
        for (let p = 2; p <= MAX_PAGES; p++) {
          const r = await dkFetch<InvoiceSummary[]>(
            `/sales/invoice/page/${p}/${PAGE_SIZE}${qs}`,
            { token, signal },
          );
          rows.push(...(r ?? []));
          if (!r || r.length < PAGE_SIZE) return { rows, truncated: false };
        }
        truncated = true;
      }
      return { rows, truncated };
    },
    enabled: !!company,
    staleTime: 120_000,
  });

  const invoices = useMemo(
    () => query.data?.rows.filter((i) => inPeriod(i.InvoiceDate, period)),
    [query.data, period],
  );

  const result: PeriodInvoices = {
    invoices,
    fetched: query.data?.rows.length ?? 0,
    truncated: query.data?.truncated ?? false,
  };
  return { ...result, query };
}
