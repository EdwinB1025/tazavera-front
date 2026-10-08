# Design

Sources: backlog R62 with Product owner's answers of 2026-10-08 ((a) inline legend per note, no legend column; (b) each axis as the API's resolved tree of its consensus nodes) and the design lead's recommendations closed by the orchestrator (inline count also in Main tastes and Defects; one tree rendering with R49). Archived designs reused: R49 `nest-card-taste-notes` (D1 resolver rules, D2 layout, D3 markup) and R56 `cascade-evaluation-descriptors` (D4: `buildDescriptorRows` kept only for this panel until this change). Fast lane: no design folder.

## Context

On `develop`, `SelectionBlock.tsx` (Main tastes, Defects) and `AxisDetail.tsx` (five axis sections) build `buildDescriptorRows` over the whole category, flatten the offering's tree with `identifiedCounts` (`lib/identified-counts.ts`) into a `ref → count` map, render `DescriptorChipGroup readOnly` with that map's keys, and list `name n/total` in `ConsensusLegend.tsx`, a `md:w-56` column beside the card or the selection. R49's nested-list tree lives inside `src/entities/offering/ui/OfferingCard.tsx` (`TasteNoteTrees`), fed by `buildTasteNoteTree` (`src/entities/taxonomy/model/taste-note-tree.ts`), which reads `cataConcordance` only and drops `count`.

## Goals / Non-Goals

**Goals:** one tree rendering in the project (card and consensus); the consensus notes of Main tastes, Defects and each axis as the API's resolved tree with each note's share inline; no legend column.

**Non-Goals:** the CATA wheel (R61), other consensus cards, the card's look, the evaluation views; no token, contrast pair, text or dependency.

## API

