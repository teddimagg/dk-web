"use client";

import { useState } from "react";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import { useActiveCompany } from "@/lib/stores/companies";
import { useToast } from "@/components/ui/Toast";

/** Shared PDF-download handler with busy state + toast feedback. */
export function usePdfDownload() {
  const company = useActiveCompany();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function download(path: string, filename: string) {
    if (!company) {
      toast.error("No active company", "Connect a company token first.");
      return;
    }
    setBusy(true);
    try {
      const blob = await dkFetchBlob(path, { token: company.token });
      downloadBlob(blob, filename);
      toast.success("PDF downloaded", filename);
    } catch (e) {
      toast.error("Could not download PDF", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  return { download, busy };
}
