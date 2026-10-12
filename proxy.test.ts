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

function expectedCsp(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://tile.openstreetmap.org",
    "font-src 'self'",
    "connect-src 'self' https://nominatim.openstreetmap.org",
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
// exchanges the code through the front's own origin (`connect-src 'self'`) — and stays
// outside the locale redirect.

describe("proxy.ts on /callback (design.md D11)", () => {
  it("runs on /callback (the matcher no longer excludes it)", () => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/callback" }),
    ).toBe(true);
  });

  it("sets Content-Security-Policy to exactly the design.md D9 directive list, connect-src naming no API origin", () => {
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

// ─── One public entry point (auth "One public entry point"; design.md D1–D3, D5) ───
// The front forwards every path under `/api/` with the prefix removed and the
// API's web routes unchanged to the server-only `API_INTERNAL_URL`. A rewrite
// to an external URL is observable as `x-middleware-rewrite`, and the
// forwarded request headers as `x-middleware-request-<key>`.

const APP_URL = "https://tazavera.test";
const INTERNAL_URL = "http://api.internal:8000";

function stubForwarding() {
  vi.stubEnv("API_INTERNAL_URL", INTERNAL_URL);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", APP_URL);
}

function forward(path: string, method = "GET", headers: Record<string, string> = {}) {
  return proxy(new NextRequest(`${APP_URL}${path}`, { method, headers }));
}

describe("proxy.ts forwarding to the API (auth: One public entry point)", () => {
  it("A path under the prefix is forwarded without it", () => {
    stubForwarding();
    const cases: [string, string, string][] = [
      ["GET", "/api/offerings?page=2", "/offerings?page=2"],
      ["POST", "/api/oauth/token", "/oauth/token"],
      ["PUT", "/api/users/01J0", "/users/01J0"],
      ["POST", "/api/logout", "/logout"],
    ];
    for (const [method, path, apiPath] of cases) {
      expect(forward(path, method).headers.get("x-middleware-rewrite")).toBe(
        `${INTERNAL_URL}${apiPath}`,
      );
    }
  });

  it("A listed web route is forwarded unchanged", () => {
    stubForwarding();
    const cases: [string, string][] = [
      ["GET", "/login"],
      ["POST", "/oauth/authorize"],
      ["GET", "/user/security"],
      ["GET", "/reset-password/abc123?email=a%40b.test"],
      ["POST", "/livewire-eb65e81f/update"],
      ["GET", "/flux/flux.js"],
      ["GET", "/build/assets/app.css"],
    ];
    for (const [method, path] of cases) {
      expect(forward(path, method).headers.get("x-middleware-rewrite")).toBe(
        `${INTERNAL_URL}${path}`,
      );
    }
  });

  it("A forwarded response is served as the API sends it", () => {
    stubForwarding();
    for (const path of ["/login", "/api/offerings"]) {
      const headers = forward(path).headers;
      expect(headers.has("Content-Security-Policy")).toBe(false);
      expect(headers.has("Cross-Origin-Opener-Policy")).toBe(false);
      expect(headers.has("X-Content-Type-Options")).toBe(false);
      expect(headers.has("Referrer-Policy")).toBe(false);
      expect(headers.has("Permissions-Policy")).toBe(false);
    }
  });

  it("The forwarded request carries the public origin", () => {
    stubForwarding();
    const response = forward("/api/offerings", "GET", {
      "x-forwarded-host": "evil.example",
      "x-forwarded-proto": "http",
      "x-forwarded-port": "8080",
    });
    expect(response.headers.get("x-middleware-request-x-forwarded-host")).toBe("tazavera.test");
    expect(response.headers.get("x-middleware-request-x-forwarded-proto")).toBe("https");
    expect(response.headers.get("x-middleware-request-x-forwarded-port")).toBe("443");
  });

  it("No internal API address", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", APP_URL);
    vi.stubEnv("API_INTERNAL_URL", undefined);
    for (const path of ["/api/offerings", "/login"]) {
      const response = forward(path);
      expect(response.status).toBe(502);
      expect(response.headers.has("x-middleware-rewrite")).toBe(false);
    }
  });

  it("Paths that are not forwarded", () => {
    stubForwarding();
    const paths = [
      "/logout",
      "/api",
      "/_next/static/x.js",
      "/favicon.ico",
      "/callback",
      "/es/offerings",
      "/user",
      "/offerings",
    ];
    for (const path of paths) {
      const response = forward(path);
      expect(response.headers.get("x-middleware-rewrite") ?? "").not.toContain(INTERNAL_URL);
      expect(response.status).not.toBe(502);
    }
  });
});
