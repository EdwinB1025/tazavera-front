# Proposal

## Why

`refine-page-surfaces` (merged into `develop`) settled the section card and the rule that a feature view hangs its sections from the page backdrop, and decided that `user-account` adopts it in a small change after `add-user-account` merged, so that change's verify is not reopened (refine-page-surfaces Open 3 (a); decisions log 2026-10-07 "superficies de página: respuestas a Open 1–3 y refactors previos"). The account and register screens still show the old content card with its 4px green leading edge and no header band. This change adopts the section card there before `add-user-contact`'s apply and before the R11 refactor (design summary §5).

## What Changes

- **The four account sections** (Profile, Password, Security, Danger zone) become section cards: each card's header band holds its heading and, where it has one, its description, and the section's content sits in the body. The four cards sit in one sections group 1rem apart with the page background showing between them; the heading block stays 2rem above them (design summary §2).
- **The gate and register cards without a band** (design summary, note under the title: Open 1 closed as (b)): the account's loading card and signed-out card and the register form card become section cards without a header band — body only, with the section card's border and body padding.
- **Visible changes** (design summary §3): the seven cards lose the green leading edge and show a uniform 1px subtle border; the section headings and descriptions move from the card body into a `surface-section` band with a 1px separator below it; the insets become 1rem below 768px (band and body sides and top, body bottom 1.25rem) instead of 1.5rem, and from 768px 1.5rem sides with the band 1rem top and bottom; consecutive sections sit 1rem apart instead of 2rem.

## Non-goals (out of scope)

- Anything inside the section bodies: the profile and password forms, the Role row, the Security link line and the Danger zone blocks are unchanged.
- The heading block, the column width (32rem, start-aligned on the account page, centred on the register routes) and the distance between the heading block and the first card: unchanged.
- Any interface text, token, contrast pair, contract operation or dependency: nothing new and nothing changed; every contrast pair the band needs is already registered in both matrices.
- The shared `Card`, `PageSection` and `Collapsible` and every guard test: unchanged (the `section` variant arrived with `refine-page-surfaces`).
- Backlog R11 (`share-access-and-status-pieces`): it moves `SessionGate` and the write-status pieces to `src/shared/ui` and runs after this change (design summary §5).
- `add-user-contact`: it renders `AccountSection` as it stands when its apply starts, which is after this change (design summary §0.5).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Account page and its session gate" — each of the four sections is a section card whose header band holds its heading and, where it has one, its description, the sections are 1rem apart with the page background showing between them, and the loading and signed-out cards are section cards with no header band. "Registration routes" — the route's loading status, form and success panel sit in one section card with no header band.

`content-structure` is unchanged: its "Section card" requirement already covers a section card with a static header band and one with only a body, which is the form-panel treatment `add-offering-management` already uses.

## Impact

- `src/features/user-account/ui/AccountSection.tsx` and `src/features/user-account/ui/SessionGate.tsx` (features layer, `user-account` slice).
- `src/pages/account/ui/AccountClient.tsx` and `src/pages/register/ui/RegisterClient.tsx` (pages layer).
- The tests next to those four files. `AccountScreen.tsx`, `RegisterScreen.tsx`, the forms and every other test stay green with no edit.
- No API endpoint, contract file, message catalog, token or dependency changes.
