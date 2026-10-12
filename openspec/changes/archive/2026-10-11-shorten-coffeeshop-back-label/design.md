## Context

See proposal.md (Why) and backlog entry R72, whose settled end state this design implements. Current state:

- `messages/{es,en,ca}/coffeeshops.json` hold `backToDirectory`: "Volver a cafeterías" / "Back to coffee shops" / "Torna a les cafeteries". The wording to match is `backLabel` in `messages/{es,en,ca}/public-evaluations.json`: "Volver" / "Back" / "Tornar".
- `src/widgets/coffeeshop-detail/ui/texts.ts` (widgets) maps `coffeeshops.backToDirectory` into `CoffeeshopDetailTexts.backToDirectory`.
- `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx` (widgets) renders that text in the top link (`href` `/{locale}/coffeeshops`) and in the two `BackButton`s (fallback `/{locale}/coffeeshops`): at the end of the content and in the not-found state.
- `src/pages/coffeeshop-detail/ui/CoffeeshopDetailScreen.tsx` (pages) renders it in the loading state's top link.

No API endpoint is added or changed and no error presentation changes. No derived API type is needed.

## Goals / Non-Goals

**Goals:** R72's end state; texts keep arriving from the message catalogs.

**Non-Goals:** no change to components, `href`s, `BackButton` fallbacks, other screens' back labels, tokens or dependencies.

## Decisions

### D1 — Only the catalog values change

The value of `backToDirectory` in the three `coffeeshops.json` catalogs becomes "Volver" (es), "Back" (en) and "Tornar" (ca). The key keeps its name: renaming it would touch `texts.ts`, both components and their tests for no observable gain, and R72 states that nothing else changes. Every back control of the detail already reads this one key, so all of them take the new label together. No file under `src/` changes except the tests named in tasks.md.

## Risks / Trade-offs

- [Validation tests asserting "Volver a cafeterías"] → by Product owner's decision of 2026-10-11 (option A), only that label string changes to "Volver" in them (task 1.1); no other assertion, query, structure or test name changes.
- [QA tests asserting the old label, such as `qa/src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.test.tsx`] → they become stale on purpose; the build leaves them untouched and lists them in its final report.
