import { Badge } from "@/components/ui/Badge";
import type { SalesInvoice } from "@/lib/api/types/sales";

/**
 * dk's SettledType: demo data shows 2 = fully settled, 0 = open. Partial
 * settlement is inferred from SettledAmount when the type is ambiguous.
 */
export function SettledBadge({ invoice }: { invoice: SalesInvoice }) {
  const total = invoice.TotalAmountWithTax ?? 0;
  const settled = invoice.SettledAmount ?? 0;
  if (invoice.SettledType === 2 || (total !== 0 && settled === total)) {
    return <Badge tone="green">Settled</Badge>;
  }
  if (invoice.SettledType === 1 || (settled !== 0 && Math.abs(settled) < Math.abs(total))) {
    return <Badge tone="amber">Partial</Badge>;
  }
  return <Badge tone="neutral">Unsettled</Badge>;
}
