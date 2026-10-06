# Corrections — add-specialist-evaluations

## Round 1

Source: Product owner's answers of 2026-10-06 (decisions log, "secciones plegables, rueda y facetas"), written down by the orchestrator under the overnight mandate. The shared mechanism is `add-collapsible-section` (content-structure "Collapsible section", `Collapsible` / `CollapsibleHeader` / `CollapsibleBody` from `@/shared/ui`), merged into `develop` at `9364ced`.

1. **Collapsible groups at every viewport.** Each CVA group of the evaluation form (descriptive and affective) and the 1–9 scale legend use the shared collapsible section, at every viewport, without changing the form's structure (order of groups, card layout, actions). This replaces the summary's toggle "below `md` only": from `md` the group header is also the collapse toggle. The header keeps the group name and the completeness indicator; the chevron is the shared component's.
2. **Initial state.** In an editable evaluation every section starts collapsed (as in the MVC form). In a closed evaluation (read-only) every section starts expanded. The legend follows the same rule.
3. **Header inside `CardAside`.** The header's total padding inside `CardAside` is 1rem (the option recorded as Open 2 of `add-collapsible-section`, approved by the orchestrator).
4. **Collapsed card.** While a group is collapsed, the card shows only its header row: the aside's separating border is not drawn under or beside a collapsed body (design lead's review of `add-collapsible-section`, captures `traditional-375-collapsed.png` and `dark-1280-collapsed.png`, where the border ran past the card's rounded corners).
5. **Validation.** When submitting reveals a missing value in a collapsed group, that group expands so the error and the focused field are visible.
