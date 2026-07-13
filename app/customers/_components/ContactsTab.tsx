"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
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
          toast.success("Contact deleted", `${deleting.Name || deleting.Number} was removed.`);
          setDeleting(null);
        },
        onError: (e) => {
          toast.error("Could not delete contact", e.message);
          setDeleting(null);
        },
      },
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add contact
        </Button>
      </div>

      <DataTable<CustomerContact>
        columns={[
          {
            key: "number",
            header: "Number",
            width: "110px",
            render: (c) => <span className="font-mono text-xs text-soot">{c.Number}</span>,
          },
          {
            key: "name",
            header: "Name",
            render: (c) => <span className="font-medium text-ink">{c.Name || "–"}</span>,
          },
          { key: "title", header: "Title", render: (c) => c.Title || <span className="text-mist">–</span> },
          {
            key: "department",
            header: "Department",
            render: (c) => c.Department || <span className="text-mist">–</span>,
          },
          { key: "email", header: "Email", render: (c) => c.Email || <span className="text-mist">–</span> },
          {
            key: "phone",
            header: "Phone",
            render: (c) =>
              c.Phone || c.PhoneMobile || c.PhoneLocal || <span className="text-mist">–</span>,
          },
          {
            key: "modified",
            header: "Modified",
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
                  aria-label={`Edit contact ${c.Name || c.Number}`}
                  onClick={() => setEditing(c)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete contact ${c.Name || c.Number}`}
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
        emptyTitle="No contacts"
        emptyBody="This customer has no contact persons yet — add the first one."
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
        title={`Delete contact ${deleting?.Name || deleting?.Number}?`}
        body={
          <>
            This permanently removes contact <strong>{deleting?.Name || deleting?.Number}</strong> from
            customer {customerNumber} in dkPlus. This cannot be undone.
          </>
        }
        confirmLabel="Delete contact"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
