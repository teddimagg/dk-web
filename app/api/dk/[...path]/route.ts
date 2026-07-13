import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for the dkPlus API. Adds the Authorization header (token arrives in
 * `x-dk-token`), avoids CORS, and keeps a short-TTL in-memory cache for GET
 * responses so navigation between pages feels instant even before React
 * Query's client cache warms up. Any mutation flushes that token's cache.
 */

const BASE = process.env.DK_API_URL ?? "https://api.dkplus.is/api/v1";
const TTL_MS = 45_000;
const MAX_ENTRIES = 500;

interface CacheEntry {
  body: ArrayBuffer;
  contentType: string;
  status: number;
  at: number;
  /** RFC5988 paging links from dk, forwarded as x-dk-link. */
  link: string | null;
}

const globalCache = globalThis as unknown as { __dkCache?: Map<string, CacheEntry> };
const cache = (globalCache.__dkCache ??= new Map<string, CacheEntry>());

function cacheKey(token: string, url: string) {
  return `${token}::${url}`;
}

function evictIfNeeded() {
  if (cache.size <= MAX_ENTRIES) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at).slice(0, 100);
  for (const [k] of oldest) cache.delete(k);
}

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const token = req.headers.get("x-dk-token");
  // A few token-management endpoints authenticate with dkPlus user
  // credentials (Basic) instead of a company token — never cached.
  const basic = req.headers.get("x-dk-basic");
  if (!token && !basic) {
    return NextResponse.json({ Message: "Missing x-dk-token header" }, { status: 401 });
  }

  const search = req.nextUrl.search ?? "";
  const target = `${BASE}/${path.map(encodeURIComponent).join("/")}${search}`;
  const method = req.method.toUpperCase();
  // dk documents one destructive GET (invoice delete-by-reference) — treat it as a write.
  const destructiveGet = method === "GET" && req.nextUrl.searchParams.get("delete") === "true";
  const fresh = req.headers.get("x-dk-fresh") === "1" || destructiveGet || !!basic;
  const key = cacheKey(token ?? "basic", target);

  if (method === "GET" && !fresh) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) {
      return new NextResponse(hit.body.slice(0), {
        status: hit.status,
        headers: {
          "content-type": hit.contentType,
          "x-dk-cache": "HIT",
          "x-dk-cache-age": String(Math.round((Date.now() - hit.at) / 1000)),
          ...(hit.link ? { "x-dk-link": hit.link } : {}),
        },
      });
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers: {
        Authorization: basic ? `Basic ${basic}` : `Bearer ${token}`,
        Accept: "*/*",
        ...(req.headers.get("content-type") ? { "content-type": req.headers.get("content-type")! } : {}),
      },
      body: method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer(),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json({ Message: `dkPlus API unreachable: ${message}` }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const upstreamLink = upstream.headers.get("link");

  if (method === "GET" && !destructiveGet) {
    if (upstream.ok && !fresh) {
      cache.set(key, {
        body: body.slice(0),
        contentType,
        status: upstream.status,
        at: Date.now(),
        link: upstreamLink,
      });
      evictIfNeeded();
    }
  } else if (token) {
    // A write happened — anything cached for this company may be stale.
    for (const k of cache.keys()) {
      if (k.startsWith(`${token}::`)) cache.delete(k);
    }
  }

  const headers: Record<string, string> = { "content-type": contentType, "x-dk-cache": "MISS" };
  // RFC5988 paging links from dk — forward so clients can show total pages.
  if (upstreamLink) headers["x-dk-link"] = upstreamLink;

  return new NextResponse(body, { status: upstream.status, headers });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
