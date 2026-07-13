"use client";

import { clsx } from "clsx";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n";

type ToastTone = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  detail?: string;
  /** Optional undo/retry hook — Shneiderman #6, easy reversal of actions. */
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, detail?: string) => void;
  error: (title: string, detail?: string) => void;
  info: (title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const icons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="size-4.5 text-accent-deep" />,
  error: <XCircle className="size-4.5 text-danger" />,
  warning: <TriangleAlert className="size-4.5 text-amber" />,
  info: <Info className="size-4.5 text-info" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const t = useT();

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), t.tone === "error" ? 8000 : 4500);
    },
    [dismiss],
  );

  const api: ToastApi = {
    toast,
    success: (title, detail) => toast({ tone: "success", title, detail }),
    error: (title, detail) => toast({ tone: "error", title, detail }),
    info: (title, detail) => toast({ tone: "info", title, detail }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={clsx(
              "toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white/95 p-4 shadow-pop backdrop-blur",
              item.tone === "error" ? "border-danger/30" : "border-line",
            )}
          >
            <span className="mt-0.5 shrink-0">{icons[item.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              {item.detail && <p className="mt-0.5 break-words text-[13px] leading-snug text-fog">{item.detail}</p>}
              {item.action && (
                <button
                  onClick={() => {
                    item.action!.onClick();
                    dismiss(item.id);
                  }}
                  className="mt-2 cursor-pointer text-[13px] font-semibold text-accent-dark hover:underline"
                >
                  {item.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(item.id)}
              aria-label={t("ui.dismiss")}
              className="shrink-0 cursor-pointer rounded-full p-1 text-mist hover:bg-haze hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
