/**
 * Icelandic-locale formatting (dkPlus is an Icelandic ERP — decimal commas,
 * dot thousand separators, ISK amounts), matching the reference design's
 * "97,22 %" style numerals.
 */

/**
 * Locale list with graceful fallback: some embedded Chromium builds ship
 * without is-IS ICU data; de-DE renders the same dot-thousands/comma-decimals
 * convention Iceland uses.
 */
const LOCALES = ["is-IS", "de-DE"];

const numberFmt = new Intl.NumberFormat(LOCALES, { maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat(LOCALES, { maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat(LOCALES, { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat(LOCALES, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "–";
  return numberFmt.format(n);
}

export function formatInt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "–";
  return intFmt.format(n);
}

/** Compact form: 14.9k, 1,2m — used on stat tiles. */
export function formatCompact(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "–";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return numberFmt.format(Math.round((n / 1_000_000) * 10) / 10) + "m";
  if (abs >= 10_000) return numberFmt.format(Math.round(n / 1000)) + "k";
  if (abs >= 1_000) return numberFmt.format(Math.round((n / 1000) * 10) / 10) + "k";
  return numberFmt.format(n);
}

export function formatAmount(n: number | null | undefined, currency = "ISK"): string {
  if (n == null || Number.isNaN(n)) return "–";
  const decimals = currency === "ISK" ? 0 : 2;
  return (
    new Intl.NumberFormat(LOCALES, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n) +
    " " +
    currency
  );
}

export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null || Number.isNaN(n)) return "–";
  return new Intl.NumberFormat(LOCALES, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n) + "%";
}

const EPOCH_GUARD = Date.UTC(1902, 0, 1);

/** dk uses 0001-01-01 as "no date" — render as dash. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() < EPOCH_GUARD) return "–";
  return dateFmt.format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() < EPOCH_GUARD) return "–";
  return dateTimeFmt.format(d);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getTime() < EPOCH_GUARD) return "–";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatHours(h: number | null | undefined): string {
  if (h == null || Number.isNaN(h)) return "–";
  return numberFmt.format(Math.round(h * 10) / 10) + " klst";
}
