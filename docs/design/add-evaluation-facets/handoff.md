# Handoff — add-evaluation-facets

## Session 2026-10-07 — task 9.1 visual verification (cloud)

Base: `origin/feature/add-evaluation-facets` at 4370c00, branch `claude/add-evaluation-facets-verify`. Result: **9.1 not complete — 30 of 31 checks pass, 1 fails (scroll position at a deep offset).** 9.1 stays unchecked.

### Environment

- No real API in the cloud. A local HTTPS mock (scratch folder, outside the repo) served `GET /user`, `GET /user/evaluations` (filters `status`, `city`, `process`, `scoreMin`, `scoreMax`, sort pair and 15-per-page paging, 23 evaluations), `GET /coffees` (processes `washed`, `natural`, `washed`, empty, `honey`, `anaerobic`, `carbonic maceration`, `wet-hulled`, `natural`), `GET /taxonomies`, `GET /offerings/{ulid}`, `/oauth/authorize` and `/oauth/token`, with bodies taken from the examples of `contracts/openapi.yaml`. HTTPS because the production build's token exchange refuses an `http://` token endpoint.
- `npm run build` + `npm run start` with `NEXT_PUBLIC_API_URL=https://localhost:8443`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_OAUTH_CLIENT_ID=mock-client`, `NODE_EXTRA_CA_CERTS` for the server-side `GET /coffees`. The task names `npm run dev`; the session prompt asked for build + start instead.
- Session: the sign-in marker (`tazavera.signed-in`) in `localStorage`; the app's own silent re-authentication (`prompt=none`) ran against the mock and settled an authenticated `specialist` (`GET /user` contract example, Andrés Gómez).
- Playwright 1.56.1 (scratch folder) with `/opt/pw-browsers/chromium-1194`, viewports 1280×900 and 375×812, theme cookie `theme=traditional` / `theme=dark`, locale `es`.

### Static checks

- **PASS** — `npm run test:run`: 163 files, 2290 tests passed (guards included: color, radius, focus, icons, client-boundary, catalog). The R15 `EvaluationForm.test.tsx` timeout did not occur.
- **PASS** — `npm run lint`: 0 errors, 1 warning (`src/shared/ui/FlavorWheel.tsx:516:23`, `jsx-a11y/role-has-required-aria-props` on a `treeitem`; outside this change).
- **PASS** — `npx tsc --noEmit`: no errors.
- **PASS** — `npm run build`: compiled, every route listed.

### Browser checks

- **PASS** — 1280 traditional: sidebar shows the facets below the entries: nav precedes form[role=search]: true; facet labels in order Estado/Puntuación/Proceso/Ciudad at 0,4,7,15
- **PASS** — 1280 traditional: trigger hidden while the sidebar is open: "Filtros" visible: false
- **PASS** — 1280 traditional: collapsed — trigger in the toolbar, facets hidden: trigger visible: true; facets visible: false; trigger in the sort row: {"overlap":true,"btnLeft":96,"selRight":1184,"aria":"false","ctl":"app-sidebar"}
- **PASS** — 1280 traditional: activating "Filtros" expands the sidebar and hides the trigger: facets visible: true; trigger visible: false
- **PASS** — 1280: selecting a facet resets to page 1 and keeps the other keys: URL after selecting "Abierta" on ?orderBy=created_at&orderDirection=asc&page=2: ?orderBy=created_at&orderDirection=asc&status=open
- **PASS** — 1280: selecting a facet keeps focus: focused element: type=radio label=Abierta
- **FAIL** — 1280: selecting a facet keeps scroll: scrollY before 300, after 351; during loading the document shrinks to the placeholder height, the scroll is clamped and scroll anchoring then moves it
- **PASS** — 1280: Back restores the previous state: URL after Back: ?orderBy=created_at&orderDirection=asc&page=2; Estado "Cualquiera" checked: true
- **PASS** — 1280: scroll kept at a small offset (control): scrollY before 60, after 60 (document height before 2565)
- **PASS** — 1280: "Borrar todo" keeps the sort: chips before: 2; URL after: ?orderBy=cupping_score&orderDirection=desc
- **PASS** — 1280 traditional: filtered empty state with the clear button: message visible: true; main "Borrar todo" visible: true; status: Resultados: 0
- **PASS** — 1280: empty-state clear button keeps the sort: URL after: ?orderBy=cupping_score&orderDirection=desc
- **PASS** — 375 traditional: overlay closed on load, trigger shown: dialogs on load: 0; trigger visible: true
- **PASS** — 375 traditional: no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 traditional: toolbar fits in one row: trigger box 16,140,115,180, sort box 131,140,359,180
- **PASS** — 375 traditional: trigger opens the overlay with the facets: dialog contains form[role=search] "Filtros"
- **PASS** — 375: a facet change updates the list behind the open overlay: overlay still open: true; list requests: OPTIONS /user/evaluations?status=closed&orderBy=created_at&orderDirection=desc&page=1 auth=no | GET /user/evaluations?status=closed&orderBy=created_at&orderDirection=desc&page=1 auth=yes; status: null
- **PASS** — 375: trigger shows the applied count: trigger text: Filtros (1)
- **PASS** — 375 traditional: filtered empty state with the clear button: message visible: true
- **PASS** — 375 traditional: no horizontal scroll (empty state): scrollWidth 375, clientWidth 375
- **PASS** — 1280 dark: sidebar shows the facets below the entries: nav precedes form[role=search]: true; facet labels in order Estado/Puntuación/Proceso/Ciudad at 0,4,7,15
- **PASS** — 1280 dark: trigger hidden while the sidebar is open: "Filtros" visible: false
- **PASS** — 1280 dark: collapsed — trigger in the toolbar, facets hidden: trigger visible: true; facets visible: false; trigger in the sort row: {"overlap":true,"btnLeft":96,"selRight":1184,"aria":"false","ctl":"app-sidebar"}
- **PASS** — 1280 dark: activating "Filtros" expands the sidebar and hides the trigger: facets visible: true; trigger visible: false
- **PASS** — 1280 dark: filtered empty state with the clear button: message visible: true; main "Borrar todo" visible: true; status: Resultados: 0
- **PASS** — 375 dark: overlay closed on load, trigger shown: dialogs on load: 0; trigger visible: true
- **PASS** — 375 dark: no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 dark: toolbar fits in one row: trigger box 16,140,115,180, sort box 131,140,359,180
- **PASS** — 375 dark: trigger opens the overlay with the facets: dialog contains form[role=search] "Filtros"
- **PASS** — 375 dark: filtered empty state with the clear button: message visible: true
- **PASS** — 375 dark: no horizontal scroll (empty state): scrollWidth 375, clientWidth 375

### The failing check

On `?orderBy=created_at&orderDirection=asc&page=2` (document height 2565px at 1280×900) scrolled to `scrollY` 300, selecting "Abierta" in Estado navigates correctly (no `page`, focus on the radio) but the scroll ends at 351. Scroll events recorded: 300 → 146 (the loading placeholder shrinks the document to 1046px, so the browser clamps the scroll to its new maximum) → 351 (the rows arrive and scroll anchoring moves it). The navigation itself does not scroll (`scroll: false` holds): at `scrollY` 60, which the placeholder height does not clamp, the position is kept (control check, PASS). Spec reference: `specs/filtering/spec.md`, "Evaluation filter state in the URL" ("keep the scroll position") and scenario "A change returns to page 1"; design.md D4. Reported as an unplanned fix; not fixed in this session.

### Other observations (no check fails)

- At 375px the sort select truncates "Orden predeterminado" ("Orden predeterminac…") in its 228px box; the toolbar still fits in one row.
- With the overlay open, the polite "Resultados: {count}" status sits outside the modal and is hidden from the accessibility tree by the dialog (`aria-hidden` on the content behind it), so the count is not announced while the overlay is open (probe: `role="status"` text "Resultados: 15" inside an `aria-hidden="true"` ancestor after selecting "Cerrada" in the overlay). The request behind the overlay was made (`GET /user/evaluations?status=closed&…&page=1`).

### Captures

`captures/<state>-<width>-<theme>.png`: `sidebar-open-1280`, `sidebar-collapsed-1280` (trigger in the toolbar), `sidebar-collapsed-375` (overlay closed on load, trigger in the toolbar), `overlay-open-375`, `filtered-empty-1280` (`?city=Sevilla&orderBy=cupping_score&orderDirection=desc`), `filtered-empty-375` (`?city=Sevilla`), each in `traditional` and `dark`.

## Session 2026-10-07 — scroll fix re-check (cloud)

Base: `origin/claude/add-evaluation-facets-verify` at 0605e2c, branch `claude/add-evaluation-facets-fix`. Fix: 437ed1a `fix(filtering): keep the scroll position while the filtered list reloads` (unplanned fix). Result: **every 9.1 check passes (32 of 32: the 31 of the previous session plus one extra scroll probe).**

### Cause found

Two causes moved the scroll; the re-check measured each one separately:

1. While the new page loads, the list block shrinks to the loading placeholder and the browser clamps the scroll (the previous session's 300 → 146 step). Fixed in `EvaluationsList`: the block keeps the height of the list it replaces (inline `min-height` set in a layout effect from the last measured height, cleared when the next state renders). The loading placeholder still shows. With only this part, the clamp disappeared (block `min-height: 2273px` during loading, document height stayed 2565) but the scroll still ended at 351.
2. The remaining +51px was scroll anchoring on the sidebar, not on the list: the applied chip added above the facets grows the facet panel from 810 to 861px, and Chrome scrolled by that amount to keep the radio in place (`overflow-anchor: none` on the list block left 351; on the facet form, 300). Fixed in `EvaluationFacets`: the panel is wrapped in `[overflow-anchor:none]`.

### Environment

Same as the previous session: the local HTTPS mock rebuilt in a scratch folder outside the repo (same endpoints and data shape: 23 evaluations, 15 per page, the nine coffee processes, `/oauth/authorize` and `/oauth/token`, bodies from the `contracts/openapi.yaml` examples; list responses delayed 400 ms so the loading state is observable), `npm run build` + `npm run start` with the same `NEXT_PUBLIC_*` values and `NODE_EXTRA_CA_CERTS`, sign-in marker plus the app's silent re-authentication against the mock, Playwright 1.56.1 with `/opt/pw-browsers/chromium-1194`, viewports 1280×900 and 375×812, theme cookie `traditional` / `dark`, locale `es`.

### Static checks

- **PASS** — `npm run test:run`: 163 files, 2292 tests passed (the R15 `EvaluationForm.test.tsx` timeout did not occur).
- **PASS** — `npm run lint`: 0 errors, 1 warning (the same `src/shared/ui/FlavorWheel.tsx:516:23` warning, outside this change).
- **PASS** — `npx tsc --noEmit`: no errors.
- **PASS** — `npm run build`: compiled.

### Browser checks

- **PASS** — 1280: selecting a facet keeps scroll (deep offset): scrollY before 300, after 300; document height before 2565, heights during the change [2565,4366], after 4366; scroll events []; URL ?orderBy=created_at&orderDirection=asc&status=open; focus radio:Abierta
- **PASS** — 1280: scroll kept at a small offset (control): scrollY before 60, after 60; document height before 2565, heights during the change [2565,4366], after 4366; scroll events []; URL ?orderBy=created_at&orderDirection=asc&status=open; focus radio:Abierta
- **PASS** — 1280: selecting a facet keeps scroll (page 1 at 600, radio off-screen, keyboard): scrollY before 600, after 600; document height before 4438, heights during the change [4438,4366], after 4366; scroll events []; URL ?orderBy=created_at&orderDirection=asc&status=open; focus radio:Abierta
- **PASS** — 1280 traditional: sidebar shows the facets below the entries: nav precedes form[role=search]: true; facet labels Estado/Puntuación/Proceso/Ciudad at 0,4,7,15
- **PASS** — 1280 traditional: trigger hidden while the sidebar is open: "Filtros" visible: false
- **PASS** — 1280 traditional: collapsed — trigger in the toolbar, facets hidden: trigger visible: true; facets visible: false; aria-expanded false
- **PASS** — 1280 traditional: activating "Filtros" expands the sidebar and hides the trigger: facets visible: true; trigger visible: false
- **PASS** — 1280 traditional: filtered empty state with the clear button: message visible: true; "Borrar todo" visible: true; status: Resultados: 0
- **PASS** — 1280: empty-state clear button keeps the sort: URL after: ?orderBy=cupping_score&orderDirection=desc
- **PASS** — 1280: selecting a facet resets to page 1 and keeps the other keys: URL after selecting "Abierta" on page 2: ?orderBy=created_at&orderDirection=asc&status=open
- **PASS** — 1280: selecting a facet keeps focus: focused element: radio:Abierta
- **PASS** — 1280: Back restores the previous state: URL after Back: ?orderBy=created_at&orderDirection=asc&page=2; Estado "Cualquiera" checked: true
- **PASS** — 1280: "Borrar todo" keeps the sort: chips before: 2; URL after: ?orderBy=cupping_score&orderDirection=desc
- **PASS** — 375 traditional: overlay closed on load, trigger shown: dialogs on load: 0; trigger visible: true
- **PASS** — 375 traditional: no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 traditional: toolbar fits in one row: trigger box 16,140,99,40, sort box 131,140,228,40
- **PASS** — 375 traditional: trigger opens the overlay with the facets: dialog contains form[role=search]: true
- **PASS** — 375: a facet change updates the list behind the open overlay: overlay still open: true; requests: GET ?status=closed&orderBy=created_at&orderDirection=desc&page=1
- **PASS** — 375: trigger shows the applied count: trigger text: Filtros (1)
- **PASS** — 375 traditional: filtered empty state with the clear button: message visible: true
- **PASS** — 375 traditional: no horizontal scroll (empty state): scrollWidth 375, clientWidth 375
- **PASS** — 1280 dark: sidebar shows the facets below the entries: nav precedes form[role=search]: true; facet labels Estado/Puntuación/Proceso/Ciudad at 0,4,7,15
- **PASS** — 1280 dark: trigger hidden while the sidebar is open: "Filtros" visible: false
- **PASS** — 1280 dark: collapsed — trigger in the toolbar, facets hidden: trigger visible: true; facets visible: false; aria-expanded false
- **PASS** — 1280 dark: activating "Filtros" expands the sidebar and hides the trigger: facets visible: true; trigger visible: false
- **PASS** — 1280 dark: filtered empty state with the clear button: message visible: true; "Borrar todo" visible: true; status: Resultados: 0
- **PASS** — 375 dark: overlay closed on load, trigger shown: dialogs on load: 0; trigger visible: true
- **PASS** — 375 dark: no horizontal scroll: scrollWidth 375, clientWidth 375
- **PASS** — 375 dark: toolbar fits in one row: trigger box 16,140,99,40, sort box 131,140,228,40
- **PASS** — 375 dark: trigger opens the overlay with the facets: dialog contains form[role=search]: true
- **PASS** — 375 dark: filtered empty state with the clear button: message visible: true
- **PASS** — 375 dark: no horizontal scroll (empty state): scrollWidth 375, clientWidth 375

The third scroll check starts on page 1 at `scrollY` 600, where the Estado radios are outside the viewport, so it selects "Abierta" from the keyboard (focus without scrolling, then Space): a pointer click would make Playwright scroll the radio into view first, which is not the app's behaviour.

### Other observations

The two observations of the previous session (sort select truncation at 375px; the result status hidden by the open overlay) were not re-checked; this session did not address them.
