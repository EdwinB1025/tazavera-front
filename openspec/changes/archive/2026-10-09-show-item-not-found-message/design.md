## Context

Backlog entry R18 is the approved design (Product owner, 2026-10-08). The contract documents the `404` of every read by identifier (`getAnOffering`, `getACoffeeShop`, `getAnEvaluation` — "Not found or not closed" —, `getMyEvaluation`), body `{"message": "..."}`. `fetchOffering`, `fetchCoffeeshop` and `getMyEvaluation` already report `404` as the shared `ApiResult` kind `not-found`; their views collapse it into the error state or the 404 page. `fetchEvaluation` reports every non-2xx as `error`.

## Goals / Non-Goals

Goals: R18's end state for the five places it lists. Non-goals: the 404 page, the role gate, list empty states, any shared component or token.

## Decisions

### D1 — The read maps, the view shows

`fetchEvaluation` returns `ApiResult<EvaluationItem, "not-found">` and maps `404` to `not-found`, as the other reads do. Each async wrapper maps the read's `not-found` to its view's own `not-found` state (`OfferingDetailResult`, `CoffeeshopDetailResult`, the evaluation view's load result, `DetailState` of `EvaluationDetail`); any other failure keeps `error`. The API `message` is never shown.

### D2 — The message block

In each view the not-found state is a block of the title as the page's `h1` with `type-heading` and the line below it as a `p` with `type-body` (the empty-state pattern), 0.5rem apart (`flex flex-col gap-2`), followed by the view's existing back control; no Retry, no tabs, no presentation. The public detail views use their page section with the 1.5rem gap of their top block (`flex flex-col gap-6`), the message block first and the back link after it. The evaluation view uses its first section only. Semantic tokens only; no new token.

### D3 — Texts as props

Full strings per item, never a template (R18). Keys, in es, en and ca: `catalog.detailNotFoundTitle` / `detailNotFoundLine` (offering, also the new form's unknown offering), `coffeeshops.detailNotFoundTitle` / `detailNotFoundLine`, `public-evaluations.viewNotFoundTitle` / `viewNotFoundLine`, `evaluations.formNotFoundTitle` / `formNotFoundLine` (the evaluation title with the offering line, R18's specialist-area rule). They reach the views as props in each view's texts type.

### D4 — Specialist area

`src/pages/evaluation-form/ui/NotFoundNotice.tsx` renders D2's block followed by the header's back button (`RouteButton` to `/{locale}/manage/evaluations`, `action-3`, `sm`, `ArrowLeft`). `EvaluationDetail` renders it for `not-found` instead of `notFound()`; `NewEvaluationScreen` renders it inside `EvaluationsGate` for the offering's `not-found` instead of `notFound()`, so a user without the specialist role still gets the 404 page from the gate. A missing `offering` query value keeps `notFound()` (R18 lists only the unknown offering). An existing evaluation whose offering read answers `404` keeps the error with Retry (not listed in R18).

## Risks / Trade-offs

- The public evaluation view keeps its client-side `status` check as a second guard: a 200 with another status shows the same not-found message.
