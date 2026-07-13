import type { MemberApplication } from "@/lib/api/types/members";

/** Badge tones supported by the shared Badge component. */
export type BadgeTone = "neutral" | "green" | "red" | "amber" | "blue" | "ink";

/**
 * Application statuses per docs/api/members.md (Update Status route).
 * Labels resolve at render time via `t(labelKey)`.
 */
export const APPLICATION_STATUSES: readonly {
  code: number;
  value: string;
  labelKey: string;
  tone: BadgeTone;
}[] = [
  { code: 0, value: "InProgress", labelKey: "members.appStatus.inProgress", tone: "blue" },
  { code: 1, value: "Accepted", labelKey: "members.appStatus.accepted", tone: "green" },
  { code: 2, value: "Rejected", labelKey: "members.appStatus.rejected", tone: "red" },
  { code: 3, value: "Expired", labelKey: "members.appStatus.expired", tone: "neutral" },
  { code: 4, value: "PartlyPaid", labelKey: "members.appStatus.partlyPaid", tone: "amber" },
  { code: 5, value: "FullyPaid", labelKey: "members.appStatus.fullyPaid", tone: "green" },
  { code: 6, value: "Closed", labelKey: "members.appStatus.closed", tone: "neutral" },
  { code: 7, value: "PayedToCompany", labelKey: "members.appStatus.paidToCompany", tone: "blue" },
  { code: 8, value: "OnHold", labelKey: "members.appStatus.onHold", tone: "amber" },
  { code: 9, value: "Invalid", labelKey: "members.appStatus.invalid", tone: "red" },
  { code: 10, value: "NotFinished", labelKey: "members.appStatus.notFinished", tone: "neutral" },
];

/**
 * Resolves a status to a badge descriptor: known statuses carry an i18n
 * `labelKey`; unknown API values pass through untranslated as `label`.
 */
export function applicationStatusInfo(
  status: number | string | null | undefined,
): { labelKey?: string; label?: string; tone: BadgeTone } | null {
  if (status === null || status === undefined || status === "") return null;
  const found = APPLICATION_STATUSES.find(
    (s) => s.code === status || s.value.toLowerCase() === String(status).toLowerCase(),
  );
  return found
    ? { labelKey: found.labelKey, tone: found.tone }
    : { label: String(status), tone: "neutral" };
}

/** dk is inconsistent about ID casing on undocumented payloads. */
export function applicationId(app: MemberApplication): number | undefined {
  return app.ID ?? app.Id;
}
