import type { MemberApplication } from "@/lib/api/types/members";

/** Badge tones supported by the shared Badge component. */
export type BadgeTone = "neutral" | "green" | "red" | "amber" | "blue" | "ink";

/** Application statuses per docs/api/members.md (Update Status route). */
export const APPLICATION_STATUSES: readonly {
  code: number;
  value: string;
  label: string;
  tone: BadgeTone;
}[] = [
  { code: 0, value: "InProgress", label: "In progress", tone: "blue" },
  { code: 1, value: "Accepted", label: "Accepted", tone: "green" },
  { code: 2, value: "Rejected", label: "Rejected", tone: "red" },
  { code: 3, value: "Expired", label: "Expired", tone: "neutral" },
  { code: 4, value: "PartlyPaid", label: "Partly paid", tone: "amber" },
  { code: 5, value: "FullyPaid", label: "Fully paid", tone: "green" },
  { code: 6, value: "Closed", label: "Closed", tone: "neutral" },
  { code: 7, value: "PayedToCompany", label: "Paid to company", tone: "blue" },
  { code: 8, value: "OnHold", label: "On hold", tone: "amber" },
  { code: 9, value: "Invalid", label: "Invalid", tone: "red" },
  { code: 10, value: "NotFinished", label: "Not finished", tone: "neutral" },
];

export function applicationStatusInfo(
  status: number | string | null | undefined,
): { label: string; tone: BadgeTone } | null {
  if (status === null || status === undefined || status === "") return null;
  const found = APPLICATION_STATUSES.find(
    (s) => s.code === status || s.value.toLowerCase() === String(status).toLowerCase(),
  );
  return found ? { label: found.label, tone: found.tone } : { label: String(status), tone: "neutral" };
}

/** dk is inconsistent about ID casing on undocumented payloads. */
export function applicationId(app: MemberApplication): number | undefined {
  return app.ID ?? app.Id;
}
