Type: Refactor (fast lane)

## Why

Backlog entry R87 (Product owner's AUT review, 2026-10-13), taken as a fast lane by Product owner's order of 2026-10-13, with its approval delegated to the orchestrator, who settled its details: the reference notes of an evaluation do not show the developed tree nor its toggles, and the +/− toggle reads better inside the note's badge than after it. Every taste tree should be the same collapsible tree, with the toggle inside the badge.

## What Changes

- Part A — in every taste tree (offering card, own offerings, coffee shop detail, landing, the offering detail's Main tastes, Defects and detail by axis), the +/− toggle of a note with children sits inside that note's own taxonomy badge, right after its name. Where a share is shown, the `name n/total` share follows the badge. A note without children shows no toggle.
- Only the toggle is interactive; the badge itself has no handler, no role and no tab stop. The toggle keeps its accessible names, `aria-expanded`, `aria-controls`, its hidden `+` / `−` glyph, the closed start and the closing of every descendant on close.
- Inside the badge the toggle's border and glyph take the badge's label colour, and it loses its hover background; no token or colour value is added.
- Part B — the evaluation sheet's Descriptors card shows the chosen notes of each of its five blocks as the same collapsible taxonomy tree (closed at first, toggle inside the badge, no shares) instead of the read-only descriptor cascade. A chosen note whose ancestor is not chosen shows under that ancestor, which shows as a badge. The block layout, its legends and the empty text stay as they are.
- One pure builder in `entities/taxonomy`, next to the consensus tree builder, turns a block's chosen references into that tree. The R87 entry places the existing tree builder in `src/widgets/offering-detail`; it already lives in `src/entities/taxonomy/model/taste-note-tree.ts`, reachable from both widgets, so nothing is moved.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: MODIFIED "Taxonomy badge trees on the offering card" (the toggle sits inside the note's badge after its name, and only the toggle is interactive; modified scenario "Toggle on notes with children").
- `offering-catalog`: MODIFIED "Consensus Defects and Main tastes" (modified scenario "Trees closed at first with the toggle after the share": the toggle inside the badge, the share after the badge) and MODIFIED "Consensus detail by axis" (modified scenario "Axis trees closed at first").
- `evaluations`: MODIFIED "Read-only evaluation presentation" (the descriptors card shows each block as the collapsible taxonomy tree; modified scenario "Descriptor blocks"; "An unresolved descriptor reference" kept).

## Non-goals

- No change to which notes the offering card and the Consensus tab render, their order, colours, shares, empty texts, the tree layout or the open/close behaviour; no change to the flavor wheel.
- The evaluation form keeps the descriptor cascade for choosing notes. The descriptor cascade and chip group, their read-only mode, its tests and its `form-fields` requirement stay untouched; an unused read-only mode is reported as a backlog candidate, not removed.
- No new token, colour value, catalog key, dependency or API request; `Badge` and `globals.css` are not touched.
- The files other sessions of the round work on (R84, R85, R86, R88) are not touched; the landing delta modifies only "Taxonomy badge trees on the offering card". No other backlog entry is folded in.

## Impact

- Modified: `src/shared/ui/TaxonomyTree.tsx` (the toggle inside the badge, after the name), `src/shared/ui/TaxonomyTreeToggle.tsx` (its classes), `src/entities/taxonomy/model/taste-note-tree.ts` and `src/entities/taxonomy/index.ts` (the chosen-note tree builder), `src/widgets/evaluation-sheet/ui/EvaluationSheetCards.tsx` (the Descriptors card moves out, `SheetCard` exported), `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx` and `src/widgets/evaluation-sheet/lib/texts.ts` (the two tree texts), `src/widgets/evaluation-sheet/ui/sheet-fixtures.ts`.
- Added: `src/widgets/evaluation-sheet/ui/EvaluationSheetDescriptors.tsx` (the Descriptors card with the trees).
- Tests: the one test of each modified scenario is rewritten — `src/entities/offering/ui/OfferingCard.test.tsx` ("Toggle on notes with children"), `src/widgets/offering-detail/ui/ConsensusPanel.test.tsx` (the two closed-at-first scenarios, and the two "identified notes" tests whose helpers read the badge's name now that the badge also holds the glyph), `src/widgets/evaluation-sheet/ui/EvaluationSheet.test.tsx` ("Descriptor blocks"). In the QA suite, only the `badgesIn` helper of `qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx` reads the badge's name, by the orchestrator's authorisation; its expected values stay.
- No API endpoint, field or request changes.

## Propose status

- Change-id: `unify-taste-trees`
- Date: 2026-10-13
- `openspec validate unify-taste-trees --strict`: valid
- Resolves backlog entry: R87 (fast lane by Product owner's order, AUT 2026-10-13; approval delegated to the orchestrator).
- Resolved (orchestrator, settled end state): the toggle inside the badge after the name, the share after the badge, only the toggle interactive, the toggle's accessibility and closed start kept, its classes (`border-current`, no `text-text-primary`, no hover background); the evaluation sheet's blocks as the same tree with no shares, the ancestor rule of the form's draft load, refs outside the block's category or unresolved rendering nothing; the tree texts from `landing.treeShowNotesLabel` and `landing.treeHideNotesLabel`; the builder in `entities/taxonomy`; the block layout unchanged.
- Resolved (architect): design.md D1–D4 (the name element and the toggle inside the badge, the toggle classes, the chosen-note builder pruning the category's descriptor tree, the Descriptors card in its own file to keep `EvaluationSheetCards.tsx` within 300 lines). The "only the toggle is clickable" rule is covered by the modified "Toggle on notes with children" scenario, so no scenario is added. The scenario "Trees closed at first with the toggle after the share" keeps its name: `openspec validate` refuses a MODIFIED block that drops a scenario name of the current spec, so only its body changes.
- Open: none.
