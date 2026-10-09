# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite). Each task moves code of one unit unchanged into the sibling files of design.md, Files, and is verified with: the related tests pass with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors and no size or complexity warning for the unit.

## 1. Checkbox

- [x] 1.1 Create `src/shared/ui/ControlMessages.tsx` (design.md D2) and split `Checkbox` as design.md D3. Commit `refactor(form-fields): split the checkbox`.

## 2. Radio group

- [x] 2.1 Create `src/shared/ui/RadioOptionRow.tsx` and split `RadioGroup` as design.md D4. Commit `refactor(form-fields): split the radio group`.

## 3. Bean scale

- [ ] 3.1 Create `src/shared/ui/BeanScaleBeans.tsx` and split `BeanScale` as design.md D5. Commit `refactor(form-fields): split the bean scale`.

## 4. Intensity slider

- [ ] 4.1 Create `src/shared/ui/IntensitySliderParts.tsx` and split `IntensitySlider` as design.md D6. Commit `refactor(form-fields): split the intensity slider`.

## 5. Descriptor chip group

- [ ] 5.1 Create `src/shared/ui/DescriptorChipRows.tsx` and split `DescriptorChipGroup` as design.md D7. Commit `refactor(form-fields): split the descriptor chip group`.

## 6. Locations map

- [ ] 6.1 Create `src/shared/ui/LocationsMapPanel.tsx` and `src/shared/ui/locations-map-view.tsx` and split `LocationsMap` as design.md D8. Commit `refactor(offering-catalog): split the locations map`.

## 7. Full checks

- [ ] 7.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; lint reports no size or complexity warning under `src/shared/` other than the out-of-scope `Combobox` and `ScoreRangeFacet`; `src/shared/ui/index.ts` is untouched. This task changes no files: check it off in a commit containing only the checkbox, `chore(form-fields): complete tasks for split-oversized-shared-ui`.
