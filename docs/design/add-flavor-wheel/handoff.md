# Handoff — add-flavor-wheel

## Session 2026-10-06 — visual verification (task 7.2) and verify
Summary: apply completed in a cloud session and integrated (`91ad0e4`, 12/13 tasks). The design lead took the 7.2 captures locally. An OpenCode architect ran `/opsx:verify`. Stopped because: 7.2 is waiting for its checkbox, and the verify was still running when this entry was written. MVC reachable: not needed (the wheel has no MVC counterpart).

### Agent feedback
Design lead, task 7.2:
- **How it was rendered.** The change has no host page yet; its consumer is `add-offering-catalog`. So the real `src/shared/ui/FlavorWheel` was rendered inside `Card`/`CardContent`, with `globals.css`, through a Vite harness outside the repo. Nothing was added to `src/`, `app/` or `.next`.
- **Data.** The `aromatics` notes of the API seed CSV (`taxonomia-sensorial-semilla.csv`), in Spanish. The counts are invented, with a total of 5.
- **Assumed host container.** `max-w-6xl px-4`.
- **Captures.** Headless Chrome, both themes, keyboard state: Tab, Right on "Frutal", Down to "Baya".
- Captures (untracked): `captures/375-wheel.png`, `captures/1280-wheel.png`, `captures/375-wheel-dark.png`, `captures/1280-wheel-dark.png`.

Checks, all measured by script in the browser:
1. **Segment labels fit — pass.** 0 of 2 drawn labels overflow in the sample; 0 of 6 with all 95 notes expanded.
2. **No horizontal scroll — pass.** Scroll width equals visible width: 375 = 375 and 1280 = 1280.
3. **Focus ring on rows — pass.** 2px card gap plus 2px `focus-ring`. Ring against the card: 11.53 (traditional), 13.22 (dark).
4. **Active-note outline — pass.** 3-unit `stroke-text-primary`, drawn last. Not gated (§5), so not measured.
5. **Layout §6.1–§6.6 — pass.**
   - wheel 291px at 375px and 400px at 1280px;
   - stacked at 375px, grid at 1280px;
   - panel 172px and 120px tall, both above its 6rem minimum.
6. **Gated text contrast — pass.** It matches the summary §5 table: lowest 5.72 (traditional), 6.82 (dark).
7. **Segment labels against their blended data colours — pass.** All 95 notes, 37 combinations per theme. Lowest 4.65 in both themes; none below 4.5. This meets the §5 bound of 4.58 or more.

Findings: none. Observations, not defects:
- Few segments carry a label (the specified fit rule, Open 13).
- An empty ring 2 shows while notes are collapsed (the specified "no rescale while expanding").
- A wording slip in design-summary §6.6: "about 1100px / 668px" should be about 1068px / 636px, because the 2 × 16px page padding was not subtracted.

Unverified:
- the real host container (none in this change);
- the read-mock data shape;
- `next/font` versus Google Fonts;
- hover states;
- touch input.

OpenCode architect, `/opsx:verify` (read-only, no edits):
- Checks: validate --strict valid; tsc exit 0; test:run 58 files / 1171 passed; lint exit 0 with 1 warning. Every guard is green; no test was removed or weakened.
- CRITICAL: only the incomplete task 7.2 (captures). It is not a code defect.
- W1 — `FlavorWheel.tsx:358`: lint `jsx-a11y/role-has-required-aria-props`, because the treeitem has no `aria-selected`. design.md D7 pins the row attributes without it. The architect classifies it as a correction.
- W2 — scenario "Every note is reachable": no test asserts that a note whose label was dropped still has its row with the name, swatch and legend. The architect classifies it as unplanned coverage.
- W3 — scenario "Activation without moving focus": only the segment click is asserted, not the row click (`FlavorWheel.test.tsx:410-419`). The architect classifies it as unplanned coverage.
- W4 — `flavor-wheel-geometry.ts:188` clamps the tangential fit bound at 180° (`sin(min(Δθ,180°)/2)`). Summary §4.2 states `sin(Δθ/2)`, which gives 0 room for a single full-ring note. The architect classifies it as a correction.
- Suggestions (no action):
  - the accessible name uses `countLabel`, not the visible `4/5` (as D7 settles);
  - a reflowed checkbox case in `index.test.tsx` (cosmetic);
  - spans become NaN if every sibling count is 0 (not reachable: counts are ≥ 1).

### Decisions taken
#### D1 — Harness instead of host page for 7.2
- Context: task 7.2 allows "a harness or the host page"; this change has no host page.
- Decision: accept the harness captures as 7.2's evidence.
- Why: the task text of tasks.md 7.2.
- Result: captures in `docs/design/add-flavor-wheel/captures/`, untracked. Committing them is Product owner's call (§5 does not let me commit them). The Build checks off 7.2 once the files exist and this entry records the result.

### Fixes and coverage sent to the Build
#### F1 — W2 and W3, unplanned coverage
- Type: unplanned coverage (spec "Every note is reachable"; spec "Activation without moving focus"), sent to the OpenCode build with the workflow §4 template. Result: see the next session entry.

### Deferred to Product owner
#### Q2 — W1: `aria-selected` on the note rows
- Question: should the rows carry `aria-selected` (amending design.md D7 and the test), or does the lint warning stay?
- Why deferred: D7 settles the row attributes. Either answer changes a design decision or the lint configuration.
- Options:
  - a) keep D7 and accept the warning; lint exits 0, and ARIA 1.2 no longer lists `aria-selected` as required on `treeitem`. That is my reading, not verified against the spec text in this session.
  - b) add `aria-selected` on the active row, through a correction;
  - c) add a lint exception for `treeitem`.
- Recommendation: a). It changes nothing and blocks nothing.
- Blocks: the archive, only if Product owner picks b) or c).

#### Q3 — W4: fit bound above 180°
- Question: keep the code's clamp (a span above 180° may use up to the diameter) and amend summary §4.2, or restore the literal chord formula?
- Why deferred: the two readings differ in what the user sees: a single full-ring note gets a label, or gets none.
- Recommendation: keep the clamp and amend the §4.2 wording. A single note filling the ring should be able to show its name.
- Blocks: the archive (a wording fix, or a correction if the formula is restored).

#### Q1 — Wording of design-summary §6.6 (1100/668px)
- Question: correct "about 1100px / 668px" to "about 1068px / 636px"?
- Why deferred: it is wording that contradicts a measurement (§3 lets me fix it). It stays uncommitted until Product owner commits the summary, so it is only recorded here.
- Recommendation: fix it when the summary is next committed. It blocks nothing.

### Final checks
`npm run test:run` (OpenCode architect, 19:27): 58 files, 1171 tests passed.
