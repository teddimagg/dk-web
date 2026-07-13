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
import { useT } from "@/lib/i18n";
import type { WebhookBody, WebhookSubscription } from "@/lib/api/types/platform";
import { WebhookFormDialog } from "./_components/WebhookFormDialog";

const EVENT_KEYS = ["Product", "Customer", "Vendor", "Project"] as const;

export default function WebhooksPage() {
  const t = useT();
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
          toast.success(t("webhooks.toast.testSent"), t("webhooks.toast.testSentDetail", { url: hook.Url ?? "" }));
          setTestingId(null);
        },
        onError: (e) => {
          toast.error(t("webhooks.toast.testFailed"), e.message);
          setTestingId(null);
        },
      },
    );
  }

  const columns: Column<WebhookSubscription>[] = [
    {
      key: "description",
      header: t("webhooks.col.description"),
      render: (h) => (
        <div>
          <p className="font-medium text-ink">{h.Description ?? t("webhooks.untitled")}</p>
          <p className="max-w-64 truncate font-mono text-xs text-fog">{h.Url ?? "–"}</p>
        </div>
      ),
    },
    {
      key: "events",
      header: t("webhooks.col.events"),
      render: (h) => {
        const active = EVENT_KEYS.filter((k) => h.Options?.[k]);
        return active.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {active.map((k) => (
              <Badge key={k} tone="blue">
                {t(`webhooks.event.${k.toLowerCase()}`)}
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
      header: t("webhooks.col.auth"),
      render: (h) =>
        h.AuthorizationScheme ? (
          <Badge tone="ink">{h.AuthorizationScheme}</Badge>
        ) : (
          <span className="text-fog">{t("webhooks.authNone")}</span>
        ),
    },
    {
      key: "status",
      header: t("webhooks.col.status"),
      render: (h) =>
        h.Options?.Enabled ? (
          <Badge tone="green">{t("webhooks.enabled")}</Badge>
        ) : (
          <Badge tone="neutral">{t("webhooks.disabled")}</Badge>
        ),
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
            aria-label={t("webhooks.sendTestTo", { url: h.Url ?? "" })}
            title={t("webhooks.sendTest")}
            loading={testingId === h.ID && test.isPending}
            onClick={() => sendTest(h)}
          >
            {!(testingId === h.ID && test.isPending) && <Send className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("webhooks.editAria", { name: h.Description ?? h.ID })}
            title={t("webhooks.manage")}
            onClick={() => setEditing(h)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("webhooks.unsubscribeAria", { name: h.Description ?? h.ID })}
            title={t("webhooks.unsubscribe")}
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
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> {t("ui.refresh")}
              </Button>
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> {t("webhooks.subscribe")}
              </Button>
            </div>
          }
        >
          {t("webhooks.cardTitle")}
        </CardTitle>

        <div className="mt-5">
          <DataTable
            columns={columns}
            rows={data}
            rowKey={(h) => h.ID}
            loading={isLoading || isFetching}
            error={error}
            onRetry={() => refetch()}
            emptyTitle={t("webhooks.emptyTitle")}
            emptyBody={t("webhooks.emptyBody")}
            emptyAction={
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="size-4" /> {t("webhooks.subscribe")}
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
        title={t("webhooks.confirm.title")}
        body={
          <>
            {t("webhooks.confirm.removes")} <strong>{deleting?.Description ?? deleting?.ID}</strong>
            {deleting?.Url ? (
              <>
                {" "}
                {t("webhooks.confirm.pointingAt")}{" "}
                <span className="font-mono text-xs">{deleting.Url}</span>
              </>
            ) : null}
            . {t("webhooks.confirm.consequence")}
          </>
        }
        confirmLabel={t("webhooks.unsubscribe")}
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(
            { path: `/admin/webhook/${encodeURIComponent(deleting.ID)}`, method: "DELETE" },
            {
              onSuccess: () => {
                toast.success(
                  t("webhooks.toast.removed"),
                  t("webhooks.toast.removedDetail", { name: deleting.Description ?? deleting.ID }),
                );
                setDeleting(null);
              },
              onError: (e) => toast.error(t("webhooks.toast.removeFailed"), e.message),
            },
          );
        }}
      />
    </div>
  );
}
