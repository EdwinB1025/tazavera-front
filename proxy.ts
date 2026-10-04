import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Front-wide proxy (Next 16 file convention; `middleware` is deprecated).
 *
 * Sets the Content-Security-Policy of design.md D9 on every response with a
 * fresh nonce per request, and forwards the same nonce upstream as `x-nonce`
 * so Next.js can stamp the framework's own inline scripts (the documented
 * strict-CSP path in `01-app/02-guides/content-security-policy.md`). The
 * policy is also set on the forwarded request, because Next.js extracts the
 * nonce from the request's `Content-Security-Policy` while rendering.
 *
 * `style-src` keeps `'unsafe-inline'` and no nonce: a nonce there suppresses
 * `'unsafe-inline'`, and the Radix overlays position themselves with inline
 * styles. In development, and only there, `'unsafe-eval'` is appended to
 * `script-src` (React uses `eval` for debugging there).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : null;

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    ["connect-src 'self'", apiOrigin].filter(Boolean).join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}
