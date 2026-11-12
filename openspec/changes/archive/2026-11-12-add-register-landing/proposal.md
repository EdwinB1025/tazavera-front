# Proposal

## Why

Today a visitor reaches registration only through two text links in the entry-page hero and two in the About us page, and nothing in the app header offers it. Product owner asked (2026-10-21, backlog R91) for one clear way in for anonymous visitors: a "Register" action that opens a registration landing explaining the two ways to join, specialist and coffee shop, each leading to its existing form.

## What Changes

- New registration landing at `/{locale}/join`: a heading, an introduction and two option cards (specialist first, then coffee shop), each with a short text and an action button that opens its existing form (`/{locale}/register`, `/{locale}/register/coffeeshop`). Like the registration forms, it waits with a loading status while the session resolves and sends an authenticated visitor to `/{locale}` through client-side navigation. When the session cannot be resolved, it shows its heading, its introduction and the two options as for an anonymous visitor, with no error.
- App header, from the large breakpoint (1024px): a "Register" action button immediately before "Sign in", opening `/{locale}/join`, shown only while the session is anonymous. Below 1024px the header is unchanged.
- Entry page, below 1024px: a "Register" action button as the last action of the hero's actions row, opening `/{locale}/join`, shown only while the session is anonymous (corrections Round 2).
- Entry-page hero: its two registration links are replaced by one action button to the About us page (`/{locale}/about`), in positional treatment 3, for every visitor, with no navigation landmark around it (corrections Round 1 and Round 2); the hero's actions sit side by side in one wrapping row (corrections Round 2).
- About us, "who it is for" section: its two registration links are replaced by one text link to `/{locale}/join`, for every visitor, with no navigation landmark around it.
- **BREAKING (texts and landmarks):** the "Registration" navigation landmark leaves both pages, and the six registration-link texts per locale are removed from the `landing` catalog. New texts: `shell.register`, `landing.heroRegisterAction`, `landing.heroAboutLabel`, `landing.aboutRegisterLabel` and eight `account.registerLanding*` keys, in es, en and ca.
- The registration forms, their routes, their fields, the success panel, Cancel, the auth flow and `POST /register` do not change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `user-account`: ADDED "Registration landing"; MODIFIED "Registration routes" (reachable from the registration landing instead of the entry page and About us).
- `app-shell`: MODIFIED "Signed-out header" (the "Register" action from the large breakpoint), "Session states in the shell" (no "Register" while resolving) and "Named navigation landmarks" (the "Registration" landmark removed).
- `landing`: MODIFIED "Page layout" (link-group rule removed), "Entry page hero" (one About us button instead of the registration links; the actions in one wrapping row) and "About us page" (one registration-landing link instead of the registration links); ADDED "Entry page Register button".

## Out of scope

