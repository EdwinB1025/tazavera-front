# Design

## Context

See proposal.md (Why). The decisions below come from the approved design summary `docs/design/add-locale-e2e-test/design-summary.md` (`Status: approved`, commit `66b2b305`) and are carried here whole, so the build needs no other file for a value.

Current state on `develop` `66b2b305`:

- No end-to-end tooling: no Playwright package in `package.json`, no `e2e/` folder, no `playwright.config.ts`; `.gitignore` ignores neither `test-results/` nor `playwright-report/`.
- `next` 16.4.6 declares `@playwright/test` `^1.51.1` as an optional peer dependency (`node_modules/next/package.json`, `peerDependenciesMeta` → `optional: true`).
- The scenario under test is `app-shell` → "Language selection" → "Choosing a locale": **WHEN** the user chooses a locale in the language selector **THEN** the application opens the same route in the chosen locale and its texts change accordingly. Its unit test "calls back with the chosen locale (spec: Choosing a locale)" (`src/widgets/app-header/ui/AppHeader.test.tsx:442`) covers only the callback; it stays untouched.
- The selector is a button whose accessible name the shell composes in `src/app/shell/AppShell.tsx:83` as `` `${active.toUpperCase()} — ${texts.languageSelector}: ${LOCALE_NAMES[active].name}` ``, from `messages/<locale>/shell.json` `languageSelector` (`es`: `"Idioma"`) and `LOCALE_NAMES` in `src/shared/config/locale-names.ts` (`es` → `"Español"`, `en` → `"English"`, `ca` → `"Català"`). For `es` the name is `ES — Idioma: Español`. Its entries are single-choice menu entries (`menuitemradio`) named by `LOCALE_NAMES[<locale>].name`, each with its own `lang`.
- `/[locale]/about` (`src/pages/about/`) reads only the `landing` catalog and calls no API. Its one level-1 heading renders `aboutHeadingBefore` + `aboutHeadingAccent` + `aboutHeadingAfter` of `messages/<locale>/landing.json`: `en` → `"Coffee, "` + `"told"` + `" as it is"` = `Coffee, told as it is`; `es` → `El café, contado como es`.
- An anonymous first visit (no session marker in the browser) settles the shell's session as anonymous with no request (`src/features/auth/model/session.ts` `start()`).
- R74 (decisions log, 2026-10-12, "the front is the API's only door"): the front is the only entry point; `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`, inlined at build time; `API_INTERNAL_URL` is server-only and needed only for forwarded paths and server-side reads, neither of which this scenario touches.
- `next.config.ts` sets `output: "standalone"`; the `Dockerfile` builds with `npm run build` and runs `next start`.

### Next.js guide read (16.4.6)

`node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` (16.4.6) agrees with the summary, which read the 16.4.0 copy: run end-to-end tests against the production build (`npm run build`, then `npm run start`); Playwright's `webServer` can start the server and wait for it; `baseURL` lets tests use relative paths. Differences from the summary's reading:

- The guide's manual set-up runs `npm init playwright` (an interactive generator that picks the latest version and offers to download browsers). Not used: the dependency is installed directly at the exact version of D1, with no browser download.
- The guide adds "Testing instant navigations" (`instant()` from `@next/playwright`, for Cache Components). Not applicable: `next.config.ts` does not enable Cache Components, and `@next/playwright` is not added.
- The guide's examples name tests `*.spec.ts` and run three browsers. Not followed: `*.spec.ts` would be picked up by both Vitest suites (D3), and the approved scope is Chromium only (D1).

## Goals / Non-Goals

**Goals:**

- A third suite, run by `npm run test:e2e`, that starts (or reuses) the production front and runs end-to-end tests in Chromium through the front's origin only.
- One end-to-end test of "Choosing a locale" with the fewest assertions that fail if the route switch breaks.
- Both Vitest suites keep their file and test counts.

**Non-Goals:**

