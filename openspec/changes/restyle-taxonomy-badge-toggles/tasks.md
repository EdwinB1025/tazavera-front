# Tasks

No derived type is needed (design.md, Context): the change consumes no endpoint and adds no prop.

## 1. The toggle as one chip at the end of its badge

- [ ] 1.1 Write the test of design.md D4 in `src/entities/offering/ui/OfferingCard.test.tsx` for the scenario "Toggle at the end of its badge": the card rendered with two top-level notes with one child each (`#336699`, white label; a light colour such as `#F2D16B`, black label); it asserts that each toggle is its badge's last element child, that both toggles have the same `className`, and that it contains `bg-surface-card`, `text-text-strong`, `border-current`, `size-4`, `rounded-check`, `ml-1`, `-mr-1` and `before:-inset-1`. Verify: the new test fails on the current classes and the file's other tests pass (`npx vitest related src/entities/offering/ui/OfferingCard.test.tsx --run`). Commit `test(landing): …`.
- [ ] 1.2 In `src/shared/ui/TaxonomyTreeToggle.tsx`, set `TOGGLE_CLASSES` to exactly `relative inline-flex size-4 shrink-0 items-center justify-center rounded-check border border-current bg-surface-card text-text-strong type-button ml-1 -mr-1 before:absolute before:-inset-1 focus-visible:focus-ring` (design.md D1–D3) and update the comment above it to cite this change's D1–D3. Behaviour, props, accessible names, `aria-expanded`, `aria-controls` and the `aria-hidden` glyph stay unchanged; no other file changes. Verify: `npx vitest related src/shared/ui/TaxonomyTreeToggle.tsx src/entities/offering/ui/OfferingCard.test.tsx --run` passes, including 1.1's test and every existing tree test with unchanged assertions; the guard tests under `src/shared/ui/` (colour, radius, badge geometry, focus) pass; typecheck and lint pass. Commit `feat(landing): …`.

## 2. Final checks

- [ ] 2.1 Run the validation suite (`npm run test:run`), the typecheck, lint and `npm run build`. Verify: all pass; any failure is fixed in its own `fix(landing): …` commit before verify. Report in the final report that the 25px badge height, the glyph's centring in the 16px box and the absence of overflow at 375px wait for the visual review (375 and 1280px, both themes).
