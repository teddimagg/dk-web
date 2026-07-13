"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "is";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

/**
 * UI language. Persisted per browser; zustand's persist rehydrates in a
 * microtask so SSR and the first client paint both render the default ("en")
 * and the stored choice applies right after mount — no hydration mismatch.
 */
export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "dk-locale" },
  ),
);