- Any change to the two registration forms, their routes, fields, success panel, Cancel destination or `POST /register` (summary Open 10 = A).
- Any change to the auth flow (popup, return route, `login_hint`, tokens); no CSP or header change.
- A "Register" entry in the small-viewport navigation menu, and any new icon (dropped with Product owner's Open 2 answer).
- An "Already have an account? Sign in" line on the landing (summary Open 8 = A).
- A "Register" action below 1024px on pages other than the entry page (summary Open 11 = A).
- Hiding the About us `/join` link for signed-in visitors (the landing itself sends them away).
- R45 (first location in coffee-shop registration): queued after this change, not folded in.
- Showing the header action or hiding the entry-page button below the large breakpoint (1024px): the visual review measured the header overflowing at 768px, so both settle on `lg` (handoff C3 = A, 2026-11-06).

## Impact

- Routing: new `app/[locale]/join/page.tsx`.
- `src/pages/register` (new landing screen, its client region and option card; the anonymous-only gate shared with the forms), `src/pages/home` (new entry-page button island, placed in the hero's actions row; hero About us button), `src/pages/about` (About us link), `src/widgets/app-header` (header action), `src/app/shell/AppShell.tsx` (one text).
- `messages/{es,en,ca}/{shell,account,landing}.json`; `README.md` route table.
- Validation tests: `HomeHero.test.tsx`, `AboutContent.test.tsx`, `HomeScreen.test.tsx`, `AppHeader.test.tsx`, `AppShell.test.tsx`, new `RegisterLandingScreen.test.tsx`. QA fixtures that go stale (not edited): `qa/src/pages/home/ui/HomeHero.test.tsx`, `qa/src/pages/home/ui/HomeScreen.test.tsx`, `qa/src/widgets/app-header/ui/AppHeader.test.tsx`.
- API: no operation consumed; no contract change. Dependencies: none added. Tokens: none added; every pair is already registered in the theme matrix.

## Propose status

- **Change-id:** add-register-landing
- **Date:** 2026-11-05
- **Type:** Change (traditional workflow 3a)
- **Source:** `docs/design/add-register-landing/design-summary.md` (approved, `c6ac3ddf`); handoff answers Q1–Q5 and decisions D1–D3.
- **`openspec validate add-register-landing --strict`:** valid
- **Backlog entries resolved:** R91. R45 is not affected beyond sharing the registration area (not folded in).
- **Resolved by the architect (design.md):**
  - Gate sharing (summary Open 7 = A) → one slice-local hook in `src/pages/register/model/`, used by the forms' client region and the landing's, instead of a component with slots: the forms keep rendering nothing (no empty card) when authenticated, and the landing's loading status stays outside any card (design.md D2).
  - FSD placement → the landing stays in the `src/pages/register` slice, as the summary settles (§4.3); the lower-layer alternative is not taken (design.md D1).
  - The entry-page button island renders its own `md:hidden` wrapper and renders nothing otherwise, so no empty flex item adds the 1.5rem gap for a signed-in or resolving visitor (design.md D5).
  - `landing.aboutRegisterLabel` is a new key, not a reuse of `heroRegisterAction` (summary §8 default kept; design.md D7).
  - New text props are required, not optional; the QA fixtures that lack them go stale and are listed, not edited (design.md D8).
  - Scenarios whose subject disappears (landing "Link groups", "Registration destinations", "Specialist registration destination", "Registration links"; app-shell "Registration links named") keep their names with new content, because `openspec validate --strict` (1.16.0) refuses a MODIFIED block that drops a scenario name, as in `open-directory-from-hero`; their existing tests are rewritten in the task that changes the behaviour (design.md D9).
- **Open:**
  - The 768px header width with the new action is unmeasured (summary Unverified 2); if the visual review measures an overflow, both breakpoints move to `lg`, per summary §9. Settled 2026-11-06: overflow measured, both actions on `lg` (handoff C3 = A; see below).
- **Artifact review (2026-11-05), Product owner's review Q6 = A, Q7 = A, Q8 = A:**
  - Q6 = A → the artifacts carry the settled values themselves and point to design.md: the catalog wording now lives in design.md D7, and tasks 1.2 and 3.2 reference design.md D7 instead of the summary's §8; the design summary is only the propose input (design.md Context).
  - Q7 = A → user-account "Registration landing session gate" states the unresolvable session and gains scenario "The landing shows its options when the session cannot be resolved" (the two options as for an anonymous visitor, with no error); task 1.1 gains its test, which drives a real unresolvable session as `src/app/shell/AppShell.test.tsx:221` does, distinct from the anonymous test (handoff decision D5; design.md D2).
  - Q8 = A → the five scenarios keep their names with the new content and are renamed later by a hand edit of the main specs (design.md D9); the renaming question leaves the Open list above.
  - `openspec validate add-register-landing --strict`: valid.
- **Artifact update during apply (2026-11-05), handoff C1 = B and C2 = A (closed by the orchestrator):**
  - C1 = B → `AppShell.test.tsx` "Session unresolvable renders as anonymous with no error message and no retry affordance" counted D4's CSS-hidden header Register button (jsdom applies no CSS). Task 2.3 now starts, test-first, by making its last assertion also leave out the button named `texts.register`, still expecting exactly 3 buttons besides the navigation-menu control; task 2.1 names that exception. No design decision or spec delta changes; nothing users see changes.
  - C2 = A → the text of user-account "Registration landing session gate" was 501 characters, over the 500-character limit of `openspec validate --strict` (CLI 1.16.0); it now reads "While the session resolves" (497 characters), with the same behaviours, name and scenarios.
  - `openspec validate add-register-landing --strict`: valid.
- **Artifact update during apply (2026-11-06), handoff Q12 = A (Product owner, 2026-11-06):**
  - Q12 = A → `next build` type-checks `qa/` (`tsconfig.json` includes it), so the build could not pass while the stale QA fixtures stayed stale. design.md D8: the new text props stay required and production code is not loosened; the build updates only the types of the QA fixtures that lack them in task 5.1 (`aboutLabel` in `qa/src/pages/home/ui/HomeHero.test.tsx`, whose fixture also drops the removed labels, and `register` in `qa/src/widgets/app-header/ui/AppHeader.test.tsx`), with no assertion changed. design.md Risks: the stale assertions stay failing and are listed for the QA run before the merge into `master`; `qa/src/pages/home/ui/HomeScreen.test.tsx` and the missing mocks are not edited. tasks.md: the "Never edit a file under `qa/`" rule allows that one exception; task 5.1 starts with the fixture-type update in one `fix(user-account)` commit and now expects `npx tsc --noEmit` to report no errors. Checked tasks stay checked; no other task, design decision or spec delta changes; nothing users see changes.
  - `openspec validate add-register-landing --strict`: valid.
- **Artifact update during apply (2026-11-06), handoff C3 = A (closed by the orchestrator, 2026-11-06):**
  - C3 = A → the visual review (design lead, 2026-11-06) measured the signed-out header at 768px with the "Register" action: content width 903px (es), 894px (ca) and 823px (en) of 768px, "Sign in" off screen; nothing overflows from 1024px in any locale. The settled fallback of summary §9 applies: both "Register" actions move to the large breakpoint (1024px) together. app-shell "Signed-out header" and its scenario "Signed-out header renders": the action shows from 1024px, not below. landing "Entry page Register button" and its scenario "Register button for an anonymous visitor on a small viewport" (name kept): the button shows below 1024px and not from 1024px. design.md D4 (wrapper `hidden lg:inline-flex`, the settled state), D5 (wrapper `lg:hidden`; the page does not change from `lg`; between 768px and 1023px the button sits 1.5rem above the two-column hero) and Risks (the measurement). proposal.md: What Changes, Capabilities, Out of scope and the Open line above state 1024px; the earlier `md:hidden` entry under "Resolved by the architect" is superseded by D5. tasks.md: new group 6 (tasks 6.1 test, 6.2 implementation, 6.3 full checks) before the workflow follow-up, whose visual-review line now covers the header at 1024px and the entry page between 768px and 1023px. Checked tasks stay checked; every other 768px value (the `/join` columns, page padding, the hero's columns, "Page layout") stays; no text, token, component or test file is added.
  - `openspec validate add-register-landing --strict`: valid.