No endpoint is added or changed.

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/offerings/{ulid}` (existing detail read) | none | — | `OfferingDetail.cataConcordance` and `sensoryTaxonomy`: `OfferingTaxonomyNode[]` (`ref`, `type`, `level`, `count`, `children`), levels 0–2; `evaluationCount` | unchanged (the detail's error state) |
| GET | `/taxonomies` (existing) | none | — | `TaxonomiesPayload` flattened by `buildTaxonomyLookup` | unchanged (the detail's error state) |

Types: `OfferingDetail`, `OfferingTaxonomyNode`, `TaxonomyNode` from `@/shared/api`; UI types below.

## Decisions

### D1. One tree component in `shared/ui`

`src/shared/ui/TaxonomyTree.tsx` takes R49's `TasteNoteTrees` with its classes and markup unchanged (R49 D2, D3: nested `ul role="list"`/`li`, level-1 column behind the `border-border-subtle` connector, level-2 wrapping row, one badge size, keys by `ref`):

```ts
export type TaxonomyTreeNode = {
  ref: string;
  label: string;
  color: string;
  level: 0 | 1 | 2;
  count?: number;
  children: TaxonomyTreeNode[];
};
export type TaxonomyTreeProps = { notes: TaxonomyTreeNode[]; total?: number };
```

It lives in `shared/ui` because both the `offering` entity (card) and the `offering-detail` widget render it and an entity cannot import another entity's UI. `OfferingCard` renders `<TaxonomyTree notes={taxonomies} />`; `ResolvedTaxonomyBadge` stays the card's prop type, an alias of `TaxonomyTreeNode`. With no `total`, the markup is exactly R49's, so the card does not change. It renders only markup (no state, handler or effect): no Next.js API is involved.

### D2. Consensus resolver

`src/entities/taxonomy/model/taste-note-tree.ts` gains `buildConsensusNoteTree(nodes: OfferingTaxonomyNode[], lookup: TaxonomyLookup): ConsensusNoteNode[]`, R49's rules on any node list (tree order kept, each reference once with the children of every occurrence, an unresolved reference replaced by its resolved children), each node keeping its own `count` (`count ?? 0`; for a repeated reference, the first occurrence's). `ConsensusNoteNode` is `TasteNoteNode` plus `count: number`. `buildTasteNoteTree(offering, lookup)` becomes that resolver over `offering.cataConcordance` with the counts dropped, so its output and R49's tests are unchanged. Exported from the slice index.

### D3. Which nodes each block renders

- Main tastes and Defects (`SelectionBlock`): `buildConsensusNoteTree` over the `cataConcordance` nodes whose `type` is the block's category (`main_tastes`, `defects`).
- Each axis section (`AxisDetail`): over the `sensoryTaxonomy` nodes whose `type` is the axis (`fragrance`, `aroma`, `flavor`, `aftertaste`, `mouthfeel`).

Only the top-level nodes are filtered by `type`; their descendants come as the API nests them. The lookup is `buildTaxonomyLookup(taxonomies, locale)`, as `CataCard` builds it.

### D4. Inline share and layout

With `total`, each tree item puts its badge and its share together in `flex flex-wrap items-center gap-2`: the badge, then `<span className="type-meta">{label} {count}/{total}</span>` (the text the legend column used). No legend column: `ConsensusLegend` and its `md:w-56` go. A selection card is the block itself: `Card layout="stacked"` with `lg:col-span-2` (it keeps spanning both grid columns), its content the heading, then the tree or the empty text. An axis body is the tree or the empty text. The empty text renders as `<p className="type-body">`, as the chip group rendered it; with no identified note no tree and no share render. Contrast: `type-meta` on the card surface and on the section card surface are pairs the panel already uses (the legend column in the axis bodies, the score card), and the badges are unchanged: no pair is added.

### D5. Removals

`src/widgets/offering-detail/ui/ConsensusLegend.tsx`, `src/widgets/offering-detail/lib/identified-counts.ts` and, with no caller left, `src/entities/taxonomy/model/descriptor-rows.ts` with its export and its validation test `descriptor-rows.test.ts` (R56 replaced the scenario it covered, "A block's options", by `descriptor-tree.test.ts`). `TasteNoteTrees` and its class constants leave `OfferingCard.tsx`.

### D6. Tests and stale QA copies

Validation: `ConsensusPanel.test.tsx` updates the Main tastes / Defects and the detail-by-axis tests to the modified scenarios; `OfferingCard.test.tsx` and `taste-note-tree.test.ts` are unchanged (protecting). QA: `qa/src/entities/taxonomy/model/descriptor-rows.test.ts` imports the removed module, so it can no longer load nor typecheck; it is added to the `tsconfig.json` `exclude` list (as the stale copies of R42 are) and reported; whether `vitest.qa.config.mts` also excludes it stays Product owner's decision. Any other QA test that fails is reported, never edited.

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/TaxonomyTree.tsx` | shared | New (D1, D4) |
| `src/shared/ui/index.ts` | shared | Exports `TaxonomyTree`, its types |
| `src/entities/offering/ui/OfferingCard.tsx` | entities | Renders `TaxonomyTree` (D1) |
| `src/entities/taxonomy/model/taste-note-tree.ts` | entities | D2 |
| `src/entities/taxonomy/index.ts` | entities | Exports `buildConsensusNoteTree`, `ConsensusNoteNode`; drops `buildDescriptorRows` |
| `src/widgets/offering-detail/ui/SelectionBlock.tsx` | widgets | D3, D4 |
| `src/widgets/offering-detail/ui/AxisDetail.tsx` | widgets | D3, D4 |
| `src/widgets/offering-detail/ui/ConsensusLegend.tsx`, `lib/identified-counts.ts` | widgets | Deleted (D5) |
| `src/entities/taxonomy/model/descriptor-rows.ts`, `descriptor-rows.test.ts` | entities | Deleted (D5) |
| `tsconfig.json` | — | One QA exclusion (D6) |

No route file changes.

## Risks / Trade-offs

- Backlog R50: detached intermediate notes from the API render where the tree places them (R49 risk, unchanged).
- A note's name shows twice, in its badge and in its share, as Product owner's `name n/total` legend states; the badge stays the visual note, the share its text.
