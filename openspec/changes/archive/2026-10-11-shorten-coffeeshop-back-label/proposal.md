Type: Refactor (fast lane)

## Why

Backlog entry R72 (Product owner, 2026-10-11), taken as a fast lane by Product owner's order of 2026-10-11: the coffee shop detail's back controls read "Volver a cafeterías" / "Back to coffee shops" / "Torna a les cafeteries", while the public evaluations' back controls read the short "Volver" / "Back" / "Tornar". Settled end state: every back control of the coffee shop detail reads es "Volver", en "Back", ca "Tornar" (the public evaluations' wording); destination and behaviour unchanged. Nothing else changes.

## What Changes

- Every back control of the coffee shop detail — the top back link (content, loading and error states) and the back button (at the end of the content and in the not-found state) — reads "Volver" in es, "Back" in en and "Tornar" in ca.
- Their destinations and behaviour stay as today: the top link points at the directory of the locale, the back button returns to the previous page of the application with the directory as fallback.
- Nothing else changes: no other screen's back label, no other text, layout, request, token or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: MODIFIED "Coffee shop detail page" (every back control reads "Back"; the scenarios that name or show the back controls state that label; new scenario "Back label in each locale"). The coffee shop directory and its detail belong to `offering-catalog` (see its description in `openspec/config.yaml`); there is no `coffeeshop-directory` capability, so the delta and the commit scopes use `offering-catalog`.

## Non-goals

- No change to any other back control: the offering detail, the public evaluations, the evaluation form, the management screens and the directory's "Back to the list" keep their labels.
- No change to the back controls' destinations, fallbacks or behaviour, to the catalog key name, to components, layout, requests, tokens or dependencies.
- No other backlog entry is folded in.

## Impact

- Modified: `messages/es/coffeeshops.json`, `messages/en/coffeeshops.json`, `messages/ca/coffeeshops.json` (value of `backToDirectory`). The key and every component that renders it (`src/widgets/coffeeshop-detail/ui/texts.ts`, `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx`, `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx`) stay as they are.
- Tests: one new test, for the new scenario "Back label in each locale". Five existing validation tests assert the old label "Volver a cafeterías"; by Product owner's decision of 2026-10-11 (option A) only that label string changes to "Volver" in them, as the tests of the scenarios this change modifies (see tasks 1.1).
- QA suite: `qa/src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx` and any other QA test asserting the old label becomes stale on purpose; it is left untouched and listed in the build's final report.

## Propose status

- Change-id: `shorten-coffeeshop-back-label`
- Date: 2026-10-11
- `openspec validate shorten-coffeeshop-back-label --strict`: valid
- Resolves backlog entry: R72 (fast lane by Product owner's order of 2026-10-11).
- Resolved (backlog entry R72): the end state as stated in What Changes.
- Resolved (architect): the requirement whose scenarios name "Back to coffee shops" is "Coffee shop detail page" in `offering-catalog`; it is the only one, so there is one delta. The backlog entry and the session prompt name the capability `coffeeshop-directory`, which does not exist; the delta and the commit scopes use `offering-catalog`, the capability that owns the coffee shop detail.
- Resolved (architect, design.md D1): only the catalog values change; the key `backToDirectory` keeps its name, so no component changes.
- Resolved (Product owner, 2026-10-11, option A): the existing validation tests that assert "Volver a cafeterías" change only that label string to "Volver"; nothing else in them changes. Mapping, each to a scenario this change modifies:
  - `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.test.tsx` "shows the back link, three placeholder bars and two skeleton cards while loading" → "Loading"
  - `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx` "links back to the directory of the locale" → "Back link"
  - same file, "Back link at the end" → "Back link at the end"
  - same file, "renders the title and the line above the back button, with no retry action and no tab" → "Unknown coffee shop"
  - same file, "renders the back link, the error and the retry action, and no tab" → "Unknown coffee shop or failure"
- Open: none.
