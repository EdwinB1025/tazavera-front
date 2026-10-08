Type: Refactor (fast lane)

# Proposal

## Why

The front's responses lack `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, and they expose the framework through `X-Powered-By` (backlog R31). Adding the three headers and removing `X-Powered-By` raises the Security headers indicator of the technical review from B to A. R3 rides with it: `proxy.test.ts` gains the response-header assertions.

## What Changes

- `proxy.ts` sets, on every document response it handles (a locale page, the locale redirect and `/callback`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`. The map and location features stay allowed for the application's own origin (`geolocation=(self)`); the map tiles need no permission.
- `next.config.ts` sets `poweredByHeader: false`, so no response carries `X-Powered-By`.
- The Content-Security-Policy, its nonce, the Cross-Origin-Opener-Policy and the locale routing stay exactly as they are; framework and asset paths stay untouched by the proxy.
- No behaviour a user sees changes, and the requests sent to the API stay the same.

## Test exception (Product owner, 2026-10-08)

A refactor change adds no tests; Product owner made an explicit exception for this change: it MAY add the response-header assertions to the existing `proxy.test.ts` (R3's tests), one test per new header behaviour. The three headers present on a page response get one test. `X-Powered-By` is removed by framework configuration, which a unit test of `proxy.ts` cannot observe; its absence is checked against the production server after `npm run build` and is not unit-tested. No other test is added.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the requirement that states the response security headers the application sends. No existing requirement changes.

## Impact

- Files: `proxy.ts`, `next.config.ts`, `proxy.test.ts`.
- Dependencies: none.
- Protecting checks: the validation and QA suites (including `proxy.test.ts`), typecheck, lint and `npm run build`.

## Non-goals

- Changing the Content-Security-Policy, its nonce or the Cross-Origin-Opener-Policy.
- Adding headers to framework and asset paths, which the proxy leaves untouched (design D2 of the locale routing).
- Strict-Transport-Security, which belongs to the hosting layer.

## Propose status

- Change-id: `harden-response-headers`
- Date: 2026-10-08
- `openspec validate harden-response-headers --strict`: valid
- Resolves backlog entries: R31 (Harden the response headers) and R3 (Cover the `/callback` exclusion and the `connect-src` fallback), the latter as decided by Product owner: R3's tests are the response-header assertions in `proxy.test.ts`.
- Resolved: the headers are set in `proxy.ts` next to the CSP on the three document branches (page, locale redirect, `/callback`); `Permissions-Policy` is `camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`; `X-Powered-By` is removed with `poweredByHeader: false`; one new test in `proxy.test.ts`, `X-Powered-By` checked at runtime only. `design.md` is skipped: the backlog entries replace it.
- Open: R3 also named the unset-`NEXT_PUBLIC_API_URL` `connect-src` fallback, which stays without a test (the `/callback` matcher case is already covered by "runs on /callback"); reported to Product owner.
