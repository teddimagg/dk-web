"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** In-page tab row (state-driven). */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: ReactNode; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-full bg-line/60 p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            "cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
            active === t.id ? "bg-ink text-white shadow-sm" : "text-fog hover:text-ink",
          )}
        >
          {t.label}
          {t.count != null && (
            <span className={clsx("ml-1.5 tnum", active === t.id ? "text-accent" : "text-mist")}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Sub-navigation tabs for module sections (link-driven). `tone="module"`
 * paints the active pill in the surrounding module's signature color
 * (--module-accent from ModuleFrame) so each facet stays recognizable.
 */
export function NavTabs({
  tabs,
  tone = "ink",
}: {
  tabs: { href: string; label: string; exact?: boolean }[];
  tone?: "ink" | "module";
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-white border border-line p-1 w-fit shadow-card">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={
              active && tone === "module"
                ? { background: "var(--module-accent, var(--color-ink))" }
                : undefined
            }
            className={clsx(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
              active
                ? tone === "module"
                  ? "text-ink shadow-sm"
                  : "bg-ink text-white shadow-sm"
                : "text-fog hover:text-ink hover:bg-haze",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
