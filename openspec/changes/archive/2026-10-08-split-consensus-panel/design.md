# Design

Sources: backlog R33 (`docs/backlog.md`); technical review §3.1, row R33 (`docs/review/technical-review.md`); the AGENTS.md size limits; add-offering-catalog design D5, D12–D14 and D18–D19 (the panel's blocks, kept as they are). Fast lane: no design folder.

## Context

Current state on `qa`: `src/widgets/offering-detail/ui/ConsensusPanel.tsx` is 480 lines. It declares `ConsensusPanelTexts` (36 keys), `ConsensusPanelProps`, `ConsensusLegendEntry`, the class constants of every block, the `ATTRIBUTES` and `AXES` tables and the helper `identifiedCounts`, and `ConsensusPanel` (252 lines) renders, in order: the score card (verified offerings with a rating tier), the attributes card or the not-verified card, the status card, the Main tastes and Defects selection blocks (via the inner functions `selectionBlock` and `consensusLegend`), the CATA card and the detail by axis (via the inner function `axisSection`). `OfferingDetailContent.tsx` and both `ConsensusPanel.test.tsx` files import the type `ConsensusPanelTexts` from `./ConsensusPanel` (or `@/widgets/offering-detail/ui/ConsensusPanel`).

## Goals / Non-Goals

**Goals:** every component of the panel at most 80 lines and every file at most 300 lines; each block in its own sibling file with the texts type of the keys it reads; identical DOM, classes, texts and accessible names.

**Non-Goals:** no change to `OfferingDetailContent`, the widget's public index, `lib/concordance.ts`, any shared or entity component, any message key or any test.

## API

None. The panel consumes no endpoint; it renders the `OfferingDetail` and `TaxonomyNode[]` it receives. The parts use the generated types through `@/shared/api` (`OfferingDetail`, `TaxonomyNode`, `OfferingTaxonomyNode`) and `ChipRow` from `@/shared/ui`; no new API type.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/widgets/offering-detail/ui/ConsensusPanel.tsx` | widgets (ui) | Modified | `ConsensusPanelTexts`, `ConsensusPanelProps`, `ConsensusPanel` composing the parts (D3–D4) |
| `src/widgets/offering-detail/ui/ScoreCard.tsx` | widgets (ui) | New | The score card (D2) |
| `src/widgets/offering-detail/ui/AttributesCard.tsx` | widgets (ui) | New | The SCA attributes card with `ATTRIBUTES` (D2) |
| `src/widgets/offering-detail/ui/StatusCard.tsx` | widgets (ui) | New | The counts and concordances card (D2) |
| `src/widgets/offering-detail/ui/ConsensusLegend.tsx` | widgets (ui) | New | The consensus legend of a selection (D2) |
| `src/widgets/offering-detail/ui/SelectionBlock.tsx` | widgets (ui) | New | A Main tastes or Defects card with its legend (D2) |
| `src/widgets/offering-detail/ui/CataCard.tsx` | widgets (ui) | New | The CATA wheel card (D2) |
| `src/widgets/offering-detail/ui/AxisDetail.tsx` | widgets (ui) | New | The detail by axis with `AXES` and its axis sections (D2) |
| `src/widgets/offering-detail/lib/identified-counts.ts` | widgets (lib) | New | `identifiedCounts`, moved unchanged (D2) |

`src/widgets/offering-detail/index.ts`, `OfferingDetailContent.tsx`, `lib/concordance.ts` and every test file do not change. No route file changes.

## Decisions

### D1 — Placement and imports

Every part is a sibling file of `ConsensusPanel.tsx` in the `ui` segment, and the helper goes to the `lib` segment beside `concordance.ts`. Siblings import each other by relative path (`./ScoreCard`, `../lib/identified-counts`), never through the widget's index, which keeps exporting only what other slices import (no part is added to it). The parts render markup only (no state, effect or handler of their own) and need no `"use client"`, as `ConsensusPanel.tsx` today.

### D2 — Parts and props

Each part moves its block's markup, class constants and tables out of `ConsensusPanel.tsx` unchanged; a class constant two parts use (`CONTENT_CLASSES`, `flex flex-col gap-4`) is declared in each part that uses it. Types are declared before the component in each file.

```ts
// ScoreCard.tsx — renders nothing unless the offering is verified and has a rating tier
export type ScoreCardTexts = {
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
};
export type ScoreCardProps = { offering: OfferingDetail; texts: ScoreCardTexts };

// AttributesCard.tsx — the verified offering's attribute scales
export type AttributesCardTexts = {
  detailAttributesHeading: string;
  attrFragrance: string;
  attrAroma: string;
  attrFlavor: string;
  attrAftertaste: string;
  attrAcidity: string;
  attrSweetness: string;
  attrMouthfeel: string;
  attrOverall: string;
  beanValue: string;
  beanValueLabel: string;
};
export type AttributesCardProps = {
  offering: OfferingDetail;
  locale: string;
  texts: AttributesCardTexts;
};

// StatusCard.tsx — counts and concordances with their band words
export type StatusCardTexts = {
  detailStatusHeading: string;
  fieldEvaluationCount: string;
  fieldDefectiveCount: string;
  fieldConcordanceAffective: string;
  fieldConcordanceDescriptive: string;
  concordanceLow: string;
  concordanceModerate: string;
  concordanceHigh: string;
  concordanceExcellent: string;
};
export type StatusCardProps = { offering: OfferingDetail; texts: StatusCardTexts };

// ConsensusLegend.tsx — one meta line per shown identified note; nothing when none
export type ConsensusLegendProps = {
  rows: ChipRow[];
  counts: Map<string, number>;
  /** The offering's evaluation count (0 when absent). */
  total: number;
};

// SelectionBlock.tsx — Main tastes or Defects from `cataConcordance`
export type SelectionBlockTexts = { detailTasteEmpty: string };
export type SelectionBlockProps = {
  offering: OfferingDetail;
  taxonomies: TaxonomyNode[];
  locale: string;
  /** The taxonomy category: "main_tastes" or "defects". */
  category: string;
  heading: string;
  texts: SelectionBlockTexts;
};

// CataCard.tsx — the CATA wheel or the empty text
export type CataCardTexts = {
  detailCataHeading: string;
  detailTasteEmpty: string;
  wheelLabel: string;
  wheelHint: string;
  wheelCount: string;
  wheelNotesToggle: string;
  wheelGroupsLabel: string;
  wheelGroupAromatics: string;
  attrMouthfeel: string;
};
export type CataCardProps = {
  offering: OfferingDetail;
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: CataCardTexts;
};

// AxisDetail.tsx — the heading and the five axis sections from `sensoryTaxonomy`
export type AxisDetailTexts = {
  detailAxesHeading: string;
  detailTasteEmpty: string;
  attrFragrance: string;
  attrAroma: string;
  attrFlavor: string;
  attrAftertaste: string;
  attrMouthfeel: string;
};
export type AxisDetailProps = {
  offering: OfferingDetail;
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: AxisDetailTexts;
};

// lib/identified-counts.ts — moved unchanged
export function identifiedCounts(
  nodes: OfferingTaxonomyNode[],
  type: string,
): Map<string, number>;
```

`AxisDetail.tsx` keeps one section per axis as a component local to the file (not exported), keyed by the axis as today. `ConsensusLegendEntry` moves to `ConsensusLegend.tsx`; no other file imports it.

### D3 — Texts grouped by part

`ConsensusPanelTexts` stays exported from `ConsensusPanel.tsx`, so its importers do not change, and becomes:

```ts
export type ConsensusPanelTexts = ScoreCardTexts &
  AttributesCardTexts &
  StatusCardTexts &
  SelectionBlockTexts &
  CataCardTexts &
  AxisDetailTexts & {
    detailMainTastesHeading: string;
    detailDefectsHeading: string;
    /** The not-verified message shown instead of the SCA card (D20). */
    detailNotVerifiedMessage: string;
  };
```

Its key set is exactly today's 36 keys. The doc comments of the keys move with them. The panel passes its whole `texts` to each part.

### D4 — The panel

`ConsensusPanel` keeps `ConsensusPanelProps` and composes, inside the same panel and grid wrappers: `ScoreCard`; `AttributesCard` when the offering is verified, else the not-verified card (kept inline in the panel, as one component per variant); `StatusCard`; `SelectionBlock` for `main_tastes` with `detailMainTastesHeading` and for `defects` with `detailDefectsHeading`; `CataCard`; `AxisDetail`.

## Risks / Trade-offs

- [Markup changes by accident] → each task runs the panel's protecting tests in both suites, which assert the headings, scales, rows, legends, wheel and axis sections with their classes; verify reads the diff of each part against the removed block.
- [Inner functions become components] → the DOM is the same; React adds a component boundary only, with no state, so nothing observable changes.

## Migration Plan

One branch, no data migration. Rollback is reverting the change's commits.
