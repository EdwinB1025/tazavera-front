# Corrections — add-specialist-evaluations

## Round 1

Source: Product owner's answers of 2026-10-06 (decisions log, "secciones plegables, rueda y facetas"), written down by the orchestrator under the overnight mandate. The shared mechanism is `add-collapsible-section` (content-structure "Collapsible section", `Collapsible` / `CollapsibleHeader` / `CollapsibleBody` from `@/shared/ui`), merged into `develop` at `9364ced`.

1. **Collapsible groups at every viewport.** Each CVA group of the evaluation form (descriptive and affective) and the 1–9 scale legend use the shared collapsible section, at every viewport, without changing the form's structure (order of groups, card layout, actions). This replaces the summary's toggle "below `md` only": from `md` the group header is also the collapse toggle. The header keeps the group name and the completeness indicator; the chevron is the shared component's.
2. **Initial state.** In an editable evaluation every section starts collapsed (as in the MVC form). In a closed evaluation (read-only) every section starts expanded. The legend follows the same rule.
3. **Header inside `CardAside`.** The header's total padding inside `CardAside` is 1rem (the option recorded as Open 2 of `add-collapsible-section`, approved by the orchestrator).
4. **Collapsed card.** While a group is collapsed, the card shows only its header row: the aside's separating border is not drawn under or beside a collapsed body (design lead's review of `add-collapsible-section`, captures `traditional-375-collapsed.png` and `dark-1280-collapsed.png`, where the border ran past the card's rounded corners).
5. **Validation.** When submitting reveals a missing value in a collapsed group, that group expands so the error and the focused field are visible.

### Status

2026-10-06. `openspec validate add-specialist-evaluations --strict`: valid ("Change 'add-specialist-evaluations' is valid").

1. Groups: spec.md "Evaluation form" (collapsible groups at every viewport, scenarios "Groups of an editable form" and "Groups of a closed evaluation"); design.md D15 (new), D14 and the Files row of `EvaluationGroupCard.tsx`; tasks 11.1–11.2 and 11.5. **The 1–9 scale legend is not processed:** this change's form has no 1–9 legend and no artifact defines one (title, nine labels and their texts, position), and adding it would change the form's structure, which this correction keeps unchanged. Recorded in design.md Open Questions, pending Product owner; no task.
2. spec.md "Evaluation form" (initial states) and "Closing a complete evaluation" (every group expanded in the read-only view after a close); design.md D15; tasks 11.1–11.4.
3. design.md D15 (1rem header spacing, `CardAside` padding 0.5rem); tasks 11.1–11.2 and 11.5.
4. spec.md "Evaluation form" (collapsed card shows only its header row, no border under it); design.md D15; tasks 11.1–11.2 and 11.5.
5. spec.md "Closing an incomplete evaluation" (incomplete groups highlighted and expanded); design.md D15 (a `409` on close is the only submit that reveals missing values inside groups; the roast level is in the non-collapsible context card); tasks 11.3–11.4.
