"use client";

import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Help } from "./Help";

const base =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-mist transition-colors outline-none focus:border-accent-deep focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:bg-haze";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={clsx(base, "h-10", className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={clsx(base, "py-2.5 min-h-24", className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={clsx(base, "h-10 appearance-none pr-8 cursor-pointer", className)} {...rest}>
        {children}
      </select>
    );
  },
);

/**
 * Labeled form field with optional hint/error and a "?" explanation for
 * fields that aren't self-evident — keeps forms consistent app-wide.
 */
export function Field({
  label,
  hint,
  help,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  /** Tooltip text behind a "?" icon next to the label. */
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-soot">
        {label}
        {required && <span className="text-danger">*</span>}
        {help && <Help text={help} />}
        {hint && <span className="ml-auto text-xs font-normal text-mist">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
