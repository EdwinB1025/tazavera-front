## Context

See proposal.md (Why) and backlog entry R87, whose end state the orchestrator settled for this fast lane. Current state, checked in the code:

- Every taste tree renders through `src/shared/ui/TaxonomyTree.tsx` (`"use client"`): the offering card (`src/entities/offering/ui/OfferingCard.tsx`, no `total`) and the offering detail's Main tastes, Defects and detail by axis (`src/widgets/offering-detail/ui/SelectionBlock.tsx`, `AxisDetail.tsx`, with `total`). Its `NoteRow` renders `<Badge variant="taxonomy">{label}</Badge>`, then the share (with a `total`), then the toggle, in one `SHARE_CLASSES` row.
- `src/shared/ui/TaxonomyTreeToggle.tsx` holds the toggle with the classes of collapse-taxonomy-trees D4.
- `Badge` (`src/shared/ui/Badge.tsx`) takes any `ReactNode` children and lays them out with `BADGE_GEOMETRY_CLASSES` (`inline-flex items-center gap-1 px-2 py-0.5`); the taxonomy label colour comes from `[data-taxonomy] { color: var(--taxonomy-label) }` in `globals.css`. The colour guard accepts `current`.
- The tree builders `buildConsensusNoteTree` and `buildTasteNoteTree` live in `src/entities/taxonomy/model/taste-note-tree.ts`, exported from `@/entities/taxonomy`; `buildDescriptorTree` (`model/descriptor-tree.ts`) builds one category's tree of `GET /taxonomies` as `CascadeNode`s (levels 0–2, API order, a node offered only when its `categories` hold the category and its parent is offered).
- The evaluation sheet's `DescriptorsCard` (`src/widgets/evaluation-sheet/ui/EvaluationSheetCards.tsx`, 292 lines) renders each block with `DescriptorCascade` in read-only mode. `EvaluationSheet.tsx` passes `formStateFromEvaluation(evaluation, null).descriptors`: per `DescriptorSelectionKey`, a flat `string[]` of chosen ulids, with no ancestors added (no taxonomies are passed), no counts and no totals.
- `evaluationSheetTexts` (`src/widgets/evaluation-sheet/lib/texts.ts`) already receives the `landing` catalog, which holds `treeShowNotesLabel` and `treeHideNotesLabel`.

## Goals / Non-Goals

**Goals:** Part A (the toggle inside the badge, in the one shared tree) and Part B (the evaluation sheet's blocks as that tree), as settled.

**Non-Goals:** no change to `Badge.tsx`, `globals.css`, tokens, catalogs, `DescriptorCascade`, `DescriptorChipGroup`, the evaluation form, the flavor wheel, requests or dependencies.

## Decisions

### D1 — The toggle inside the badge, after the name

In `TaxonomyTree.tsx` the badge's children become the name in its own `span`, then, for a note with children, the toggle as the badge's next child. The 0.25rem gap is the badge geometry's `gap-1`. The row is then: the badge, then the share when a `total` is given. A note without children and without a total renders the bare badge, as today; any other note keeps the `SHARE_CLASSES` row. The badge gets no handler, role or `tabIndex`; only the toggle is interactive. The toggle keeps every attribute and behaviour of collapse-taxonomy-trees D3–D4 (`type="button"`, catalog names, `aria-expanded`, `aria-controls` to the child list kept with `hidden`, the `aria-hidden` glyph, the closed start, the closing of descendants).

Consequence for tests: a badge's whole text now holds the glyph (`Floral+`), so tests that read a badge's name read its name element (`[data-taxonomy] > span:first-child`), not the badge's full text.

### D2 — The toggle's classes inside the badge

`TOGGLE_CLASSES` in `TaxonomyTreeToggle.tsx` become: `inline-flex size-6 shrink-0 items-center justify-center rounded-field border border-current type-button focus-visible:focus-ring`. `border-border-subtle` is replaced by `border-current`; `text-text-primary` and `hover:bg-surface-section` are removed, so the border and the glyph take the badge's label colour, which already meets its contrast on the badge background. No token or colour value is added.

### D3 — The chosen-note tree builder

`src/entities/taxonomy/model/taste-note-tree.ts` gains `buildChosenNoteTree(nodes: TaxonomyNode[], category: string, chosen: string[], locale: string): TasteNoteNode[]`, exported from `src/entities/taxonomy/index.ts`. It reuses `buildDescriptorTree(nodes, category, locale)` (the category's tree, levels 0–2, API order, localized names) and keeps a node when it is chosen or keeps a descendant, mapping `value` to `ref`. So a chosen note whose ancestor is not chosen shows under that ancestor, which shows as a badge (cascade-evaluation-descriptors D7); a ref outside the category or unresolved renders nothing. Pure and small (well under 20 lines of logic); no code is copied.

### D4 — The Descriptors card in its own file

`EvaluationSheetCards.tsx` is at 292 lines, so `DescriptorsCard` moves to `src/widgets/evaluation-sheet/ui/EvaluationSheetDescriptors.tsx` with `CATEGORY_BY_BLOCK`, the blocks list and `BLOCKS_CLASSES`; `EvaluationSheetCards.tsx` exports `SheetCard` for it. Layout unchanged: the card stays wide; the blocks grid `grid grid-cols-1 gap-6 md:grid-cols-2`; each block a `fieldset` (`m-0 min-w-0 border-0 p-0`) whose `legend` (`type-label mb-2`) carries the block label; below it `TaxonomyTree` with the block's notes, no `total`, and the tree texts; or `<p className="type-body">` with the empty text when the block has no note. `DescriptorsCard` gains a `treeTexts: TaxonomyTreeTexts` prop. `EvaluationSheetTexts` gains `showNotesLabel` and `hideNotesLabel`, mapped in `evaluationSheetTexts` from `landing.treeShowNotesLabel` and `landing.treeHideNotesLabel`; the fixture `sheet-fixtures.ts` gains the two fields. The sheet is rendered from server and client hosts; the tree is already a client component and every prop it receives is serialisable.

## Risks / Trade-offs

- [`DescriptorCascade`'s and `DescriptorChipGroup`'s read-only mode loses its only production consumer] → left untouched with its tests and its `form-fields` requirement; reported as a backlog candidate.
- [QA tests that read a badge's full text see the glyph] → only `qa/src/widgets/offering-detail/ui/ConsensusPanel.test.tsx`'s `badgesIn` helper is known; by the orchestrator's authorisation it reads the badge's name element, expected values unchanged. Any other QA failure is a regression and stops the change.
