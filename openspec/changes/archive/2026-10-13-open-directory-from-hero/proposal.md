Type: Refactor (fast lane)

## Why

Backlog entry R86 (production AUT, 2026-10-13), taken as a fast lane by Product owner's order (AUT correction, 2026-10-13, maximum priority): the landing hero's "Explore coffees" action scrolls to the landing's own offerings block, while Product owner expects it to open the list of coffee shops. Settled end state: the hero's "Explore coffees" action opens the coffee shop directory of the active locale (`/{locale}/coffeeshops`) and no longer scrolls; its label, look and place stay the same; the about page's closing action is unchanged.

## What Changes

- The hero's explore action becomes a link to the coffee shop directory of the active locale, `/{locale}/coffeeshops`, opened through client-side navigation; it no longer scrolls the verified offerings list into view.
- Its label, its look (the action button treatment 3) and its place in the hero stay the same.
- Nothing else changes: the offerings block keeps its `offerings` id, the about page's closing action, the registration links, texts, the requests sent to the API and every other requirement stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: MODIFIED "Entry page hero" (the action that scrolls the verified offerings list into view becomes an action that opens the coffee shop directory of the active locale; the scenario "Explore scrolls to the offerings" keeps its name, because a MODIFIED block cannot drop a scenario, and now states that the explore action is a link to the coffee shop directory of the active locale; nothing else in it changes).

## Non-goals

- No change to the about page's closing action (`src/pages/about/ui/ExploreButton.tsx`).
- No change to the offerings block, its `offerings` id, the registration links or the hero's layout.
- No change to `Button`'s rendered classes or behaviour, or to the shared `Link`.
- No change to the requests sent to the API, texts, tokens or dependencies.
- No other backlog entry is folded in (R84 and R85 run as their own changes).

## Impact

- Modified: `src/shared/ui/Button.tsx` (shared layer, own commit), `src/pages/home/ui/ExploreButton.tsx` and `src/pages/home/ui/HomeHero.tsx` (pages layer), see design.md D1 and D2.
- Tests: in `src/pages/home/ui/ExploreButton.test.tsx`, the two tests of the replaced scenario "Explore scrolls to the offerings" and their `#offerings` and router fixtures are replaced by one test of the new scenario (task 1.1). No other test changes.
- QA suite: `qa/src/pages/home/ui/HomeHero.test.tsx` (line 80) finds the actions group with `getByRole("button")`; it is expected to fail once the action is a link. QA tests are not edited in this change and production code is not changed to satisfy it (task 2.1).

## Propose status

- Change-id: `open-directory-from-hero`
- Date: 2026-10-13
- `openspec validate open-directory-from-hero --strict` (`@fission-ai/openspec@1.14.1`): valid
- Resolves backlog entry: R86 (fast lane by Product owner's order, AUT correction of 2026-10-13, maximum priority).
- Resolved (backlog entry R86): the end state as stated in What Changes.
- Resolved (architect, design.md D1): the link takes `Button`'s base, rest, geometry and width classes from the same maps `Button` uses; its hover classes come from a map in the plain `hover:` form, because an anchor never matches `:enabled` and the `enabled:hover:` classes would drop the button's hover colours, against "look stays the same". `Button`'s rendered classes and tests do not change.
- Resolved (architect, design.md D2): `ExploreButton` becomes a `next/link` anchor taking `locale`; it stays a Client Component because it calls a function of the client module `Button.tsx`.
- Resolved (architect, task 1.1): the two tests of the replaced scenario and their fixtures give way to one test of the new scenario content; no other test changes.
- Resolved (architect, spec delta): `openspec validate --strict` (1.14.1, and 1.13.2 alike) rejects a MODIFIED block that drops a scenario of the main spec, so the replaced scenario keeps its header "Explore scrolls to the offerings" and only its WHEN/THEN change, as the archived change `show-item-not-found-message` did ("its name kept because a MODIFIED block cannot drop a scenario").
- Known risk: `qa/src/pages/home/ui/HomeHero.test.tsx` line 80 is expected to fail once the action is a link (task 2.1).
- Open (Product owner): the kept scenario name "Explore scrolls to the offerings" no longer describes its content. Renaming it needs either an OpenSpec tool that lets a MODIFIED block drop a scenario or a hand edit of `openspec/specs/landing/spec.md`, which the architect may not make; the change is not archived until Product owner decides.
- Resolved (orchestrator, with approval delegated by Product owner, 2026-10-13): the scenario keeps its name "Explore scrolls to the offerings" with the new content, because the openspec CLI refuses a MODIFIED block that drops a scenario name; the change is archived with it. The same approval authorised the QA-suite edit of `qa/src/pages/home/ui/HomeHero.test.tsx` line 80 (the actions group is found through the link named by the explore label), so the full checks pass.
