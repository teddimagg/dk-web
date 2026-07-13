"use client";

import { useCallback, useEffect } from "react";
import { useLocale, type Locale } from "./locale";
import { commonDict } from "./dict/common";
import { customersDict } from "./dict/customers";
import { salesDict } from "./dict/sales";
import { productsDict } from "./dict/products";
import { vendorsDict } from "./dict/vendors";
import { projectsDict } from "./dict/projects";
import { ledgerDict } from "./dict/ledger";
import { membersDict } from "./dict/members";
import { generalDict } from "./dict/general";
import { platformDict } from "./dict/platform";

/**
 * Tiny i18n layer: flat dot-keys, per-module dictionaries merged here, `{var}`
 * interpolation, English fallback, unknown keys render as the key itself so
 * gaps are visible instead of silent.
 */

const en: Record<string, string> = {
  ...commonDict.en,
  ...customersDict.en,
  ...salesDict.en,
  ...productsDict.en,
  ...vendorsDict.en,
  ...projectsDict.en,
  ...ledgerDict.en,
  ...membersDict.en,
  ...generalDict.en,
  ...platformDict.en,
};

const is: Record<string, string> = {
  ...commonDict.is,
  ...customersDict.is,
  ...salesDict.is,
  ...productsDict.is,
  ...vendorsDict.is,
  ...projectsDict.is,
  ...ledgerDict.is,
  ...membersDict.is,
  ...generalDict.is,
  ...platformDict.is,
};

const dictionaries: Record<Locale, Record<string, string>> = { en, is };

export type TVars = Record<string, string | number>;

export function translate(locale: Locale, key: string, vars?: TVars): string {
  let s = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

/** Translation hook: `const t = useT(); t("nav.overview"); t("x.y", {n: 3})`. */
export function useT() {
  const locale = useLocale((s) => s.locale);
  return useCallback((key: string, vars?: TVars) => translate(locale, key, vars), [locale]);
}

/** Keeps <html lang> in sync with the chosen language (mount in the shell). */
export function useHtmlLang() {
  const locale = useLocale((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}
