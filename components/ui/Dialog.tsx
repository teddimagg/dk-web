"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import { useT } from "@/lib/i18n";

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useT();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={clsx(
        "m-auto w-full rounded-card bg-surface p-0 shadow-pop backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]",
        wide ? "max-w-3xl" : "max-w-lg",
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-fog">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label={t("ui.close")}
          className="cursor-pointer rounded-full p-1.5 text-mist transition-colors hover:bg-haze hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
    </dialog>
  );
}

/**
 * Destructive-action guard (Shneiderman #5, error prevention): explicit
 * confirmation with the affected entity named, destructive style, Esc to bail.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
}) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="text-sm leading-relaxed text-fog">{body}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("ui.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel ?? t("ui.delete")}
        </Button>
      </div>
    </Dialog>
  );
}
