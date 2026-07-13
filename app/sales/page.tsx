import { redirect } from "next/navigation";

/** The sales module lands on invoices — the busiest area. */
export default function SalesIndexPage() {
  redirect("/sales/invoices");
}
