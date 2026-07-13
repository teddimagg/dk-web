/**
 * Client-side dkPlus API access. Every call goes through the Next.js proxy at
 * /api/dk/* which adds the Authorization header, a server-side GET cache and
 * CORS-free access. The token travels in the `x-dk-token` header.
 */

export class DkError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export interface DkRequestOptions {
  token: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the server-side proxy cache for this request. */
  fresh?: boolean;
  /**
   * Base64 user:pass for the few token-management endpoints dk authenticates
   * with dkPlus user credentials instead of a company token (never cached).
   */
  basic?: string;
}

/** Unicode-safe base64 for Basic auth credentials. */
export function encodeBasicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.length > 0 && body.length < 400) return body;
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    for (const key of ["Message", "message", "error", "Error", "detail"]) {
      if (typeof b[key] === "string" && b[key]) return b[key] as string;
    }
  }
  return fallback;
}

/** JSON request against the dkPlus API. `path` starts with `/`, e.g. `/customer/page/1/50`. */
export async function dkFetch<T>(path: string, opts: DkRequestOptions): Promise<T> {
  const res = await fetch(`/api/dk${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.token ? { "x-dk-token": opts.token } : {}),
      ...(opts.basic ? { "x-dk-basic": opts.basic } : {}),
      ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(opts.fresh ? { "x-dk-fresh": "1" } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new DkError(res.status, extractMessage(data, `${res.status} ${res.statusText}`), data);
  }
  return data as T;
}

/**
 * Like dkFetch but also returns dk's RFC5988 paging links (x-dk-link) so
 * callers can learn the total page count from the first request.
 */
export async function dkFetchPaged<T>(
  path: string,
  opts: DkRequestOptions,
): Promise<{ data: T; lastPage: number | null }> {
  const res = await fetch(`/api/dk${path}`, {
    method: "GET",
    headers: {
      ...(opts.token ? { "x-dk-token": opts.token } : {}),
      ...(opts.fresh ? { "x-dk-fresh": "1" } : {}),
    },
    signal: opts.signal,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new DkError(res.status, extractMessage(data, `${res.status} ${res.statusText}`), data);
  }
  const link = res.headers.get("x-dk-link");
  const last = link?.match(/page\/(\d+)\/\d+[^>]*>;\s*rel=last/i);
  return { data: data as T, lastPage: last ? Number(last[1]) : null };
}

/** Binary fetch (PDF downloads etc.) — returns a Blob. */
export async function dkFetchBlob(path: string, opts: DkRequestOptions): Promise<Blob> {
  const res = await fetch(`/api/dk${path}`, {
    method: opts.method ?? "GET",
    headers: { "x-dk-token": opts.token, "x-dk-fresh": "1" },
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new DkError(res.status, extractMessage(text, `${res.status} ${res.statusText}`));
  }
  return res.blob();
}

/** Trigger a browser download of a blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}
