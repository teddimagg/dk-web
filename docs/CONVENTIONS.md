# dkPanel — module builder conventions

You are building one module of a Next.js 15 (App Router, React 19, Tailwind v4) dashboard for the
dkPlus ERP API. The core scaffold already exists — **use it, never modify it**.

## Hard rules

1. **Only create files inside your assigned directories**: `app/<your-module>/**` and
   `lib/api/types/<your-module>.ts`. Never edit shared files (`app/layout.tsx`, `app/globals.css`,
   `components/**`, `lib/hooks/useDk.ts`, `lib/api/client.ts`, `lib/stores/**`, `lib/modules.ts`,
   `app/api/**`, `package.json`). If something you need is missing, build it locally inside your
   module folder.
2. Every route in your module's API reference doc must be reachable from the UI. GET routes render
   data; POST/PUT/PATCH/DELETE routes get forms/buttons with confirmation and toasts. PDF routes get
   download buttons; HTML routes get preview dialogs (render into `<iframe srcDoc>`); email routes get
   a small "send" dialog.
3. `"use client"` on every page — all data comes from client hooks. No server components with data.
4. TypeScript strict: type your API responses in `lib/api/types/<module>.ts` (PascalCase fields,
   e.g. `Number`, `Name`, `TotalAmountWithTax`). Mark uncertain fields optional. Never use `any`
   (use `unknown` + narrowing if needed).

## Data layer (already built — import, don't re-implement)

```tsx
import { useDkQuery, useDkMutation, usePrefetch } from "@/lib/hooks/useDk";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Query (list page with paging — dk uses /page/:page/:count style URLs):
const { data, isLoading, isFetching, error, refetch } = useDkQuery<Customer[]>(
  ["customers", "page", page],           // key WITHOUT company id (added automatically)
  `/customer/page/${page}/${COUNT}`,
  { placeholderData: keepPreviousData }, // smooth pagination
);
const hasMore = (data?.length ?? 0) === COUNT;

// Mutation with cache invalidation + feedback:
const create = useDkMutation<Customer>({ invalidates: [["customers"]] });
create.mutate(
  { path: "/customer", method: "POST", body: form },
  { onSuccess: () => { toast.success("Customer created"); router.push(...); },
    onError: (e) => toast.error("Could not create customer", e.message) },
);

// Hover prefetch on table rows so detail pages open instantly:
const prefetch = usePrefetch();
<DataTable onRowHover={(r) => prefetch(["customer", r.Number], `/customer/${r.Number}`)} ... />

// PDF download (goes around the JSON pipeline):
const blob = await dkFetchBlob(`/sales/invoice/${n}/pdf`, { token: company!.token });
downloadBlob(blob, `invoice-${n}.pdf`);
// for token: import { useActiveCompany } from "@/lib/stores/companies";
```

The proxy at `/api/dk/*` handles auth + a 45 s server cache; you never call api.dkplus.is directly.

## UI kit (`@/components/ui/*`) — use these, keep the app consistent

- `Button` (`variant: primary|secondary|ghost|danger|accent`, `size, loading`)
- `Card`, `CardTitle` (icon chip + gray label + optional right-side `action`)
- `Badge` (`tone: neutral|green|red|amber|blue|ink`)
- `Input`, `Textarea`, `Select`, `Field` (label + error wrapper)
- `Dialog` (`open,onClose,title,subtitle,wide`), `ConfirmDialog` — required before every DELETE/destructive call
- `useToast()` → `toast.success/error/info(title, detail?)` — required after every mutation
- `DataTable<T>` (`columns: {key,header,render,align,width}[]`, `rows`, `rowKey`, `onRowClick`,
  `onRowHover`, `loading`, `error`, `onRetry`, `emptyTitle`, `emptyBody`, `footer`)
