# Corrections — add-offering-catalog

## Round 1

Source: Product owner's answers of 2026-10-07 to handoff Q1–Q5 (the entries marked "ANSWERED … (final)" and "ADDITION" for Q1 prevail over the earlier Q1 entries), written down by the orchestrator. Product owner does the visual check once the round is built.

1. **Consensus tab reads only `cataConcordance`.** The "Perfil sensorial" wheel is removed: the tab shows one wheel, the CATA wheel, fed the `aromatics` group of `cataConcordance`. The Main tastes and Defects cards read the `main_tastes` / `defects` nodes of `cataConcordance` instead of `sensoryTaxonomy`. The question of a count rule across axes is void: `cataConcordance` already counts distinct evaluations per note.
2. **`mouthfeel` as its own group in the CATA wheel.** `mouthfeel` stays in the wheel (no chip card, no API change) and is set apart as a reference group: a wider, more marked separation from the aromatic group than the gap between ordinary segments; a general legend naming the groups; an inner legend inside the wheel telling aromatics from mouthfeel. The form of the two legends and of the separation follows the design lead's mock-up.
3. **Per-axis detail from `sensoryTaxonomy`.** The Consensus tab also shows one expandable section per axis of `sensoryTaxonomy` other than `main_tastes` / `defects`: fragrance, aroma, flavor, aftertaste, mouthfeel; collapsed by default. Each section uses the shared `Collapsible` (content-structure) and renders its identified notes as `DescriptorChipGroup readOnly` over the rows of the shared descriptor-row builder (a level-0 node heading a row of its level-1 children; childless level-0 nodes in one shared row; level 2 not shown), with the `n/total` consensus legend per note, as D13's selection blocks do. The axis names and the section heading come from the message catalog (es/en/ca). Dependency: `Collapsible` must be in the branch (merge develop first).
4. **One centered column.** The catalog list drops the multi-column grid (several columns were meant only for the landing page): the offering cards render in a single column, centered in the results region, at every viewport. The column has no fixed width: its width is what the left and right margins leave, where the page background shows on both sides. The side margins and the page background are those of `refine-page-surfaces` (its body-container spacing, summary drafted on 2026-10-07; handoff Q2 "UPDATE 2026-10-07"); this round only drops the grid and centers the single column, and places the results region in a `PageSection surface="page"`, so that the side margins show the page background (cream on today's `develop`; the new background once `refine-page-surfaces` merges, with no further catalog edit).
5. **Unverified offering.** In the Consensus tab, an offering that is not verified does not show the SCA card; the tab shows instead a message telling the user that the offering is not verified yet (message catalog, es/en/ca). A provisional offering returns no averages, concordances or consensus nodes, so the message is in practice the whole content of the tab.
6. **Status card at `lg`.** The status card is paired with another one-column card instead of leaving half a row empty.
7. **Equal selection cards.** The two selection cards measure the same width: the consensus legend column has a fixed width from `md`, the same in both blocks.
8. **Wording (F7).** design.md D15 names `text-label` where `text-secondary` renders; the design text is aligned with the registered pair.

### Status
- Date: 2026-10-07 (architect agent, scheduled cloud session).
- `openspec validate add-offering-catalog --strict`: valid (`Change 'add-offering-catalog' is valid`).
1. spec.md "Consensus taste trees" (one wheel from `cataConcordance`), "Consensus Defects and Main tastes" (read from the CATA concordance); design.md D12, D13, D14, D16 → tasks 11.5, 11.6.
2. spec.md new "Mouthfeel group in the CATA wheel"; design.md D19 (values chosen without a mock-up: 6° gap at each group boundary; inner legend arc at radius 74, 2 units, and group name at radius 62, font size 11, `text-secondary`; general legend first in the wheel's side column), D16 → tasks 11.3, 11.4 (wheel and helper), 11.5, 11.6 (panel).
3. spec.md new "Consensus detail by axis"; design.md D12, D16, D18 → tasks 11.7, 11.8.
4. spec.md "Catalog grid by available width" replaced by "Catalog single column", "Offering catalog page" Loading wording; design.md D10, Context (side margins and background left to `refine-page-surfaces`) → tasks 11.1, 11.2.
5. spec.md "Consensus SCA attribute averages" (new scenario "Offering not verified"), "Consensus score" Provisional scenario wording; design.md D20, D16 → tasks 11.5, 11.6.
6. design.md D12 (the SCA or not-verified card is one column from `lg`, paired with the status card; the CATA wheel spans both columns) → tasks 11.5, 11.6.
7. design.md D13 (fixed 14rem legend column from `md`, a value chosen here; also used by D18) → tasks 11.5, 11.6.
8. design.md D15 (row aligned to `text-secondary` / `surface-section`, 5.39 / 7.18); wording only, no task.
- Browser check of the round: task 11.9.

## Round 2

Source: Product owner's decision of 2026-10-07 (decisions log, "superficies de página: respuestas a Open 1–3": each running change gets a small adoption round before its archive), written down by the orchestrator. The shared pattern is `refine-page-surfaces`, merged into `develop` at `2bc80ae` (content-structure "Section card" and "Page sections"; `Card variant="section"`; `surface-page` = `sage-100` in the traditional theme). Reference: `docs/design/refine-page-surfaces/design-summary.md` §5.2, §5.3, §5.5 and the §9.2 row of this change.

1. **Per-axis sections are section cards.** The five per-axis sections of the Consensus tab (round 1 point 3) become `Card variant="section"` with the collapsible header in the band, in the sections group's 1rem gap.
2. **Detail on the backdrop.** On the offering detail, the header block and the tab bar sit on the page backdrop (not in a `surface="section"` band); the tab panels' cards hang from it. Every gated pair of the tab bar that moves onto `surface-page` is registered in the theme contrast matrix and passes.
3. **List margins.** The single column of the catalog list fills its container on the backdrop, with the side margins of the refine-page-surfaces §5.5 table (round 1 point 4 already placed the results in `PageSection surface="page"`).
