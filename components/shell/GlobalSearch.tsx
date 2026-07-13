"use client";

import { Loader2, Package, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dkFetch } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";
import { useT } from "@/lib/i18n";

interface CustomerHit {
  Number: string;
  Name: string;
}
interface ProductHit {
  ItemCode: string;
  Description: string;
}

/**
 * Header search ("Type Client Name or ID"). Debounced live results across
 * customers and products; ⌘K / Ctrl+K focuses it from anywhere
 * (Shneiderman #2 — shortcuts for frequent users).
 */
export function GlobalSearch() {
  const company = useActiveCompany();
  const router = useRouter();
  const t = useT();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const enabled = !!company && debounced.length >= 2;

  const customers = useQuery({
    queryKey: [company?.id, "search", "customers", debounced],
    queryFn: ({ signal }) =>
      dkFetch<CustomerHit[]>(`/customer/search/${encodeURIComponent(debounced)}`, {
        token: company!.token,
        signal,
      }),
    enabled,
    staleTime: 30_000,
  });

  const products = useQuery({
    queryKey: [company?.id, "search", "products", debounced],
    queryFn: ({ signal }) =>
      dkFetch<ProductHit[]>(`/Product/search/${encodeURIComponent(debounced)}`, {
        token: company!.token,
        signal,
      }),
    enabled,
    staleTime: 30_000,
  });

  const loading = customers.isFetching || products.isFetching;
  const custHits = (customers.data ?? []).slice(0, 5);
  const prodHits = (products.data ?? []).slice(0, 5);
  const hasResults = custHits.length > 0 || prodHits.length > 0;

  function go(href: string) {
    setOpen(false);
    setTerm("");
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <div className="flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-1.5 pr-4 transition-colors focus-within:border-accent-deep">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-white">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
        </span>
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => term && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && debounced) go(`/search?q=${encodeURIComponent(debounced)}`);
          }}
          placeholder={company ? t("shell.searchPlaceholder") : t("shell.searchDisabled")}
          disabled={!company}
          aria-label="Global search"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mist disabled:cursor-not-allowed"
        />
        <kbd className="hidden shrink-0 rounded-md border border-line bg-haze px-1.5 py-0.5 text-[10px] font-medium text-fog lg:block">
          ⌘K
        </kbd>
      </div>

      {open && enabled && (
        <div className="fade-up absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-pop">
          {!hasResults && !loading && (
            <p className="px-3 py-4 text-center text-sm text-fog">
              {t("shell.searchNoMatches", { term: debounced })}
            </p>
          )}
          {custHits.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-mist">
                {t("shell.searchCustomers")}
              </p>
              {custHits.map((c) => (
                <button
                  key={c.Number}
                  onClick={() => go(`/customers/${encodeURIComponent(c.Number)}`)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-haze"
                >
                  <Users className="size-4 shrink-0 text-fog" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{c.Name}</span>
                  <span className="text-xs text-mist tnum">{c.Number}</span>
                </button>
              ))}
            </>
          )}
          {prodHits.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-mist">
                {t("shell.searchProducts")}
              </p>
              {prodHits.map((p) => (
                <button
                  key={p.ItemCode}
                  onClick={() => go(`/products/${encodeURIComponent(p.ItemCode)}`)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-haze"
                >
                  <Package className="size-4 shrink-0 text-fog" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.Description}</span>
                  <span className="text-xs text-mist tnum">{p.ItemCode}</span>
                </button>
              ))}
            </>
          )}
          {hasResults && (
            <button
              onClick={() => go(`/search?q=${encodeURIComponent(debounced)}`)}
              className="mt-1 w-full cursor-pointer rounded-xl border-t border-line px-3 py-2.5 text-center text-[13px] font-medium text-accent-dark hover:bg-accent-soft"
            >
              {t("shell.searchAll")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
