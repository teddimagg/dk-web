import type { ReactNode } from "react";
import { Card, CardTitle } from "./Card";
import { StripMeter } from "./charts";
import { clsx } from "clsx";

/**
 * Reference-style stat card: icon chip + label header, huge numeral with a
 * superscript unit, two side stats, barcode meter at the bottom.
 */
export function StatCard({
  icon,
  title,
  value,
  unit,
  left,
  right,
  meter,
  children,
  className,
  action,
}: {
  icon?: ReactNode;
  title: string;
  value: ReactNode;
  unit?: string;
  left?: { value: ReactNode; label: string };
  right?: { value: ReactNode; label: string };
  meter?: number;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Card className={clsx("flex flex-col gap-4 p-5", className)}>
      <CardTitle icon={icon} action={action}>
        {title}
      </CardTitle>
      <div className="flex items-end justify-between gap-3">
        {left && (
          <div className="min-w-0">
            <p className="stat-numeral text-lg text-ink tnum">{left.value}</p>
            <p className="truncate text-xs text-fog">{left.label}</p>
          </div>
        )}
        <div className="stat-numeral text-center text-[2.6rem] leading-none text-ink tnum">
          {value}
          {unit && <sup className="ml-0.5 text-base font-normal text-fog">{unit}</sup>}
        </div>
        {right && (
          <div className="min-w-0 text-right">
            <p className="stat-numeral text-lg text-ink tnum">{right.value}</p>
            <p className="truncate text-xs text-fog">{right.label}</p>
          </div>
        )}
      </div>
      {meter != null && <StripMeter value={meter} />}
      {children}
    </Card>
  );
}
