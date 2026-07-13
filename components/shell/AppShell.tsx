"use client";

import { clsx } from "clsx";
import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MODULES } from "@/lib/modules";
import { useCompanies } from "@/lib/stores/companies";
import { useHtmlLang, useT } from "@/lib/i18n";
import { CompanySwitcher } from "./CompanySwitcher";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { Onboarding } from "./Onboarding";

const PRIMARY = [
  { href: "/", key: "nav.overview", exact: true },
  { href: "/analytics", key: "nav.analytics" },
  { href: "/companies", key: "nav.companies" },
  { href: "/calculator", key: "nav.calculator" },
];

function ModulesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useT();
  const inModule = MODULES.some((m) => pathname.startsWith(m.href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          "flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
          inModule ? "bg-ink text-white shadow-sm" : "text-fog hover:text-ink",
        )}
      >
        <LayoutGrid className="size-4" />
        {t("nav.modules")}
        <ChevronDown className={clsx("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="fade-up absolute left-1/2 top-full z-50 mt-3 w-[560px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-3xl border border-line bg-white p-2 shadow-pop"
        >
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {MODULES.map((m) => {
              const active = pathname.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  role="menuitem"
                  className={clsx(
                    "flex items-start gap-3 rounded-2xl p-3 transition-colors",
                    active ? "bg-accent-soft" : "hover:bg-haze",
                  )}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-ink [&>svg]:size-4.5"
                    style={{ background: m.accent }}
                  >
                    <m.icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">
                      {t(`module.${m.key}.label`)}
                    </span>
                    <span className="block truncate text-xs text-fog">{t(`module.${m.key}.desc`)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { companies, hydrated } = useCompanies();
  const t = useT();
  useHtmlLang();

  // Everything except company management needs a connected company.
  const needsCompany = pathname !== "/companies";
  const showOnboarding = hydrated && companies.length === 0 && needsCompany;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-6">
          <Link href="/" aria-label="Overview" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {PRIMARY.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    active ? "bg-ink text-white shadow-sm" : "text-fog hover:text-ink",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <ModulesMenu />
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <GlobalSearch />
            <LanguageSwitcher />
            <CompanySwitcher />
          </div>
        </div>

        {/* Mobile nav row */}
        <div className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {PRIMARY.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium",
                  active ? "bg-ink text-white" : "text-fog",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          {MODULES.map((m) => {
            const active = pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                style={active ? { background: m.accent } : undefined}
                className={clsx(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium",
                  active ? "text-ink" : "text-fog",
                )}
              >
                {t(`module.${m.key}.label`)}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        {!hydrated ? (
          <div className="space-y-4">
            <div className="skeleton h-12 w-72 rounded-2xl" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="skeleton h-48 rounded-card" />
              <div className="skeleton h-48 rounded-card" />
              <div className="skeleton h-48 rounded-card" />
            </div>
          </div>
        ) : showOnboarding ? (
          <Onboarding />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
