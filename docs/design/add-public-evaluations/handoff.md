# Handoff — add-public-evaluations

## Session 2026-10-08 — task 5.2 visual verification (cloud)

Base: `origin/feature/add-public-evaluations` at af91d8d plus the apply commits, branch `claude/add-public-evaluations-apply2`. Result: **63 of 63 browser checks pass**, and the task 5.1 checks pass; 5.1 and 5.2 are checked off.

### Environment

- No real API in the cloud. A local HTTP mock (scratch folder, outside the repo) served `GET /evaluations` (filters `offeringId`, `evaluationType`, `status`, `scoreMin`, `scoreMax`, the sort pair, 5 per page; `city=Sevilla` answers an empty page), `GET /evaluations/{ulid}` (`OPEN` answers an open evaluation), `GET /offerings/{ulid}` (two offerings; a third ULID answers 500 for the offering-unavailable row), `GET /taxonomies`, `GET /coffees` and `GET /user` (401). Bodies come from the `contracts/openapi.yaml` examples of `getAnEvaluation`, `getAnOffering`, `listOlfactoryTaxonomies` and `listCoffees`: 12 closed specialist evaluations (offerings A and B, two with `offeringId` null, one whose offering read fails) and two baselines of offering A (82.50 newest, 80.00 older); offering B has no baseline.
- `npm run build` + `npm run start` with `NEXT_PUBLIC_API_URL=http://localhost:8787`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_OAUTH_CLIENT_ID=mock-client`; anonymous visitor.
- Playwright 1.56.1 (scratch folder) with `/opt/pw-browsers/chromium-1194`, viewports 1280×900 and 375×812, theme cookie `traditional` / `dark`, locale `es`.

### Static checks (task 5.1)

- **PASS** — `npm run test:run`: 171 files, 1163 tests passed (guards included: color, radius, focus, client-boundary, xss, icons, badge-geometry, theme-tokens with no pair added, and the catalog guard over `public-evaluations` and `catalog`).
- **PASS** — `npm run lint`: 0 errors, 1 warning (`src/shared/ui/FlavorWheel.tsx:516:23`, outside this change).
- **PASS** — `npx tsc --noEmit`: no errors.
- **PASS** — `npm run build`: compiled; `/[locale]/evaluations` and `/[locale]/evaluations/[ulid]` listed.

### Browser checks (task 5.2)

- **PASS** — 1280 traditional: detail header actions row: last child of the title group true; 8px below the last caption; classes "flex flex-wrap items-start gap-4"
- **PASS** — 1280 traditional: View evaluations target: /es/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 1280 traditional: provisional tab third, newest baseline shown: tabs ["Datos del inventario","Consenso","Evaluación provisional"]; URL /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D?tab=provisional; 82.50 shown, 80.00 absent
- **PASS** — 1280 traditional: provisional tab no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 traditional: provisional empty state: class "type-body text-center"
- **PASS** — 1280 traditional: unknown tab opens inventory: aria-selected true
- **PASS** — 1280 traditional: list arrives with the Offering facet selected and its chip: radio checked true; chip buttons 1
- **PASS** — 1280 traditional: public facets, no Status: ["Oferta","Cualquiera","Huila El Mirador · Tazavera Gràcia","Puntuación","Desde","Hasta","Proceso","Cualquiera"]
- **PASS** — 1280 traditional: rows of the offering: ["Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador"]
- **PASS** — 1280 traditional: list no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 traditional: list content width: 960px (expected 960)
- **PASS** — 1280 traditional: missing and unavailable rows: ["Huila El Mirador","Huila El Mirador","Sidama Bensa","Oferta inexistente","Oferta no disponible"]
- **PASS** — 1280 traditional: missing row has View only, suffixed: ["Ver Oferta inexistente, 29 sept 2026"]
- **PASS** — 1280 traditional: Next keeps the query and replaces page: /es/evaluations?status=open&evaluationType=baseline&page=2
- **PASS** — 1280 traditional: fixed request keys: GET /evaluations?evaluationType=specialist&status=closed&orderBy=created_at&orderDirection=desc&page=2
- **PASS** — 1280 traditional: filtered empty state and Clear all keeps the sort: /es/evaluations?orderBy=cupping_score&orderDirection=desc
- **PASS** — 1280 traditional: view of an evaluation without offering: h1 "Oferta inexistente"
- **PASS** — 1280 traditional: open evaluation renders the 404 page: status 200; body starts "requestAnimationFrame(function(){$RT=performance.now()});(self.__next_f=self.__n"
- **PASS** — 1280 traditional: view header: back /es/evaluations; h1 Huila El Mirador; View offering /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 1280 traditional: sheet cards: ["Contexto","Intensidad","Preferencia","Descriptores","Notas","Atributos extrínsecos"]
- **PASS** — 1280 traditional: view no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 traditional: view description: Evaluaciones públicas de especialistas
- **PASS** — 375 traditional: detail header actions row: last child of the title group true; 8px below the last caption; classes "flex flex-wrap items-start gap-4"
- **PASS** — 375 traditional: View evaluations target: /es/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 375 traditional: provisional tab third, newest baseline shown: tabs ["Datos del inventario","Consenso","Evaluación provisional"]; URL /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D?tab=provisional; 82.50 shown, 80.00 absent
- **PASS** — 375 traditional: provisional tab no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 traditional: list arrives with the Offering facet selected and its chip: radio checked true; chip buttons 1
- **PASS** — 375 traditional: public facets, no Status: ["Oferta","Cualquiera","Huila El Mirador · Tazavera Gràcia","Puntuación","Desde","Hasta","Proceso","Cualquiera"]
- **PASS** — 375 traditional: rows of the offering: ["Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador"]
- **PASS** — 375 traditional: list no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 traditional: list content width: 343px (expected 343)
- **PASS** — 375 traditional: view header: back /es/evaluations; h1 Huila El Mirador; View offering /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 375 traditional: sheet cards: ["Contexto","Intensidad","Preferencia","Descriptores","Notas","Atributos extrínsecos"]
- **PASS** — 375 traditional: card content box: 291px (expected 291)
- **PASS** — 375 traditional: view no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 traditional: view description: Evaluaciones públicas de especialistas
- **PASS** — 1280 dark: detail header actions row: last child of the title group true; 8px below the last caption; classes "flex flex-wrap items-start gap-4"
- **PASS** — 1280 dark: View evaluations target: /es/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 1280 dark: provisional tab third, newest baseline shown: tabs ["Datos del inventario","Consenso","Evaluación provisional"]; URL /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D?tab=provisional; 82.50 shown, 80.00 absent
- **PASS** — 1280 dark: provisional tab no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 dark: list arrives with the Offering facet selected and its chip: radio checked true; chip buttons 1
- **PASS** — 1280 dark: public facets, no Status: ["Oferta","Cualquiera","Huila El Mirador · Tazavera Gràcia","Puntuación","Desde","Hasta","Proceso","Cualquiera"]
- **PASS** — 1280 dark: rows of the offering: ["Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador"]
- **PASS** — 1280 dark: list no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 dark: list content width: 960px (expected 960)
- **PASS** — 1280 dark: view header: back /es/evaluations; h1 Huila El Mirador; View offering /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 1280 dark: sheet cards: ["Contexto","Intensidad","Preferencia","Descriptores","Notas","Atributos extrínsecos"]
- **PASS** — 1280 dark: view no horizontal scroll: scrollWidth 1280, clientWidth 1280
- **PASS** — 1280 dark: view description: Evaluaciones públicas de especialistas
- **PASS** — 375 dark: detail header actions row: last child of the title group true; 8px below the last caption; classes "flex flex-wrap items-start gap-4"
- **PASS** — 375 dark: View evaluations target: /es/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 375 dark: provisional tab third, newest baseline shown: tabs ["Datos del inventario","Consenso","Evaluación provisional"]; URL /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D?tab=provisional; 82.50 shown, 80.00 absent
- **PASS** — 375 dark: provisional tab no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 dark: list arrives with the Offering facet selected and its chip: radio checked true; chip buttons 1
- **PASS** — 375 dark: public facets, no Status: ["Oferta","Cualquiera","Huila El Mirador · Tazavera Gràcia","Puntuación","Desde","Hasta","Proceso","Cualquiera"]
- **PASS** — 375 dark: rows of the offering: ["Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador","Huila El Mirador"]
- **PASS** — 375 dark: list no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 dark: list content width: 343px (expected 343)
- **PASS** — 375 dark: view header: back /es/evaluations; h1 Huila El Mirador; View offering /es/offerings/01K6A3M8Q2V7XH4T9B5N1RCW0D
- **PASS** — 375 dark: sheet cards: ["Contexto","Intensidad","Preferencia","Descriptores","Notas","Atributos extrínsecos"]
- **PASS** — 375 dark: card content box: 291px (expected 291)
- **PASS** — 375 dark: view no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 dark: view description: Evaluaciones públicas de especialistas

### Comparison with summary §5.6–§5.7

- Public list at 1280 with the sidebar open, arriving from "Ver evaluaciones": the content column is 960px; the sidebar shows the Offering chip, "Borrar todo", Oferta (Cualquiera / "Huila El Mirador · Tazavera Gràcia" selected), Puntuación, Proceso and Ciudad, and no Estado; the rows match the mock-up (aside score row, `h2`, "Cerrada el …", captions, Ver / Ver oferta at the end) with the pagination below.
- At 375: container 343px, card content box 291px, no horizontal scroll on the list, the view and the detail; the facets open in the full-screen sidebar panel.
- Read-only view: back link, eyebrow, `h1`, captions, meta line and "Ver oferta" in section 1; Contexto, Intensidad, Preferencia, Descriptores, Notas and Atributos extrínsecos on the sheet grid in section 2.
- Offering detail: "Ver evaluaciones" sits 8px (0.5rem) below the last caption as the last child of the title group; the third tab "Evaluación provisional" follows the other two and shows the newest baseline.

### Observations (no check fails)

- The contract example of `getAnEvaluation` carries `score: 0` (not null) on unscored axes, so the sheet renders those bean scales at "0/9" (the spec omits only null scores). The specialist form reads an affective 0 as unset (`formStateFromEvaluation`, `|| null`). Whether the public sheet should do the same is a product question.
- A descriptor ref pointing at a level-0 node that has level-1 children in the block's category resolves to no chip (the settled `buildDescriptorRows` rule), so with the example taxonomy the mock's Fragancia / Aroma block reads "Sin descriptores.".
- At 1280 the row aside (a quarter of the card) wraps the rating badge under the score for some scores, because the score row is a wrapping flex row.

### Captures

`captures/<state>-<width>-<theme>.png`: `list-from-offering` (arriving from "Ver evaluaciones"; sidebar open at 1280, closed at 375), `list-filters-open` (375, the full-screen facets), `view` (an evaluation with notes and extrinsic attributes), `provisional-tab`, `detail-header`, each in `traditional` and `dark` at 375 and 1280.
