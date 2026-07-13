"use client";

import { useCallback, useEffect, useState } from "react";

export const RECENT_ORDERS_KEY = "dk-sales-recent-orders";
export const RECENT_QUOTES_KEY = "dk-sales-recent-quotes";

/**
 * dk has no list endpoint for orders/quotes, so we remember recently opened
 * ids in localStorage (per device) as a low-memory-load lookup aid.
 */
export function useRecentIds(storageKey: string, max = 8) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setIds(parsed.filter((x): x is string => typeof x === "string"));
        }
      }
    } catch {
      /* corrupted storage — start fresh */
    }
  }, [storageKey]);

  const remember = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)].slice(0, max);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* storage full/blocked — non-fatal */
        }
        return next;
      });
    },
    [storageKey, max],
  );

  const forget = useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = prev.filter((x) => x !== id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* non-fatal */
        }
        return next;
      });
    },
    [storageKey],
  );

  return { ids, remember, forget };
}
