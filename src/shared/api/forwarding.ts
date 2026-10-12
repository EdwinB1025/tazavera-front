import { NextResponse, type NextRequest } from "next/server";

/**
 * Forwarding of the API's surface through the front (route-api-web-pages-through-front
 * design.md D1–D3, D5; auth "One public entry point"). The front is the only
 * public entry point: the proxy hands every forwarded path to the server-only
 * `API_INTERNAL_URL` and answers nothing else for it.
 */

/** The one place the prefix of the JSON calls and the token endpoint lives. */
export const API_PREFIX = "/api";

/** The API's web routes forwarded with their path unchanged (exact paths). */
const WEB_PATHS = new Set([
  "/oauth/authorize",
  "/login",
  "/two-factor-challenge",
  "/forgot-password",
  "/reset-password",
  "/email/verify",
  "/email/verification-notification",
  "/user/security",
  "/user/confirm-password",
  "/user/confirmed-password-status",
  "/user/confirmed-two-factor-authentication",
  "/user/two-factor-authentication",
  "/user/two-factor-qr-code",
  "/user/two-factor-recovery-codes",
  "/user/two-factor-secret-key",
  "/user/passkeys",
  "/user/passkeys/options",
  "/passkeys/login",
  "/passkeys/login/options",
  "/passkeys/confirm",
  "/passkeys/confirm/options",
  "/favicon.svg",
]);

/**
 * The parameterised web routes (one non-empty segment per parameter) and the
 * asset prefixes: `/build/`, `/flux/` and the Livewire group `/livewire-<hex>/`.
 */
const WEB_PATTERNS = [
  /^\/reset-password\/[^/]+$/,
  /^\/email\/verify\/[^/]+\/[^/]+$/,
  /^\/user\/passkeys\/[^/]+$/,
  /^\/build\//,
  /^\/flux\//,
  /^\/livewire-[0-9a-f]+\//,
];

/**
 * The path to request on the API: the prefix removed for a path under
 * `/api/`, unchanged for a listed web route; `null` when the path is not
 * forwarded.
 */
export function apiPathFor(pathname: string): string | null {
  if (pathname.startsWith(`${API_PREFIX}/`)) {
    return pathname.slice(API_PREFIX.length);
  }
  if (WEB_PATHS.has(pathname) || WEB_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return pathname;
  }
  return null;
}

/**
 * The front's public origin as the three forwarded headers (design.md D3),
 * replacing any incoming value.
 */
function forwardedHeaders(request: NextRequest): Headers {
  const app = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const proto = app.protocol.slice(0, -1);
  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-Host", app.host);
  headers.set("X-Forwarded-Proto", proto);
  headers.set("X-Forwarded-Port", app.port || (proto === "https" ? "443" : "80"));
  return headers;
}

/**
 * The response for a forwarded path: a rewrite to `API_INTERNAL_URL` with the
 * same query and the forwarded headers, or `502` with an empty body when that
 * address is unset or empty (design.md D5). `null` when the path is not
 * forwarded. The response carries none of the front's headers.
 */
export function forwardToApi(request: NextRequest): NextResponse | null {
  const apiPath = apiPathFor(request.nextUrl.pathname);
  if (apiPath === null) {
    return null;
  }
  const internal = process.env.API_INTERNAL_URL;
  if (!internal) {
    return new NextResponse(null, { status: 502 });
  }
  return NextResponse.rewrite(`${internal}${apiPath}${request.nextUrl.search}`, {
    request: { headers: forwardedHeaders(request) },
  });
}
