import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
// Top-level import: the whole file fails to load until `proxy.ts` exists at
// the project root (task 2.3), which is the "verification fails" expectation
// of task 2.2.
import { proxy } from "../proxy";

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
  it("generates a fresh nonce per request", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const first = runProxy();
    const second = runProxy();
    expect(first.nonce).not.toBe("");
    expect(second.nonce).not.toBe("");
    expect(second.nonce).not.toBe(first.nonce);
  });

  it("writes connect-src 'self' and the Nominatim origin when NEXT_PUBLIC_API_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", undefined);
    const { csp } = runProxy();
    expect(csp).toContain("connect-src 'self' https://nominatim.openstreetmap.org;");
  });

  it("appends 'unsafe-eval' to script-src only in development", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    vi.stubEnv("NODE_ENV", "development");
    const { csp, nonce } = runProxy();
    expect(csp).toBe(expectedCsp(nonce, true));
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
  it("redirects a bare path to the same path under the default locale", () => {
    const response = runProxyOn("https://tazavera.test/about?ref=nav");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://tazavera.test/es/about?ref=nav",
    );
  });

  // Framework and asset paths are not application routes: they must reach
  // their own URL untouched — no locale prefix and nothing forwarded — or no
  // CSS, JS, icon or font loads and the page is blank (design.md D2).

  it("lets a file path pass through untouched (/favicon.ico)", () => {
    const response = runProxyOn("https://tazavera.test/favicon.ico");
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-locale")).toBeNull();
  });
});

// ─── `/callback` (design.md D11; spec "Content-Security-Policy on the callback") ───
// `/callback` joins the proxy's handling with the D9 directive list and its
// own fresh nonce — redirect mode hydrates for its client-side navigation and
// exchanges the code at the API origin, named in `connect-src` — and stays
// outside the locale redirect.

describe("proxy.ts on /callback (design.md D11)", () => {
  it("generates a fresh nonce per /callback request", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const nonceOf = () =>
      runProxyOn("https://tazavera.test/callback")
        .headers.get("Content-Security-Policy")
        ?.match(/'nonce-([^']+)'/)?.[1] ?? "";
    const first = nonceOf();
    const second = nonceOf();
    expect(first).not.toBe("");
    expect(second).not.toBe("");
    expect(second).not.toBe(first);
  });

  it("leaves /callback outside the locale redirect while a bare path still redirects", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    const callback = runProxyOn("https://tazavera.test/callback?code=c&state=s");
    expect(callback.status).toBe(200);
    expect(callback.headers.get("location")).toBeNull();

    const bare = runProxyOn("https://tazavera.test/about");
    expect(bare.status).toBe(307);
    expect(bare.headers.get("location")).toBe("https://tazavera.test/es/about");
  });
});
