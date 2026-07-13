"use client";

import { Banknote, CalendarDays } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PaymentLookupCard } from "../_components/PaymentLookupCard";

export default function PaymentsPage() {
  const t = useT();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <PaymentLookupCard
        kind="mode"
        title={t("general.payments.modes")}
        singular={t("general.payments.mode")}
        icon={<Banknote />}
      />
      <PaymentLookupCard
        kind="term"
        title={t("general.payments.terms")}
        singular={t("general.payments.term")}
        icon={<CalendarDays />}
      />
    </div>
  );
}
