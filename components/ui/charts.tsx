"use client";

import { clsx } from "clsx";

/**
 * Signature visual widgets from the reference design: gauge arcs, the
 * barcode-style strip meter (green + black head, gray tail) and thin-bar
 * sparklines. Pure SVG/CSS — no chart library, instant paint.
 */

/** Arc gauge with a green dot at the current value ("71,74 %" widget). */
export function Gauge({
  value,
  size = 150,
  label,
  className,
}: {
  value: number; // 0..100
  size?: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const stroke = size * 0.075;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;
  const angle = startAngle + (sweep * pct) / 100;
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(startAngle + sweep);
  const [vx, vy] = toXY(angle);
  const largeAll = sweep > 180 ? 1 : 0;
  const valueSweep = (sweep * pct) / 100;
  const largeVal = valueSweep > 180 ? 1 : 0;

  return (
    <div className={clsx("relative inline-grid place-items-center", className)} role="img" aria-label={`Gauge at ${pct.toFixed(0)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeAll} 1 ${ex} ${ey}`}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeVal} 1 ${vx} ${vy}`}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle cx={vx} cy={vy} r={stroke * 0.85} fill="var(--color-accent)" stroke="white" strokeWidth={2.5} />
      </svg>
      {label && <div className="absolute inset-0 grid place-items-center">{label}</div>}
    </div>
  );
}

/**
 * Barcode-style meter: a green block, a black block, then a long tail of thin
 * gray ticks — the meter at the bottom of the reference stat cards.
 */
export function StripMeter({
  value,
  className,
  ticks = 42,
}: {
  value: number; // 0..100
  className?: string;
  ticks?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const filled = Math.round((ticks * pct) / 100);
  const greenEnd = Math.max(1, Math.round(filled * 0.55));
  return (
    <div
      className={clsx("flex h-6 items-stretch gap-[3px]", className)}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: ticks }).map((_, i) => {
        const isFilled = i < filled;
        const isGreen = i < greenEnd;
        return (
          <span
            key={i}
            className={clsx(
              "rounded-[2px] transition-colors",
              isFilled ? (isGreen ? "bg-accent" : "bg-ink") : "bg-line",
            )}
            style={{ width: isFilled ? 7 : 3 }}
          />
        );
      })}
    </div>
  );
}

/** Thin-bar sparkline with optional highlight window (Timely Closures chart). */
export function BarSpark({
  values,
  height = 72,
  highlightFrom,
  className,
}: {
  values: number[];
  height?: number;
  /** Index from which bars render green. */
  highlightFrom?: number;
  className?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={clsx("flex items-end gap-[2px]", className)} style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={clsx(
            "flex-1 rounded-t-[1px] min-w-[2px]",
            highlightFrom != null && i >= highlightFrom ? "bg-accent" : "bg-ink/70",
          )}
          style={{ height: `${Math.max(3, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** Horizontal split bar (verified vs pending style). */
export function SplitBar({
  segments,
  className,
}: {
  segments: { value: number; color: string; label?: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={clsx("flex h-2.5 w-full overflow-hidden rounded-full bg-line", className)} aria-hidden>
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
      ))}
    </div>
  );
}
