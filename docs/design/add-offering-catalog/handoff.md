# Handoff — add-offering-catalog

## Session 2026-10-06/07 — apply in the cloud and visual review (overnight mandate)
Summary: develop merged (scales, card session, flavor wheel), the apply ran in two cloud sessions, the design lead took task 10.2's captures against a local read mock. Stopped because: the review found correction-level points that change approved decisions (Product owner). MVC reachable: not needed.

### Agent feedback
- Orchestrator: develop merged into the branch without conflicts (`4e4f406`).
- Cloud build (routine trig_013WMcZa49ukwnENnhojTHSR, branch `claude/add-offering-catalog-apply`): tasks 1.1–9.6 in 20 commits (`1d960c9` … `814bf47`), test before implementation in each pair; stopped at 9.7 because the merged `FlavorWheel` props (`nodes`, `total`, `texts`) differ from the task's sketch (`tree`, `counts`).
- Cloud build (routine trig_01X6z6PrMTaKt9wEavf7jofy, branch `claude/add-offering-catalog-apply2`): tasks 9.7–10.1 (`95356c2`, `97e6f89`, `58fdd95`) with the orchestrator's answer below. Integrated by fast-forward; test:run 93 files / 1547 tests (orchestrator's run).
- Design lead, task 10.2 (one `next dev` with a local read mock of `GET /offerings`, `/offerings/{ulid}`, `/taxonomies` shaped from the contract; headless Chrome, 375/1280, both themes; all servers stopped): the four task checks pass — no horizontal scroll at 375, every row wraps, one-column grid at 375, the tabs switch with `?tab=` (keyboard: arrows move focus, Enter selects). D9, D11, D12 pass; D13 passes with notes. 19 captures in `captures/`. Contrast (design lead's numbers): `text-secondary`/`surface-section` 5.39 / 7.18, `text-primary`/`surface-section` 5.72 / 11.97, `text-link`/`surface-page` 6.41 / 14.28.
  - Unverified: en/ca, the real API, loading and error states (the mock always answers 200), the Evaluate link with a specialist session.

### Decisions taken
#### D1 — FlavorWheel call site (task 9.7)
- Context: the task sketched `<FlavorWheel tree counts total texts />`; the merged wheel takes `nodes`, `total`, `texts` with `buildFlavorWheelNodes`. / Decision: adapt only the call site, per design.md D14 + Risks and the decisions log (2026-10-06, add-offering-catalog point 3): per tree, `nodes = buildFlavorWheelNodes(tree, lookup, evaluationCount, countLabel)`. / Result: tasks 9.7/9.8.

### Deferred to Product owner
#### Q1 — F1: the sensory wheel never renders
- `buildFlavorWheelNodes` keeps only `aromatics` roots; the API never puts `aromatics` in `sensoryTaxonomy` (its `sensoryAxes` scope excludes it), so "Perfil sensorial" always shows the empty text — spec scenario "One wheel per tree" not met. The two settled designs (D14 two wheels; add-flavor-wheel's aromatic wheel) contradict each other.
- Options: (a) remove the sensory wheel, keep the CATA wheel (main tastes and defects already have their cards); (b) one wheel per sensory axis (five wheels, new texts); (c) merge the five axes in one wheel (a count rule for a `ref` on several axes would have to be invented).
- Recommendation (design lead): (a). Blocks: the archive.
#### Q2 — F2: the catalog never reaches 3 columns
- D10/spec: 3 columns when the results region reaches 1280px; the region is at most 1088px (`PageSection` `max-w-6xl`, `md:px-8`) and 945px with the `@sidebar` open, so it shows 2. The §6.5 mock-up shows 3 from xl.
- Options: (a) lower the container threshold (e.g. 3 columns from a ~960px region, value to set); (b) accept 2 columns maximum and update the mock-up. Recommendation: (a). Blocks: the archive.
#### Q3 — F3: SCA card empty when every average is missing
- A provisional offering with no averages shows only the heading. Options: (a) show `detailTasteEmpty`; (b) hide the card. Recommendation: (a). Blocks: nothing.
#### Q4 — F4: status card leaves half a row empty at `lg`
- Options: (a) the status card spans both columns; (b) pair it with another one-column card. Recommendation: (a). Blocks: nothing.
#### Q5 — F5: the two selection cards end at different widths (cosmetic, follows D13)
- Options: (a) fixed legend column width from `md`; (b) accept. Recommendation: (b) unless your browser check shows it. Blocks: nothing.
#### Note — F6 (block name twice in a selection card) is accepted by D13 Risks; F7 (D15 names `text-label` where `text-secondary` renders; the pair is already registered and passes) is a wording fix to design.md, to be made with the correction round.

### Final checks
test:run 93 files, 1547 tests passed (after integrating 9.7–10.1).
