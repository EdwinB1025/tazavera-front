# Tasks

Every task commit uses the scope `testing` (`<type>(testing): …`, footer `Refs: add-locale-e2e-test`). No derived API types are needed: the change consumes no API operation (design.md D10), so there is no types group. No file under `app/`, `src/`, `messages/`, `contracts/`, and neither `Dockerfile` nor `.dockerignore`, changes in any task.

## 1. Baseline

- [x] 1.1 Before any other change, run `npm run test:run` and `npm run test:qa`, each on its own. Expected: both pass; record each suite's number of test files and tests in the final report (the baseline for task 4.1, design.md D9). No file changes; commit only the checkbox.

## 2. Dependency, script and ignored output

- [x] 2.1 Run `npm install --save-dev --save-exact @playwright/test@1.63.0` (design.md D1); add the script `"test:e2e": "playwright test"` to `package.json` (D2), leaving `test:run` and `test:qa` unchanged; add `test-results/` and `playwright-report/` to `.gitignore` under `# testing` (D7). Do not run `npx playwright install` or download any browser. Expected: `package.json` lists `"@playwright/test": "1.63.0"` in `devDependencies` (no `^` or `~`); `package-lock.json` resolves `@playwright/test`, `playwright` and `playwright-core` to `1.63.0` and changes no other package's version; a new nested `fsevents` entry under `playwright` in `package-lock.json` is expected and not a stop (design.md Files); `npx playwright --version` prints `1.63.0`; `npx tsc --noEmit` and `npm run lint` pass. If npm proposes any other change, stop and report it.

## 3. "Choosing a locale" end to end

- [x] 3.1 Write `e2e/app-shell/language-selection.e2e.ts` (design.md D6): one test titled `opens the same route in the chosen locale (spec: Choosing a locale)` that, in its fresh context, opens `/es/about`, clicks the button named `ES — Idioma: Español`, clicks the `menuitemradio` named `English`, then asserts that the URL's path is `/en/about` and that the level-1 heading's text is `Coffee, told as it is`. The texts are not literals: the selector's name is composed as `` `${"es".toUpperCase()} — ${languageSelector}: ${LOCALE_NAMES.es.name}` `` from `../../messages/es/shell.json` and `../../src/shared/config/locale-names.ts`; the entry's name is `LOCALE_NAMES.en.name`; the heading is `aboutHeadingBefore + aboutHeadingAccent + aboutHeadingAfter` from `../../messages/en/landing.json`. No other assertion, no screenshot, no snapshot. Do not run `npm run test:e2e` in this task: the test covers behaviour that already exists, so there is no meaningful red step, and task 3.2's green run is the evidence. Expected: `npx tsc --noEmit` and `npm run lint` pass.
- [x] 3.2 Write `playwright.config.ts` at the root (design.md D4, D5): `testDir` `e2e`, `testMatch` `**/*.e2e.ts`; one project `chromium` with the `Desktop Chrome` device; `use.baseURL` = `process.env.E2E_BASE_URL` or `http://localhost:3000`; `retries` `0`; no trace, video or screenshot option; reporters `list` and `html` with `{ open: 'never' }`; `webServer` with `command` `npm run build && npm run start`, `url` the base URL, `reuseExistingServer` `true`, `timeout` `300_000`, and `env` `{ NEXT_PUBLIC_APP_URL: <base URL>, NEXT_PUBLIC_API_URL: <base URL> + '/api' }` (no `API_INTERNAL_URL`). Expected: `npm run test:e2e` builds and starts the front (the `next start` standalone warning is expected) and passes 1 test in `chromium`; the HTML report is written to `playwright-report/` and not opened; `git status` shows neither `playwright-report/` nor `test-results/`; `npx tsc --noEmit` and `npm run lint` pass with no new warning on `playwright.config.ts`. If the browser cannot launch in the cloud, stop and report it (no `executablePath`).

## 4. Full checks

- [ ] 4.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build` and `npm run test:e2e` (one run). Expected: both Vitest suites pass with the same numbers of test files and tests as in task 1.1; typecheck and lint report no errors; the build succeeds; `npm run test:e2e` passes 1 test; `git status` is clean apart from `tasks.md`; `git diff develop --stat` lists only `package.json`, `package-lock.json`, `.gitignore`, `playwright.config.ts`, `e2e/app-shell/language-selection.e2e.ts`, `docs/design/add-locale-e2e-test/design-summary.md` and the change's `openspec/` files.

## Workflow follow-up

- Verify (`/opsx:verify add-locale-e2e-test`) and archive on Product owner's request; the archive resolves backlog entry R1.
