# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite); "the panel tests" means `ConsensusPanel.test.tsx` and `OfferingDetailContent.test.tsx` in `src/widgets/offering-detail/ui/` and `qa/src/widgets/offering-detail/ui/`, plus `qa/src/widgets/offering-detail/ui/OfferingDetailContent.pass2.test.tsx`. Each task moves code out of `src/widgets/offering-detail/ui/ConsensusPanel.tsx` unchanged, as design.md D1–D2, and makes `ConsensusPanel` render the new part in place of the moved block.

## 1. Score card

- [x] 1.1 Create `src/widgets/offering-detail/ui/ScoreCard.tsx` with `ScoreCardTexts`, `ScoreCardProps` and `ScoreCard` (design.md D2), moving the score card, its tier words, `SCORE_SCALE` and `SCORE_ROW_CLASSES`; `ConsensusPanelTexts` takes `ScoreCardTexts` in place of the four rating keys (design.md D3). Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors. Commit `refactor(offering-catalog): extract the consensus score card`.

## 2. Attributes card

- [x] 2.1 Create `src/widgets/offering-detail/ui/AttributesCard.tsx` with `AttributesCardTexts`, `AttributesCardProps` and `AttributesCard` (design.md D2), moving the attributes card, its one-decimal formatting, `ATTRIBUTES` and `SCALES_CLASSES`; the not-verified card stays inline in the panel (design.md D4). Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(offering-catalog): extract the consensus attributes card`.

## 3. Status card

- [x] 3.1 Create `src/widgets/offering-detail/ui/StatusCard.tsx` with `StatusCardTexts`, `StatusCardProps` and `StatusCard` (design.md D2), moving the status rows, the concordance value with its band word, `LIST_CLASSES` and `CONCORDANCE_CLASSES`. Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(offering-catalog): extract the consensus status card`.

## 4. Consensus legend

- [x] 4.1 Create `src/widgets/offering-detail/ui/ConsensusLegend.tsx` with `ConsensusLegendEntry`, `ConsensusLegendProps` and `ConsensusLegend` (design.md D2), moving the legend markup and `LEGEND_CLASSES`, and `src/widgets/offering-detail/lib/identified-counts.ts` with `identifiedCounts` moved unchanged; the panel's selection and axis blocks render `ConsensusLegend` and import `identifiedCounts`. Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(offering-catalog): extract the consensus legend`.

## 5. Selection block

- [x] 5.1 Create `src/widgets/offering-detail/ui/SelectionBlock.tsx` with `SelectionBlockTexts`, `SelectionBlockProps` and `SelectionBlock` (design.md D2), moving the Main tastes and Defects block and `SELECTION_BLOCK_CLASSES`; the panel renders it twice in today's order (design.md D4). Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(offering-catalog): extract the consensus selection block`.

## 6. CATA card

- [x] 6.1 Create `src/widgets/offering-detail/ui/CataCard.tsx` with `CataCardTexts`, `CataCardProps` and `CataCard` (design.md D2), moving the wheel card, its lookup, wheel texts, wheel groups, count label and `WIDE_CARD_CLASSES`. Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(offering-catalog): extract the consensus cata card`.

## 7. Detail by axis

- [ ] 7.1 Create `src/widgets/offering-detail/ui/AxisDetail.tsx` with `AxisDetailTexts`, `AxisDetailProps`, a local axis section component and `AxisDetail` (design.md D2), moving `AXES`, `AXES_BLOCK_CLASSES`, `AXIS_SECTIONS_CLASSES` and `AXIS_BODY_CLASSES`; `ConsensusPanelTexts` ends as design.md D3 and `ConsensusPanel` as design.md D4. Verify: the related tests pass, including the panel tests, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors; `ConsensusPanel.tsx` and every new file are at most 300 lines and every component at most 80 lines. Commit `refactor(offering-catalog): extract the consensus detail by axis`.

## 8. Full checks

- [ ] 8.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `git diff origin/qa --stat -- src qa` lists only the files of design.md, Files; `index.ts`, `OfferingDetailContent.tsx` and `lib/concordance.ts` are untouched. This task changes no files: check it off in a commit containing only the checkbox, `chore(offering-catalog): complete tasks for split-consensus-panel`.
