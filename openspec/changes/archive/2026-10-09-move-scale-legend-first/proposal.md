Type: Refactor (fast lane)

# Proposal

## Why

The evaluation form shows the 1–9 legend "Affective quality impression" (`ScaleLegend`, catalog key `legendTitle`) right after the Flavor / Aftertaste group, which holds Main tastes (design.md D16 of the change that introduced it). Product owner's acceptance test finding (2026-10-09) decides that the legend is the first section of the form, so the scale is read before any score is given. This moves the section by Product owner's decision; it is typed as a fast-lane change as Product owner types AUT corrections.

## What Changes

- The form renders, in order: the header (`EvaluationFormHeader`), the legend (`ScaleLegend`), the context fields card (`ContextFieldsCard`), the eight groups (`EvaluationGroupList`) and the actions or the read-only status, in every mode (editable and read-only).
- The legend keeps its texts, its open state (`legendOpen` / `form.setLegendOpen`), its initial state, its look and its behaviour; as a top-level block of the form it is separated from its neighbours by the form's existing gap.
- The "Evaluation form" requirement of `evaluations` places the legend first; its scenario "The 1–9 legend" checks the position, and "Form sections" lists the legend among the form's top-level blocks.

## Out of scope (non-goals)

- The legend's content, texts, look and open/closed rules, the groups, the context fields and the actions: unchanged.
- No new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: MODIFIED "Evaluation form": the 1–9 legend is the form's first section, after the header and before the context fields; its scenario "The 1–9 legend" checks it.

## Impact

- **Code** (FSD layer `pages`, slice `evaluation-form`, segment `ui`): modified `src/pages/evaluation-form/ui/EvaluationForm.tsx` (renders the legend) and `src/pages/evaluation-form/ui/EvaluationGroupList.tsx` (no longer renders it).
- **Tests**: `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, test "sits after Flavor / Aftertaste and before Acidity, as no group and with no indicator", asserts instead that the legend precedes the context fields card and follows the header; its other assertions stay. No other test.
- **API, contract, texts, tokens, dependencies**: none.

## Propose status

- **Change-id:** `move-scale-legend-first`
- **Date:** 2026-10-09
- **Validation:** `openspec validate move-scale-legend-first --strict` → "Change 'move-scale-legend-first' is valid".
- **Resolved:** the legend is the first section of the form, after the header and before the context fields card, in editable and read-only forms; texts, open state, look and behaviour unchanged; spacing is the form's existing gap (Product owner, 2026-10-09). The "Form sections" scenario lists the legend among the 2rem-apart top-level blocks, which follows from that spacing decision.
- **Open:** nothing.
