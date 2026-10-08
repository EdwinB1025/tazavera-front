Type: Refactor (fast lane)

# Proposal

## Why

The installed `next@16.3.6` carries six high-severity advisories, fixed in 16.4.0, and the transitive `source-map-js` carries one more, so `npm audit` cannot come back clean (backlog R20, technical review §3.1 row R20). Upgrading the framework minor version is the only way to clear them.

## What Changes

- Upgrade `next` and `eslint-config-next` to the latest `16.4.x` patch (16.4.0 at propose time), keeping the exact-version pins `package.json` uses today.
- Apply `npm audit fix` (without `--force`) for the transitive `source-map-js` advisory; `package-lock.json` changes accordingly.
- Apply only the mechanical code changes the 16.4 upgrade notes require for the current code to keep building and behaving the same. The 16.4.0 docs list only additions (`navigation`, `prefetch`, `ensureStatic`, new experimental options) and no deprecation that touches the project's code, so none is expected.
- No behaviour change: what users see, the requests sent to the API, the security headers and the Content-Security-Policy stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the observable property that the installed framework carries no known high or critical advisory. No existing requirement changes.

## Impact

- Files: `package.json`, `package-lock.json`.
- Dependencies: `next` and `eslint-config-next` 16.3.6 → 16.4.x; transitive `source-map-js` updated by `npm audit fix`. ESLint stays on v9. No dependency is added or removed; 16.4.0 adds no peer dependency the project lacks.
- Protecting checks: the validation and QA suites (including `proxy.test.ts` and the `client-boundary` guard), typecheck, lint and `npm run build`.

## Non-goals

- Adopting any 16.4 feature (`navigation`, `prefetch`, `ensureStatic`, experimental options).
- Upgrading any other dependency, ESLint 10 included.
- Changing `proxy.ts`, the security headers or the Content-Security-Policy.

## Propose status

- Change-id: `upgrade-next-16-4`
- Date: 2026-10-08
- `openspec validate upgrade-next-16-4 --strict`: valid
- Resolves backlog entry: R20 (Upgrade Next.js to 16.4, security advisories)
- Resolved: target version 16.4.0 for both `next` and `eslint-config-next` (latest 16.4.x on npm at propose time); 16.4.0 requires no new peer dependency; its docs list no deprecation affecting the current code, so no code change is planned. `design.md` is skipped: the backlog entry and review row R20 replace it.
- Update (2026-10-08, before apply): the spec delta is narrowed to the framework and the production dependencies. After the upgrade, `npm audit` still reports the dev-only `braces` advisory (GHSA-vfj7-8cjw-p6xm, `braces <=3.0.3`) through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch`; no patched `braces` release exists, the only `npm audit` fix is `--force` to `eslint-config-next@14.2.35`, and the chain is already present on `origin/qa`. `openspec validate upgrade-next-16-4 --strict`: valid.
- Open: the dev-only `braces` advisory, reported to Product owner; not part of R20.
