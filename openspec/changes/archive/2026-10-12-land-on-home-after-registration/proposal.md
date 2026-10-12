Type: Refactor (fast lane)

## Why

Backlog entry R78 (Product owner, 2026-10-12), taken as a fast lane by Product owner's order of 2026-10-12 ("can you bring me back to the landing page"): after a registration whose `201` carries a `token` block that signs the user in, the front opens `/{locale}/account`. A normal sign-in returns to where it started; the registration should bring the user back to the landing page. Settled end state: that destination becomes `/{locale}`; nothing else changes.

## What Changes

- When `POST /register` answers `201` with a `token` block that signs the user in, the session is authenticated and the landing page `/{locale}` opens through client-side navigation, with no success panel and no full page load (today: `/{locale}/account`).
- Nothing else changes: registration without the token block or with a block that does not sign the user in, the success panel, `422` and every other failure, both registration roles (specialist and coffee shop), the API requests, texts, layout and every other requirement stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: MODIFIED "Registration result" (the destination after a registration sign-in becomes `/{locale}` in the requirement text and in the scenario "Signed in by the registration"; nothing else in it changes).

## Non-goals

- No change to the success panel, its "Sign in" action, the `422` handling, the generic form-level error or the cancel destination.
- No change to the redirect of an already authenticated session on a registration route (it already opens `/{locale}`).
- No change to the requests sent to the API, to texts, components' layout, tokens or dependencies.
- No other backlog entry is folded in (R76 and R77 run in parallel on other files).

## Impact

- Modified: `src/pages/register/ui/RegisterClient.tsx` (pages layer), see design.md D1.
- Tests: no new test. The existing validation test of the scenario "Signed in by the registration" in `src/pages/register/ui/RegisterClient.test.tsx` changes only its expected destination (task 1.1). No other test changes.
- QA suite: `qa/src/pages/register/ui/RegisterClient.test.tsx` asserts no registration sign-in destination; it is expected to keep passing unchanged.

## Propose status

- Change-id: `land-on-home-after-registration`
- Date: 2026-10-12
- `openspec validate land-on-home-after-registration --strict` (`@fission-ai/openspec@1.13.2`): valid
- Resolves backlog entry: R78 (fast lane by Product owner's order of 2026-10-12).
- Resolved (backlog entry R78): the end state as stated in What Changes.
- Resolved (architect): the requirement text of "Registration result" names the same destination as its scenario, so the delta changes `/{locale}/account` to `/{locale}` in both; no other word of the requirement or of its other scenarios changes.
- Resolved (architect, design.md D1): with both authenticated paths going to `/{locale}`, the registration sign-in needs no destination of its own.
- Resolved (architect, task 1.1): the existing test's expected destination is stated in three places (its title, the expected `replace` call and the guard against the other destination); all three swap `/{locale}/account` and `/{locale}`, and nothing else in the test changes.
- Open: none.
