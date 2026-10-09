Type: Refactor (fast lane)

# Proposal

## Why

On the registration routes (`/{locale}/register` and `/{locale}/register/coffeeshop`), from the medium breakpoint, the column that holds the loading status, the registration form and the success panel is capped at 40rem (`widen-account-cards`, R51) but sits at the start of the full-width section card, so on a wide screen the fields do not sit centred across the card. Product owner's acceptance test finding (2026-10-09) decides that this column is centred in the card. This changes the layout by Product owner's decision; it is typed as a fast-lane change as Product owner types AUT corrections.

## What Changes

- In `src/pages/register/ui/RegisterClient.tsx`, the content column inside the section card (`w-full md:max-w-160`) is centred horizontally from the medium breakpoint, keeping the same 40rem cap with equal space on both sides. Below the medium breakpoint it stays full width.
- The "Registration routes" requirement of `user-account` states the centring and its "The registration card" scenario checks it.

## Out of scope (non-goals)

- The section card, its padding, the loading status, the form and the success panel themselves: unchanged.
- The account page and every other screen: they keep their own layout (the account page's content stays aligned to the card's start).
- No new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: MODIFIED "Registration routes": the content column is centred in the registration card from the medium breakpoint; its scenario "The registration card" checks it.

## Impact

- **Code** (FSD layer `pages`, slice `register`, segment `ui`): modified `src/pages/register/ui/RegisterClient.tsx`.
- **Tests**: `src/pages/register/ui/RegisterScreen.test.tsx`, test "fills the page container with the registration card, its content capped from md", additionally asserts the centring class on the capped column; the `md:max-w-160` assertion stays. No other test.
- **API, contract, texts, tokens, dependencies**: none.

## Propose status

- **Change-id:** `center-register-card-content`
- **Date:** 2026-10-09
- **Validation:** `openspec validate center-register-card-content --strict` → "Change 'center-register-card-content' is valid".
- **Resolved:** from the medium breakpoint the registration content column is centred in the section card with the same 40rem cap; below it, unchanged (Product owner, 2026-10-09). The build chooses the centring class and the test asserts it.
- **Open:** nothing.
