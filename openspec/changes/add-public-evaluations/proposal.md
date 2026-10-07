# Proposal

## Why

`listEvaluations` and `getAnEvaluation` are public operations of the contract with no consumer since the earlier draft was withdrawn, so no visitor can browse the closed specialist evaluations of the catalog, and the offering detail has nowhere to show the coffee shop's provisional (baseline) evaluation that the API now seeds and exposes. Product owner restored both pieces to scope on 2026-10-06 (decisions log of `docs/general-context.md`, "evaluaciones públicas y evaluación provisional", which corrects "evaluaciones públicas fuera del alcance", and "API add-offering-baseline-seed: diseño final, integrado"), and the approved summary `docs/design/add-public-evaluations/design-summary.md` (Status: approved) settles the design.

## What Changes

- **Public evaluations list** at `/{locale}/evaluations`: the closed specialist evaluations, newest first, as row cards (score with its rating word, closing date, coffee name, coffeeshop and roaster) with Previous/Next pagination. A filter sidebar holds the facets Offering, Score, Process and City; the body toolbar holds the sort. Every listing request carries `evaluationType=specialist&status=closed`, whatever the URL says.
- **Read-only evaluation view** at `/{locale}/evaluations/{ulid}`: one closed evaluation with its offering's identity in the header, and its results in the shared read-only evaluation presentation (summary, intensity, preference, descriptors, notes, extrinsic attributes).
- **Offering detail delta** (capability `offering-catalog`): a "View evaluations" link that opens `/{locale}/evaluations?offeringId={ulid}` with the Offering facet active, and a third tab "Provisional evaluation" that shows the offering's `baseline` evaluation read-only, newest first, with empty and error states inside the panel.
- **One shared read-only evaluation presentation** for the view and the provisional tab, in the Consensus-tab style the decisions log settles ("estilo de la pestaña futura de evaluación provisional": read-only bean scales and the same layout).

No breaking changes: the specialist "my evaluations" list keeps its rendering and its tests; its row card is moved to a widget with an optional status badge and an actions slot and no visible change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: the public evaluations list with its filter (by offering, score, process and city) and its sort, and the read-only view of a closed evaluation through a shared read-only presentation.
- `offering-catalog`: the offering detail gains the "View evaluations" link and the "Provisional evaluation" tab showing the coffee shop's baseline evaluation.

## Out of Scope (non-goals)

- The specialist's public page (`listTheEvaluationsOfAUser`): Product owner keeps it out of scope.
- Open (draft) evaluations in public: the list never shows one, and an open evaluation opened by URL shows the 404 page (Open 5, answered a).
- The evaluator's identity: no public response exposes it, and none is shown.
- Creating a baseline evaluation: the API keeps it on its backlog as a creation endpoint only; uniqueness is guaranteed by the seeder.
- Writing evaluations: capability `evaluations` already owns it (`add-specialist-evaluations`).
- A header entry for the list: it is reached from "View evaluations" and by URL only (Open 7, answered a).
- The flavor wheel in the presentation: the aromatic descriptors render as chips like the other four blocks (Open 4, answered a).
- A combobox to pick any offering in the sidebar: the Offering facet is a radio list over the active offering only (Open 1, answered a); an offering is chosen from its detail page.

## Impact

- **Code (root `app/` and `src/`)**: created — `app/[locale]/evaluations/page.tsx`, `app/[locale]/evaluations/[ulid]/page.tsx`, `app/[locale]/@sidebar/evaluations/page.tsx` (layer `app`, routing only); `src/pages/public-evaluations`, `src/pages/public-evaluation` (layer `pages`); `src/widgets/public-evaluation-list`, `src/widgets/evaluation-sheet`, `src/widgets/evaluation-row` (layer `widgets`, the last one moved out of the specialist list page per Open 2, answered a). Modified — `src/features/evaluation-facets` (the public facet set, Open 3 answered a), `src/entities/evaluation` (the evaluation reads and model reuse), `src/entities/taxonomy` (the shared descriptor-row builder, finding F3), `src/widgets/offering-detail` and `src/pages/offering-detail` (the detail delta), and the message catalogs `messages/{locale}/public-evaluations.json` (new area) and `messages/{locale}/catalog.json`. Full list in design.md D5.
- **API**: five public operations (`security: []`) consumed on the server with plain `fetch` against `NEXT_PUBLIC_API_URL` and no credential — `listEvaluations`, `getAnEvaluation`, `getAnOffering`, `listOlfactoryTaxonomies`, `listCoffees`. With this change `listEvaluations` and `getAnEvaluation` gain their consumer; only `listTheEvaluationsOfAUser` stays uncovered. The contract gaps of finding F7 (descriptions mention an embedded offering, only `200` documented) are reported to Product owner and never adapted to.
- **Dependencies**: no new npm package. All controls used (`Card`, `PageSection`, `Pagination`, `Tabs`, `LabelValueRow`, `Link`, `Button`, `Badge`, `RetryButton`, the read-only scales, the facet controls, `ClearFiltersButton` once `extract-clear-filters-button` merges) already exist.
- **Depends on**: `add-offering-catalog`, `add-sidebar-slot`, `add-facet-controls`, `add-specialist-evaluations` (these four are on `develop`), `add-evaluation-facets` and `extract-clear-filters-button` (backlog R9: the shared `ClearFiltersButton` the list's "Clear all" renders) must be merged into `develop`, and `develop` merged into `feature/add-public-evaluations`, before the apply starts. Task 1.1 is that merge gate and nothing before it is started.
- **Existing behavior**: unchanged on `/manage/evaluations` and on the offering detail's Inventory data and Consensus tabs. The offering detail's header gains the link and an actions row around the existing Evaluate link (same 0.5rem below the captions).
