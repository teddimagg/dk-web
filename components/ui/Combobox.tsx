"use client";

import { clsx } from "clsx";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

export interface ComboOption {
  value: string;
  label: string;
  /** Secondary line (e.g. the entity's number or description). */
  sub?: string;
}

/**
 * Accessible autocomplete input — the backbone of every entity picker.
 * Free text stays allowed (dk accepts values that may not be in the list),
 * suggestions are provided by the parent, keyboard: ↑/↓ navigate, Enter picks,
 * Esc closes. The visible input shows the picked option's label with the raw
 * value as a chip, so users see names instead of codes (recognition over
 * recall) while dk still receives the code.
 */
export function Combobox({
  value,
  onChange,
  options,
  loading,
  placeholder,
  disabled,
  required,
  emptyText,
  /** Called as the user types (parents debounce their own queries). */
  onSearch,
  /** Label of the currently selected value, shown as a chip under the input. */
  selectedLabel,
  autoFocus,
  inputMode,
}: {
  value: string;
  onChange: (value: string, option?: ComboOption) => void;
  options: ComboOption[] | undefined;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  emptyText?: string;
  onSearch?: (term: string) => void;
  selectedLabel?: string;
  autoFocus?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [options]);

  const visible = options ?? [];
  const showList = open && (loading || visible.length > 0 || (value.trim().length > 0 && emptyText));

  function pick(opt: ComboOption) {
    onChange(opt.value, opt);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={!!showList}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          inputMode={inputMode}
          value={value}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            onSearch?.(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (visible.length > 0 || loading) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, visible.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              if (open && visible[active]) {
                e.preventDefault();
                pick(visible[active]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={clsx(
            "h-10 w-full rounded-xl border border-line bg-white px-3.5 pr-16 text-sm text-ink placeholder:text-mist",
            "transition-colors outline-none focus:border-accent-deep focus:ring-2 focus:ring-accent/40",
            "disabled:opacity-50 disabled:bg-haze",
          )}
        />
        <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && <Loader2 className="size-3.5 animate-spin text-mist" />}
          {value && !disabled && (
            <button
              type="button"
              aria-label={t("picker.clear")}
              onClick={() => {
                onChange("");
                onSearch?.("");
                inputRef.current?.focus();
              }}
              className="cursor-pointer rounded-full p-0.5 text-mist hover:bg-haze hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label={t("picker.toggle")}
            onClick={() => {
              setOpen((o) => !o);
              inputRef.current?.focus();
            }}
            className="cursor-pointer rounded-full p-0.5 text-mist hover:text-ink"
          >
            <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
          </button>
        </span>
      </div>

      {selectedLabel && (
        <p className="mt-1 flex items-center gap-1 text-xs text-accent-dark">
          <Check className="size-3" /> {selectedLabel}
        </p>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="fade-up absolute left-0 right-0 top-full z-[80] mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-line bg-white p-1 shadow-pop"
        >
          {loading && visible.length === 0 && (
            <li className="px-3 py-2.5 text-[13px] text-fog">{t("picker.loading")}</li>
          )}
          {!loading && visible.length === 0 && emptyText && (
            <li className="px-3 py-2.5 text-[13px] text-fog">{emptyText}</li>
          )}
          {visible.map((opt, i) => (
            <li
              key={`${opt.value}-${i}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focus
                pick(opt);
              }}
              onMouseEnter={() => setActive(i)}
              className={clsx(
                "flex cursor-pointer items-baseline justify-between gap-3 rounded-xl px-3 py-2",
                i === active ? "bg-haze" : "",
              )}
            >
              <span className="min-w-0 truncate text-sm text-ink">{opt.label}</span>
              {opt.sub && <span className="shrink-0 text-xs text-mist tnum">{opt.sub}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
