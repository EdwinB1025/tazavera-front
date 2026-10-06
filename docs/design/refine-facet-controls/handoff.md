# Handoff — refine-facet-controls

## Session 2026-10-06 — propose, apply, integration and visual review (overnight mandate)
Summary: a cloud session (routine trig_01MrBr2mSFjbbh1rHSyLaW1L, branch `claude/refine-facet-controls`) proposed and built the change; the orchestrator integrated it and the design lead reviewed it in a browser. Stopped because: completed except the archive, which waits for Product owner's browser check (UI change). MVC reachable: not needed.

### Agent feedback
- Cloud architect + build: 10 commits, `04d5c80` (propose) … `58629af` (complete tasks). Every task checked; `openspec validate --strict` valid; test:run 1368, lint, tsc and `next build` clean at the end of the session. Open 1 (a) included: the combobox searches only for typed text (also on first render with a value, recorded in design.md D3).
- Design lead visual review (harness on the worktree's `src/` and `globals.css`, headless Chrome, 375/1280, both themes): both points pass.
  - Row-facet help and error: left edge 20px, aligned with every legend; classes `type-meta mt-1 px-3` / `type-error mt-1 px-3`; field presentation unchanged (0px padding); no horizontal scroll.
  - Combobox: every row of summary §4.2 behaves as specified (Escape / leave restores the label, no value → empty, emptied + Escape keeps the value, emptied + leave reports `null`); search mode logs no call for a label the combobox fills itself, typed text still searches.
  - Captures (this folder, `captures/`): `375-light.png`, `375-dark.png`, `1280-light.png`, `1280-dark.png`, `1280-light-combobox-open.png`, `1280-light-combobox-search.png`.
  - Unverified: real `Sidebar`/`Sheet` wrappers and a real page (no page renders the facets yet), Next fonts, combobox driven only in light.

### Decisions taken
#### D1 — Integration
- Context: the cloud branch was based on develop f177e6c. / Decision: worktree `tazavera-front-refacet` created on `feature/refine-facet-controls` at `58629af`; local develop (wheel included) merged without conflicts (`8457a6c`). / Why: section 6 step 7.2, clean merge. / Result: `npm run test:run` 79 files, 1451 tests passed; pushed.

### Deferred to Product owner
#### Q1 — Archive
- Question: archive and merge to develop after your browser check. / Why deferred: UI change; the overnight mandate archives only non-UI changes. / Recommendation: archive; must land before the apply of `add-offering-facets`. / Blocks: add-offering-facets apply.
#### Q2 — Row facet error boundary in light theme (outside this change)
- Question: under an error, the row radio/checkbox boxes show the error boundary in dark but the cream boundary in light (`375-light.png` vs `375-dark.png`, "Proceso", "Solo disponibles"). Code from `add-facet-controls`; no consumer passes an error today. / Options: new change, or backlog entry. / Recommendation: backlog entry until a facet consumer shows errors. / Blocks: nothing.

### Final checks
test:run 79 files, 1451 tests passed (after merging develop, orchestrator's run).
