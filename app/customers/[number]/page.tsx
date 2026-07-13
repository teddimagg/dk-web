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
import { useT } from "@/lib/i18n";
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
  const t = useT();

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
          toast.success(
            t("customers.detail.deleted"),
            t("customers.detail.deletedDetail", { name: c?.Name ?? number }),
          );
          router.push("/customers");
        },
        onError: (e) => {
          toast.error(t("customers.detail.deleteFailed"), e.message);
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
            aria-label={t("customers.detail.back")}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {c?.Name ?? number}
              </h2>
              {c?.Blocked && <Badge tone="red">{t("customers.badge.blocked")}</Badge>}
            </div>
            <p className="text-[13px] text-fog tnum">
              {t("customers.meta", { number })}
              {c?.SSNumber ? ` · ${t("customers.detail.metaSsn", { ssn: c.SSNumber })}` : ""}
              {c?.Group ? ` · ${t("customers.detail.metaGroup", { group: c.Group })}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => q.refetch()} aria-label={t("customers.detail.refreshAria")}>
            <RefreshCw className={clsx("size-4", q.isFetching && "animate-spin")} /> {t("ui.refresh")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)} disabled={!c}>
            <Pencil className="size-4" /> {t("customers.detail.edit")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> {t("ui.delete")}
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
                {t("customers.detail.profile")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  { label: t("customers.field.number"), value: c.Number },
                  { label: t("customers.field.alias"), value: c.Alias },
                  { label: t("customers.field.ssn"), value: c.SSNumber },
                  { label: t("customers.field.email"), value: c.Email },
                  { label: t("customers.field.phone"), value: c.Phone },
                  { label: t("customers.field.phoneLocal"), value: c.PhoneLocal },
                  { label: t("customers.field.mobile"), value: c.PhoneMobile },
                  { label: t("customers.field.fax"), value: c.PhoneFax },
                  { label: t("customers.field.address"), value: c.Address1 },
                  { label: t("customers.field.address2"), value: c.Address2 },
                  { label: t("customers.field.address3"), value: c.Address3 },
                  { label: t("customers.field.city"), value: c.City },
                  { label: t("customers.field.zip"), value: c.ZipCode },
                  { label: t("customers.field.country"), value: c.CountryCode },
                ]}
              />
            </Card>
            <Card className="p-6">
              <CardTitle icon={<Landmark />} className="mb-5">
                {t("customers.detail.billing")}
              </CardTitle>
              <KV
                columns={1}
                items={[
                  {
                    label: t("customers.field.balance"),
                    value: <span className="font-semibold">{formatAmount(c.BalanceAmount)}</span>,
                  },
                  { label: t("customers.field.group"), value: c.Group },
                  { label: t("customers.field.salesperson"), value: c.SalesPerson },
                  { label: t("customers.field.discount"), value: c.Discount ? formatPercent(c.Discount) : "" },
                  { label: t("customers.field.paymentTerm"), value: c.PaymentTerm },
                  { label: t("customers.field.paymentMode"), value: c.PaymentMode },
                  { label: t("customers.field.currency"), value: c.CurrencyCode },
                  { label: t("customers.field.ledgerCode"), value: c.LedgerCode },
                  { label: t("customers.field.priceGroup"), value: c.PriceGroup ? String(c.PriceGroup) : "" },
                  { label: t("customers.field.billingFee"), value: c.BillingFee ? formatAmount(c.BillingFee) : "" },
                  {
                    label: t("customers.field.vat"),
                    value: c.NoVat ? (
                      <Badge tone="amber">{t("customers.badge.noVat")}</Badge>
                    ) : (
                      t("customers.vatStandard")
                    ),
                  },
                  {
                    label: t("customers.field.status"),
                    value: c.Blocked ? (
                      <Badge tone="red">{t("customers.badge.blocked")}</Badge>
                    ) : (
                      <Badge tone="green">{t("customers.badge.active")}</Badge>
                    ),
                  },
                  { label: t("customers.field.modified"), value: formatDateTime(c.Modified) },
                ]}
              />
            </Card>
          </div>

          <Card className="p-5">
            <div className="mb-4">
              <Tabs
                tabs={[
                  { id: "contacts", label: t("customers.detail.tabContacts"), count: c.Contacts?.length },
                  { id: "transactions", label: t("customers.detail.tabTransactions") },
                  { id: "orders", label: t("customers.detail.tabOrders") },
                  { id: "quotes", label: t("customers.detail.tabQuotes") },
                  { id: "invoices", label: t("customers.detail.tabInvoices") },
                  { id: "projects", label: t("customers.detail.tabProjects") },
                  { id: "attachments", label: t("customers.detail.tabAttachments"), count: c.Attachments?.length },
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

          <JsonView data={c} label={t("customers.detail.rawPayload")} />
        </>
      )}

      <CustomerDialog open={editOpen} onClose={() => setEditOpen(false)} customer={c} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("customers.detail.confirmDeleteTitle", {
          name: c?.Name ?? t("customers.detail.customerN", { number }),
        })}
        body={
          <>
            {t("customers.detail.confirmDeleteBody1")} <strong>{c?.Name ?? number}</strong>{" "}
            {t("customers.detail.confirmDeleteBody2", { number })}
          </>
        }
        confirmLabel={t("customers.detail.confirmDeleteAction")}
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
