# Proposal

## Why

Today a visitor reaches registration only through two text links in the entry-page hero and two in the About us page, and nothing in the app header offers it. Product owner asked (2026-10-21, backlog R91) for one clear way in for anonymous visitors: a "Register" action that opens a registration landing explaining the two ways to join, specialist and coffee shop, each leading to its existing form.

## What Changes

- New registration landing at `/{locale}/join`: a heading, an introduction and two option cards (specialist first, then coffee shop), each with a short text and an action button that opens its existing form (`/{locale}/register`, `/{locale}/register/coffeeshop`). Like the registration forms, it waits with a loading status while the session resolves and sends an authenticated visitor to `/{locale}` through client-side navigation.
- App header, from the medium breakpoint (768px): a "Register" action button immediately before "Sign in", opening `/{locale}/join`, shown only while the session is anonymous. Below 768px the header is unchanged.
- Entry page, below 768px: a "Register" action button above the hero, opening `/{locale}/join`, shown only while the session is anonymous.
- Entry-page hero: its two registration links are replaced by one text link to the About us page (`/{locale}/about`), for every visitor, with no navigation landmark around it.
- About us, "who it is for" section: its two registration links are replaced by one text link to `/{locale}/join`, for every visitor, with no navigation landmark around it.
- **BREAKING (texts and landmarks):** the "Registration" navigation landmark leaves both pages, and the six registration-link texts per locale are removed from the `landing` catalog. New texts: `shell.register`, `landing.heroRegisterAction`, `landing.heroAboutLabel`, `landing.aboutRegisterLabel` and eight `account.registerLanding*` keys, in es, en and ca.
- The registration forms, their routes, their fields, the success panel, Cancel, the auth flow and `POST /register` do not change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `user-account`: ADDED "Registration landing"; MODIFIED "Registration routes" (reachable from the registration landing instead of the entry page and About us).
- `app-shell`: MODIFIED "Signed-out header" (the "Register" action from the medium breakpoint), "Session states in the shell" (no "Register" while resolving) and "Named navigation landmarks" (the "Registration" landmark removed).
- `landing`: MODIFIED "Page layout" (link-group rule removed), "Entry page hero" (one About us link instead of the registration links) and "About us page" (one registration-landing link instead of the registration links); ADDED "Entry page Register button".

## Out of scope

- Any change to the two registration forms, their routes, fields, success panel, Cancel destination or `POST /register` (summary Open 10 = A).
- Any change to the auth flow (popup, return route, `login_hint`, tokens); no CSP or header change.
- A "Register" entry in the small-viewport navigation menu, and any new icon (dropped with Product owner's Open 2 answer).
- An "Already have an account? Sign in" line on the landing (summary Open 8 = A).
- A "Register" action below 768px on pages other than the entry page (summary Open 11 = A).
- Hiding the About us `/join` link for signed-in visitors (the landing itself sends them away).
- R45 (first location in coffee-shop registration): queued after this change, not folded in.
- Moving the header action and the entry-page button to the `lg` breakpoint: only if the visual review measures an overflow at 768px, as a later correction.

## Impact

- Routing: new `app/[locale]/join/page.tsx`.
- `src/pages/register` (new landing screen, its client region and option card; the anonymous-only gate shared with the forms), `src/pages/home` (new entry-page button island; hero link), `src/pages/about` (About us link), `src/widgets/app-header` (header action), `src/app/shell/AppShell.tsx` (one text).
- `messages/{es,en,ca}/{shell,account,landing}.json`; `README.md` route table.
- Validation tests: `HomeHero.test.tsx`, `AboutContent.test.tsx`, `HomeScreen.test.tsx`, `AppHeader.test.tsx`, `AppShell.test.tsx`, new `RegisterLandingClient.test.tsx`. QA fixtures that go stale (not edited): `qa/src/pages/home/ui/HomeHero.test.tsx`, `qa/src/pages/home/ui/HomeScreen.test.tsx`, `qa/src/widgets/app-header/ui/AppHeader.test.tsx`.
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
  - The 768px header width with the new action is unmeasured (summary Unverified 2); if the visual review measures an overflow, both breakpoints move to `lg` through a correction round.
  - The kept scenario names above no longer describe their content; renaming them needs a hand edit of the main specs or a tool that lets a MODIFIED block drop a scenario (Product owner's decision, as for `open-directory-from-hero`).
