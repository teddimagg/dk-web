"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** One connected dkPlus company = one API token. */
export interface Company {
  id: string;
  token: string;
  name: string;
  number: string;
  ssn?: string;
  /** Accent hue used for the company avatar chip. */
  hue: number;
  addedAt: number;
}

interface CompaniesState {
  companies: Company[];
  activeId: string | null;
  /** True once localStorage has been rehydrated on the client. */
  hydrated: boolean;
  add: (c: Omit<Company, "id" | "hue" | "addedAt">) => Company;
  remove: (id: string) => void;
  setActive: (id: string) => void;
  rename: (id: string, name: string) => void;
}

const HUES = [140, 90, 200, 260, 20, 320];

export const useCompanies = create<CompaniesState>()(
  persist(
    (set, get) => ({
      companies: [],
      activeId: null,
      hydrated: false,
      add: (c) => {
        const existing = get().companies.find((x) => x.token === c.token);
        if (existing) {
          set({ activeId: existing.id });
          return existing;
        }
        const company: Company = {
          ...c,
          id: crypto.randomUUID(),
          hue: HUES[get().companies.length % HUES.length],
          addedAt: Date.now(),
        };
        set((s) => ({
          companies: [...s.companies, company],
          activeId: company.id,
        }));
        return company;
      },
      remove: (id) =>
        set((s) => {
          const companies = s.companies.filter((c) => c.id !== id);
          return {
            companies,
            activeId: s.activeId === id ? (companies[0]?.id ?? null) : s.activeId,
          };
        }),
      setActive: (id) => set({ activeId: id }),
      rename: (id, name) =>
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
    }),
    {
      name: "dk-companies",
      partialize: (s) => ({ companies: s.companies, activeId: s.activeId }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function useActiveCompany(): Company | null {
  return useCompanies((s) => s.companies.find((c) => c.id === s.activeId) ?? null);
}
