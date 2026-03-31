import { NextRequest, NextResponse } from "next/server";

/**
 * API behavior (matches jobfluencer4: all data from backend /api/*)
 *
 * 1) Set BACKEND_URL (server-only, e.g. http://localhost:8000) — requests to /api/*
 *    are proxied to BACKEND_URL/api/*. No mock data in this repo.
 *
 * 2) Leave REACT_APP_BACKEND_URL empty in the browser — axios calls same-origin /api/*.
 *
 * 3) If BACKEND_URL is unset — return empty shapes / 401 / 503 so the UI loads without
 *    hardcoded jobs, creators, or users (featured sections stay empty until backend exists).
 */

const BACKEND = process.env.BACKEND_URL?.replace(/\/$/, "") || "";

function getPath(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.replace(/^\/api\//, "");
}

const NO_BACKEND_MSG =
  "No backend configured. Set BACKEND_URL in .env.local to proxy to your API, or set REACT_APP_BACKEND_URL to your API origin.";

async function proxyToBackend(req: NextRequest, method: string) {
  const path = getPath(req);
  const url = new URL(req.url);
  const backendUrl = `${BACKEND}/api/${path}${url.search}`;

  const headers = new Headers();
  const hopByHop = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
  ]);
  req.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) headers.set(key, value);
  });

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
  }

  const res = await fetch(backendUrl, { method, headers, body, cache: "no-store" });
  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

function emptyGet(path: string) {
  // Same shape as jobfluencer4 backend `/api/stats` when counts are zero (trust band uses fallbacks in UI).
  if (path === "stats") {
    return NextResponse.json({
      total_creators: 0,
      total_brands: 0,
      open_campaigns: 0,
    });
  }

  // jobs list: /api/jobs (query string is not part of pathname)
  if (path === "jobs") {
    return NextResponse.json({ campaigns: [], jobs: [] });
  }
  // brand "my jobs" — must not be treated as /jobs/:id
  if (path === "jobs/my") {
    return NextResponse.json([]);
  }
  // single job detail
  if (path.startsWith("jobs/")) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  if (path.startsWith("campaigns")) {
    return NextResponse.json({ campaigns: [] });
  }

  // creators list
  if (path === "creators") {
    return NextResponse.json({ creators: [] });
  }
  if (path === "creators/profile") {
    return NextResponse.json({});
  }
  if (path.startsWith("creators/")) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  if (path === "influencers") {
    return NextResponse.json({ creators: [] });
  }

  if (path.startsWith("brands/")) {
    if (path.endsWith("/profile")) {
      return NextResponse.json({});
    }
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  if (path.startsWith("applications/")) {
    return NextResponse.json([]);
  }

  if (path === "invites/received") {
    return NextResponse.json([]);
  }

  if (path.startsWith("invites/")) {
    return NextResponse.json({ success: true });
  }

  if (path.startsWith("portfolio/links") || path.startsWith("portfolio/services")) {
    return NextResponse.json([]);
  }
  if (path.startsWith("portfolio/")) {
    return NextResponse.json([]);
  }

  if (path.startsWith("reviews/")) {
    return NextResponse.json([]);
  }

  if (path === "analytics/dashboard") {
    return NextResponse.json({});
  }

  if (path.startsWith("escrow")) {
    return NextResponse.json([]);
  }

  if (path.startsWith("files/")) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  if (path === "auth/me") {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (path === "subscriptions/my") {
    return NextResponse.json({ plan: "free", limits: {} });
  }
  if (path === "wallet") {
    return NextResponse.json({
      invite_credits: 0,
      balance: 0,
      transactions: [],
    });
  }
  if (path === "notifications") {
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }
  // FastAPI returns a raw array for both endpoints (not { conversations: [...] }).
  if (path === "messages/conversations") {
    return NextResponse.json([]);
  }
  if (path.startsWith("messages/") && path.endsWith("/thread")) {
    return NextResponse.json([]);
  }
  if (path.startsWith("messages/")) {
    return NextResponse.json([]);
  }

  return NextResponse.json({});
}

function noBackendResponse() {
  return NextResponse.json({ detail: NO_BACKEND_MSG }, { status: 503 });
}

export async function GET(req: NextRequest) {
  if (BACKEND) {
    try {
      return await proxyToBackend(req, "GET");
    } catch {
      return NextResponse.json({ detail: "Upstream unreachable" }, { status: 502 });
    }
  }
  return emptyGet(getPath(req));
}

export async function POST(req: NextRequest) {
  if (BACKEND) {
    try {
      return await proxyToBackend(req, "POST");
    } catch {
      return NextResponse.json({ detail: "Upstream unreachable" }, { status: 502 });
    }
  }
  return noBackendResponse();
}

export async function PUT(req: NextRequest) {
  if (BACKEND) {
    try {
      return await proxyToBackend(req, "PUT");
    } catch {
      return NextResponse.json({ detail: "Upstream unreachable" }, { status: 502 });
    }
  }
  return noBackendResponse();
}

export async function PATCH(req: NextRequest) {
  if (BACKEND) {
    try {
      return await proxyToBackend(req, "PATCH");
    } catch {
      return NextResponse.json({ detail: "Upstream unreachable" }, { status: 502 });
    }
  }
  return noBackendResponse();
}

export async function DELETE(req: NextRequest) {
  if (BACKEND) {
    try {
      return await proxyToBackend(req, "DELETE");
    } catch {
      return NextResponse.json({ detail: "Upstream unreachable" }, { status: 502 });
    }
  }
  return noBackendResponse();
}
