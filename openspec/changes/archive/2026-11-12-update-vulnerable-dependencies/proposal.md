# Proposal

## Why

The installed `next@16.4.0` carries a critical advisory (GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr; patched from 16.4.1), so `develop` no longer meets app-shell's requirement "No known high or critical framework advisory", and `npm run build` fails intermittently with Next.js's `SecurityFatalError`. The audit of 2026-11-11 also reports high-severity advisories in development tooling (`vite`, `undici`, `zod`) that the requirement does not cover today (design summary `docs/design/update-vulnerable-dependencies/design-summary.md`, sections 1–2).

## What Changes

- Upgrade `next` and `eslint-config-next` from 16.4.0 to 16.4.6, keeping the exact-version pins `package.json` uses today (summary D1, Open 3 = A).
- Apply `npm audit fix` without `--force` for the in-range packages (`vitest` / `@vitest/mocker`, `vite`, `undici`, `zod`); only `package-lock.json` changes for them, and no `package.json` range is widened (D2).
- The `minimatch` / `typescript-eslint` chain (7 moderate, dev only) has no stable patched release in range: it is accepted and reported; `typescript-eslint` 8.72.3 or later is taken through `npm audit fix` only if it is released by the time of the apply (Open 2 = A).
- Apply only the mechanical renames the Next.js 16.4.1–16.4.6 notes require (D5).
- Widen app-shell's advisory requirement from production dependencies to every installed dependency, for high and critical severity; moderate and low advisories stay report-only (Open 1 = B).
- No behaviour change: what users see, the requests sent to the API, `proxy.ts`, the security headers and the Content-Security-Policy stay the same (D4).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: the requirement "No known high or critical framework advisory" now covers every installed dependency, development tooling included, for high and critical severity; moderate and low advisories are reported without failing verification.

## Impact

- Files: `package.json`, `package-lock.json`. No code, test or configuration file is expected to change.
- Dependencies (approved by the orchestrator under Product owner's delegation, 2026-11-11, summary Open 3 = A): `next` and `eslint-config-next` 16.4.0 → 16.4.6 (exact pins); `@next/*` transitive packages follow to 16.4.6; `vitest`, `@vitest/mocker`, `vite`, `undici` and `zod` move within their current ranges through `npm audit fix`. No dependency is added or removed, no `overrides` entry is added, ESLint stays on v9 (D3).
- Protecting checks: the validation and QA suites, typecheck, lint, `npm run build` (twice), `npm audit` and `npm audit --omit=dev`.
- Order: highest priority; goes to `develop` first, before R91 and the badge-toggle change, which take `develop` in at their merge (Open 4).

## Non-goals

- Fixing the `minimatch` advisory (GHSA-g3hv-75wg-m249) through `overrides`, a canary `typescript-eslint` or `--force`.
- Upgrading any dependency beyond what the advisories require (for example ESLint 10, or a `next` minor version).
- Adopting any Next.js 16.4.1–16.4.6 feature, or changing `proxy.ts`, the security headers or the Content-Security-Policy.
- Adding tests or a guard for the audit: verification runs `npm audit`, as in `upgrade-next-16-4`.
- Changing the Docker base image (its glibc or musl base, relevant to GHSA-2464, is unverified).
