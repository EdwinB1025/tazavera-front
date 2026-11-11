# Tasks

`design.md` is skipped: the approved design summary `docs/design/update-vulnerable-dependencies/design-summary.md` (decisions D1–D6, sections 2 and 5) replaces it, as in `upgrade-next-16-4`. This change adds no tests (D4): the app-shell scenarios are verified by the audit commands of task 2.1.

## 1. Upgrade

- [ ] 1.1 Set `next` and `eslint-config-next` in `package.json` to `16.4.6` as exact pins, run `npm install`, then run `npm view typescript-eslint version` and `npm audit fix` without `--force`. Expected: only `package.json` and `package-lock.json` change; `@next/*` transitive packages resolve to 16.4.6; `vitest` / `@vitest/mocker` resolve to 5.0.3 or later, `vite` to 8.3.3 or later, `undici` to 8.12.2 or later and `zod` to 4.6.6 or later, all within their current `package.json` ranges (no range is edited); no dependency is added or removed, no `overrides` entry is added and ESLint stays on v9. If 16.4.6 asks for a new peer dependency, if `npm audit fix` proposes anything outside these ranges, or if a fix needs `--force` or ESLint 10, stop and ask. The `minimatch` / `typescript-eslint` chain stays unless `npm view` shows a stable `typescript-eslint` 8.72.3 or later that `npm audit fix` takes within `eslint-config-next`'s range. Report in the final report the version `npm audit fix` picked for each package, and the `typescript-eslint` version `npm view` returned. Then `npx next typegen`, `npx tsc --noEmit`, `npm run lint` and `npx vitest run proxy.test.ts` pass.
- [ ] 1.2 Read the upgrade and version notes under `node_modules/next/dist/docs/` (search for "16.4", "upgrading" and "deprecat") and apply only the mechanical renames the project's current code needs to keep building and behaving the same. Expected: no file changes; any deprecation that needs more than a mechanical rename is reported as a question, not changed.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm ci`, `npx next typegen`, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build` twice, `npm audit --omit=dev`, `npm audit --audit-level=high` and `npm audit`. Expected: both suites pass with the same test files and cases as on `develop` at `95fc68e4`; typecheck and lint report no errors; both builds succeed with no `SecurityFatalError`; `npm audit --omit=dev` reports no advisory; `npm audit --audit-level=high` exits with status 0 (no high or critical advisory, development dependencies included); `npm audit` reports at most the moderate `minimatch` advisory (GHSA-g3hv-75wg-m249) and its `@typescript-eslint/*` / `typescript-eslint` / `eslint-config-next` dependents, listed in the final report and not fixed; `proxy.ts`, `next.config.ts` and every file under `src/` are unchanged.

## Workflow follow-up

- Verify (`/opsx:verify update-vulnerable-dependencies`) after `npm run test:qa` has passed.
- Product owner's browser check before archive (recommended, summary section 5): home page with the `next/image` hero, sign-in popup, one form submission.
- Archive on Product owner's request.
