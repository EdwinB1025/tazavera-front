# Proposal

## Why

The shell's one navigation interaction, "Choosing a locale" (`app-shell` → "Language selection"), is verified only up to the selector's callback: the unit tests mock the router, so nothing checks that the application really opens the same route in the chosen locale with its texts changed (backlog R1, verify W1 of `add-app-shell`). That needs a real browser and the running application, which no current suite provides. R74 (the front as the API's only door) is on `develop`, which was R1's precondition.

## What Changes

- Add a third, end-to-end test suite, run by its own command against the running front through its origin, in a real browser. It is never counted in the validation or QA suite totals, and adding it leaves both of those suites' file and test counts unchanged.
- Add one end-to-end test of "Choosing a locale": an anonymous first visit to `/es/about`, the language selector set to English, the URL becomes `/en/about` and the main heading reads the English text.
- Add the development dependency `@playwright/test` at an exact version, Chromium only (explicitly approved by Product owner, 2026-11-12), with its configuration, an npm script `test:e2e` and ignore entries for its output folders.
- Adjust the `testing` spec's "two test suites" wording so that the validation and QA suites keep their property next to the new end-to-end suite.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `testing`: the requirement "Test environment set-up keeps the suites' results" now names the validation and QA suites next to a separate end-to-end suite; a new requirement states the end-to-end suite (own command, run against the running front through its origin, never counted in the validation or QA totals).

`app-shell` takes no delta: "Choosing a locale" is unchanged; this change only adds a test of it.

## Impact

- Files: `package.json`, `package-lock.json`, `.gitignore`, `playwright.config.ts` (new), `e2e/app-shell/language-selection.e2e.ts` (new). No file under `app/`, `src/`, `messages/` or `contracts/`, and no deploy file (`Dockerfile`, `.dockerignore`) changes.
- Dependencies: `@playwright/test` added to `devDependencies` at an exact version (design.md D1). No other dependency is added, removed or upgraded.
- API: no operation consumed; the scenario's route reads no API.
- Resolves backlog entry R1.

## Non-goals

- Any other end-to-end scenario, viewport, browser or locale pair.
- Accessibility scans, visual comparison, snapshots or screenshots as assertions.
- A mock of the API, and sign-in flows end to end.
- CI configuration and deploy files (`Dockerfile`, `.dockerignore`).
- Any change to the application's code, texts, the behaviour stated in specs other than `testing`, or `contracts/openapi.yaml`.
- Moving or deleting any existing test, including the unit test "calls back with the chosen locale (spec: Choosing a locale)".
- Editing `AGENTS.md`, `docs/agents/` or `openspec/config.yaml`, whose test-suite wording reads stale after this change (Product owner's files).
