"use client";

import { useEffect, useState } from "react";
import { dkFetchBlob, downloadBlob } from "@/lib/api/client";
import type { PurchaseOrder, VendorInvoice, VendorTransaction } from "@/lib/api/types/vendors";

/** Debounce a changing value (used for search-as-you-type). */
export function useDebounced<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** dk payloads sometimes come back as a single object where a list is expected. */
export function asArray<T>(data: T | T[] | null | undefined): T[] {
  if (data == null) return [];
  return Array.isArray(data) ? data : [data];
}

/** Best-effort unique id for a vendor invoice across the different routes. */
export function invoiceId(inv: VendorInvoice): number | undefined {
  return inv.ID ?? inv.InvoiceID ?? inv.RecordID;
}

export function invoiceNumber(inv: VendorInvoice): string {
  return inv.Number ?? inv.InvoiceNumber ?? (invoiceId(inv) != null ? `#${invoiceId(inv)}` : "–");
}

export function invoiceVendorLabel(inv: VendorInvoice): string {
  if (typeof inv.Vendor === "string" && inv.Vendor) return inv.VendorName ? `${inv.VendorName} (${inv.Vendor})` : inv.Vendor;
  if (inv.Vendor && typeof inv.Vendor === "object") {
    const v = inv.Vendor;
    if (v.Name && v.Number) return `${v.Name} (${v.Number})`;
    if (v.Name || v.Number) return v.Name ?? v.Number ?? "–";
  }
  if (inv.VendorName || inv.VendorNumber)
    return inv.VendorName && inv.VendorNumber ? `${inv.VendorName} (${inv.VendorNumber})` : (inv.VendorName ?? inv.VendorNumber ?? "–");
  return "–";
}

export function invoiceAmount(inv: VendorInvoice): number | undefined {
  return inv.Amount ?? inv.TotalAmountWithTax ?? inv.TotalAmount;
}

export function transactionText(t: VendorTransaction): string {
  return t.Text ?? t.Description ?? "–";
}

export function purchaseId(o: PurchaseOrder): number | undefined {
  return o.RecordID ?? o.ID;
}

export function purchaseVendorLabel(o: PurchaseOrder): string {
  const name = o.Vendor?.Name ?? o.VendorName;
  const number = o.Vendor?.Number ?? o.VendorNumber;
  if (name && number) return `${name} (${number})`;
  return name ?? number ?? "–";
}

/** Today minus `days`, as a yyyy-mm-dd string for `<input type="date">`. */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function blobExtension(blob: Blob): string {
  const t = blob.type.toLowerCase();
  if (t.includes("pdf")) return "pdf";
  if (t.includes("json")) return "json";
  if (t.includes("xml")) return "xml";
  if (t.includes("zip")) return "zip";
  if (t.includes("png")) return "png";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  if (t.includes("tiff")) return "tiff";
  return "bin";
}

/** Download an invoice attachment (binary route — bypasses the JSON pipeline). */
export async function downloadAttachment(path: string, token: string, baseName: string): Promise<void> {
  const blob = await dkFetchBlob(path, { token });
  downloadBlob(blob, `${baseName}.${blobExtension(blob)}`);
}
