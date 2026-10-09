import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
// The installed Next.js exports the matcher check as
// `unstable_doesMiddlewareMatch`; the bundled proxy guide names it
// `unstable_doesProxyMatch`, which this version does not export.
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
// Top-level import: the whole file fails to load until `proxy.ts` exists at
// the project root (task 2.3), which is the "verification fails" expectation
// of task 2.2.
import { config, proxy } from "./proxy";

/**
 * Content-Security-Policy contract of `proxy.ts` (design.md D9) and its
 * locale routing (design.md D2; spec "Locale routing").
 *
 * Every response carries exactly the documented directive list with a fresh
 * nonce per request in `script-src`, and the same nonce is forwarded upstream
 * on the request as `x-nonce` so Next.js can stamp the framework's inline
 * scripts. In development, and only there, `'unsafe-eval'` is appended to
 * `script-src` (React uses `eval` for debugging there).
 *
 * The forwarded request headers are observable on the response as
 * `x-middleware-request-<key>` — the encoding `NextResponse.next({ request })`
 * hands to the render server.
 */

const API_URL = "https://api.tazavera.test";
const API_ORIGIN = "https://api.tazavera.test";

function expectedCsp(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://tile.openstreetmap.org",
    "font-src 'self'",
    `connect-src 'self' ${API_ORIGIN} https://nominatim.openstreetmap.org`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function runProxy(): { csp: string; nonce: string; upstreamNonce: string | null } {
  const response = proxy(new NextRequest("https://tazavera.test/es"));
  const csp = response.headers.get("Content-Security-Policy") ?? "";
  const nonce = csp.match(/'nonce-([^']+)'/)?.[1] ?? "";
  const upstreamNonce = response.headers.get("x-middleware-request-x-nonce");
  return { csp, nonce, upstreamNonce };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("proxy.ts Content-Security-Policy (design.md D9)", () => {
  it("sets Content-Security-Policy to exactly the design.md D9 directive list", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const { csp, nonce } = runProxy();
    expect(nonce).not.toBe("");
    expect(csp).toBe(expectedCsp(nonce, false));
  });

  it("forwards the same nonce upstream as x-nonce", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const { nonce, upstreamNonce } = runProxy();
    expect(upstreamNonce).toBe(nonce);
  });
});

// ─── Locale routing (design.md D2; spec "Root URL", "Unsupported locale") ───
// A path whose first segment is not a supported locale is redirected to the
// same path under the default locale, keeping its query: it resolves there to
// not-found and no screen ever renders in an unsupported locale.

function runProxyOn(url: string) {
  return proxy(new NextRequest(url));
}

describe("proxy.ts locale routing (design.md D2)", () => {
  it("redirects the root URL to the default locale (spec: Root URL)", () => {
    const response = runProxyOn("https://tazavera.test/");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://tazavera.test/es");
  });

  it("redirects an unsupported locale prefix to the same path under the default locale, keeping its query (spec: Unsupported locale)", () => {
    const response = runProxyOn("https://tazavera.test/fr/about?ref=nav");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://tazavera.test/es/fr/about?ref=nav",
    );
  });

  it("lets a supported-locale path through with no redirect", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const response = runProxyOn("https://tazavera.test/es/about?ref=nav");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-next-intl-locale")).toBe("es");
  });

  // Framework and asset paths are not application routes: they must reach
  // their own URL untouched — no locale prefix and nothing forwarded — or no
  // CSS, JS, icon or font loads and the page is blank (design.md D2).
  it("lets a framework path pass through untouched (/_next/static/x.js)", () => {
    const response = runProxyOn("https://tazavera.test/_next/static/x.js");
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-next-intl-locale")).toBeNull();
  });

  // The locale comes only from the URL and the language selector
  // (adopt-next-intl-routing; spec "Locale chosen only by the user").
  it("redirects the root URL to the default locale whatever the browser language, setting no cookie (spec: Browser language ignored)", () => {
    const response = proxy(
      new NextRequest("https://tazavera.test/", {
        headers: {
          "accept-language": "en",
          cookie: "NEXT_LOCALE=en",
          "sec-fetch-dest": "document",
        },
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://tazavera.test/es");
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});

// ─── `/callback` (design.md D11; spec "Content-Security-Policy on the callback") ───
// `/callback` joins the proxy's handling with the D9 directive list and its
// own fresh nonce — redirect mode hydrates for its client-side navigation and
// exchanges the code at the API origin, named in `connect-src` — and stays
// outside the locale redirect.

describe("proxy.ts on /callback (design.md D11)", () => {
  it("runs on /callback (the matcher no longer excludes it)", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/callback" }),
    ).toBe(true);
  });

  it("sets Content-Security-Policy to exactly the design.md D9 directive list, the API origin in connect-src", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const response = runProxyOn("https://tazavera.test/callback?code=c&state=s");
    const csp = response.headers.get("Content-Security-Policy") ?? "";
    const nonce = csp.match(/'nonce-([^']+)'/)?.[1] ?? "";
    expect(nonce).not.toBe("");
    expect(csp).toBe(expectedCsp(nonce, false));
    expect(response.headers.get("x-middleware-request-x-nonce")).toBe(nonce);
  });
});

// ─── Cross-Origin-Opener-Policy (design.md D11; app-shell spec delta) ───
// Pages stay isolated while the sign-in popup keeps its opener; `/callback`
// carries none, or it would be severed from its opener after returning from
// the API origin.

describe("proxy.ts Cross-Origin-Opener-Policy (design.md D11)", () => {
  it("sets Cross-Origin-Opener-Policy: same-origin-allow-popups on a page response", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const response = runProxyOn("https://tazavera.test/es/about");
    expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin-allow-popups",
    );
  });

  it("sets no Cross-Origin-Opener-Policy on a /callback response", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const response = runProxyOn("https://tazavera.test/callback?code=c&state=s");
    expect(response.headers.has("Cross-Origin-Opener-Policy")).toBe(false);
  });
});

// ─── Response security headers (app-shell "Response security headers") ───
// Every document response carries nosniff, the referrer policy and a
// permissions policy that keeps geolocation for the app's own origin.

describe("proxy.ts response security headers", () => {
  it("sets nosniff, Referrer-Policy and Permissions-Policy on a page response", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const response = runProxyOn("https://tazavera.test/es/about");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
    );
  });
});
