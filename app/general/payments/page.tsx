"use client";

import { Banknote, CalendarDays } from "lucide-react";
import { PaymentLookupCard } from "../_components/PaymentLookupCard";

export default function PaymentsPage() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <PaymentLookupCard
        kind="mode"
        title="Payment modes"
        singular="Payment mode"
        icon={<Banknote />}
      />
      <PaymentLookupCard
        kind="term"
        title="Payment terms"
        singular="Payment term"
        icon={<CalendarDays />}
      />
    </div>
  );
}
