# Tasks

## 1. Return to My evaluations after a save (evaluations)

- [ ] 1.1 Test first, in `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` (the `next/navigation` mock exposes a shared `push`): scenarios "The first save" and "A later save": "creates the evaluation on the first save…" and "updates the evaluation on a later save…" replace their assertions of the saved message and of `window.history.replaceState` with `push` called with `/en/manage/evaluations`; scenario "The API refuses the write": the refused-write test adds that `push` is not called. The `push` assertions fail before 1.2.
- [ ] 1.2 `onSave` in `use-evaluation-form.ts` calls `router.push(\`/${locale}/manage/evaluations\`)` on success and drops the saved message; `save()` no longer calls `window.history.replaceState`. Close evaluation unchanged. `savedMessage` leaves `FormMessages`, `EvaluationForm`'s texts, `form-texts.ts`, `form-fixtures.ts` and the three `messages/*/evaluations.json`.

  Verify: `npx vitest related src/pages/evaluation-form/model/use-evaluation-form.ts src/pages/evaluation-form/ui/form-texts.ts --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed, plus stale QA copies of the changed files), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
