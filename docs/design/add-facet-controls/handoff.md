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
- Result: the local OpenCode run was killed when the machine ran out of memory, so the work moved to a cloud routine (`trig_01J9QLf9ADJmj4Y3EWpREDX1`, `claude/add-facet-controls-fixes`): `796208c` fix (combobox first ArrowDown), then `3cdfa99`, `a6fe762`, `6119238` and `1ee1093` coverage. Integrated by fast-forward: 66 files, 1226 tests.

## Session 2026-10-06 (night) — visual review (Product owner's browser check, delegated)
Summary: the design lead rendered every control in a harness that copies the sidebar look of develop, at 375 and 1280px and in both themes. 12 captures are in `captures/`. Stopped because: two unplanned fixes were sent to the Build.

### Agent feedback
- Pass:
  - the focus ring on 23 controls (ring 6.41 / 4.90 traditional, 12.27 / 10.50 dark);
  - the chip remove buttons are named;
  - no horizontal scroll;
  - every gated contrast: text 4.63 or more, boundaries 3.41 or more in traditional and 4.19 or more in dark;
  - the geometry of D3–D9;
  - row hover;
  - the combobox's match, check mark, `aria-expanded`, focus and popup placement.
- F1 (unplanned fix): the disabled radio and checkbox boxes are at 0.25 effective opacity, because the row's `opacity-50` and the box's `disabled:opacity-50` stack. Spec "Disabled facet" says 50%.
- F2 (unplanned fix): in dark the row shadows still render. Tailwind 4 inlines the shadow value into `.shadow-nav-current` and `.hover:shadow-nav-hover`, so `--shadow-nav-current: none` in the dark block never applies. Spec "Facet rows" and D10 say the shadows are none in dark.
- F3 (correction): help and error under the row facets start 8px from the edge, while the legend and rows start at 20px. Recommendation: 0.75rem side padding.
- F4 (correction): when typed text is abandoned (Escape, blur), the combobox input keeps the typed text and not the chosen label. Recommendation: restore the chosen label.
- F5 (note for consumers): `Combobox` brings no side padding; inside a facet panel the consumer wraps it with 0.75rem.
- Unverified: the real `Sidebar` and `Sheet`; the search-mode status rows; "See more" expanded; the disabled `ScoreRangeFacet` and `FacetTextField`.

### Fixes and coverage sent to the Build
#### F2 — F1 and F2, unplanned fixes
- Type: unplanned fixes (spec filtering "Facet option data unavailable"; spec "Facet rows" and design.md D10). Sent to the local build subagent. Result: pending.

### Deferred to Product owner
#### Q1 — F3: padding of help and error under row facets
- Recommendation: 0.75rem side padding, matching the legend. Does not block the archive.
#### Q2 — F4: abandoned typed text in the combobox
- Recommendation: restore the chosen label on blur or Escape when nothing was chosen. Does not block the archive; settle it before add-offering-facets uses the control.
