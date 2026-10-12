Type: Refactor (fast lane)

## Why

Backlog entry R77 (Product owner, 2026-10-12), taken as a fast lane by Product owner's order of 2026-10-12: every taxonomy tree shows all its levels at once, and long trees crowd the offering cards. The trees should start closed, showing only their top-level notes, and open note by note.

## What Changes

- Every taxonomy tree starts closed, showing only its level-0 notes, in the three places it appears: the offering card (landing and every card list), the Main tastes and Defects cards of the Consensus tab, and the detail by axis.
- A note with children shows a toggle button right after its badge (after its `name count/total` share on the Consensus tab), its visible text `+` while closed and `−` while open; a note without children has no toggle.
- Opening a note shows its direct children, each closed; closing a note closes all its descendants.
- The toggle carries `aria-expanded`, `aria-controls` pointing at the child list and an accessible name from the message catalogs (show / hide the notes under the note's label, in es, en and ca); its glyph is hidden from assistive technologies.
- The open state lives only on the page: it is not remembered across reloads or navigation and changes neither the URL nor any API request.
- Once open, the nested lists, the indented level-1 column with its connector, the wrapping level-2 row and the inline shares stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: MODIFIED "Taxonomy badge trees on the offering card" (the trees start closed and open note by note; modified scenario "Nested trees"; new scenarios "Closed at first", "Toggle on notes with children", "Opening a note", "Closing a note closes its descendants", "Accessible toggle" and "Open state stays on the page").
- `offering-catalog`: MODIFIED "Consensus Defects and Main tastes" (modified scenario "Identified notes"; new scenario "Trees closed at first with the toggle after the share") and MODIFIED "Consensus detail by axis" (modified scenario "Identified notes of an axis"; new scenario "Axis trees closed at first").

## Non-goals

- No change to which notes render, their order, badges, colours, shares or the empty texts; no change to the flavor wheel ("Consensus taste trees" holds no badge tree and is not modified) or to the axis sections' own collapsible.
- No new token, colour value, icon or dependency; no disabled state; no remembered state, URL parameter or API request.
- `next.config.ts` and the `Dockerfile` are not touched (R76 runs in parallel). No other backlog entry is folded in.

## Impact

- Modified: `src/shared/ui/TaxonomyTree.tsx` (client component with the open state), `src/entities/offering/ui/OfferingCard.tsx` and `src/widgets/offering-detail/ui/SelectionBlock.tsx`, `src/widgets/offering-detail/ui/AxisDetail.tsx` (texts passed to the tree), the screens that build their texts (`src/pages/home/ui/HomeScreen.tsx`, `src/pages/offerings/ui/OfferingsScreen.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx`, `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx`, `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`), `messages/{es,en,ca}/landing.json`.
- Added: `src/shared/ui/TaxonomyTreeToggle.tsx` (the toggle button).
- Tests: one test per new or modified scenario in `src/entities/offering/ui/OfferingCard.test.tsx` and `src/widgets/offering-detail/ui/ConsensusPanel.test.tsx`; text fixtures typed with the changed text types gain the two new texts. QA tests that fail only because the tree starts closed add the clicks that open it, keeping their assertions.
- No API endpoint, field or request changes.

## Propose status

- Change-id: `collapse-taxonomy-trees`
- Date: 2026-10-12
- `openspec validate collapse-taxonomy-trees --strict`: valid
- Resolves backlog entry: R77 (fast lane by Product owner's order of 2026-10-12).
- Resolved (backlog entry R77, Product owner): closed at first everywhere the tree appears; toggle after the badge or share with `+` / `−`; level-by-level opening; closing closes descendants; toggle accessibility and catalog texts; state kept only in the component; layout unchanged once open.
- Resolved (architect): the owning specs are landing "Taxonomy badge trees on the offering card" (all six new scenarios) and offering-catalog "Consensus Defects and Main tastes" and "Consensus detail by axis" (one scenario each for the closed start with the toggle after the share, plus their modified "identified notes" scenarios). The R77 entry names offering-catalog "Consensus taste trees", but that requirement covers only the flavor wheel and holds no badge tree, so it is not modified. Design decisions D1–D5 in design.md (one catalog key pair in `landing`, the toggle file, the child list kept hidden while closed, the toggle classes, the texts types).
- Open: none.
