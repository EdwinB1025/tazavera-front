# Handoff — add-offering-management

## Session 2026-10-06/07 — apply in the cloud (overnight mandate)
Summary: cloud build runs for the apply; tasks 1–5 integrated; a blocking point before task 6 closed by the orchestrator; tasks 6.0a–7.2 relaunched. Stopped because: tasks 8–10 wait for Product owner (sidebar entries). MVC reachable: not needed.

### Agent feedback
- Cloud build (routine trig_01C4sERVWrEYBk3rNSbbSvsu, branch `claude/add-offering-management-apply`): tasks 1–5 (types, catalog, own list and gate, card actions and selection, single and bulk delete with step-up), `396a9a4` … `0c39220`; then the session went idle before task 6. Integrated by fast-forward into `feature/add-offering-management` and pushed.
- Cloud build (routine trig_01W7L66WsdcyvuBoRreoK5RU): stopped before 6.1 with no commits. A probe render showed the shared `Combobox` inside `Field` prints the label twice ("Inventory item *" from Field and "Inventory item" from the combobox) and the Field's `<label for>` points at nothing (cmdk gives the input its own id); `required`, `aria-invalid` and the help/error ids do reach the input.
- Local architect: artifact update `025e0af` (design.md D14, spec scenario "One label names the inventory field", tasks 6.0a/6.0b); `openspec validate --strict` valid.
- Cloud build (routine trig_01Q5ukeKFvX5VYoonbY3McNK, branch `claude/add-offering-management-apply3`): tasks 6.0a–7.2, `12ce9bf` … `1c12458`, test before implementation in each pair; files limited to the tasks' paths plus the checkboxes. Integrated by fast-forward and pushed.

### Closed for review
#### C1 — Shared Combobox inside a Field
- Point: task 6.2 (shared combobox in `Field` with `required`) cannot be built as written without a duplicated, unlinked label.
- Options: (a) combobox alone with new `required`/`error`/invalid props; (b) inside a `Field` the combobox renders no label and no help and its input takes the Field's id; (c) accept the duplicate label.
- Choice: (b).
- Why: keeps task 6.2's wording and the summary's §6 single-label layout (fewest settled texts changed); nothing the user sees changes; no security, API, token or dependency. Outside a `Field` (facet panels) the combobox is unchanged.
- Result: `025e0af`; tasks 6.0a/6.0b. Risk: `refine-facet-controls` (built, not merged) also edits `Combobox.tsx`; whichever merges second takes develop first.

### Deferred to Product owner
#### Q1 — ANSWERED 2026-10-07: unify. Product owner delegated the choice; recorded choice: a correction round in this change replaces the two entries with one, "Administrar ofertas" (en "Manage offerings", ca "Gestionar ofertes", from the message catalog), addressing the list route and marked current on both the list and the create route; the create route stays reachable from the list's "New offering" link and empty-state link (spec lines 18 and 49). "Administrar ubicaciones" is added by add-coffeeshop-location beside it. Original entry below.
#### Q1 — Sidebar entries (tasks 8.1/8.2)
- Question: task 8 builds "Mis ofertas" / "Nueva oferta" in the sidebar; on 2026-10-06 you asked for "Administrar ofertas" and "Administrar ubicaciones" in the coffeeshop sidebar (the latter from add-coffeeshop-location). / Why deferred: changes a settled decision of this change (correction round). / Options: (a) a correction round here renaming the entries and adding the locations entry once add-coffeeshop-location exists; (b) keep this change as designed and let add-coffeeshop-location add its entry and rename. / Recommendation: (a) for the label, the locations entry in add-coffeeshop-location. / Blocks: tasks 8–10.

### Final checks
After integrating 6.0a–7.2 (orchestrator's run): test:run 85 files, 1466 tests passed.
