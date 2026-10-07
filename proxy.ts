import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/shared/config/locales";

/**
 * Cross-Origin-Opener-Policy (`add-auth` design.md D11): every response this
 * proxy handles keeps its page isolated while the sign-in popup keeps its
 * opener. `/callback` carries none — it would be severed from its opener after
 * returning from the API origin.
 */
const COOP = "same-origin-allow-popups";

/**
 * Front-wide proxy (Next 16 file convention; `middleware` is deprecated).
 *
 * Locale routing (design.md D2): a bare path is prefixed with the default
 * locale, the root URL redirects to it, and the matched locale is forwarded
 * upstream as `x-locale` so the root layout can set `<html lang>` (the proxy
 * passes information to the application through headers). `/callback` sits
 * outside the locale redirect (`add-auth` design.md D11): it gets the
 * Content-Security-Policy below and nothing else, and framework and asset paths (`/_next/*`, any path with a file extension) are
 * excluded from the proxy itself so they are never prefixed with a locale.
 *
 * Content-Security-Policy (design.md D9): set on every response this proxy
 * handles, with a fresh nonce per request forwarded upstream as `x-nonce`
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
  const { pathname, search } = request.nextUrl;

  // Framework and asset paths are not application routes (design.md D2) and
  // are excluded from the proxy entirely — the same outcome as leaving them
  // out of the matcher. Anything under `/_next/` and any path whose last
  // segment carries a file extension (favicon, icon, images, fonts) must
  // reach its own URL untouched: prefixing those with the locale would load
  // no CSS, JS or font and leave the page blank.
  if (pathname.startsWith("/_next/") || /\/[^/]*\.[^/]*$/.test(pathname)) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : null;

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://tile.openstreetmap.org",
    "font-src 'self'",
    ["connect-src 'self'", apiOrigin].filter(Boolean).join(" "),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  // `/callback` (`add-auth` design.md D11): the same directive list with its
  // own nonce — redirect mode hydrates for its client-side navigation and
  // exchanges the code at the API origin in `connect-src` — and no locale.
  if (pathname === "/callback") {
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

  const locale = LOCALES.find(
    (candidate) =>
      pathname === `/${candidate}` || pathname.startsWith(`/${candidate}/`),
  );

  // Locale routing (design.md D2): the root URL redirects to the default
  // locale and a bare path is prefixed with it, so every application URL
  // carries one of the supported locale prefixes (spec: "Route under a locale
  // prefix", "Root URL").
  if (locale === undefined) {
    const target =
      pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    const response = NextResponse.redirect(
      new URL(`${target}${search}`, request.url),
    );
    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("Cross-Origin-Opener-Policy", COOP);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Cross-Origin-Opener-Policy", COOP);

  return response;
}

export const config = {
  // Every path: framework and asset paths return untouched inside the proxy
  // (design.md D2) and `/callback` gets its own branch (`add-auth` design.md
  // D11).
  matcher: ["/:path*"],
};
