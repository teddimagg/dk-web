"use client";

import { Pencil, Plus, RefreshCw, Send, Trash2, Webhook } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation, useDkQuery } from "@/lib/hooks/useDk";
import type { WebhookBody, WebhookSubscription } from "@/lib/api/types/platform";
import { WebhookFormDialog } from "./_components/WebhookFormDialog";

const EVENT_KEYS = ["Product", "Customer", "Vendor", "Project"] as const;

export default function WebhooksPage() {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WebhookSubscription | null>(null);
  const [deleting, setDeleting] = useState<WebhookSubscription | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useDkQuery<WebhookSubscription[]>(
    ["webhooks"],
    "/admin/webhook",
    { fresh: true },
  );

  const remove = useDkMutation<unknown>({ invalidates: [["webhooks"]] });
  const test = useDkMutation<unknown>();

  function sendTest(hook: WebhookSubscription) {
    const body: WebhookBody = {
      Description: hook.Description ?? "dkPanel test event",
      Url: hook.Url ?? "",
      ...(hook.AuthorizationScheme ? { AuthorizationScheme: hook.AuthorizationScheme } : {}),
      ...(hook.AuthorizationValue ? { AuthorizationValue: hook.AuthorizationValue } : {}),
      Options: {
        Enabled: hook.Options?.Enabled ?? true,
        Product: hook.Options?.Product ?? false,
        Customer: hook.Options?.Customer ?? false,
        Vendor: hook.Options?.Vendor ?? false,
        Project: hook.Options?.Project ?? false,
      },
    };
    setTestingId(hook.ID);
    test.mutate(
      { path: "/admin/webhook/action/test", method: "POST", body },
      {
        onSuccess: () => {
          toast.success("Test event sent", `dk posted a test delivery to ${hook.Url}.`);
          setTestingId(null);
        },
        onError: (e) => {
          toast.error("Test delivery failed", e.message);
          setTestingId(null);
        },
      },
    );
  }

  const columns: Column<WebhookSubscription>[] = [
    {
      key: "description",
      header: "Description",
      render: (h) => (
        <div>
          <p className="font-medium text-ink">{h.Description ?? "Untitled subscription"}</p>
          <p className="max-w-64 truncate font-mono text-xs text-fog">{h.Url ?? "–"}</p>
        </div>
      ),
    },
    {
      key: "events",
      header: "Events",
      render: (h) => {
        const active = EVENT_KEYS.filter((k) => h.Options?.[k]);
        return active.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {active.map((k) => (
              <Badge key={k} tone="blue">
                {k}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-fog">–</span>
        );
      },
    },
    {
      key: "auth",
      header: "Auth",
      render: (h) =>
        h.AuthorizationScheme ? (
          <Badge tone="ink">{h.AuthorizationScheme}</Badge>
        ) : (
          <span className="text-fog">None</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (h) =>
        h.Options?.Enabled ? <Badge tone="green">Enabled</Badge> : <Badge tone="neutral">Disabled</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (h) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Send test event to ${h.Url}`}
            title="Send test event"
            loading={testingId === h.ID && test.isPending}
            onClick={() => sendTest(h)}
          >
            {!(testingId === h.ID && test.isPending) && <Send className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${h.Description ?? h.ID}`}
            title="Manage subscription"
            onClick={() => setEditing(h)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Un-subscribe ${h.Description ?? h.ID}`}
            title="Un-subscribe"
            onClick={() => setDeleting(h)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle
          icon={<Webhook />}
          action={
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> Subscribe
              </Button>
            </div>
          }
        >
          Webhook subscriptions
        </CardTitle>

        <div className="mt-5">
          <DataTable
            columns={columns}
            rows={data}
            rowKey={(h) => h.ID}
            loading={isLoading || isFetching}
            error={error}
            onRetry={() => refetch()}
            emptyTitle="No webhook subscriptions"
            emptyBody="Subscribe a URL and dk will POST an event every time a selected module changes."
            emptyAction={
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> Subscribe
              </Button>
            }
          />
        </div>
      </Card>

      <WebhookFormDialog open={creating} onClose={() => setCreating(false)} />
      <WebhookFormDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Un-subscribe webhook?"
        body={
          <>
            This removes the subscription <strong>{deleting?.Description ?? deleting?.ID}</strong>
            {deleting?.Url ? (
              <>
                {" "}
                pointing at <span className="font-mono text-xs">{deleting.Url}</span>
              </>
            ) : null}
            . dk will stop delivering events to it immediately. You can subscribe the same URL again
            at any time.
          </>
        }
        confirmLabel="Un-subscribe"
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(
            { path: `/admin/webhook/${encodeURIComponent(deleting.ID)}`, method: "DELETE" },
            {
              onSuccess: () => {
                toast.success("Webhook removed", `${deleting.Description ?? deleting.ID} was un-subscribed.`);
                setDeleting(null);
              },
              onError: (e) => toast.error("Could not un-subscribe", e.message),
            },
          );
        }}
      />
    </div>
  );
}
