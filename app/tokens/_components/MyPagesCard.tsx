"use client";

import { Mail, Plus, RefreshCw, Search, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import { useActiveCompany } from "@/lib/stores/companies";
import { formatDateTime } from "@/lib/format";
import type { MyPagesInvite, MyPagesInviteBody } from "@/lib/api/types/platform";

/**
 * My Pages invites — GET/POST /mypages/invites, DELETE /mypages/invites/:id.
 * The dkPlus demo token answers 405 here; that case renders an informative
 * notice instead of an error while keeping the actions available.
 */
export function MyPagesCard() {
  const toast = useToast();
  const company = useActiveCompany();
  const [customerFilter, setCustomerFilter] = useState("");
  const [applied, setApplied] = useState("");
  const [inviting, setInviting] = useState(false);
  const [revoking, setRevoking] = useState<MyPagesInvite | null>(null);

  const path = applied
    ? `/mypages/invites?customer=${encodeURIComponent(applied)}`
    : "/mypages/invites";
  const { data, isLoading, isFetching, error, refetch } = useDkQuery<MyPagesInvite[]>(
    ["mypages-invites", applied],
    path,
    { fresh: true, retry: false },
  );

  const notEnabled = error?.status === 405;

  // Invite dialog state
  const [email, setEmail] = useState("");
  const [customer, setCustomer] = useState("");
  const [role, setRole] = useState("Admin");
  const [errors, setErrors] = useState<{ email?: string; customer?: string; role?: string }>({});

  useEffect(() => {
    if (inviting) {
      setEmail("");
      setCustomer(applied);
      setRole("Admin");
      setErrors({});
    }
  }, [inviting, applied]);

  const create = useDkMutation<unknown>({ invalidates: [["mypages-invites"]] });
  const remove = useDkMutation<unknown>({ invalidates: [["mypages-invites"]] });

  function submitInvite() {
    const next: typeof errors = {};
    if (!email.trim() || !email.includes("@")) next.email = "A valid email is required";
    if (!customer.trim()) next.customer = "Customer number is required";
    if (!role.trim()) next.role = "Role is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: MyPagesInviteBody = {
      Email: email.trim(),
      Customer: customer.trim(),
      Role: role.trim(),
    };
    create.mutate(
      { path: "/mypages/invites", method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Invite created", `${email.trim()} was invited as ${role.trim()}.`);
          setInviting(false);
        },
        onError: (e) =>
          toast.error(
            "Could not create invite",
            e.status === 405 ? "My Pages invites are not enabled for this token." : e.message,
          ),
      },
    );
  }

  const columns: Column<MyPagesInvite>[] = [
    {
      key: "email",
      header: "Email",
      render: (r) => <span className="font-medium text-ink">{r.Email ?? "–"}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => <span className="tnum">{r.Customer != null ? String(r.Customer) : "–"}</span>,
    },
    { key: "role", header: "Role", render: (r) => r.Role ?? "–" },
    {
      key: "created",
      header: "Created",
      render: (r) => <span className="tnum">{formatDateTime(r.Created)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Revoke invite for ${r.Email ?? r.ID}`}
          title="Revoke invite"
          onClick={() => setRevoking(r)}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <Card className="p-6">
      <CardTitle
        icon={<Mail />}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Refresh invites"
              onClick={() => refetch()}
              disabled={!company}
            >
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => setInviting(true)}>
              <Plus className="size-4" /> Invite
            </Button>
          </div>
        }
      >
        My Pages invites
      </CardTitle>
      <p className="mt-2 text-[13px] text-fog">
        Invitations that give customers access to their own My Pages portal.
      </p>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(customerFilter.trim());
        }}
      >
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
          <Input
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            placeholder="Filter by customer number…"
            className="pl-9"
            aria-label="Filter invites by customer number"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Apply
        </Button>
      </form>

      <div className="mt-4">
        {notEnabled ? (
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-haze/60 px-4 py-4">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber" />
            <div className="text-[13px] leading-relaxed text-fog">
              <p className="font-medium text-ink">My Pages invites are not enabled for this token</p>
              <p className="mt-0.5">
                dk answered 405 (method not allowed) — the demo token does not have the My Pages
                module switched on. Connect a token from a company with My Pages enabled to list,
                create and revoke invites here.
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={data}
            rowKey={(r, i) => r.ID ?? `${r.Email ?? "invite"}-${i}`}
            loading={isLoading}
            error={error}
            onRetry={() => refetch()}
            emptyTitle="No invites"
            emptyBody={
              applied
                ? `No My Pages invites found for customer ${applied}.`
                : "Send the first invite to give a customer access to My Pages."
            }
            emptyAction={
              <Button size="sm" onClick={() => setInviting(true)}>
                <Plus className="size-4" /> Invite
              </Button>
            }
          />
        )}
      </div>

      <Dialog
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite to My Pages"
        subtitle="Sends an invitation email that links the customer to their My Pages account."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitInvite();
          }}
        >
          <Field label="Email" required error={errors.email}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              inputMode="email"
              autoFocus
            />
          </Field>
          <Field label="Customer number" required error={errors.customer}>
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. 1710794709"
            />
          </Field>
          <Field label="Role" required error={errors.role} hint='dk expects e.g. "Admin"'>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Admin" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              Send invite
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!revoking}
        onClose={() => setRevoking(null)}
        title="Revoke invite?"
        body={
          <>
            This revokes the My Pages invite for <strong>{revoking?.Email ?? revoking?.ID}</strong>
            {revoking?.Customer != null ? <> (customer {String(revoking.Customer)})</> : null}. The
            recipient will no longer be able to use it — you can always send a fresh invite later.
          </>
        }
        confirmLabel="Revoke invite"
        loading={remove.isPending}
        onConfirm={() => {
          if (!revoking?.ID) {
            toast.error("Cannot revoke", "This invite has no ID in the API response.");
            setRevoking(null);
            return;
          }
          remove.mutate(
            { path: `/mypages/invites/${encodeURIComponent(revoking.ID)}`, method: "DELETE" },
            {
              onSuccess: () => {
                toast.success("Invite revoked", `${revoking.Email ?? revoking.ID} was revoked.`);
                setRevoking(null);
              },
              onError: (e) =>
                toast.error(
                  "Could not revoke invite",
                  e.status === 405 ? "My Pages invites are not enabled for this token." : e.message,
                ),
            },
          );
        }}
      />
    </Card>
  );
}
