Status: approved — by the orchestrator in Product owner's absence (overnight mandate, 2026-10-06): Open 1 included — the combobox stops searching for a label it fills in itself. Product owner may reopen it.

# Design summary — refine-facet-controls

Change-id: `refine-facet-controls` · capability `filtering` (with a `form-fields` delta, as `add-facet-controls` had) · the follow-up of the archived `add-facet-controls` (merged in `develop`, `e85c529`). Drafted by the design lead on 2026-10-06 (generation mode). Values marked *(computed)* are the design lead's own; *unverified* marks what was not checked.

## 1. Scope

Two answers recorded in the decisions log, "2026-10-06 — secciones plegables, rueda y facetas (respuestas de Product owner)". They come from the `add-facet-controls` visual review, handoff F3/Q1 and F4/Q2:
- **Q1 / F3.** The help text and the error message under the row facets get 0.75rem of side padding, aligned with the legend (decided by the orchestrator under Product owner's delegation).
- **Q2 / F4.** Typed text that is abandoned in the `Combobox` (Escape, or leaving the input without choosing) is replaced. With a value chosen, the input shows that value's label again; with no value chosen, the input clears.

This change must land before the apply of `add-offering-facets` (decisions log). Nothing else changes: no token, no colour, no dependency, no contract operation.

## 2. Contract operations consumed

None. The `Combobox` consumers pass their own search: `add-offering-facets` uses `listRoasteries` with `?name=`, and `add-offering-management` uses `listCoffeeInventory` with `?coffeeName=`. Neither search changes.

## 3. Files

| Path | Capability | Change |
|---|---|---|
| `src/shared/ui/facet-row.ts` | filtering | one shared class constant for facet help and error messages (§4.1), beside `FACET_LEGEND_CLASSES` |
| `src/shared/ui/RadioGroup.tsx` (+ test) | form-fields | in the facet-row presentation only, the help and error paragraphs take that constant |
| `src/shared/ui/Checkbox.tsx` (+ test) | form-fields | same as `RadioGroup` |
| `src/shared/ui/FacetCascade.tsx` (+ test) | filtering | its help paragraph takes that constant |
| `src/shared/ui/Combobox.tsx` (+ test) | filtering | the abandoned-text rule (§4.2) |

One commit per capability (`AGENTS.md`): the `form-fields` files go in their own commits.

## 4. Behaviour and spacing

### 4.1 Help and error under row facets (Q1 / F3)

Today, as rendered in `docs/design/add-facet-controls/captures/375-panel.png`:
- the help line under "Variedad" and "Defectos" ("Opciones no disponibles") starts at the sidebar's content edge;
- the legend starts 0.75rem further in (`FACET_LEGEND_CLASSES` = `type-label mb-1 px-3 py-1`, `facet-row.ts:36`).

The cause is that `RadioGroup.tsx:208-217`, `Checkbox.tsx:150-159` and `FacetCascade.tsx:163` render `type-meta mt-1` / `type-error mt-1` with no side padding.

End state:

| Element | Value | Source |
|---|---|---|
| Help paragraph under a row facet (radio-list, cascade, row checkbox) | `type-meta`; 0.25rem above (unchanged); 0.75rem padding on the left and the right; no border, no background | decisions log Q1; the legend's `px-3` |
| Error paragraph under a row facet | `type-error`; 0.25rem above (unchanged); 0.75rem padding on the left and the right | same |
| The same paragraphs in the field presentation (forms) | unchanged: no side padding | form-fields "Facet row presentation": "The existing presentation SHALL keep rendering unchanged when the facet-row presentation is not requested" |
| Text facet and score range | unchanged. `FacetTextField` already wraps its `Field` in `px-3` (`FacetTextField.tsx:53`); `ScoreRangeFacet` has no help | code on `develop` |
| `Combobox` inside a facet panel | unchanged. The consumer wraps it in 0.75rem side padding (`add-facet-controls` handoff F5); `add-offering-facets` must do so | handoff F5 |

**Reuse (criterion C).** One constant in `facet-row.ts` (for example `FACET_MESSAGE_CLASSES`, side padding only; the build names it) serves the three components, rather than three copies of the same padding. `facet-row.ts` is already the home of the facet-row class sets that `RadioGroup`, `Checkbox` and `FacetCascade` share (add-facet-controls design.md D3).

Contrast is unchanged: only padding moves. The help sits on `nav-surface-dark` under `variant-inverse`, as before, so nothing new is gated (criterion D).

### 4.2 Abandoned typed text in the Combobox (Q2 / F4)

Today (`Combobox.tsx`):
- `term` follows `value` only when `value` changes (`:109-113`);
- on blur, the popup closes and `clearIfEmpty()` runs (`:185-188`);
- Escape only closes the popup (Radix Popover);
- so after typing "fin" over a chosen "Finca A" and pressing Escape or leaving, the input keeps "fin" while the value is still "Finca A".

End state. A choice is "abandoned" when the user leaves the input or presses Escape after typing, without choosing an option:

| Case | Input after it | Reported |
|---|---|---|
| A value is chosen; the user types other text and presses **Escape** | the chosen value's label; popup closed | nothing |
| A value is chosen; the user types other text and **leaves** the input | the chosen value's label; popup closed | nothing |
| No value is chosen; the user types and presses Escape or leaves | empty; popup closed | nothing |
| A value is chosen; the user **empties** the input and leaves it, or presses Enter | empty | the removal of the value (unchanged; spec scenario "Clearing the value") |
| A value is chosen; the user empties the input and presses **Escape** | the chosen value's label | nothing (Escape cancels the edit) |
| The user chooses an option | its label; popup closed | the option (unchanged) |

Notes:
- Escape works whether or not the popup is open. In search mode, the popup stays closed under 2 characters, and Escape still restores the label.
- Restoring the label never opens the popup. Focus stays where the user put it: in the input after Escape, and on the next element after leaving.
- **Last row, Escape on an emptied input (settled under criterion B).** The filtering spec reports a removal only for "emptying the input and pressing Enter or leaving it". Escape is not one of those paths, so Escape keeps the value and cancels the edit.
- Clicking an option does not count as leaving, because focus stays in the input (`onMouseDown` prevents the blur, `Combobox.tsx:208`). It is a choice.

### 4.3 Responsive

Nothing is breakpoint-specific. At 375px the sidebar becomes a full-screen sheet with the same sidebar styles (decisions log, "filtros"), and the 0.75rem padding applies there as well.

### 4.4 Visual reference

- Before: `docs/design/add-facet-controls/captures/375-panel.png` and `1280-panel.png` (on `develop`), where the help sits at the edge.
- After, ASCII:

```
  Variedad                      ← legend, 0.75rem in
 ┃ ◉ Cualquiera                 ← row (4px indicator + 0.75rem)
  Opciones no disponibles       ← help, now 0.75rem in, aligned with the legend
```

## 5. Texts

No new text and no catalog change.

## 6. Tests: what changes

- **`Combobox.test.tsx`:**
  - "Escape closes the popup" (`:129-135`) keeps its assertions and gains: with no value, the input is empty after Escape.
  - New cases, each failing on today's code and passing on the end state:
    1. With `value` "Finca A", type "zz" and press Escape: the input shows "Finca A" and `onChange` is not called.
    2. The same, but blur instead of Escape.
    3. With no value, type "fin" and blur: the input is empty and `onChange` is not called.
    4. With `value` "Finca A", empty the input and press Escape: the input shows "Finca A" and `onChange` is not called.
  - "emptying the input and blurring with a value reports null" (`:160-167`) is unchanged and must keep passing.
- **`RadioGroup.test.tsx`, `Checkbox.test.tsx`, `FacetCascade.test.tsx`:**
  - in the row presentation, the help and error paragraphs carry the shared constant;
  - in the field presentation, they keep exactly `type-meta mt-1` / `type-error mt-1`. This fails if the padding leaks into forms.
  - No existing test asserts these paragraphs' classes today (searched: no `type-meta mt-1` in `src/shared/ui/*.test.tsx`), so none needs updating.
- `facet-disabled.test.tsx` keeps passing: the help is still shown on a disabled facet.

## 7. Dependencies and interactions

- **Builds on:** `add-facet-controls` (merged): `filtering` and the `form-fields` facet-row presentation.
- **Must land before:** the apply of `add-offering-facets`, which renders `FacetRadioList` and `FacetCascade` with help on disabled facets, and the Roastery `Combobox`.
- **`add-evaluation-facets`:** uses the same facets. It gets the fix when it merges `develop` before its apply.
- **`add-offering-management` (apply running in the cloud, `claude/add-offering-management-apply`):**
  - It uses the shared `Combobox` in `InventoryField` (its design.md D9). It does not edit `Combobox.tsx`; it only has it from `develop`.
  - Its tasks mock the combobox in `InventoryField.test.tsx` (task 6.1), and its asserted behaviour matches this end state: "choosing a row … shows the coffee name in the input"; "clearing the input clears the choice". So no management test should change.
  - What changes for its users: an abandoned search in the inventory field now restores the chosen coffee name, or clears when nothing is chosen.
  - Whichever of the two merges second takes `develop` before integrating. A text conflict is unlikely, because neither change touches the other's files (*unverified*: `git merge-tree` was not run, since this change has no branch).
- **Backlog:**
  - R9 (single "Clear all") does not touch these files;
  - R8 (422 per field) is unrelated.
- **Decisions log:** "secciones plegables, rueda y facetas"; "add-offering-management: puntos del explore" (the combobox takes the `Input` `variant`; unchanged).

## 8. Findings on existing code

1. **A search runs for the chosen label.**
   - Evidence: after `choose()` sets the term to the option's label (`Combobox.tsx:150-154`), `useComboboxSearch` sees a term of 2 or more characters (`use-combobox-search.ts:36-58`). In search mode it then runs one request 300 ms later, which nobody shows, because the popup is closed.
   - This change would add a second trigger: restoring the label.
   - It was read from the code and not run (*unverified* at runtime).
   - Workflow §4 path: a defect in merged code is a **new change**, unless Product owner folds it into this one (Open 1).

## Open

1. **Should this change also stop the search for a label the combobox puts in the input itself** (after a choice or a restore)?
   - Options:
     - (a) include it: the end state is "no search request runs for a term set by choosing or restoring; only typed text searches";
     - (b) leave it for a new change.
   - Recommendation: (a). It is the same code path this change already edits; it saves one public request per choice on the `listRoasteries` and `listCoffeeInventory` searches; and it would otherwise double with the restore. Source: §8.
   - Blocks propose: no. Without an answer, the architect proposes without it (b).

## Review log

### 2026-10-06 — design lead, generation
Settled under criterion B:
- **Q1 scope:** help and error, row presentation only. The forms keep their presentation, per the form-fields requirement text.
- **Q1 reuse:** one shared constant in `facet-row.ts` (criterion C).
- **Q2, Escape on an emptied input:** it keeps the value. The spec reports a removal only on Enter or leaving.
- **Q2, restoring opens no popup:** the decision restores the label and says nothing about reopening.

Recorded the interaction with `add-offering-management` (§7), and one finding on existing code (§8 → Open 1).
