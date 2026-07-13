import type { ReactNode } from "react";

/** Big display heading like "Overview Panel" with eyebrow + actions. */
export function PageHeader({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[13px] text-fog">{eyebrow}</p>}
        <h1 className="text-4xl font-medium tracking-tight text-ink md:text-5xl">{title}</h1>
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
