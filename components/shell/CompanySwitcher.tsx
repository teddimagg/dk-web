"use client";

import { Check, ChevronDown, Plus, Building2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCompanies } from "@/lib/stores/companies";
import { useT } from "@/lib/i18n";
import { clsx } from "clsx";

function CompanyAvatar({ name, hue, size = 34 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl font-semibold text-ink"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, hsl(${hue} 90% 72%), hsl(${hue + 40} 85% 82%))`,
      }}
      aria-hidden
    >
      {initials || <Building2 className="size-4" />}
    </span>
  );
}

/**
 * Active-company chip + dropdown. The active company is always visible in the
 * header (Shneiderman #8 — the user never has to remember which company's
 * data they're looking at).
 */
export function CompanySwitcher() {
  const { companies, activeId, setActive, hydrated } = useCompanies();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = companies.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hydrated) return <div className="skeleton h-10 w-40 rounded-full" />;

  if (!active) {
    return (
      <Link
        href="/companies"
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-ink transition-transform hover:brightness-95 active:scale-[0.98]"
      >
        <Plus className="size-4" /> {t("shell.connectCompany")}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white"
      >
        <CompanyAvatar name={active.name} hue={active.hue} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-40 truncate text-sm font-medium leading-tight text-ink">
            {active.name}
          </span>
          <span className="block text-xs leading-tight text-fog">{active.number}</span>
        </span>
        <ChevronDown className={clsx("size-4 text-fog transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="fade-up absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-white p-1.5 shadow-pop"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-mist">
            {t("shell.companies")}
          </p>
          {companies.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === activeId}
              onClick={() => {
                setActive(c.id);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-haze"
            >
              <CompanyAvatar name={c.name} hue={c.hue} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{c.name}</span>
                <span className="block text-xs text-fog">{c.number}</span>
              </span>
              {c.id === activeId && <Check className="size-4 shrink-0 text-accent-deep" />}
            </button>
          ))}
          <div className="mt-1 border-t border-line pt-1">
            <Link
              href="/companies"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-fog transition-colors hover:bg-haze hover:text-ink"
            >
              <Plus className="size-4" /> {t("shell.manageCompanies")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
