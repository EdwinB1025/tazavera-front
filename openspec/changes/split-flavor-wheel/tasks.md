# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite); "the wheel tests" means `FlavorWheel.test.tsx` and `flavor-wheel-geometry.test.ts` in `src/shared/ui/` and `qa/src/shared/ui/`, plus the guard tests of `src/shared/ui` (`client-boundary.test.ts`, `color-guard.test.ts`, `focus-guard.test.ts`, `radius-guard.test.ts`, `xss-guard.test.ts`). Each task moves code out of `src/shared/ui/FlavorWheel.tsx` unchanged, as design.md D1–D2, and makes `FlavorWheel` use the new part in place of the moved code.

## 1. Note-tree helpers

- [x] 1.1 Create `src/shared/ui/flavor-wheel-tree.ts` with `Row`, `SWATCH_CLASSES`, `visibleRows`, `findNode`, `descendantIds`, `descriptionId`, `swatchStyle` and `arrangeRoots` (design.md D2), the last taking the group arrangement of `FlavorWheel` (groups set apart with two or more runs, roots in group order, legend groups). Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors. Commit `refactor(feedback): extract the flavor wheel tree helpers`.

## 2. Segment labels

- [x] 2.1 Create `src/shared/ui/FlavorWheelLabels.tsx` with `WheelLabelProps`, `SegmentLabel` and `ActiveName` (design.md D2), moved unchanged. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(feedback): extract the flavor wheel segment labels`.

## 3. Description panel

- [x] 3.1 Create `src/shared/ui/FlavorWheelPanel.tsx` with `FlavorWheelPanelProps` and `FlavorWheelPanel` (design.md D2), moving the panel markup and `PANEL_CLASSES`. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(feedback): extract the flavor wheel description panel`.

## 4. SVG wheel

- [x] 4.1 Create `src/shared/ui/FlavorWheelChart.tsx` (`"use client"`) with `FlavorWheelChartProps`, a local segment component, a local group-arc component and `FlavorWheelChart` (design.md D1–D2), moving the `<svg>` with its segments, group arcs, centre total, active outline and active name, and `GROUP_ARC_RADIUS`, `GROUP_NAME_RADIUS` and `GROUP_NAME_FONT_SIZE`; the wheel wrapper div stays in `FlavorWheel`. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(feedback): extract the flavor wheel chart`.

## 5. Note list

- [x] 5.1 Create `src/shared/ui/FlavorWheelNoteList.tsx` (`"use client"`) with `FlavorWheelNoteListProps`, a local row component and `FlavorWheelNoteList` (design.md D1–D2), moving the `Collapsible` with the `role="tree"` list, the rows with their `aria-*` attributes, roving `tabIndex` and handlers, the tab-stop computation, `ROW_CLASSES` and `ROW_INDENT`. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(feedback): extract the flavor wheel note list`.

## 6. Keyboard model

- [x] 6.1 Create `src/shared/ui/flavor-wheel-keys.ts` with `TreeKeyContext` and `handleTreeKey` (design.md D2), one handler per key with today's effects; `FlavorWheel`'s row key handler calls it and prevents the default only when it returns true. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors and no `complexity` warning in `flavor-wheel-keys.ts`. Commit `refactor(feedback): extract the flavor wheel keyboard model`.

## 7. Wheel state

- [x] 7.1 Create `src/shared/ui/use-flavor-wheel-state.ts` (`"use client"`) with `FlavorWheelState` and `useFlavorWheelState` (design.md D2), moving the expansion and active-note state, `useId`, the row refs and `setExpansion`, `toggle`, `activate`, `focusRow`, plus `collapseAll` and `registerRow`; `FlavorWheel` ends as design.md D3. Verify: the related tests pass, including the wheel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors and no `max-lines`, `max-lines-per-function` or `complexity` warning in `FlavorWheel.tsx` or any new file; `FlavorWheel.tsx` and every new file are at most 300 lines and every component and function at most 80 lines. Commit `refactor(feedback): extract the flavor wheel state`.

## 8. Full checks

- [x] 8.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `git diff origin/qa --stat -- src qa` lists only the files of design.md, Files; `src/shared/ui/index.ts`, `flavor-wheel-geometry.ts` and `taxonomy-color.ts` are untouched. This task changes no files: check it off in a commit containing only the checkbox, `chore(feedback): complete tasks for split-flavor-wheel`.
