# Handoff — add-facet-controls

## Session 2026-10-06 (night) — verify
Summary: the apply was completed in the cloud and integrated (`21ff097`, 19/19 tasks). `/opsx:verify` ran in a cloud routine (`cse_018FL5MaoQZNe83y4zDh2Y1y`, report truncated in the log), then again with the OpenCode architect for the full report. Stopped because: fixes and coverage sent to the Build. MVC reachable: not needed.

### Agent feedback
- Checks: test:run 1217 passed, lint clean, tsc exit 0.
- C1 — `Combobox.tsx`: with three options shown, Down, Down, Enter chooses the third option instead of the second (spec filtering "Combobox", scenario "Keyboard choice"). The test at `Combobox.test.tsx:95` cannot see it, because it leaves only two options. The architect classifies it as an unplanned fix.
- W1 — requirement "Sort control" (`specs/filtering/spec.md:205-214`): design.md D14.10 leaves the composition (`Field` + `Select`) to each consumer, so no test shows "Choosing an order". The contrast half is registered. The architect classifies it as a correction.
- W2 — `FacetPanel.tsx:63` uses `onSubmitCapture`; design.md D4's sketch said `onSubmit`. Task 4.1's verification only passes with the capture handler. The architect classifies it as a correction.
- W3 — scenario "Disabled facet": not covered are the 50% opacity, the disabled paths of `FacetCascade` and `ScoreRangeFacet`, and "the other facets stay enabled". Unplanned coverage.
- W4 — scenario "Default variant": the popup classes are not asserted (`Combobox.tsx:51-52`, design.md D9). Unplanned coverage.
- S1 — the Enter-to-clear path of the combobox is not tested. S2 — `facet-row.ts` has no `"use client"`. S3 — `ComboboxOption` and `ComboboxSearch` are declared in `use-combobox-search.ts`. None needs action.

### Closed for review
#### C1 — W1, Sort control verification
- Point: the spec requires the sort control; D14.10 makes it a consumer composition, so this change has no code that shows it.
- Options: (a) a test that composes `Field` + `Select` labelled "Sort by" and checks that the choice is reported at once, as unplanned coverage; (b) move the requirement to the consumer changes (a correction).
- Choice: (a).
- Why: it changes no requirement and no decision, and it verifies the scenario with the existing components.
- Result: sent to the Build (F1).

### Artifact fixes
#### A1 — W2, design.md D4 submit handler
- Phase: verify. Conflict: D4's sketch (`onSubmit`) contradicted task 4.1's verification (a form listener already sees `defaultPrevented`); the code follows the task.
- Fix: D4 now says `onSubmitCapture`, and why. `openspec validate --strict` passes.
- Result: commit `docs(filtering): fix artifacts for add-facet-controls (verify W2)`.

### Fixes and coverage sent to the Build
#### F1 — C1 fix; W1, W3, W4, S1 coverage
- Type: one unplanned fix and unplanned coverage, sent to the OpenCode build with the workflow §4 template.
- Result: pending.
