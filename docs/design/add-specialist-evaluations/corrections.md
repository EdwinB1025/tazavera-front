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

## Round 2

Source: Product owner's answer of 2026-10-07 to handoff Q10 (option b) and Product owner's decision of 2026-10-07 on evaluations of a deleted offering, written down by the orchestrator. Visual reference: the MVC form, `resources/views/livewire/evaluations/evaluation-form.blade.php:67-89`.

1. **1–9 legend.** The evaluation form gains an informative collapsible section, "Impresión de calidad afectiva" (en "Affective quality impression", ca "Impressió de qualitat afectiva"), placed right after Main tastes. It uses the shared `Collapsible` and follows the round 1 initial-state rule (collapsed in an editable evaluation, expanded in a closed one). It lists the nine values, each with its numbered bean icon, in the SCA order (not the MVC's, whose 3-column grid pairs labels with the wrong numbers):
   - es: 1 Extremadamente baja, 2 Muy baja, 3 Moderadamente baja, 4 Ligeramente baja, 5 Ni alta ni baja, 6 Ligeramente alta, 7 Moderadamente alta, 8 Muy alta, 9 Extremadamente alta.
   - en: Extremely low, Very low, Moderately low, Slightly low, Neither high nor low, Slightly high, Moderately high, Very high, Extremely high.
   - ca: Extremadament baixa, Molt baixa, Moderadament baixa, Lleugerament baixa, Ni alta ni baixa, Lleugerament alta, Moderadament alta, Molt alta, Extremadament alta.
   The en and ca texts are proposed; Product owner may change them.
2. **Evaluation of a deleted offering.** Product owner's decision of 2026-10-07 (decisions log, "API: borrar una oferta con evaluaciones"; confirmed the same day: assume it nullable): when an offering is deleted, the API keeps its specialist evaluations and returns them with `offeringId: null`. The front handles it:
   - the list row shows "Oferta inexistente" (en "Offering no longer exists", ca "Oferta inexistent") in place of the offering's data, and requests no offering for that row;
   - opening such an evaluation shows it read-only, with the same message in place of the offering's context: it cannot be edited or closed (the API's `update` and `close` need the offering); deleting it stays available;
   - the en and ca texts are proposed; Product owner may change them.
   - when there is no offering, "Oferta inexistente" replaces the offering header together with the roast level that comes from the offering's coffee; the extraction method stays.
   Contract: the `deleteAnOffering` / `deleteMultipleOfferings` descriptions (contract `290d22e`) communicate the case, but the response schema still types `offeringId` as a non-nullable string; the front narrows the type to `string | null` at one read point (no edit to `schema.ts`). No task waits for the contract.
