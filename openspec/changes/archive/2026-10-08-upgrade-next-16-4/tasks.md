# Tasks

## 1. Upgrade

- [x] 1.1 Run `npm view next@16.4 version` and `npm view eslint-config-next@16.4 version`, set both in `package.json` to that same latest `16.4.x` patch as exact pins, run `npm install`, then `npm audit fix` without `--force`. Expected: only `package.json` and `package-lock.json` change; no dependency is added or removed and ESLint stays on v9 (if 16.4.x asks for a new peer dependency, stop and ask); `npm audit --omit=dev` reports no advisory and `npm audit` reports no high or critical advisory for `next` or `source-map-js`; `npx vitest run proxy.test.ts`, the `client-boundary` guard, `npx tsc --noEmit` and `npm run lint` pass.
- [x] 1.2 Read the upgrade and version notes under `node_modules/next/dist/docs/` (search for "16.4", "upgrading" and "deprecat") and apply only the mechanical renames the project's current code needs to keep building and behaving the same. Expected: no file changes (the 16.4.0 notes list only additions); any deprecation that needs more than a mechanical rename is reported as a question, not changed.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm audit` and `npm audit --omit=dev`. Expected: both suites pass with the same test files and cases as on `origin/qa`, typecheck and lint report no errors, the build succeeds, `npm audit --omit=dev` reports no advisory, `npm audit` reports no advisory for `next` or `source-map-js` (the dev-only `braces` chain under `eslint-config-next` has no patched release and is reported, not fixed), and `proxy.ts` is unchanged.
