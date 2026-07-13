"use client";

import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";

/**
 * dk entity pickers — every reference field in the app (customer, product,
 * salesperson, warehouse, payment term/mode, employee, project, vendor,
 * currency, groups, ledger account) uses one of these instead of a raw text
 * input, so users pick real values (recognition over recall) while free text
 * stays possible for edge cases.
 */

export interface PickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

function useDebounced(value: string, ms = 300): string {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** Client-side filter for static reference lists. */
function filterOptions(options: ComboOption[], term: string): ComboOption[] {
  const q = term.trim().toLowerCase();
  if (!q) return options.slice(0, 50);
  return options
    .filter(
      (o) =>
        o.value.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        (o.sub ?? "").toLowerCase().includes(q),
    )
    .slice(0, 50);
}

/** Static-list picker over a cached reference endpoint. */
function StaticPicker({
  path,
  queryKey,
  toOption,
  props,
}: {
  path: string;
  queryKey: string;
  toOption: (row: Record<string, unknown>) => ComboOption | null;
  props: PickerProps;
}) {
  const t = useT();
  const [term, setTerm] = useState("");
  const query = useDkQuery<Record<string, unknown>[]>([queryKey], path, {
    staleTime: 5 * 60_000,
  });
  const options = useMemo(() => {
    const rows = Array.isArray(query.data) ? query.data : [];
    return rows.map(toOption).filter((o): o is ComboOption => !!o);
  }, [query.data, toOption]);
  const selected = options.find((o) => o.value === props.value);

  return (
    <Combobox
      {...props}
      options={filterOptions(options, term)}
      loading={query.isLoading}
      onSearch={setTerm}
      selectedLabel={selected && selected.label !== props.value ? selected.label : undefined}
      emptyText={t("picker.noMatches")}
    />
  );
}

/** Server-search picker (customer/product/vendor have real search routes). */
function SearchPicker({
  searchPath,
  queryKey,
  toOption,
  props,
}: {
  searchPath: (term: string) => string;
  queryKey: string;
  toOption: (row: Record<string, unknown>) => ComboOption | null;
  props: PickerProps;
}) {
  const t = useT();
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term);
  const enabled = debounced.trim().length >= 2;
  const query = useDkQuery<Record<string, unknown>[]>(
    [queryKey, "picker", debounced],
    searchPath(encodeURIComponent(debounced.trim())),
    { enabled, staleTime: 60_000, placeholderData: keepPreviousData },
  );
  const options = useMemo(() => {
    const rows = Array.isArray(query.data) ? query.data : [];
    return rows.map(toOption).filter((o): o is ComboOption => !!o).slice(0, 25);
  }, [query.data, toOption]);

  return (
    <Combobox
      {...props}
      options={enabled ? options : []}
      loading={enabled && query.isFetching}
      onSearch={setTerm}
      emptyText={enabled ? t("picker.noMatches") : t("picker.typeToSearch")}
    />
  );
}

const s = (v: unknown): string => (v == null ? "" : String(v));

export function CustomerPicker(props: PickerProps) {
  return (
    <SearchPicker
      props={props}
      queryKey="customers"
      searchPath={(term) => `/customer/search/${term}`}
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Name) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function ProductPicker(props: PickerProps) {
  return (
    <SearchPicker
      props={props}
      queryKey="products"
      searchPath={(term) => `/Product/search/${term}`}
      toOption={(r) =>
        r.ItemCode
          ? { value: s(r.ItemCode), label: s(r.Description) || s(r.ItemCode), sub: s(r.ItemCode) }
          : null
      }
    />
  );
}

export function VendorPicker(props: PickerProps) {
  return (
    <SearchPicker
      props={props}
      queryKey="vendors"
      searchPath={(term) => `/vendor/search/${term}`}
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Name) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function SalespersonPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="salespeople-all"
      path="/sales/person/page/1/100"
      toOption={(r) =>
        r.Number
          ? { value: s(r.Number), label: s(r.NameOnSalesOrders) || s(r.Number), sub: s(r.Number) }
          : null
      }
    />
  );
}

export function WarehousePicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="warehouses"
      path="/productwarehouse"
      toOption={(r) =>
        r.Code ? { value: s(r.Code), label: s(r.Name) || s(r.Code), sub: s(r.Code) } : null
      }
    />
  );
}

export function PaymentModePicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="payment-modes"
      path="/general/payment/mode"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Description) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function PaymentTermPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="payment-terms"
      path="/general/payment/term"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Description) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function EmployeePicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="employees-all"
      path="/general/employee"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Name) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function ProjectPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="projects-all"
      path="/project"
      toOption={(r) =>
        r.Number
          ? { value: s(r.Number), label: s(r.Name) || s(r.Description) || s(r.Number), sub: s(r.Number) }
          : null
      }
    />
  );
}

export function CurrencyPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="currencies"
      path="/general/currency"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Description) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function CustomerGroupPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="customergroups"
      path="/customergroup"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Description) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function ProductGroupPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="productgroups"
      path="/productgroup"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Description) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}

export function LedgerAccountPicker(props: PickerProps) {
  return (
    <StaticPicker
      props={props}
      queryKey="gl-accounts"
      path="/generalLedger/account"
      toOption={(r) =>
        r.Number ? { value: s(r.Number), label: s(r.Name) || s(r.Number), sub: s(r.Number) } : null
      }
    />
  );
}
