import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "green" | "red" | "amber" | "blue" | "ink";

const tones: Record<Tone, string> = {
  neutral: "bg-haze text-fog border-line",
  green: "bg-accent-soft text-accent-dark border-accent/40",
  red: "bg-danger-soft text-danger border-danger/20",
  amber: "bg-amber-soft text-[#9a6a10] border-amber/30",
  blue: "bg-info-soft text-info border-info/20",
  ink: "bg-ink text-white border-ink",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
