Type: Refactor (fast lane)

# Proposal

## Why

The design lead's final AUT pass found that the Catalan header button "Iniciar sessió" wraps onto two lines at 375px (it does not overflow). Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that in Catalan the header sign-in button reads "Entra". It changes one Catalan text by Product owner's decision.

## What Changes

- `messages/ca/shell.json`, key `signIn`: "Iniciar sessió" → "Entra". The key is used only by the app header, through `AppShell`.

## Non-goals

- The other Catalan "Iniciar sessió" strings (`account.json`, `evaluations.json`, `location-management.json`, `offering-management.json`) stay as they are.
- No change to es or en texts, code, tokens, layout or tests, and no change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: "Signed-out header" gains the scenario "Catalan sign-in label fits on one line".

## Impact

- Messages: `messages/ca/shell.json`.
- Code, tests, APIs, dependencies: none. No test asserts this string; none is added.

## Propose status

- **Change-id:** shorten-ca-header-sign-in
- **Date:** 2026-10-09
- **`openspec validate shorten-ca-header-sign-in --strict`:** valid
- **Backlog entries resolved:** none (AUT correction given in the session prompt)
- **Resolved:**
  - Catalan header label → "Entra" (Product owner, 2026-10-09), only in `messages/ca/shell.json` key `signIn`.
  - Spec placement → no requirement in `openspec/specs/` states the Catalan header text verbatim, so "Signed-out header" is MODIFIED only to add the scenario stating the observable property; its requirement text is unchanged.
- **Open:** none.
