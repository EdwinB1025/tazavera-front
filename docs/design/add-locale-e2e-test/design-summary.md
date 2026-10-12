Status: draft — pending Product owner review

# Design summary — add-locale-e2e-test

Input for `/opsx:propose` once Product owner approves it. Drafted by the design lead on 2026-10-12 in a cloud session, from `develop` at `2bf3bbe2` and `feature/route-api-web-pages-through-front` at `7e9f88ae` (R74). The design lead decides nothing: what a source settles is listed in §0 with that source, and everything else is under "Open" with options and a recommendation.

- Change-id: `add-locale-e2e-test` (backlog R1). Type: `Change` (traditional workflow, section 3a; it adds a dependency and a test suite).
- Capability: `app-shell` (owns "Language selection" → "Choosing a locale"). Whether `testing` also takes a delta is Open 4.
- Branch and folders: `feature/add-locale-e2e-test`, `openspec/changes/add-locale-e2e-test/`, `docs/design/add-locale-e2e-test/`. Base branch: Open 3.
- Depends on: R74 `route-api-web-pages-through-front` (its environment: the front is the only entry point). Nothing waits on this change; every later end-to-end scenario builds on the suite it sets up.
- Installed versions (`package.json`, `node_modules`): `next` 16.4.0, `next-intl` 4.14.9, `react` 19.2.8, `vitest` (validation and QA suites). No Playwright package is installed; `next` 16.4.0 declares `@playwright/test` `^1.51.1` as an optional peer dependency (`package-lock.json`).
- No UI, token, text or contract operation is added: criteria A (spacing) and D (contrast) have nothing to apply to, and no visual reference is needed.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `docs/design/backlog.md` R1 | The change is the end-to-end test of "Choosing a locale" (verify W1 of `add-app-shell`, `docs/design/add-app-shell/corrections.md:73`). Where today: `src/app/shell/ShellChrome.tsx` (the swap), `src/widgets/app-header/ui/LanguageSelect.tsx` (the callback), `src/app/shell/AppShell.test.tsx` (router mocked with a no-op). Type `Change`. Priority table: waits for "R74 in `develop`" (Product owner, 2026-10-12). |
| `openspec/specs/app-shell/spec.md`, "Language selection" → "Choosing a locale" | **WHEN** the user chooses a locale in the language selector **THEN** the application opens the same route in the chosen locale and its texts change accordingly. The selector's accessible name is `ES — Idioma: Español` for `es` ("Selector is named"); entries show each language in its own name (`Español`, `English`, `Català`) with its own `lang` ("Each language in its own name"). |
| `AGENTS.md` → Testing | "End-to-end tests (Playwright) come later, as a pre-deployment suite." One test per spec scenario; the test asserts the scenario's observable result with the fewest assertions; no snapshots. |
| `AGENTS.md` → Dependencies | No dependency is added without Product owner's explicit approval (Open 1). |
| `openspec/specs/testing/spec.md` | The repository keeps two suites (validation, QA); a change to the test set-up leaves each suite running the same files and tests with the same results. The new suite must not change the counts of either (§3). |
| Decisions log, 2026-10-12 "el front es la única puerta del API" (R74) and R74 `design.md` D1–D5, D9 | One public entry point, the front. `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`; the front forwards `/api/…` (prefix stripped) and the API's web routes to `API_INTERNAL_URL`; server-side reads go to `API_INTERNAL_URL` directly, with no fallback; without it, forwarding answers `502` and server reads fail into their existing error states. A production build signs in only over `https` (D8); an anonymous visit is unaffected. |
| Product owner, 2026-10-12 (this session's assignment) | Playwright tests run on `feature/route-api-web-pages-through-front` (the future deploy branch) and count as the develop tests. |
| Decisions log, 2026-10-07 "verificación con navegador en la nube" | Cloud sessions already run Playwright (from the session image) with a mocked API for visual checks; the laptop is short of memory. |
| `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` | Next.js recommends running end-to-end tests against the production build (`npm run build` + `npm run start`); Playwright's `webServer` can start the server and wait for it; `baseURL` lets tests use relative paths. |
| Code, `develop` `2bf3bbe2` (verified) | `/[locale]/about` (`AboutScreen`) reads only the `landing` catalog and calls no API. The shell's session on a first visit (no marker in the browser) settles `anonymous` with no request (`src/features/auth/model/session.ts` `start()`). The selector's swap is `localeRouter.push(localePathname, { locale })` (next-intl navigation, `ShellChrome.tsx`). `<html lang>` follows the active locale (`app/layout.tsx`, `getLocale()`). R74 does not touch any of these files. |

## 1. Scope

**In:**
- One end-to-end test of "Choosing a locale" (§2).
- The minimum suite set-up it needs: a Playwright configuration file, a folder for end-to-end tests, an npm script, how the application is started, the base URL and the environment it runs with (§3–§4).
- The new development dependency `@playwright/test` and a Chromium browser for it (Open 1).

**Out (non-goals):**
- Any other scenario, viewport, browser or locale pair; accessibility scans (axe); visual comparison or screenshots as assertions.
- A mock of the API (not needed by this scenario, §5); sign-in flows end to end.
- CI configuration (the repository has no `.github/`), deploy files, and any change to the app's code, texts, specs' behaviour or `contracts/openapi.yaml`.
- Moving or deleting the existing unit test of the scenario (Open 7).

## 2. The test (R1 scenario)

One test, named after the scenario ("Choosing a locale"). End state of what it does and observes:

1. Opens `/es/about` in a fresh browser context (no tokens, no session marker: the shell is anonymous and calls nothing). Route: Open 5.
2. Opens the language selector by its accessible name `ES — Idioma: Español` and chooses the entry `English` (a single-choice menu entry, `lang="en"`).
3. Observes, with the fewest assertions that fail if the behaviour breaks:
   - the URL becomes `/en/about` (same route, chosen locale);
   - the page's main heading reads the `en` text of the `landing` catalog (`aboutHeadingBefore` + `aboutHeadingAccent` + `aboutHeadingAfter` = "Coffee, told as it is"), where it read "El café, contado como es" before.

`<html lang>` is not asserted: it follows the locale on the server render and is covered elsewhere; whether the client navigation updates it is unverified, so asserting it could fail for a reason outside the scenario.

How the test reads the expected texts (catalog file or literal) is Open 8.

## 3. Suite set-up (end state; the build chooses the exact syntax)

| Part | End state |
|---|---|
| Config | `playwright.config.ts` at the repository root: one project, Chromium, desktop viewport (1280×720, Playwright's default); `baseURL` from the environment (§4) with `http://localhost:3000` as default; `webServer` per Open 2; retries 0; reporter `list`. |
| Folder | `e2e/` at the repository root, grouped by capability like the specs: `e2e/app-shell/`. Outside `src/` and `app/`, so no FSD layer applies (no file is placed under `app/` or `src/`). |
| File naming | `*.e2e.ts` (e.g. `e2e/app-shell/language-selection.e2e.ts`), matched by Playwright's `testMatch`. Vitest's default include (`**/*.{test,spec}.?(c\|m)[jt]s?(x)`) does not match it, so neither `vitest.config.mts` nor `vitest.qa.config.mts` changes and both suites keep their file and test counts (`testing` spec). A `*.spec.ts` name would be picked up by both Vitest suites. |
| npm script | `test:e2e` → `playwright test`. Not part of `test:run` or `test:qa`. |
| Output | Playwright's `test-results/` and `playwright-report/` are ignored in `.gitignore`. |
| Typecheck and lint | `tsconfig.json` already includes `**/*.ts`, so `npx tsc --noEmit` and `next build` typecheck the config and the test once the dependency is installed; ESLint lints them with the project config. No configuration change is expected for either (unverified until the dependency is installed). |

## 4. How it fits R74's routing

- **Base URL = the front's origin, the only entry point.** The test talks only to the front; it never needs the API's address. Locally that is `http://localhost:3000` (or the `https` origin the local set-up serves); on the deploy branch it is whatever origin the front is served on.
- **Environment the started app needs** (when the suite starts it, Open 2): `NEXT_PUBLIC_APP_URL` = the base URL and `NEXT_PUBLIC_API_URL` = `{base URL}/api` (inlined at build time, R74 D4). `API_INTERNAL_URL` is not needed by this scenario (§5); unset, forwarded paths answer `502` and server-side reads fail, and the scenario touches neither.
- **`/api` forwarding:** not exercised. With R74, a future scenario that needs data mocks the API with **one** HTTP server at `API_INTERNAL_URL`: server-side reads go there directly and browser JSON calls reach it through the front's `/api` forwarding. Playwright's `page.route` alone cannot mock server-side reads (they leave from the Next.js server, not the browser). Recorded for later; out of this change.
- **`https`:** a production build refuses an `http` token endpoint only when signing in (R74 D8); an anonymous scenario runs on plain `http://localhost:3000`.
- **Does the scenario need the API at all?** No, on `/es/about` (§0, code row). On `/es` (the landing) it would: the landing's verified-offerings block reads `GET /offerings` on the server, which fails without `API_INTERNAL_URL` (the header and the switch still work, but the page shows its error state). Open 5.

## 5. Where it runs and against what

The scenario needs no API (§4), so it runs the same anywhere a browser and Node run:
- **Cloud session:** the session image ships Chromium (`/opt/pw-browsers`, revision 1194) and sets `PLAYWRIGHT_BROWSERS_PATH`; the pinned `@playwright/test` must expect that revision, or the session must launch Chromium by its path (unverified which Playwright release maps to revision 1194). No API, no mock.
- **Product owner's machine:** against the real stack (front + API, R74 environment) or the front alone; needs `npx playwright install chromium` once (a download outside npm).

Options and recommendation: Open 6.

## 6. Relation to the existing suites and the release checks

| Suite | Command | Content | When (today) |
|---|---|---|---|
| Validation | `npm run test:run` | One test per spec scenario + guards (Vitest, jsdom) | Related tests after each task; whole suite after the last task |
| QA | `npm run test:qa` | Everything else (Vitest) | After each refactor change; before `develop` → `master` |
| End-to-end (new) | `npm run test:e2e` | Spec scenarios that need a real browser and the running app (Playwright) | Open 9 |

- The end-to-end suite is a separate command and is never counted in the validation or QA totals.
- The existing unit test "calls back with the chosen locale (spec: Choosing a locale)" (`src/widgets/app-header/ui/AppHeader.test.tsx:411`) stays: it covers the selector's callback; the new test covers the route switch the unit test cannot (Open 7).
- After the last task of this change, the build runs the validation suite, the typecheck, lint, `npm run build` **and** `npm run test:e2e` once.

## 7. Files that change

| File | Change |
|---|---|
| `package.json`, `package-lock.json` | `@playwright/test` in `devDependencies` (Open 1); script `test:e2e` |
| `playwright.config.ts` (new) | §3 |
| `e2e/app-shell/language-selection.e2e.ts` (new) | §2 |
| `.gitignore` | `test-results/`, `playwright-report/` |
| `openspec/specs/testing/spec.md` (delta, via archive) | Only under Open 4 A |

No file under `app/`, `src/`, `messages/` or `contracts/` changes.

## 8. Risks and unverified points

- **[Unverified]** Which `@playwright/test` release expects Chromium revision 1194 (the cloud image's). A mismatch makes the cloud run download a browser or fail; launching with `executablePath: '/opt/pw-browsers/chromium'` is the fallback the session image documents.
- **[Unverified]** Whether `next build` (on the R74 branch) prerenders any page that reads the API at build time without `API_INTERNAL_URL` (R74 design, Risks, "Prerendered pages"). If it does, the suite's build step needs `API_INTERNAL_URL` or the dev server (Open 2).
- **[Unverified]** Whether `tsc` and ESLint pass on the new files without configuration changes (§3).
- Duration: a production build before the run adds minutes (Open 2).
- The "first visit" premise: if a later change makes the anonymous shell call the API on load, the scenario starts needing a mock.

## Open

1. **New development dependency: `@playwright/test` and its Chromium browser.**
   - A: `@playwright/test`, exact version pinned (the release that matches the cloud image's Chromium revision 1194, to be confirmed at propose), Chromium only; locally `npx playwright install chromium`. MIT license; maintained by Microsoft; the runner Next.js documents and lists as its optional peer (`^1.51.1`).
   - B: `@vitest/browser-playwright` (Vitest browser mode, already in the lockfile as an optional peer). Runs components in a real browser but not the running app with its proxy and routing: it does not test the route switch end to end.
   - C: no dependency: a script driving the preinstalled Chromium over the DevTools protocol (as the design lead's captures do). In-house runner, no reporting, no retries, nothing reusable by later scenarios.
   - Recommendation: A (AGENTS.md names Playwright for this suite; Next.js guide). 
   - Blocks propose: **yes** (`AGENTS.md` → Dependencies).

2. **How the suite starts the application.**
   - A: `webServer` runs a production build and start (`npm run build`, then `npm run start`) with the §4 environment; `reuseExistingServer` on, so an already running front at the base URL is used instead.
   - B: `webServer` runs `npm run dev`. Faster, but not the code that is deployed (dev CSP adds `'unsafe-eval'`; dev-only behaviour).
   - C: no `webServer`: the suite always runs against a front someone started (local stack, or the deploy) at the base URL.
   - Recommendation: A, per the Next.js guide ("run against your production code"), with C's behaviour available through `reuseExistingServer` and the base URL variable.
   - Blocks propose: no (A by default).

3. **Base branch, given that Product owner wants the suite on `feature/route-api-web-pages-through-front`.** `AGENTS.md` (Git Flow) creates `feature/<change-id>` from `develop`; the backlog says R1 waits for "R74 in `develop`"; R74 is not merged yet.
   - A: wait for R74's merge into `develop`, branch from `develop`; the suite reaches the deploy branch through `develop`.
   - B: branch from `feature/route-api-web-pages-through-front` and integrate into it (outside the Git Flow rules; R74's branch would carry a second change).
   - C: branch from `develop` now (the test touches nothing R74 changes; the config takes its URLs from the environment, so it works before and after R74), and bring it into the deploy branch by merging `develop` into it.
   - Recommendation: A, as the backlog records; C if Product owner wants the suite before R74 is merged.
   - Blocks propose: **yes** (the architect proposes on the change's branch).

4. **A third suite and the `testing` spec.** The `testing` spec says the repository "SHALL keep two test suites"; a change in OpenSpec also needs at least one delta, and "Choosing a locale" itself does not change.
   - A: a `testing` delta that adds the end-to-end suite (separate command, never counted in the validation or QA totals, runs against the running front through its origin) and adjusts "two suites" accordingly; `app-shell` takes no delta. Commits per capability.
   - B: no `testing` delta; an `app-shell` delta that only restates "Choosing a locale" (no behaviour change) so the change validates; the suite stays outside the specs.
   - C: no delta; the suite is recorded only in `AGENTS.md` (Product owner's file).
   - Recommendation: A; it states where the suite stands next to the other two and keeps the "two suites" requirement true.
   - Blocks propose: **yes** (decides the capabilities and the spec delta).

5. **Route the test uses.**
   - A: `/es/about` → `/en/about`. No API read; asserts the About heading.
   - B: `/es` → `/en` (the landing). Needs `API_INTERNAL_URL` (real API or a mock) or tolerates the offerings block's error state.
   - C: a route with a query (e.g. `/es/offerings?page=2`) to show the query is kept. Needs the API, and query keeping is not in the scenario's text.
   - Recommendation: A (the smallest route that proves "same route, other locale, texts change" with no API).
   - Blocks propose: no (A by default).

6. **Where the suite runs and against what.**
   - A: cloud sessions only, against the front alone (no API, no mock), as part of the checks they already run.
   - B: Product owner's machine only, against the real stack (R74 environment, local `https` origin).
   - C: both: the same command; cloud sessions run it as part of the change's checks; Product owner's machine runs it before deploying, against the real stack.
   - Recommendation: C. For this scenario the two runs are equivalent (no API); a mock server at `API_INTERNAL_URL` (§4) is decided with the first scenario that needs data.
   - Blocks propose: no.

7. **The existing unit test of the same scenario** (`AppHeader.test.tsx:411`).
   - A: keep it; the unit test covers the callback, the end-to-end test the route switch.
   - B: move it to `qa/` through Product owner's reduction plan, leaving one test per scenario in the validation suite only if the end-to-end suite counts as the scenario's test.
   - Recommendation: A (no test is moved during a change, `AGENTS.md` → Testing).
   - Blocks propose: no.

8. **Expected texts in the test.**
   - A: read them from `messages/<locale>/landing.json` (and the selector's name from `shell.json`), so a catalog edit does not break the test.
   - B: literal strings in the test.
   - Recommendation: A (no invented or duplicated texts).
   - Blocks propose: no.

9. **When the suite runs, and what "count as the develop tests" means.**
   - Options for when: (a) after the last task of every change that touches a scenario it covers; (b) before each merge of `develop` into `master` and before each deploy from `feature/route-api-web-pages-through-front`; (c) both.
   - "Count as the develop tests": does a green run of the full checks plus `test:e2e` on the deploy branch replace the checks on `develop`, or only add to them?
   - Recommendation: (c) for when; the deploy-branch run adds to, and does not replace, the validation and QA suites on `develop`, until Product owner says otherwise.
   - Blocks propose: no (process; the architect can write the change without it, and the workflow file is Product owner's).

## Review log

- **2026-10-12, design lead (draft, cloud session).** Generated from `docs/design/backlog.md` R1 and R74, the decisions log in `docs/design/general-context.md` (2026-10-07 cloud browser checks; 2026-10-12 R74 single entry point), `docs/design/change-progress.md` (2026-10-12 entry), `AGENTS.md` (Testing, Dependencies, Git Flow), `docs/agents/workflow_sdd.md` §3a and §3c, `openspec/specs/app-shell/spec.md` and `openspec/specs/testing/spec.md`, R74's `design.md` and design summary on `feature/route-api-web-pages-through-front`, the code of `ShellChrome.tsx`, `LanguageSelect.tsx`, `AppShell.test.tsx`, `AppHeader.test.tsx`, `session.ts`, `AboutScreen.tsx`, `app/layout.tsx`, `vitest.config.mts`, `vitest.qa.config.mts`, `tsconfig.json`, `package.json`/`package-lock.json`, and the Next.js 16.4.0 guide `01-app/02-guides/testing/playwright.md`.
  - Settled from sources (criterion B): the scenario's assertions (spec text); the test opens an anonymous first visit, which makes no request (`session.ts`); the `*.e2e.ts` naming keeps both Vitest suites' counts (`testing` spec, Vitest default include); the API is not needed on `/es/about`; a future mock sits at `API_INTERNAL_URL` because server-side reads bypass the browser (R74 D5).
  - Not run: no browser, no API and no install in this session; every Playwright behaviour above is from documentation, not executed.
  - Conflicts in the sources: (1) the backlog's priority table says R1 waits for "R74 in `develop`", while Product owner's instruction of 2026-10-12 wants the suite on R74's branch (Open 3). (2) The `testing` spec's "two test suites" against a third suite (Open 4). (3) `docs/agents/design-lead.md` ("Never commit, push") against this session's assignment to commit and push the draft; the assignment was followed for this file only.
