"use client";

import { Copy, KeyRound, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { JsonView } from "@/components/ui/JsonView";
import { useToast } from "@/components/ui/Toast";
import { dkFetch, DkError, encodeBasicAuth } from "@/lib/api/client";
import type { CreateTokenBody, TokenCompany } from "@/lib/api/types/platform";

/** dk doesn't document the POST /token response — dig the token string out defensively. */
function extractToken(data: unknown): string {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["Token", "token", "ApiToken", "AccessToken", "Value", "ID", "Id"]) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return JSON.stringify(data);
}

/** POST /token — mint a new API token for a company the user can access. */
export function CreateTokenDialog({
  open,
  onClose,
  companies,
}: {
  open: boolean;
  onClose: () => void;
  companies?: TokenCompany[];
}) {
  const toast = useToast();
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [descError, setDescError] = useState<string | undefined>();
  const [credError, setCredError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    if (open) {
      setDescription("");
      setCompanyId("");
      setUsername("");
      setPassword("");
      setDescError(undefined);
      setCredError(undefined);
      setResult(null);
    }
  }, [open]);

  // dk authenticates POST /token with dkPlus USER credentials (Basic auth),
  // not a company token — the password never leaves the create request.
  async function submit() {
    if (!description.trim()) {
      setDescError("Description is required");
      return;
    }
    setDescError(undefined);
    if (!username.trim() || !password) {
      setCredError("dkPlus username and password are required to mint tokens");
      return;
    }
    setCredError(undefined);
    const body: CreateTokenBody = {
      Description: description.trim(),
      ...(companyId ? { Company: companyId } : {}),
    };
    setPending(true);
    try {
      const data = await dkFetch<unknown>("/token", {
        token: "",
        method: "POST",
        body,
        basic: encodeBasicAuth(username.trim(), password),
      });
      setResult(data);
      toast.success("Token created", "Copy it now — dk shows it only this once.");
    } catch (e) {
      const msg = e instanceof DkError && e.status === 401
        ? "dkPlus rejected the username or password."
        : e instanceof Error ? e.message : "Unknown error";
      toast.error("Could not create token", msg);
    } finally {
      setPending(false);
    }
  }

  const tokenValue = result != null ? extractToken(result) : null;

  function copyToken() {
    if (!tokenValue) return;
    navigator.clipboard
      .writeText(tokenValue)
      .then(() => toast.success("Token copied to clipboard"))
      .catch(() => toast.error("Could not copy", "Select and copy the token manually."));
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create API token"
      subtitle="Mints a new dkPlus token for a company the signed-in user can access."
    >
      {tokenValue == null ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="Description" required error={descError}>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Webshop integration"
              autoFocus
            />
          </Field>
          <Field label="Company" hint="optional — defaults to the token's own company">
            <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">Token&apos;s own company (default)</option>
              {(companies ?? []).map((c) =>
                c.ID ? (
                  <option key={c.ID} value={c.ID}>
                    {c.Name ?? c.ID}
                  </option>
                ) : null,
              )}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="dkPlus username" required error={credError}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user@company.is"
                autoComplete="off"
              />
            </Field>
            <Field label="dkPlus password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </Field>
          </div>
          <p className="text-xs leading-relaxed text-fog">
            dk mints tokens against your dkPlus <em>user</em> account (Basic auth), not a company
            token. Credentials are sent only with this one request and never stored.
          </p>
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-soft px-3.5 py-3 text-[13px] leading-snug text-[#9a6a10]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            The new token is shown <strong>only once</strong>, right after creation. Have a safe
            place ready to store it before you continue.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              <KeyRound className="size-4" /> Create token
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-soft px-3.5 py-3 text-[13px] leading-snug text-[#9a6a10]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            This is the <strong>only time</strong> dk will show this token. Copy it now and store it
            securely — once this dialog closes it cannot be retrieved again.
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent-soft p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent-dark">
              Your new token
            </p>
            <p className="break-all font-mono text-sm text-ink">{tokenValue}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
            <Button onClick={copyToken}>
              <Copy className="size-4" /> Copy token
            </Button>
          </div>
          <JsonView data={result} label="Raw create-token response" />
        </div>
      )}
    </Dialog>
  );
}
