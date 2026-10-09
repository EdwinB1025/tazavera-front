# Tasks

## 1. View evaluations action on the offering card (landing)

- [x] 1.1 Test first. In `src/widgets/offering-list/ui/OfferingList.test.tsx`, add `viewEvaluationsLabel: "texts.viewEvaluationsLabel"` to `TEXTS` and one test for the scenario "View evaluations action for everyone": with a signed-in user and one item, the card renders a button named `texts.viewEvaluationsLabel` in the same group as the View button and after it; activating it pushes `/es/evaluations?offeringId=<ulid>`. Update other existing assertions only where this change breaks them. No `qa/` test changes.

  Verify: `npx vitest related src/widgets/offering-list/ui/OfferingList.test.tsx --run`. Expected: only the new test fails. `npm run lint` passes; `npx tsc --noEmit` fails only on the missing `viewEvaluationsLabel` texts field, if at all.

- [x] 1.2 Add `cardViewEvaluationsLabel` to `messages/es/landing.json` (`Ver evaluaciones`), `messages/en/landing.json` (`View evaluations`) and `messages/ca/landing.json` (`Mostra les avaluacions`). Add `viewEvaluationsLabel` to `OfferingCardActions`' texts and to `OfferingListTexts`; fill it from `cardViewEvaluationsLabel` in every screen that builds those texts. In `OfferingCardActions`, render between View and `EvaluateLink`, for every viewer, a `RouteButton` (`variant="action-3"`, `size="sm"`) to `/${locale}/evaluations?offeringId=${ulid}` with that label.

  Verify: `npx vitest related` on the changed files `--run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
