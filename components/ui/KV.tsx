import type { ReactNode } from "react";
import { clsx } from "clsx";

/** Key–value grid for detail pages. Hides empty values to reduce noise. */
export function KV({
  items,
  columns = 2,
  className,
}: {
  items: { label: string; value: ReactNode }[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const visible = items.filter(
    (i) => i.value !== null && i.value !== undefined && i.value !== "" && i.value !== "–",
  );
  return (
    <dl
      className={clsx(
        "grid gap-x-8 gap-y-3",
        columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "",
        className,
      )}
    >
      {visible.map((i, idx) => (
        <div key={idx} className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2">
          <dt className="shrink-0 text-[13px] text-fog">{i.label}</dt>
          <dd className="min-w-0 truncate text-right text-sm font-medium text-ink tnum">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
