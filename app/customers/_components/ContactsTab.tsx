"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { useT } from "@/lib/i18n";
import { timeAgo } from "@/lib/format";
import type { CustomerContact } from "@/lib/api/types/customers";
import { ContactDialog } from "./ContactDialog";

/** GET /customer/:number/contact with create / edit / delete actions. */
export function ContactsTab({ customerNumber }: { customerNumber: string }) {
  const enc = encodeURIComponent(customerNumber);
  const contacts = useDkQuery<CustomerContact[]>(
    ["customer", customerNumber, "contacts"],
    `/customer/${enc}/contact`,
  );

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CustomerContact | null>(null);
  const [deleting, setDeleting] = useState<CustomerContact | null>(null);
  const toast = useToast();
  const t = useT();

  const remove = useDkMutation<unknown>({ invalidates: [["customer", customerNumber]] });

  function confirmDelete() {
    if (!deleting) return;
    remove.mutate(
      {
        path: `/customer/${enc}/contact/${encodeURIComponent(deleting.Number)}`,
        method: "DELETE",
      },
      {
        onSuccess: () => {
          toast.success(
            t("customers.contacts.deleted"),
            t("customers.contacts.deletedDetail", { name: deleting.Name || deleting.Number }),
          );
          setDeleting(null);
        },
        onError: (e) => {
          toast.error(t("customers.contacts.deleteFailed"), e.message);
          setDeleting(null);
        },
      },
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> {t("customers.contacts.add")}
        </Button>
      </div>

      <DataTable<CustomerContact>
        columns={[
          {
            key: "number",
            header: t("customers.col.number"),
            width: "110px",
            render: (c) => <span className="font-mono text-xs text-soot">{c.Number}</span>,
          },
          {
            key: "name",
            header: t("customers.col.name"),
            render: (c) => <span className="font-medium text-ink">{c.Name || "–"}</span>,
          },
          {
            key: "title",
            header: t("customers.col.title"),
            render: (c) => c.Title || <span className="text-mist">–</span>,
          },
          {
            key: "department",
            header: t("customers.col.department"),
            render: (c) => c.Department || <span className="text-mist">–</span>,
          },
          {
            key: "email",
            header: t("customers.col.email"),
            render: (c) => c.Email || <span className="text-mist">–</span>,
          },
          {
            key: "phone",
            header: t("customers.col.phone"),
            render: (c) =>
              c.Phone || c.PhoneMobile || c.PhoneLocal || <span className="text-mist">–</span>,
          },
          {
            key: "modified",
            header: t("customers.col.modified"),
            align: "right",
            render: (c) => <span className="text-fog">{timeAgo(c.Modified)}</span>,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            width: "90px",
            render: (c) => (
              <span className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("customers.contacts.editAria", { name: c.Name || c.Number })}
                  onClick={() => setEditing(c)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("customers.contacts.deleteAria", { name: c.Name || c.Number })}
                  onClick={() => setDeleting(c)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </span>
            ),
          },
        ]}
        rows={contacts.data}
        rowKey={(c, i) => c.Number || i}
        loading={contacts.isLoading}
        error={contacts.error}
        onRetry={() => contacts.refetch()}
        emptyTitle={t("customers.contacts.emptyTitle")}
        emptyBody={t("customers.contacts.emptyBody")}
      />

      <ContactDialog open={adding} onClose={() => setAdding(false)} customerNumber={customerNumber} />
      <ContactDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        customerNumber={customerNumber}
        contact={editing ?? undefined}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("customers.contacts.confirmDeleteTitle", {
          name: deleting?.Name || deleting?.Number || "",
        })}
        body={
          <>
            {t("customers.contacts.confirmDeleteBody1")}{" "}
            <strong>{deleting?.Name || deleting?.Number}</strong>{" "}
            {t("customers.contacts.confirmDeleteBody2", { number: customerNumber })}
          </>
        }
        confirmLabel={t("customers.contacts.confirmDeleteAction")}
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