- Any file under `app/` or `src/`: the suite lives in `e2e/` and a root configuration file, outside every Feature-Sliced Design layer (checked against the `fsd-architecture` skill: no layer holds test tooling or root configuration, and the test only imports two source files, D6).
- An API mock. A future data scenario mocks **one** HTTP server at `API_INTERNAL_URL` (server-side reads go there directly; browser JSON calls reach it through the front's `/api` forwarding; a browser-only route mock cannot reach server-side reads) — recorded for later, decided with the first scenario that needs data (decisions log 2026-10-12, R74).
- Asserting `<html lang>`, the "before" heading text, screenshots or snapshots.
- The other non-goals of proposal.md.

## Decisions

### D1. `@playwright/test` `1.63.0`, exact, Chromium only

The dependency is `@playwright/test` at exactly `1.63.0` in `devDependencies` (no `^` or `~`), installed with an exact save. Only Chromium is used.

Evidence, checked read-only on 2026-11-12:

- The cloud image ships Chromium revision **1243**, not 1194: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, which holds `chromium-1243`, `chromium_headless_shell-1243` and `ffmpeg-1011` (both browser folders marked `INSTALLATION_COMPLETE`). The image's own global `playwright` package is `1.63.0`.
- Chromium revision each stable `playwright-core` release expects (its `browsers.json`, read from the npm registry tarballs): 1.56.1 → 1194; 1.57.0 → 1200; 1.58.2 → 1208; 1.59.1 → 1217; 1.60.0 → 1223; 1.61.1 → 1228; 1.62.1 → 1234; **1.63.0 → 1243** (Chromium 153.0.8010.12, headless shell 1243); 1.64.1 → 1248; 1.65.0 → 1254. `1.63.0` is the only 1.63 release.
- `@playwright/test@1.63.0` depends on `playwright` `1.63.0`, which depends on `playwright-core` `1.63.0`; Apache-2.0; `engines.node` `>=20` (the cloud has Node 22); published 2026-09-04 (stable, not a pre-release).
- It satisfies `next` 16.4.6's optional peer range `^1.51.1`.

Why not `1.56.1` (the summary's recommendation): it expects revision 1194, which the image no longer ships, so it would try to use a missing browser. The orchestrator's decision of 2026-11-12 settles the fallback: the stable release whose `browsers.json` expects the shipped revision, within `^1.51.1`. No `executablePath` workaround is configured.

Browsers: in the cloud, Playwright finds revision 1243 through `PLAYWRIGHT_BROWSERS_PATH`; no task installs or downloads a browser. On Product owner's machine, the browser comes from `npx playwright install chromium`, run once (a download outside npm).

Files: `package.json`, `package-lock.json`.

### D2. Script `test:e2e`

`package.json` gains the script `"test:e2e": "playwright test"`. `test:run` and `test:qa` do not change, so neither runs the end-to-end suite and its tests are never counted in their totals.

### D3. Folder and file naming: `e2e/<capability>/*.e2e.ts`

The test is `e2e/app-shell/language-selection.e2e.ts`. `e2e/` sits at the repository root and groups tests by the capability that owns the scenario (`app-shell`), although this change's capability and commit scope are `testing`. The `*.e2e.ts` suffix is outside Vitest's default include (`**/*.{test,spec}.?(c|m)[jt]s?(x)`) and outside both projects of `vitest.config.mts`, so `vitest.config.mts` and `vitest.qa.config.mts` do not change and both Vitest suites keep their counts. A `*.spec.ts` name would be picked up by both Vitest suites.

### D4. `playwright.config.ts` at the root

One file, end state:

- `testDir`: `e2e`; `testMatch`: `**/*.e2e.ts`.
- One project, named `chromium`, using Playwright's `Desktop Chrome` device (Chromium, desktop viewport 1280×720).
- `use.baseURL`: the environment variable `E2E_BASE_URL` when set, otherwise `http://localhost:3000`. The base URL is always the front's origin; the suite never needs the API's address.
- `retries`: `0`. No `trace`, `video` or `screenshot` option (Playwright's defaults: off).
- `reporter`: `list` and `html` with `{ open: 'never' }`; the HTML report goes to Playwright's default `playwright-report/` (read with `npx playwright show-report`); per-test output goes to Playwright's default `test-results/` (Product owner, 2026-11-12).
- `webServer`: see D5.
- No storage state: every test gets Playwright's default fresh browser context.

The file stays within the size limits (at most 80 lines per function, 300 per file); it renders no JSX, so the root `*.ts` rule `react/jsx-no-literals` has nothing to flag.

### D5. How the suite starts the front (Open 2 A)

`webServer`, end state:

- `command`: `npm run build && npm run start` — a production build, then `next start` on port 3000, the command the `Dockerfile` deploys. Playwright runs it through the platform's shell (`sh` on Linux, `cmd.exe` on Windows); `&&` chains in both, so the command is the same on Product owner's Windows machine and in the Linux cloud.
- `env`: `NEXT_PUBLIC_APP_URL` = the base URL, `NEXT_PUBLIC_API_URL` = `{base URL}/api` (inlined at build time, so they must reach the build; passed through `webServer.env`, never as inline `VAR=value` prefixes, which `cmd.exe` does not support). `API_INTERNAL_URL` is not set: forwarded paths and server-side reads would fail, and this scenario uses neither. Variables already in the process environment take precedence over `.env*` files in Next.js, so a local `.env` file cannot redirect these two.
- `url`: the base URL; Playwright waits until it answers.
- `reuseExistingServer`: `true`, always: when a front already answers at the base URL (a running local stack, or a deployment named by `E2E_BASE_URL`), the suite uses it and builds nothing. `E2E_BASE_URL` is meant for that case; an origin other than `http://localhost:3000` where nothing answers is not started by the suite.
- `timeout`: `300_000` ms (five minutes), to cover a production build; Playwright's default of 60 s is shorter than a cold build.

Facts behind it:

- `next start` on the `output: "standalone"` build logs `"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` and serves: in 16.4.6 it is a `_log.warn` (`node_modules/next/dist/server/next.js`), while only `output: "export"` throws. Not a failure.
- No page reads the API at build time: verified for R74 (its handoff, task 7.1: only `/icon.svg` prerendered); for R91 `/[locale]/join` and R45 `/[locale]/manage/locations/first`, checked by reading on 2026-11-12: there is no `generateStaticParams` anywhere under `app/` or `src/`, so `[locale]` pages render on demand, and both screens (`RegisterLandingScreen`, `FirstLocationScreen`) read only message catalogs on the server. Not confirmed by running a build in this session.

Alternatives (summary Open 2): `npm run dev` (not the deployed code); no `webServer` (always needs a front started by hand; still available through `reuseExistingServer`); the self-contained `node .next/standalone/server.js` (needs a static-asset copy step and is not what the `Dockerfile` runs).

Files: `playwright.config.ts`.

### D6. The test: expected texts read from the app's sources (Open 8 A)

`e2e/app-shell/language-selection.e2e.ts` holds one test, titled `opens the same route in the chosen locale (spec: Choosing a locale)` (the project's "behaviour (spec: Scenario)" convention for spec tests). It:

1. Opens `/es/about` (relative to the base URL) in its fresh context: anonymous first visit, no request to the API.
2. Clicks the button named `ES — Idioma: Español`, then the `menuitemradio` entry named `English`.
3. Asserts, with two assertions: the URL's path becomes `/en/about`; the level-1 heading's text is `Coffee, told as it is`.

The texts are not written as literals. The test loads them with relative imports from `e2e/app-shell/`:

- `../../messages/es/shell.json` (`languageSelector`) and `../../src/shared/config/locale-names.ts` (`LOCALE_NAMES`): the selector's name is composed exactly as `AppShell.tsx:83` does for the active locale `es`: `` `${"es".toUpperCase()} — ${languageSelector}: ${LOCALE_NAMES.es.name}` ``; the entry's name is `LOCALE_NAMES.en.name`.
- `../../messages/en/landing.json`: the heading is `aboutHeadingBefore + aboutHeadingAccent + aboutHeadingAfter`.

`messages/es/landing.json` is not loaded: the "before" heading is not asserted. Relative imports avoid depending on the `@/*` alias resolving from `e2e/`. `locale-names.ts` imports only the type `Locale` from `next-intl`, which disappears at compile time.

Configuration: none changes. `tsconfig.json` includes `**/*.ts` and has `resolveJsonModule`, so `npx tsc --noEmit` and `next build` typecheck `playwright.config.ts` and the test once the dependency is installed (D1 comes first for that reason). ESLint applies to `playwright.config.ts` the root `*.ts` entries (`react/jsx-no-literals`, size and complexity) and to `e2e/**` only the Next presets; the `no-restricted-imports` entries match only `src/**`. If `tsc` or lint flags either file anyway, the build stops and reports it instead of changing a configuration file.

### D7. Output folders ignored

`.gitignore` gains `test-results/` and `playwright-report/` under its `# testing` heading.

### D8. When the suite runs (Open 6 C, Open 9 (c))

The same command, `npm run test:e2e`, runs in cloud sessions (the front alone: no API, no mock) and on Product owner's machine before deploying (against the real stack or the front alone). It runs after the last task of every change that touches a scenario it covers, and before each merge of `develop` into `master`; it adds to the validation and QA suites and replaces neither. This change records the rule only here: the workflow file is Product owner's (see `## Propose status` in the design summary).

### D9. How the `testing` delta's scenarios are verified

No test file beyond the one end-to-end test is planned:

- "Same tests and results after an environment change" and "End-to-end tests stay out of the other suites": the build records the file and test counts of `npm run test:run` and `npm run test:qa` before its first change (task 1.1) and compares them after the last task (task 4.1); they must match and all pass.
- "State leak between test files": unchanged by this change; covered by the same full runs.
- "End-to-end suite passes": `npm run test:e2e` passes its one test in Chromium (task 3.2, task 4.1).
- "Failing end-to-end scenario": verified like "State leak between test files": by the runner's normal behaviour, a non-zero exit of `npm run test:e2e` naming the failing test. No deliberate failing run is planned, so no extra run and no extra production build.

### D10. No API, no types

No contract operation is consumed, so there is no endpoint, no API error to present and no derived type. The project rule "the first task group defines derived API types" has nothing to apply to; tasks.md has no such group.

### Files

| File | Change | FSD layer |
|---|---|---|
| `package.json` | `@playwright/test` `1.63.0` in `devDependencies`; script `test:e2e` | none (root) |
| `package-lock.json` | entries for `@playwright/test`, `playwright`, `playwright-core` `1.63.0` (and `fsevents` only if `npm` adds a new entry for it) | none (root) |
| `.gitignore` | `test-results/`, `playwright-report/` | none (root) |
| `playwright.config.ts` (new) | D4, D5 | none (root) |
| `e2e/app-shell/language-selection.e2e.ts` (new) | D6 | none (outside `src/`) |

No route, component or file under `app/`, `src/`, `messages/` or `contracts/` changes, and no deploy file.

## Risks / Trade-offs

- [The cloud image changes its Chromium revision again] → the suite cannot launch its browser in the cloud. Mitigation: the build stops and reports it; moving the exact version is a dependency upgrade for Product owner's approval. No `executablePath` fallback is configured.
- [A production build before every run adds minutes] → accepted (Open 2 A); `reuseExistingServer` skips it when a front is already running.
- [`next start` logs the standalone warning on every start] → expected, not a failure (D5).
- [The anonymous shell starts calling the API on load in a later change] → the scenario then needs a mock at `API_INTERNAL_URL` (Non-Goals).
- [Traces turned on later] → the HTML report gains JavaScript files that `npm run lint` would pick up; `playwright-report/**` then needs an ESLint ignore. Not in this change (no trace option).
- [`.dockerignore` does not exclude `playwright-report/` or `test-results/`] → a local report enters the Docker build context and the image (`COPY . .`). Harmless for the build; a deploy-file change, out of scope.
- [The Docker `deps` stage runs `npm ci` with development dependencies] → `@playwright/test` is installed in the image's build stage and `next build` typechecks `e2e/`; `npm ci` downloads no browser. Not run in this session.
- [Base-URL override pointing at an origin where nothing runs] → the suite times out waiting for it (D5); the override is for a front that is already running.
