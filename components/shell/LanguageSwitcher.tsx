"use client";

import { clsx } from "clsx";
import { useLocale, type Locale } from "@/lib/i18n/locale";

const OPTIONS: { id: Locale; label: string; aria: string }[] = [
  { id: "is", label: "IS", aria: "Íslenska" },
  { id: "en", label: "EN", aria: "English" },
];

/** Compact IS/EN toggle in the header. */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border border-line bg-white p-0.5"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => setLocale(o.id)}
          aria-pressed={locale === o.id}
          aria-label={o.aria}
          className={clsx(
            "cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
            locale === o.id ? "bg-ink text-white shadow-sm" : "text-fog hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
