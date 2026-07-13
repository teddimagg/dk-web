"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";
import type { WebhookBody, WebhookSubscription } from "@/lib/api/types/platform";

const EVENT_KEYS = ["Product", "Customer", "Vendor", "Project"] as const;
type EventKey = (typeof EVENT_KEYS)[number];

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink transition-colors hover:border-mist">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-ink"
      />
      {label}
    </label>
  );
}

/**
 * Subscribe (POST /admin/webhook) and Manage (PUT /admin/webhook/:id) share
 * this form — pass `initial` to edit an existing subscription.
 */
export function WebhookFormDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: WebhookSubscription | null;
}) {
  const toast = useToast();
  const editing = !!initial;

  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [scheme, setScheme] = useState("");
  const [value, setValue] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [events, setEvents] = useState<Record<EventKey, boolean>>({
    Product: false,
    Customer: false,
    Vendor: false,
    Project: false,
  });
  const [errors, setErrors] = useState<{ description?: string; url?: string }>({});

  useEffect(() => {
    if (!open) return;
    setDescription(initial?.Description ?? "");
    setUrl(initial?.Url ?? "");
    setScheme(initial?.AuthorizationScheme ?? "");
    setValue(initial?.AuthorizationValue ?? "");
    setEnabled(initial?.Options?.Enabled ?? true);
    setEvents({
      Product: initial?.Options?.Product ?? false,
      Customer: initial?.Options?.Customer ?? false,
      Vendor: initial?.Options?.Vendor ?? false,
      Project: initial?.Options?.Project ?? false,
    });
    setErrors({});
  }, [open, initial]);

  const save = useDkMutation<unknown>({ invalidates: [["webhooks"]] });

  function submit() {
    const next: typeof errors = {};
    if (!description.trim()) next.description = "Description is required";
    if (!url.trim()) next.url = "URL is required";
    else if (!/^https?:\/\//i.test(url.trim())) next.url = "Must start with http:// or https://";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const body: WebhookBody = {
      Description: description.trim(),
      Url: url.trim(),
      ...(scheme.trim() ? { AuthorizationScheme: scheme.trim() } : {}),
      ...(value.trim() ? { AuthorizationValue: value.trim() } : {}),
      Options: { Enabled: enabled, ...events },
    };
    save.mutate(
      {
        path: editing ? `/admin/webhook/${encodeURIComponent(initial!.ID)}` : "/admin/webhook",
        method: editing ? "PUT" : "POST",
        body,
      },
      {
        onSuccess: () => {
          toast.success(
            editing ? "Subscription updated" : "Webhook subscribed",
            `${description.trim()} → ${url.trim()}`,
          );
          onClose();
        },
        onError: (e) =>
          toast.error(editing ? "Could not update subscription" : "Could not subscribe", e.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Manage subscription" : "Subscribe to webhooks"}
      subtitle={
        editing
          ? `Editing ${initial?.Description ?? initial?.ID}`
          : "dk will POST an event to your URL whenever a selected module changes."
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Description" required error={errors.description}>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Update webpage"
            autoFocus
          />
        </Field>
        <Field label="Payload URL" required error={errors.url}>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/hooks"
            inputMode="url"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Authorization scheme" hint="optional — e.g. Bearer or Basic">
            <Input value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="Bearer" />
          </Field>
          <Field label="Authorization value" hint="optional">
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="secret" />
          </Field>
        </div>
        <Field label="Events" hint="modules that trigger a delivery">
          <div className="grid grid-cols-2 gap-2">
            {EVENT_KEYS.map((k) => (
              <Checkbox
                key={k}
                label={k}
                checked={events[k]}
                onChange={(v) => setEvents((prev) => ({ ...prev, [k]: v }))}
              />
            ))}
          </div>
        </Field>
        <Checkbox label="Enabled — deliver events immediately" checked={enabled} onChange={setEnabled} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Subscribe"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
