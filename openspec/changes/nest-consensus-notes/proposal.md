Type: Refactor (fast lane)

# Proposal

## Why

Production AUT finding 30 (backlog R62). The fast-lane typing is Product owner's (standing rule for AUT corrections, maximum priority); unlike a behaviour-keeping refactor, this change **changes observable behaviour by Product owner's decision**. Today the Consensus tab's "Notes by attribute" sections and the Main tastes and Defects cards flatten the API's resolved tree into a `ref → count` map and lay it over the full taxonomy's descriptor rows, where a level-0 note with children is only a row title and level 2 never shows; the `n/total` legend sits in a separate `md:w-56` column, whose counters overflowed their cards at 1280px (add-offering-catalog D13, D18). Product owner settled that each axis renders only its consensus nodes as the API's resolved tree, nested like R49's card trees, with each note's `name n/total` inline next to its badge; the design lead's recommendation (closed by the orchestrator) extends the inline count to Main tastes and Defects and keeps one tree rendering in the project.

## What Changes

- R49's tree rendering moves from the offering card into one shared taxonomy tree component (`src/shared/ui/TaxonomyTree.tsx`); the card renders it unchanged (design.md D1).
- The taxonomy entity's tree resolver gains a consensus variant that keeps each node's `count` and takes any list of consensus nodes; the card's resolver builds on it and keeps its output (design.md D2).
- Each axis section of "Notes by attribute" renders its axis' `sensoryTaxonomy` nodes as that tree; Main tastes and Defects render their `cataConcordance` group's nodes the same way; each note shows `name n/total` inline after its badge; the separate legend column goes (design.md D3, D4).
- `buildDescriptorRows`, the consensus legend and the count map lose their last callers and are removed (design.md D5).
- Spec: `offering-catalog` modifies "Consensus Defects and Main tastes", "Consensus detail by axis" (the "(level 2 not shown)" wording goes) and "Consensus panel kept as one view".

## Non-goals

- No API or contract change; no new token, contrast pair, text or dependency.
- No change to the CATA flavor wheel (R61), the score, attribute and status cards, the offering card's look or the evaluation views (R56).
- No re-attachment of notes under taxonomy parents: the tree renders as the API resolves it (R49 rules).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-catalog`: the consensus notes of Main tastes, Defects and every axis render as nested trees with each note's count inline; no separate legend column.

## Impact

- Code: `src/shared/ui/TaxonomyTree.tsx` (new), `src/shared/ui/index.ts`, `src/entities/offering/ui/OfferingCard.tsx`, `src/entities/taxonomy/model/taste-note-tree.ts`, `src/entities/taxonomy/index.ts`, `src/widgets/offering-detail/ui/SelectionBlock.tsx`, `src/widgets/offering-detail/ui/AxisDetail.tsx`; removed: `src/widgets/offering-detail/ui/ConsensusLegend.tsx`, `src/widgets/offering-detail/lib/identified-counts.ts`, `src/entities/taxonomy/model/descriptor-rows.ts` and its test; `tsconfig.json` (design.md D6).
- Tests (validation suite): `src/widgets/offering-detail/ui/ConsensusPanel.test.tsx`, `src/entities/taxonomy/model/taste-note-tree.test.ts`.
- QA suite: copies asserting the legend column or importing the removed builder go stale (design.md D6); reported, never edited.
- APIs, dependencies: none.

## Propose status

- **Change-id:** nest-consensus-notes
- **Date:** 2026-10-08
- **`openspec validate nest-consensus-notes --strict`:** valid
- **Backlog entry resolved:** R62 — Consensus "Notes by attribute" as nested trees with inline counts (production AUT finding 30)
- **Resolved (Product owner; design lead's recommendation closed by the orchestrator):** each axis renders only its consensus nodes as the API's resolved tree, levels 0–2 (D3); the inline `name n/total` next to each badge, also in Main tastes and Defects, with no legend column (D4); one tree rendering shared with R49's card (D1, D2); contrast pairs unchanged (D4).
- **Resolved by the architect:** the shared tree component lives in `shared/ui` so the `offering` entity and the `offering-detail` widget both reach it (D1); the card resolver keeps its exact output (no `count`) so R49's tests keep their assertions (D2); the selection cards keep spanning both grid columns (D4); the QA copy of the removed builder's test is excluded from `tsconfig.json` because it cannot load once the module is gone (D6).
- **Open (Product owner):** whether `vitest.qa.config.mts` also excludes `qa/src/entities/taxonomy/model/descriptor-rows.test.ts` (D6). None blocks the build.
