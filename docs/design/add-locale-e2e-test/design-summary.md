Status: approved

# Design summary — add-locale-e2e-test

Input for `/opsx:propose` once Product owner approves it. Drafted by the design lead on 2026-10-12 in a cloud session, from `develop` at `2bf3bbe2` and `feature/route-api-web-pages-through-front` at `7e9f88ae` (R74); reviewed on 2026-11-12 against `develop` at `ea138174` (R74, R91, R45 and the dependency upgrade merged). The design lead decides nothing: what a source settles is listed in §0 with that source, and everything else is under "Open" with options and a recommendation.

- Change-id: `add-locale-e2e-test` (backlog R1). Type: `Change` (traditional workflow, section 3a; it adds a dependency and a test suite).
- Capability: `testing` (Open 4, answered A): a `testing` delta adds the end-to-end suite; `app-shell` (owner of "Language selection" → "Choosing a locale") takes no delta. Commit scope `testing` (precedent: `speed-up-test-environment`, `docs(testing)` / `refactor(testing)`).
- Branch and folders: `feature/add-locale-e2e-test` from `develop` (Open 3, answered A), `openspec/changes/add-locale-e2e-test/`, `docs/design/add-locale-e2e-test/`.
- Depends on: R74 `route-api-web-pages-through-front`, on `develop` (merge `8e3c2242`, archived as `openspec/changes/archive/2026-10-12-route-api-web-pages-through-front/`). Nothing waits on this change; every later end-to-end scenario builds on the suite it sets up.
- Versions on `develop` (`package.json`, `package-lock.json`): `next` 16.4.6, `eslint-config-next` 16.4.6, `next-intl` 4.14.9, `react` 19.2.8, `vitest` 5.1.0 (lockfile). No Playwright package is installed; `next` 16.4.6 declares `@playwright/test` `^1.51.1` as an optional peer dependency. The main checkout's `node_modules` still holds `next` 16.4.0 (not reinstalled after the upgrade).
- No UI, token, text or contract operation is added: criteria A (spacing) and D (contrast) have nothing to apply to, and no visual reference is needed.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `docs/design/backlog.md` R1 | The change is the end-to-end test of "Choosing a locale" (verify W1 of `add-app-shell`, `docs/design/add-app-shell/corrections.md:73`). Where today: `src/app/shell/ShellChrome.tsx` (the swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op). Type `Change`. Priority table: waits for "R74 in `develop`" (Product owner, 2026-10-12) — met. |
| `openspec/specs/app-shell/spec.md`, "Language selection" → "Choosing a locale" | **WHEN** the user chooses a locale in the language selector **THEN** the application opens the same route in the chosen locale and its texts change accordingly. The selector's accessible name is `ES — Idioma: Español` for `es` ("Selector is named"); entries show each language in its own name (`Español`, `English`, `Català`) with its own `lang` ("Each language in its own name"). Unchanged on `develop` `ea138174`. |
| `AGENTS.md` → Testing | "End-to-end tests (Playwright) come later, as a pre-deployment suite." One test per spec scenario; the test asserts the scenario's observable result with the fewest assertions; no snapshots. During a change, no existing test is deleted or moved. |
| `AGENTS.md` → Dependencies | No dependency is added without Product owner's explicit approval (Open 1, answered). |
| `openspec/specs/testing/spec.md` | The repository keeps two suites (validation, QA); a change to the test set-up leaves each suite running the same files and tests with the same results. The new suite must not change the counts of either (§3); the "two suites" wording changes through the `testing` delta (Open 4). |
| Decisions log, 2026-10-12 "the front is the API's only door" (R74) and R74 `design.md` D1–D5, D8, D9 (archived) | One public entry point, the front. `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`; the front forwards `/api/…` (prefix stripped) and the API's web routes to `API_INTERNAL_URL` (`proxy.ts` → `forwardToApi`); server-side reads go to `API_INTERNAL_URL` directly, with no fallback; without it, forwarding fails and server reads fail into their existing error states (app-shell spec "Server-side reads at the internal API address"). A production build signs in only over `https` (D8); an anonymous visit is unaffected. |
| Product owner, 2026-10-12 (the draft's assignment) | Playwright tests were to run on `feature/route-api-web-pages-through-front` (then "the future deploy branch") and count as the develop tests. **No longer applicable as written:** that branch was merged into `develop` and deleted (no local or remote branch). Superseded for the base branch by the 2026-11-12 row; the "count as the develop tests" part is Open 9. |
| Product owner, 2026-11-12, as read by the orchestrator | Product owner asked to schedule the Playwright tests; the orchestrator reads it as approval with the recommendations of the three points that blocked propose: Open 1 A (`@playwright/test`, exact version, Chromium only), Open 3 A (base `develop`), Open 4 A (third suite and a `testing` delta). |
| Product owner, 2026-11-12 (relayed by the orchestrator) | Explicit approval of the dependency: `@playwright/test`, exact version, Chromium only (Open 1 A; `AGENTS.md` → Dependencies). A Playwright output report: reporters `list` and `html`, the HTML report in `playwright-report/`, not opened automatically (`open: 'never'`) (§3). |
| Decisions log, 2026-10-07 "browser verification in the cloud" (archived) | Cloud sessions already run Playwright (from the session image) with a mocked API for visual checks; the laptop is short of memory. |
| `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` (read from the installed 16.4.0; the 16.4.6 copy is unverified) | Next.js recommends running end-to-end tests against the production build (`npm run build` + `npm run start`); Playwright's `webServer` can start the server and wait for it; `baseURL` lets tests use relative paths. |
| `next.config.ts` (`output: "standalone"`, `build-standalone-output`) and `Dockerfile` on `develop` | The deployed image builds with `npm run build` (no `API_INTERNAL_URL` at build) and runs `npx next start -H 0.0.0.0 -p 3000`. With `output: "standalone"`, `next start` logs a warning ("`next start` does not work with `output: standalone`…") and serves (warning text read in the installed 16.4.0 `dist/server/next.js`; 16.4.6 unverified). The suite's start command (Open 2 A) is therefore the deployed one. |
| R74 handoff, task 7.1 (`docs/design/route-api-web-pages-through-front/handoff.md:114`) | `npm run build` with R74 passed with only `/icon.svg` prerendered: no page read the API at build time. |
| Code, `develop` `ea138174` (verified by reading) | `/[locale]/about` (`AboutScreen`) reads only the `landing` catalog and calls no API; R91 replaced its two registration links with one link to `/{locale}/join` (`aboutRegisterLabel`); the heading keys (`aboutHeadingBefore/Accent/After`) and texts are unchanged. The shell's session on a first visit (no marker in the browser) settles `anonymous` with no request (`src/features/auth/model/session.ts` `start()`, unchanged since `2bf3bbe2`). The selector's swap is `localeRouter.push(localePathname, { locale })` (next-intl navigation, `ShellChrome.tsx:56`). Its entries are `DropdownMenuRadioItem` with `lang` (`LanguageSelect.tsx`). Its name is composed in `AppShell.tsx:83` from `shell.json` `languageSelector` and `LOCALE_NAMES` (`src/shared/config/locale-names.ts`). R91 adds, for an anonymous session, a header "Register" action to `/{locale}/join`, shown from `lg` (visible at the suite's 1280px viewport; it does not change the selector). R45 (first-location step) touches neither the shell, the session nor `/about`. `<html lang>` follows the active locale (`app/layout.tsx`, `getLocale()`). |

## 1. Scope

**In:**
- One end-to-end test of "Choosing a locale" (§2).
- The minimum suite set-up it needs: a Playwright configuration file, a folder for end-to-end tests, an npm script, how the application is started, the base URL and the environment it runs with (§3–§4).
- The new development dependency `@playwright/test` at an exact version and a Chromium browser for it (Open 1, answered A).
- A `testing` spec delta that adds the end-to-end suite (Open 4, answered A).

**Out (non-goals):**
- Any other scenario, viewport, browser or locale pair; accessibility scans (axe); visual comparison or screenshots as assertions.
- A mock of the API (not needed by this scenario, §5); sign-in flows end to end.
- CI configuration (the repository has no `.github/`), deploy files (`Dockerfile`, `.dockerignore`), and any change to the app's code, texts, specs' behaviour or `contracts/openapi.yaml`.
- Moving or deleting the existing unit test of the scenario (§6, settled).

## 2. The test (R1 scenario)

One test, named after the scenario ("Choosing a locale"). End state of what it does and observes:

1. Opens `/es/about` in a fresh browser context (no tokens, no session marker: the shell is anonymous and calls nothing). Route: Open 5.
2. Opens the language selector by its accessible name `ES — Idioma: Español` and chooses the entry `English` (a single-choice menu entry, `menuitemradio`, `lang="en"`).
3. Observes, with the fewest assertions that fail if the behaviour breaks:
   - the URL becomes `/en/about` (same route, chosen locale);
   - the page's main heading reads the `en` text of the `landing` catalog (`aboutHeadingBefore` + `aboutHeadingAccent` + `aboutHeadingAfter` = "Coffee, told as it is"), where it read "El café, contado como es" before.

`<html lang>` is not asserted: it follows the locale on the server render and is covered elsewhere; whether the client navigation updates it is unverified, so asserting it could fail for a reason outside the scenario.

How the test reads the expected texts (catalog file or literal) is Open 8.

## 3. Suite set-up (end state; the build chooses the exact syntax)

| Part | End state |
|---|---|
| Dependency | `@playwright/test` in `devDependencies` at an exact version (no range), Chromium only (Open 1, answered A). Recommended version: `1.56.1`, whose `browsers.json` expects Chromium revision 1194, the cloud image's (§5); it satisfies Next's optional peer `^1.51.1`. The architect confirms the version at propose. |
| Config | `playwright.config.ts` at the repository root: one project, Chromium, desktop viewport (1280×720, Playwright's default); `baseURL` from the environment (§4) with `http://localhost:3000` as default; `webServer` per Open 2; retries 0; reporters `list` (console) and `html`, the HTML report written to `playwright-report/` (Playwright's default folder) and never opened automatically (`open: 'never'`) (Product owner, 2026-11-12). |
| Folder | `e2e/` at the repository root, grouped by capability like the specs: `e2e/app-shell/` (the scenario belongs to `app-shell`, even though the change's capability is `testing`). Outside `src/` and `app/`, so no FSD layer applies (no file is placed under `app/` or `src/`). |
| File naming | `*.e2e.ts` (e.g. `e2e/app-shell/language-selection.e2e.ts`), matched by Playwright's `testMatch`. Vitest's default include (`**/*.{test,spec}.?(c\|m)[jt]s?(x)`) does not match it, and neither the `vm` nor the `forks` project of `vitest.config.mts` lists it, so neither `vitest.config.mts` nor `vitest.qa.config.mts` changes and both suites keep their file and test counts (`testing` spec). A `*.spec.ts` name would be picked up by both Vitest suites. |
| npm script | `test:e2e` → `playwright test`. Not part of `test:run` or `test:qa`. |
| Output | The HTML report in `playwright-report/` (read with `npx playwright show-report`) and Playwright's `test-results/` (per-test artifacts) are both added to `.gitignore` by this change (neither is ignored on `develop` today). |
| Typecheck and lint | `tsconfig.json` includes `**/*.ts`, so `npx tsc --noEmit` and `next build` typecheck the config and the test once the dependency is installed. ESLint applies the root `*.ts` entries (size, complexity, `jsx-no-literals`) to `playwright.config.ts` and only the Next presets to `e2e/**`. No configuration change is expected (unverified until the dependency is installed). |

## 4. How it fits R74's routing

- **Base URL = the front's origin, the only entry point.** The test talks only to the front; it never needs the API's address. Locally that is `http://localhost:3000` (or the `https` origin the local set-up serves); against a deployment it is whatever origin the front is served on.
- **Environment the started app needs** (when the suite starts it, Open 2): `NEXT_PUBLIC_APP_URL` = the base URL and `NEXT_PUBLIC_API_URL` = `{base URL}/api` (inlined at build time, R74 D4). `API_INTERNAL_URL` is not needed by this scenario (§5); unset, forwarded paths fail and server-side reads fail, and the scenario touches neither.
- **`/api` forwarding:** not exercised. With R74, a future scenario that needs data mocks the API with **one** HTTP server at `API_INTERNAL_URL`: server-side reads go there directly and browser JSON calls reach it through the front's `/api` forwarding. Playwright's `page.route` alone cannot mock server-side reads (they leave from the Next.js server, not the browser). Recorded for later; out of this change.
- **`https`:** a production build refuses an `http` token endpoint only when signing in (R74 D8); an anonymous scenario runs on plain `http://localhost:3000`.
- **Does the scenario need the API at all?** No, on `/es/about` (§0, code row). On `/es` (the landing) it would: the landing's verified-offerings block reads `GET /offerings` on the server, which fails without `API_INTERNAL_URL` (the header and the switch still work, but the page shows its error state). Open 5.

## 5. Where it runs and against what

The scenario needs no API (§4), so it runs the same anywhere a browser and Node run:
- **Cloud session:** the session image ships Chromium (`/opt/pw-browsers`, revision 1194, per the 2026-10-07 decision) and sets `PLAYWRIGHT_BROWSERS_PATH`. Playwright 1.56.0 and 1.56.1 expect revision 1194 (1.57.0 expects 1200), so `@playwright/test` `1.56.1` uses the image's browser with no download. No API, no mock.
- **Product owner's machine:** against the real stack (front + API, R74 environment) or the front alone; needs `npx playwright install chromium` once (a download outside npm).

Options and recommendation: Open 6.

## 6. Relation to the existing suites and the release checks

| Suite | Command | Content | When (today) |
|---|---|---|---|
| Validation | `npm run test:run` | One test per spec scenario + guards (Vitest, jsdom) | Related tests after each task; whole suite after the last task |
| QA | `npm run test:qa` | Everything else (Vitest) | After each refactor change; before `develop` → `master` |
| End-to-end (new) | `npm run test:e2e` | Spec scenarios that need a real browser and the running app (Playwright) | Open 9 |

- The end-to-end suite is a separate command and is never counted in the validation or QA totals.
- **Settled (criterion B, `AGENTS.md` → Testing: no test is moved or deleted during a change):** the existing unit test "calls back with the chosen locale (spec: Choosing a locale)" (`src/widgets/app-header/ui/AppHeader.test.tsx:442`) stays: it covers the selector's callback; the new test covers the route switch the unit test cannot. Moving it later is only possible through Product owner's reduction plan.
- After the last task of this change, the build runs the validation suite, the typecheck, lint, `npm run build` **and** `npm run test:e2e` once.

## 7. Files that change

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | `@playwright/test` in `devDependencies` at an exact version (§3); script `test:e2e` |
| `playwright.config.ts` (new) | §3 |
| `e2e/app-shell/language-selection.e2e.ts` (new) | §2 |
| `.gitignore` | `test-results/`, `playwright-report/` |
| `openspec/specs/testing/spec.md` (delta, via archive) | Adds the end-to-end suite (separate command, never counted in the validation or QA totals, runs against the running front through its origin) and adjusts "two test suites" (Open 4 A) |

No file under `app/`, `src/`, `messages/` or `contracts/` changes, and no deploy file (`Dockerfile`, `.dockerignore`).

## 8. Risks and unverified points

- **[Unverified]** That the cloud session image still ships Chromium revision 1194 today (the figure is from the 2026-10-07 decision). If it changed, the exact version moves to the release that expects the new revision; launching with `executablePath` under `/opt/pw-browsers` is the fallback.
- **[Partly verified]** No page reads the API at build time: verified for R74 (§0, handoff 7.1). Pages added since (R91 `/join`, R45 `/manage/locations/first`) are unverified; the `Dockerfile` builds without `API_INTERNAL_URL`, which suggests they do not.
- **[Unverified]** Whether `tsc` and ESLint pass on the new files without configuration changes (§3).
- **[Unverified]** The Docker image: its `deps` stage runs `npm ci` with dev dependencies, so `@playwright/test` is installed there and `next build` typechecks `e2e/` and `playwright.config.ts` with it; a browser download at `npm ci` is not expected (Playwright installs browsers only on `playwright install`), not checked.
- `next start` on a standalone build logs a warning on every start (§0); the suite's start (Open 2 A) inherits it. Not a failure.
- **[Unverified]** The HTML report and lint: ESLint's flat config does not lint `.html`, so the report's `index.html` is not linted; if traces are ever turned on (not in this change: retries 0, no trace option), the report gains a `trace/` folder of JavaScript files that `npm run lint` would pick up, and `playwright-report/**` then needs an ESLint ignore.
- `.dockerignore` does not exclude `playwright-report/` or `test-results/`, so a local report is sent with the Docker build context and copied into the image (`COPY . .`). Harmless for the build; excluding them is a deploy-file change, out of this change's scope.
- Duration: a production build before the run adds minutes (Open 2).
- The "first visit" premise: if a later change makes the anonymous shell call the API on load, the scenario starts needing a mock.

## Open

1. **New development dependency: `@playwright/test` and its Chromium browser.** — **Answered: A**, explicitly approved by Product owner on 2026-11-12 (`AGENTS.md` → Dependencies; first read by the orchestrator from his request to schedule the Playwright tests, then confirmed by him): `@playwright/test` at an exact version, Chromium only; locally `npx playwright install chromium`. Recommended version `1.56.1` (Chromium revision 1194, §5); the architect confirms it at propose. Alternatives that were offered: B `@vitest/browser-playwright` (does not test the running app's route switch); C an in-house DevTools-protocol script.
   - Blocks propose: no (answered).

2. **How the suite starts the application.**
   - A: `webServer` runs a production build and start (`npm run build`, then `npm run start`) with the §4 environment; `reuseExistingServer` on, so an already running front at the base URL is used instead. This is the command the `Dockerfile` deploys (`next start` on the standalone build, with its warning).
   - B: `webServer` runs `npm run dev`. Faster, but not the code that is deployed (dev CSP adds `'unsafe-eval'`; dev-only behaviour).
   - C: no `webServer`: the suite always runs against a front someone started (local stack, or the deploy) at the base URL.
   - D: `webServer` builds and runs the self-contained server (`node .next/standalone/server.js` with the static assets copied next to it). Closer to the app-shell "Self-contained production server" requirement, but not what the `Dockerfile` runs today, and it needs a copy step.
   - Recommendation: A, per the Next.js guide ("run against your production code") and the `Dockerfile`'s start command, with C's behaviour available through `reuseExistingServer` and the base URL variable.
   - Blocks propose: no (A by default).

3. **Base branch.** — **Answered: A** (Product owner's request of 2026-11-12, as read by the orchestrator): `feature/add-locale-e2e-test` from `develop`. R74 is on `develop` (`8e3c2242`), together with Next.js 16.4.6, R91 and R45; R74's branch no longer exists, so the draft's option B (branch from it) is void.
   - Blocks propose: no (answered).

4. **A third suite and the `testing` spec.** — **Answered: A** (Product owner's request of 2026-11-12, as read by the orchestrator): a `testing` delta adds the end-to-end suite (separate command, never counted in the validation or QA totals, runs against the running front through its origin) and adjusts "two suites" accordingly; `app-shell` takes no delta; the change's capability and commit scope are `testing`.
   - Note for Product owner (not blocking): `testing` is missing from the capability lists of `openspec/config.yaml` and `docs/agents/workflow_sdd.md` §2, although its spec exists and `speed-up-test-environment` already used the scope; and `AGENTS.md` → Testing ("The repository holds two suites") will read stale after the archive. All three files are Product owner's.
   - Blocks propose: no (answered).

5. **Route the test uses.**
   - A: `/es/about` → `/en/about`. No API read; asserts the About heading.
   - B: `/es` → `/en` (the landing). Needs `API_INTERNAL_URL` (real API or a mock) or tolerates the offerings block's error state.
   - C: a route with a query (e.g. `/es/offerings?page=2`) to show the query is kept. Needs the API, and query keeping is not in the scenario's text.
   - Recommendation: A (the smallest route that proves "same route, other locale, texts change" with no API; still true on `develop` `ea138174`, §0).
   - Blocks propose: no (A by default).

6. **Where the suite runs and against what.**
   - A: cloud sessions only, against the front alone (no API, no mock), as part of the checks they already run.
   - B: Product owner's machine only, against the real stack (R74 environment, local `https` origin).
   - C: both: the same command; cloud sessions run it as part of the change's checks; Product owner's machine runs it before deploying, against the real stack.
   - Recommendation: C. For this scenario the two runs are equivalent (no API); a mock server at `API_INTERNAL_URL` (§4) is decided with the first scenario that needs data.
   - Blocks propose: no.

7. **The existing unit test of the same scenario.** — **Settled** (criterion B; §6): kept, by `AGENTS.md` → Testing.
   - Blocks propose: no.

8. **Expected texts in the test.**
   - A: read them from the sources the app renders: the heading from `messages/<locale>/landing.json`, and the selector's name composed as the shell does (`AppShell.tsx:83`) from `messages/es/shell.json` `languageSelector` and the language names of `src/shared/config/locale-names.ts`; a catalog edit does not break the test.
   - B: literal strings in the test.
   - Recommendation: A (no invented or duplicated texts). The draft named only `shell.json` for the selector; the language names live in `locale-names.ts` (corrected). Whether Playwright resolves the `@/*` alias from `e2e/` is unverified; a relative import avoids the question.
   - Blocks propose: no.

9. **When the suite runs, and what "count as the develop tests" means.**
   - The 2026-10-12 premise (a deploy branch `feature/route-api-web-pages-through-front`) no longer holds: that branch was merged and deleted; deployment is the `Dockerfile` image built from the release that reaches `master`.
   - Options for when: (a) after the last task of every change that touches a scenario it covers; (b) before each merge of `develop` into `master` (the release check of workflow 3a step 13), next to the QA suite; (c) both.
   - "Count as the develop tests": does a green `test:e2e` replace any of the checks on `develop`, or only add to them?
   - Recommendation: (c) for when; the end-to-end suite adds to, and does not replace, the validation and QA suites, until Product owner says otherwise.
   - Blocks propose: no (process; the architect can write the change without it, and the workflow file is Product owner's).

## Review log

- **2026-10-12, design lead (draft, cloud session).** Generated from `docs/design/backlog.md` R1 and R74, the decisions log in `docs/design/general-context.md` (2026-10-07 cloud browser checks; 2026-10-12 R74 single entry point), `docs/design/change-progress.md` (2026-10-12 entry), `AGENTS.md` (Testing, Dependencies, Git Flow), `docs/agents/workflow_sdd.md` §3a and §3c, `openspec/specs/app-shell/spec.md` and `openspec/specs/testing/spec.md`, R74's `design.md` and design summary on `feature/route-api-web-pages-through-front`, the code of `ShellChrome.tsx`, `LanguageSelect.tsx`, `AppShell.test.tsx`, `AppHeader.test.tsx`, `session.ts`, `AboutScreen.tsx`, `app/layout.tsx`, `vitest.config.mts`, `vitest.qa.config.mts`, `tsconfig.json`, `package.json`/`package-lock.json`, and the Next.js 16.4.0 guide `01-app/02-guides/testing/playwright.md`.
  - Settled from sources (criterion B): the scenario's assertions (spec text); the test opens an anonymous first visit, which makes no request (`session.ts`); the `*.e2e.ts` naming keeps both Vitest suites' counts (`testing` spec, Vitest default include); the API is not needed on `/es/about`; a future mock sits at `API_INTERNAL_URL` because server-side reads bypass the browser (R74 D5).
  - Not run: no browser, no API and no install in this session; every Playwright behaviour above is from documentation, not executed.
  - Conflicts in the sources: (1) the backlog's priority table says R1 waits for "R74 in `develop`", while Product owner's instruction of 2026-10-12 wants the suite on R74's branch (Open 3). (2) The `testing` spec's "two test suites" against a third suite (Open 4). (3) `docs/agents/design-lead.md` ("Never commit, push") against this session's assignment to commit and push the draft; the assignment was followed for this file only.
- **2026-11-12, design lead (review mode, local).** Re-checked against `develop` `ea138174` (R74 `8e3c2242`, the dependency upgrade, R91, R45 `c1ff0618`).
  - Recorded Product owner's answers (Product owner's request of 2026-11-12 to schedule the Playwright tests, as read by the orchestrator): Open 1 A (exact version, Chromium only), Open 3 A (base `develop`), Open 4 A (`testing` delta; capability `testing`, `app-shell` without delta). Header, §1, §3, §7 updated to match.
  - No longer true, corrected: `next` 16.4.0 → 16.4.6 on `develop` (and `eslint-config-next` 16.4.6); R74 "not merged" → merged and archived, its branch deleted (§0 2026-10-12 row, Open 3, Open 9); the unit test's line `AppHeader.test.tsx:411` → `:442`; the selector's name is composed from `shell.json` and `locale-names.ts`, not `shell.json` alone (Open 8); "the deploy branch" → the deployed front (§4).
  - Re-verified, still true: the scenario's spec text; `/about` reads no API and its heading texts are unchanged (R91 only replaced its registration links with one `/join` link); the first-visit session makes no request; the swap code; the Vitest includes (R91 added one `forks` file, not matching `*.e2e.ts`); no Playwright package installed.
  - New since the draft, added: the `Dockerfile` and `output: "standalone"` (Open 2 option D; A matches the deployed `next start`); R91's header "Register" action from `lg` (no effect on the scenario); R74's build had no build-time API read (§8 risk reduced); the Chromium revision mapping, verified from Playwright's `browsers.json` (1.56.0 and 1.56.1 → 1194; 1.57.0 → 1200), giving the recommended version `1.56.1`.
  - Settled (criterion B): Open 7, keep the unit test (`AGENTS.md` → Testing forbids moving tests during a change).
  - Later the same day, two further answers of Product owner relayed by the orchestrator: Open 1 A is his explicit approval of the dependency (`AGENTS.md` → Dependencies), recorded in §0 and Open 1; and he wants an output report: §3 Config now uses the reporters `list` and `html` (`playwright-report/`, `open: 'never'`), §3 Output names the report, §8 replaces the "HTML reporter later" risk with the lint and Docker-context notes on the report. §4 (routing) is unaffected: the report changes nothing in how the suite reaches the front.
- **2026-11-12, approval (orchestrator, on Product owner's request).** Product owner asked to schedule the Playwright tests, approved the dependency explicitly ("si apruebo") and asked for an output report. No open point blocks the propose; the non-blocking points take the design lead's recommendations: Open 2 A, Open 5 A, Open 6 C, Open 8 A, Open 9 (c). Status set to approved.
  - Not run: no install, no browser, no build. The cloud image's current Chromium revision, the Next.js 16.4.6 copy of the Playwright guide and of the standalone warning (only 16.4.0 is installed in the main checkout), the build-time reads of the R91 and R45 pages, and Playwright's resolution of `@/*` from `e2e/` are unverified.

## Propose status

- Change-id: `add-locale-e2e-test` (backlog R1, resolved on archive). Capability `testing` (MODIFIED "Test environment set-up keeps the suites' results", both scenarios kept; ADDED "End-to-end suite runs against the running front", three scenarios). `app-shell` without delta.
- Date: 2026-11-12, cloud session, branch `claude/add-locale-e2e-test-propose` from `feature/add-locale-e2e-test` at `66b2b305`.
- `openspec validate add-locale-e2e-test --strict`: valid. The CLI accepted the `testing` capability although `openspec/config.yaml` does not list it.
- Resolved (design.md):
  - Version (D1): `@playwright/test` **`1.63.0`**, not `1.56.1`. The cloud image now ships Chromium revision **1243** (`/opt/pw-browsers/chromium-1243`, `chromium_headless_shell-1243`); `browsers.json` of the registry tarballs: 1.56.1 → 1194, 1.62.1 → 1234, 1.63.0 → 1243, 1.64.1 → 1248. `1.63.0` is stable (2026-09-04), within `next` 16.4.6's optional peer `^1.51.1`, and is the image's own global Playwright version. No `executablePath`. Product owner's machine: `npx playwright install chromium` once.
  - Start (D5): `webServer` `npm run build && npm run start`, `env` `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_API_URL`, `url` the base URL, `reuseExistingServer` `true`, `timeout` 300 s; base URL from `E2E_BASE_URL`, default `http://localhost:3000`. The 16.4.6 standalone message is a warning (`_log.warn`). R91 `/join` and R45 `/manage/locations/first` checked by reading: no `generateStaticParams`, catalogs only on the server, so no build-time API read (not run).
  - Next.js 16.4.6 Playwright guide: agrees with §0; it adds an "instant navigations" section (`@next/playwright`, Cache Components; not applicable) and suggests `npm init playwright` (not used).
  - Texts (D6): relative imports of `messages/es/shell.json`, `src/shared/config/locale-names.ts`, `messages/en/landing.json`; `messages/es/landing.json` not loaded (the "before" heading is not asserted). No `tsconfig.json` or ESLint change expected.
  - Test name (D6): `opens the same route in the chosen locale (spec: Choosing a locale)`, in `e2e/app-shell/language-selection.e2e.ts`.
  - Delta verification (D9): Vitest counts before/after and one `test:e2e` run; "Failing end-to-end scenario" is verified by the runner's normal non-zero exit naming the failing test (no deliberate failing run, artifact review 2026-11-12); no other test file.
  - When the suite runs (D8): Open 6 C and Open 9 (c), recorded in design.md only.
- Notes for Product owner (his files; not edited): after the archive, `AGENTS.md` → Testing ("The repository holds two suites"; "End-to-end tests (Playwright) come later"), `docs/agents/workflow_sdd.md` §2 capability list and §3c (no end-to-end row; when it runs, D8), and `openspec/config.yaml`'s capability list (no `testing`) read stale. `openspec/specs/testing/spec.md` `## Purpose` ("the repository's two test suites") also reads stale: the MODIFIED requirement does not change it; the archive should update the Purpose when it syncs (to be settled at archive; the main spec is not edited before then). From §8: traces turned on later need an ESLint ignore for `playwright-report/**`; `.dockerignore` does not exclude `playwright-report/` or `test-results/` (deploy file, out of scope).
- Artifact review (2026-11-12, design lead's findings settled by the orchestrator), applied in `docs(testing): update artifacts for add-locale-e2e-test`; `openspec validate add-locale-e2e-test --strict`: valid:
  1. tasks.md 3.1 expected "no tests found" (blocking; without a config Playwright's default `testMatch` would load the Vitest files): the `test:e2e` run removed from 3.1, which keeps `npx tsc --noEmit` and `npm run lint`; 3.2's green run is the evidence.
  2. Deliberate failing run (option B): dropped from tasks.md 4.1 and design.md D9; the ADDED scenario "Failing end-to-end scenario" is kept unchanged in the `testing` delta and verified like "State leak between test files", by the runner's non-zero exit naming the failing test. 4.1 keeps the Vitest counts, typecheck, lint, build and one `test:e2e` run.
  3. Repeated production builds: resolved by finding 2 (the extra run is gone).
  4. `fsevents`: tasks.md 2.1 now allows a new nested `fsevents` entry under `playwright` in `package-lock.json`, matching design.md Files.
  5. `testing` main spec Purpose: noted for Product owner above; main spec not edited.
  6. Stale summary body (1.56.1 / 1194): no change; this section records 1.63.0 (D1).
- Open: none blocking apply.
