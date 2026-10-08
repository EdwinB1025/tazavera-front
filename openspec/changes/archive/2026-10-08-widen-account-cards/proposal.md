Type: Refactor (fast lane)

## Why

Product owner's production AUT (finding 19, backlog entry R51): on the account page the section cards sit in a 32rem column aligned to the container's start, so on wide screens they "look cut off". Product owner and the design lead decided that the account cards, the registration card and the not-found card take the full width of the page container, with the page's usual side margins, while form content inside a card keeps a readable width. Unlike other fast-lane changes, this one changes settled layout by Product owner's decision (it reverses add-user-account D10 "Column" and adopt-section-card-in-account item 4); Product owner typed it as fast lane.

## What Changes

- Account page: the heading block and the section cards fill the page container's width (no 32rem column); from the medium breakpoint, the content of each section card (fields, statuses, actions) is at most 40rem wide, aligned to the card's start; the header band still fills the card. The loading and signed-out gate cards have no content cap.
- Registration routes (specialist and coffeeshop): the heading block and the registration card fill the page container's width (no centred 32rem column); from the medium breakpoint the card's content (loading status, form, success panel) is at most 40rem wide.
- Not-found page: its section card fills the page container's width (no centred 32rem column), with no content cap.
- The side margins are the page container's own (max 72rem, 1rem side padding below the medium breakpoint, 2rem from it); nothing new is added for them. Confirmation dialogs keep their own width.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Account page and its session gate" (cards fill the container, content at most 40rem from the medium breakpoint; new scenario "Sections fill the container") and "Registration routes" (the registration card fills the container; scenario "The registration card" extended).
- `app-shell`: "Not-found page" (its section card spans the page container's width; scenario "Not-found page content" extended).

## Non-goals

- No change to texts, headings, fields, states, requests or the API.
- No change to the page container (`PageSection`) or its margins, to the card component, or to the confirmation dialogs' width.
- No change to other pages' layout (management, catalog, evaluations).
- No change to the stacking of fields inside the forms (name and surname stay stacked).
- No other backlog entry is folded in.

## Impact

- Modified: `src/pages/account/ui/AccountScreen.tsx`, `src/features/user-account/ui/AccountSection.tsx`, `src/pages/register/ui/RegisterScreen.tsx`, `src/pages/register/ui/RegisterClient.tsx`, `src/pages/not-found/ui/NotFoundScreen.tsx`.
- Tests added (one per new or modified scenario, class assertions): `src/pages/account/ui/AccountScreen.test.tsx`, `src/pages/register/ui/RegisterScreen.test.tsx`, `src/pages/not-found/ui/NotFoundScreen.test.tsx`. No existing test asserts the removed `max-w-lg` on these screens.

## Propose status

- Change-id: `widen-account-cards`
- Date: 2026-10-08
- `openspec validate widen-account-cards --strict`: valid
- Resolves backlog entry: R51
- Resolved (Product owner and design lead): account, registration and not-found fill the `PageSection` container with its own margins (design.md D1); form content inside a section card at most 40rem from `md`, start-aligned, on the account sections and the registration card, none on the gate cards or the not-found card (D2); the register routes and the 404 are in scope; the confirmation dialogs keep `max-w-lg` (D3).
- Open: nothing.
