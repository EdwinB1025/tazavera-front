# Handoff — name-card-actions-by-coffee

## Session 2026-10-11 — propose, apply, verify, archive (cloud, fast lane)
Summary: backlog entry R71 (Product owner, 2026-10-11, answer A to round R67+R68 Q3; fast lane by order) ran in one cloud session from `qa` `e57f35f4` (`trig_015dsvigfNVEtgEMLa8VSrvf`, session `cse_01JCbBxjycDH4sdCJ1UnyKmD`, branch `claude/name-card-actions-by-coffee`, 18:28–18:42 UTC). Prompt written by the design lead. Stopped because: completed. MVC reachable: no.

### Agent feedback
7 commits, propose `ee8dadac` to archive `a9e6a64f` (R71 removed from the backlog). Inventory card "Ver" and "Crear oferta" are named label + coffee (+ " — roastery" when present) with the extra words in an `sr-only` span; My offerings "Ver" is named "Ver" + coffee — location (the Select/Delete helper). The feature's index exports the identification helpers and `LABEL_SEPARATOR`; `OfferingViewButton`'s `label` accepts `ReactNode`; the pages compose the names; `RouteButton`, `Button` and the public cards are unchanged. Spec delta: offering-management 2 modified ("My offerings list", "Coffee inventory card"), one test per new scenario. Verify: no CRITICAL. No stale QA test. Checks in the cloud: validation 207 / 1175, QA 361 / 1958, tsc, lint 0 errors, build OK.

### Decisions taken
None.

### Artifact fixes
None.

### Fixes and coverage sent to the Build
None.

### Deferred to Product owner
#### Q1 — Lookup names changed in two existing validation tests
- Question: `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx` ("Card actions fit the card") and `src/pages/manage-inventory/ui/InventoryListClient.test.tsx` ("Card actions") now find the buttons by their new accessible name instead of "Ver" / "Crear oferta"; what they assert (order, variant, height, destination) is unchanged. The fast-lane rule keeps existing assertions; Product owner's option A of 2026-10-11 (only the label string may change in the tests of the modified scenarios) was given for R72 only. / Options: (A) the same permission for R71, and R71 is integrated into `qa`; (B) R71 goes back to the cloud for another approach. / Blocks: R71's integration, then R72, the QA cleanup and the round end.
- **Answer (Product owner, 2026-10-11): A.** Option A covers R71 too: in the tests of the scenarios a change modifies, only the label string used to find the control changes. R71 integrated into `qa` the same day.

### Final checks
Review by the orchestrator: test before implementation in each task pair, one test per new scenario, scope limited to the two pages, the feature's identification helper and index, `OfferingViewButton`, the spec and the change folder; skill files read in the run log. Re-run locally on `a9e6a64f`: validation 207 / 1175, QA 361 / 1958 (a first run showed 1 failure that did not repeat), `tsc` clean, lint 0 errors, build OK. **Not integrated** pending Q1.
