"use client";

import { clsx } from "clsx";
import { ArrowLeft, IdCard, Landmark, Pencil, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/EmptyState";
import { JsonView } from "@/components/ui/JsonView";
import { KV } from "@/components/ui/KV";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { formatAmount, formatDateTime, formatPercent } from "@/lib/format";
import type { Customer } from "@/lib/api/types/customers";
import { AttachmentsTab } from "../_components/AttachmentsTab";
import { ContactsTab } from "../_components/ContactsTab";
import { CustomerDialog } from "../_components/CustomerDialog";
import {
  InvoicesTab,
  ProjectsTab,
  SalesDocsTab,
  TransactionsTab,
} from "../_components/relatedTabs";

type TabId =
  | "contacts"
  | "transactions"
  | "orders"
  | "quotes"
  | "invoices"
  | "projects"
  | "attachments";

export default function CustomerDetailPage() {
  const params = useParams<{ number: string }>();
  const number = decodeURIComponent(params.number);
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState<TabId>("contacts");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const q = useDkQuery<Customer>(["customer", number], `/customer/${encodeURIComponent(number)}`);
  const remove = useDkMutation<unknown>({ invalidates: [["customers"]] });
  const c = q.data;

  function confirmDelete() {
    remove.mutate(
      { path: `/customer/${encodeURIComponent(number)}`, method: "DELETE" },
      {
        onSuccess: () => {
          toast.success("Customer deleted", `${c?.Name ?? number} was removed from dkPlus.`);
          router.push("/customers");
        },
        onError: (e) => {
          toast.error("Could not delete customer", e.message);
          setDeleteOpen(false);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-fog transition-colors hover:text-ink"
            aria-label="Back to all customers"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {c?.Name ?? number}
              </h2>
              {c?.Blocked && <Badge tone="red">Blocked</Badge>}
            </div>
            <p className="text-[13px] text-fog tnum">
              Nº {number}
              {c?.SSNumber ? ` · SSN ${c.SSNumber}` : ""}
              {c?.Group ? ` · group ${c.Group}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => q.refetch()} aria-label="Refresh customer">
            <RefreshCw className={clsx("size-4", q.isFetching && "animate-spin")} /> Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)} disabled={!c}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </div>

      {q.error ? (
        <Card className="p-5">
          <ErrorState error={q.error} onRetry={() => q.refetch()} />
        </Card>
      ) : !c ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardTitle icon={<IdCard />} className="mb-5">
                Profile
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: "Number", value: c.Number },
                  { label: "Alias", value: c.Alias },
                  { label: "SSN", value: c.SSNumber },
                  { label: "Email", value: c.Email },
                  { label: "Phone", value: c.Phone },
                  { label: "Local phone", value: c.PhoneLocal },
                  { label: "Mobile", value: c.PhoneMobile },
                  { label: "Fax", value: c.PhoneFax },
                  { label: "Address", value: c.Address1 },
                  { label: "Address 2", value: c.Address2 },
                  { label: "Address 3", value: c.Address3 },
                  { label: "City", value: c.City },
                  { label: "Zip code", value: c.ZipCode },
                  { label: "Country", value: c.CountryCode },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Landmark />} className="mb-5">
                Billing & terms
              </CardTitle>
              <KV
                columns={1}
                items={[
                  {
                    label: "Balance",
                    value: <span className="font-semibold">{formatAmount(c.BalanceAmount)}</span>,
                  },
                  { label: "Group", value: c.Group },
                  { label: "Salesperson", value: c.SalesPerson },
                  { label: "Discount", value: c.Discount ? formatPercent(c.Discount) : "" },
                  { label: "Payment term", value: c.PaymentTerm },
                  { label: "Payment mode", value: c.PaymentMode },
                  { label: "Currency", value: c.CurrencyCode },
                  { label: "Ledger code", value: c.LedgerCode },
                  { label: "Price group", value: c.PriceGroup ? String(c.PriceGroup) : "" },
                  { label: "Billing fee", value: c.BillingFee ? formatAmount(c.BillingFee) : "" },
                  { label: "VAT", value: c.NoVat ? <Badge tone="amber">No VAT</Badge> : "Standard" },
                  {
                    label: "Status",
                    value: c.Blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>,
                  },
                  { label: "Modified", value: formatDateTime(c.Modified) },
                ]}
              />
            </Card>
          </div>

          <Card className="p-5">
            <div className="mb-4">
              <Tabs
                tabs={[
                  { id: "contacts", label: "Contacts", count: c.Contacts?.length },
                  { id: "transactions", label: "Transactions" },
                  { id: "orders", label: "Orders" },
                  { id: "quotes", label: "Quotes" },
                  { id: "invoices", label: "Invoices" },
                  { id: "projects", label: "Projects" },
                  { id: "attachments", label: "Attachments", count: c.Attachments?.length },
                ]}
                active={tab}
                onChange={(id) => setTab(id as TabId)}
              />
            </div>
            {tab === "contacts" && <ContactsTab customerNumber={number} />}
            {tab === "transactions" && <TransactionsTab customerNumber={number} />}
            {tab === "orders" && <SalesDocsTab customerNumber={number} kind="order" />}
            {tab === "quotes" && <SalesDocsTab customerNumber={number} kind="quote" />}
            {tab === "invoices" && <InvoicesTab customerNumber={number} />}
            {tab === "projects" && <ProjectsTab customerNumber={number} />}
            {tab === "attachments" && (
              <AttachmentsTab
                customerNumber={number}
                attachments={c.Attachments}
                loading={q.isLoading}
              />
            )}
          </Card>

          <JsonView data={c} label="Raw customer payload" />
        </>
      )}

      <CustomerDialog open={editOpen} onClose={() => setEditOpen(false)} customer={c} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete ${c?.Name ?? `customer ${number}`}?`}
        body={
          <>
            This permanently deletes customer <strong>{c?.Name ?? number}</strong> (Nº {number}) in
            dkPlus, including its contacts. This action cannot be undone.
          </>
        }
        confirmLabel="Delete customer"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
