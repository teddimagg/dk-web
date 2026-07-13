# Input optimization contract (wave 2)

Goal: every input in the app is optimized — entity references become autocompletes, non-obvious
fields get a "?" explanation, and all inputs use correct semantics. This file is the shared spec
for the per-module sweeps.

## Primitives (already built — import, don't re-implement)

- `Field` (`@/components/ui/Input`) now takes `help?: string` — renders a "?" tooltip
  (`@/components/ui/Help`) next to the label. Use it for every field whose meaning, format or
  side effect isn't self-evident. Help texts are translated: add `<module>.help.*` keys (en + is)
  to your module dictionary.
- `Combobox` (`@/components/ui/Combobox`) — accessible autocomplete (↑/↓/Enter/Esc, free text
  allowed, clear button, loading state). Usually you want a picker instead:
- Entity pickers (`@/components/shell/pickers`): `CustomerPicker`, `ProductPicker`,
  `VendorPicker`, `SalespersonPicker`, `WarehousePicker`, `PaymentModePicker`,
  `PaymentTermPicker`, `EmployeePicker`, `ProjectPicker`, `CurrencyPicker`,
  `CustomerGroupPicker`, `ProductGroupPicker`, `LedgerAccountPicker`.
  All take `{ value, onChange(value), placeholder?, disabled?, required?, autoFocus? }` and are
  drop-in replacements for `<Input>` inside a `<Field>`. They show names, submit codes, and
  still allow free text (dk accepts values outside the list).

## Rules

1. **Autocomplete/dropdown where applicable.** Any field whose value is a dk entity code MUST use
   the matching picker: customer number → CustomerPicker; item code → ProductPicker; vendor →
   VendorPicker; salesperson → SalespersonPicker; warehouse → WarehousePicker; payment mode/term →
   pickers; employee → EmployeePicker; project → ProjectPicker; currency → CurrencyPicker;
   customer/product group → group pickers; GL account → LedgerAccountPicker. A fixed enum from the
   API docs (status values, priorities, output formats) becomes a `<Select>` with translated
   labels — never free text.
2. **"?" where not self-evident.** Fields like reference numbers, vouchers, date filters with
   server-side semantics ("greater or equal"), destructive toggles, dk-specific concepts
   (SettledType, ClaimStatus, fund id, table keys) get `help` text explaining what dk does with
   the value — one or two sentences, translated (en + is) in your module dict.
3. **Input semantics.** Dates → `type="date"` (or `datetime-local` where time matters); amounts &
   quantities → `type="number"` with sensible `step`/`min` + `inputMode="decimal"`; counts →
   `inputMode="numeric"`; emails → `type="email"`; URLs → `type="url"`; phone → `type="tel"`;
   search boxes → `role="searchbox"` or `type="search"`. Monetary/quantity inputs align right with
   `tnum`.
4. **Forms**: Enter submits (wrap in `<form onSubmit>`), the primary button is `disabled` until
   required fields validate, and validation errors render inline via `Field`'s `error` prop —
   never only as a toast.
5. Don't change fetching/mutation logic or visual design; this is an input-layer sweep only.
6. Never remove the ability to type a raw code — pickers allow free text by design.
