"use client";

import type { CSSProperties, ReactNode } from "react";
import { NavTabs } from "@/components/ui/Tabs";
import { moduleFor } from "@/lib/modules";
import { useT } from "@/lib/i18n";

/**
 * Module chrome: every module wraps its pages in this frame, which stamps the
 * module's signature color on the header chip, a soft tinted wash and the
 * active section tab — so any screen tells you at a glance which facet of the
 * system you're in. Exposes --module-accent / --module-soft to descendants.
 */
export function ModuleFrame({
  href,
  title,
  intro,
  tabs,
  actions,
  children,
}: {
  /** Module root href, e.g. "/customers" — resolves identity from the registry. */
  href: string;
  /** Big heading (already translated by the caller). */
  title: string;
  /** Optional one-line description under the heading. */
  intro?: string;
  tabs?: { href: string; label: string; exact?: boolean }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  const mod = moduleFor(href);
  if (!mod) return <>{children}</>;

  return (
    <div
      className="space-y-6"
      style={{ "--module-accent": mod.accent, "--module-soft": mod.soft } as CSSProperties}
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-10 h-44 rounded-b-[3rem]"
          style={{
            background: `radial-gradient(55% 90% at 18% 0%, ${mod.soft} 0%, transparent 75%)`,
          }}
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-ink shadow-card [&>svg]:size-6"
            style={{ background: mod.accent }}
          >
            <mod.icon />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-fog">
              {t(`module.${mod.key}.label`)} · dkPanel
            </p>
            <h1 className="truncate text-3xl font-medium tracking-tight text-ink md:text-4xl">
              {title}
            </h1>
          </div>
          {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {intro && <p className="relative mt-3 max-w-2xl text-sm text-fog">{intro}</p>}
      </div>
      {tabs && tabs.length > 0 && <NavTabs tabs={tabs} tone="module" />}
      {children}
    </div>
  );
}
