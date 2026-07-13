# dkPanel — multi-company dkPlus workspace

A Next.js dashboard covering **all 174 routes** of the [dkPlus ERP API](https://api.dkplus.is/api/v1),
with multi-company token switching, two layers of caching, and a reference-grade visual design.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Connect a company with a dkPlus API token (or click **Use demo company** — dk's public demo token).

## Architecture

| Layer | What it does |
| --- | --- |
| `app/api/dk/[...path]` | Proxy to `api.dkplus.is` — injects the Bearer token from the `x-dk-token` header, 45 s in-memory GET cache per token, flushes on any write, forwards RFC5988 paging links. |
| `lib/api/client.ts` | `dkFetch` / `dkFetchBlob` — JSON + binary (PDF) access through the proxy. |
| `lib/hooks/useDk.ts` | `useDkQuery` / `useDkMutation` / `usePrefetch` — TanStack Query wrappers; every key is prefixed with the active company id so switching companies is instant and never leaks data across tokens. |
| `lib/stores/companies.ts` | zustand + localStorage token wallet — one token per company, unlimited companies. |
| `components/ui/*` | Design system: cards, tables, dialogs, toasts, gauges, strip meters, sparklines. |
| `docs/api/*.md` | Per-module API reference generated from the Postman collection (`dkPlus_api.json`). |
| `docs/CONVENTIONS.md` | The patterns every module page follows. |

## Modules

Overview (live KPI dashboard) · Analytics · Calculator (dk pricing engine) · Companies (token wallet)
· Customers · Sales (invoices/orders/quotes/salespeople/payment types) · Products (catalogue,
inventory ops, barcodes) · Vendors (invoices, approvals, purchase orders) · Projects · Members
· General Ledger · General (employees, payments, currencies, table explorer) · Time Clock
· Webhooks · Tokens & Access · Global search (⌘K).

## UX principles

Built against Shneiderman's 8 golden rules: consistent patterns from one shared kit, ⌘K + hover
prefetching for shortcuts, toast feedback on every mutation, dialogs that close the loop, validation
and confirm-dialogs to prevent errors, reversal affordances (e.g. invoice reverse), user-initiated
refresh everywhere, and labels-over-codes to keep memory load low.
