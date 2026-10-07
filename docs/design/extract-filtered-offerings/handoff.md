# Handoff — extract-filtered-offerings

## Session 2026-10-07 — visual review (with extract-clear-filters-button)
Summary: the design lead reviewed R12 (`ebeb90c`) together with R9 against develop before both refactors (`8f1e416`), on `/es/offerings` with a local read mock, at 375px and 1280px, in the traditional and the dark theme. Stopped because: completed; verify and archive come next. MVC reachable: not needed.

### Agent feedback
Design lead, condensed:
- PASS on every check. Screenshots are byte-identical to the baseline in every state (with results, filtered results, filtered empty, error).
- "Borrar todo" (`filters.clearAll`) sits 16px below the empty message, centred. Activating it drops `process` and `page` and keeps `orderBy`/`orderDirection`; the scroll stays at 0.
- Focus ring is visible in both themes. No horizontal scroll at 375px.
- Button contrast, by the design lead's script: label 6.85 / 11.67 light (rest / hover) and 5.38 / 6.64 dark; boundary through the fill in light (6.64 / 11.30) and through the border in dark (15.93).
- The evaluations list's clear button was not reachable, because add-evaluation-facets was not merged yet.
- Unrelated, present in develop too: "Orden predeterminado" is cut at 375px. This was already accepted as is (offering-facets F3, closed for review).

### Decisions taken
#### D1 — R9 visual review closed together with R12
- Context: R9 was merged without a visual review of its own.
- Decision: this review closes it.
- Why: both refactors render the same button in the same place.
- Result: captures in `captures/`.

### Final checks
`ebeb90c`: 2245 tests (the known R15 timeout passes when run alone), lint, tsc and build green (previous session).
