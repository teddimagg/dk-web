"use client";

import { KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDkMutation } from "@/lib/hooks/useDk";

function maskToken(t: string): string {
  return t.length > 10 ? `${t.slice(0, 4)}…${t.slice(-4)}` : "the entered token";
}

/** DELETE /token/:token — permanently revoke an API token. */
export function RevokeTokenCard() {
  const toast = useToast();
  const [value, setValue] = useState("");
  const [confirming, setConfirming] = useState(false);
  const revoke = useDkMutation<unknown>();

  const trimmed = value.trim();

  return (
    <Card className="p-6">
      <CardTitle icon={<KeyRound />}>Revoke a token</CardTitle>
      <p className="mt-2 text-[13px] text-fog">
        Paste the full token value to permanently remove its access to the company. Use this the
        moment a token leaks or an integration is retired.
      </p>

      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) setConfirming(true);
        }}
      >
        <Field label="Token value" required>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste the token to revoke"
            className="font-mono"
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="danger" disabled={!trimmed}>
            <Trash2 className="size-4" /> Revoke token
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Permanently revoke this token?"
        body={
          <>
            You are about to revoke <strong className="font-mono">{maskToken(trimmed)}</strong>.
            Every application, integration or script still using it will{" "}
            <strong>lose API access immediately</strong>. This cannot be undone — the only way back
            is creating a brand-new token and re-configuring each integration by hand. If this is
            the token dkPanel itself is using, this dashboard will stop working too.
          </>
        }
        confirmLabel="Revoke forever"
        loading={revoke.isPending}
        onConfirm={() => {
          revoke.mutate(
            { path: `/token/${encodeURIComponent(trimmed)}`, method: "DELETE" },
            {
              onSuccess: () => {
                toast.success("Token revoked", "Its API access was removed permanently.");
                setValue("");
                setConfirming(false);
              },
              onError: (e) => toast.error("Could not revoke token", e.message),
            },
          );
        }}
      />
    </Card>
  );
}