- `Pagination` (`page,onPage,hasMore,loading`) — put inside DataTable's `footer`
- `Tabs` (state-driven) and `NavTabs` (link-driven section nav)
- `PageHeader` (`eyebrow,title,actions`) — top of every page
- `KV` (label/value grid for detail pages), `JsonView` (collapsible raw payload — add at the bottom of every detail page)
- `StatCard`, `Gauge`, `StripMeter`, `BarSpark`, `SplitBar` (reference-style visuals)
- `Skeleton`, `TableSkeleton`, `EmptyState`, `ErrorState`

Formatting (`@/lib/format`): `formatAmount(n, currency?)` (ISK default), `formatNumber`, `formatInt`,
`formatCompact`, `formatPercent`, `formatDate`, `formatDateTime`, `timeAgo`, `formatHours`.
Icelandic locale — decimal commas — is intentional. Always `formatDate` ISO strings; it hides
dk's `0001-01-01` sentinel dates.

## Page pattern

Your module gets a `layout.tsx` presenting the section nav, then one page per area:

```tsx
// app/<module>/layout.tsx
"use client";
import { NavTabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="<Module> module" title="<Module>" />
      <NavTabs tabs={[{ href: "/sales/invoices", label: "Invoices" }, ...]} />
      {children}
    </div>
  );
}
```

- List pages: `Card` containing a toolbar row (search input, filters, "Create" button on the right)
  then `DataTable` + `Pagination`. Client-side text filter over the loaded page is fine when the API
  has no search route.
- Detail pages: dynamic segment (`[number]/page.tsx`), header with entity name + action buttons,
  `KV` grid(s) in Cards, related-data tables (often via `Tabs`), `JsonView` at the bottom.
  Route param values MUST be `decodeURIComponent`-ed (`useParams` returns encoded strings).
- Forms: `Dialog` for create/edit with `Field`-wrapped inputs; disable submit while pending
  (`loading` on Button); validate required fields before submitting; show field errors inline.
- Deletes: `ConfirmDialog` naming the entity.
- Empty/error states are built into DataTable — always pass `error` and `onRetry={refetch}`.

## i18n (en/is)

Every user-facing string goes through `const t = useT()` from `@/lib/i18n` — `t("module.key")`,
interpolation via `t("key", {var})`. Each module owns `lib/i18n/dict/<module>.ts` with `en` and
`is` variants (flat dot-keys prefixed by the module name); shared strings live in
`dict/common.ts` (`ui.*`, `nav.*`, `module.*`). The locale store is `lib/i18n/locale.ts` and the
header has an IS/EN switcher. Data values from the API are never translated. Numbers/dates keep
Icelandic formatting (lib/format.ts) in both languages by design.

## Module identity

Each module has a signature color (`accent`/`soft` in `lib/modules.ts`). Module layouts wrap
content in `<ModuleFrame href="/<module>" title intro? tabs actions?>` from
`@/components/shell/ModuleFrame` — it renders the tinted header chip, soft wash, translated
eyebrow, and accent-colored active tabs, and exposes `--module-accent`/`--module-soft` CSS vars
to descendants. Don't hand-roll module headers.

## Design language (match exactly)

Light, minimal, generous whitespace. Near-black `ink` text, gray `fog` secondary, `#76FB91` accent
used sparingly (badges, highlights, active states). Cards are white, rounded-card (24 px), subtle
shadow. Numbers use `tnum` class. Icons: `lucide-react`, size-4 default. Buttons are pill-shaped.
Never introduce new colors, fonts, or shadows — the tokens in globals.css are the palette.

## UX contract (Shneiderman)

Consistency (shared kit only), shortcuts (hover-prefetch, Enter submits dialogs/forms), feedback
(toast every mutation, `isFetching` spinners), closure (success toasts say what happened), error
prevention (validation + ConfirmDialog), reversal (link back, note when an action is irreversible
in the confirm body), user control (no auto-refresh without a visible Refresh button), low memory
load (labels over codes, KV over raw JSON, `JsonView` for the full payload).
