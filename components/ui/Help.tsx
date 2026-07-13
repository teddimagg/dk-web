"use client";

import { HelpCircle } from "lucide-react";
import { useId, useState } from "react";

/**
 * Inline "?" affordance for fields whose meaning isn't self-evident.
 * Hover or keyboard-focus reveals the explanation; screen readers get it
 * via aria-describedby on the trigger.
 */
export function Help({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label="Explanation"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-full text-mist outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-deep"
      >
        <HelpCircle className="size-3.5" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="fade-up absolute bottom-full left-1/2 z-[90] mb-2 w-64 -translate-x-1/2 rounded-xl border border-line bg-ink px-3 py-2 text-xs font-normal normal-case leading-relaxed text-white shadow-pop"
        >
          {text}
        </span>
      )}
    </span>
  );
}
