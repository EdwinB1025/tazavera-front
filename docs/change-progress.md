# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-07 20:30 UTC (22:30 local), orquestador (Claude Code), al cerrar la sesión. Mergeados hoy: catalog, user-account, refine-page-surfaces, fix-collapsible-overflow, fix-auth-return-query, offering-management, adopt-section-card-in-account, specialist-evaluations, offering-facets, R11, user-contact y R9 (`develop` `8803904`). En la nube: applies de refine-list-pagination, add-coffeeshop-location y add-evaluation-facets, y el plan de reducción de tests. OpenCode en pausa por memoria del portátil (Product owner, 7 oct).

## Cómo se usa

- Una fila por cambio, en orden de prioridad para la entrega.
- Quien cambia la fase de un cambio actualiza su fila en el mismo momento: el orquestador al cerrar una sesión, Product owner al decidir.
- **Agente** es quien tiene el siguiente paso, no quien hizo el último.
- **Fases de resumen:** "Resumen — borrador", "Resumen — en revisión" y "Resumen — aprobado" (`.claude/CLAUDE.md` §9, pipeline de diseño). Nada pasa a Explore o Propose sin "aprobado".
- **Bloqueo** remite a la pregunta del handoff (`Q<n>`) o a la decisión pendiente; "—" si no hay.
- Al mergear un cambio, su fila pasa al final del tablero con fase **Merge**, y en "Estado" queda lo pendiente tras el merge.

### Fases

| Fase | Qué es | Termina con |
|---|---|---|
| Resumen | `docs/design/<change-id>/design-summary.md` por escribir o revisar | Commit de Product owner |
| Explore | Arquitecto, solo feedback | Puntos diferidos respondidos |
| Propose | Arquitecto crea proposal, specs, design, tasks | `docs(<cap>): propose <change-id>` y validate en verde |
| Revisión | Product owner revisa los artefactos | `docs(<cap>): update artifacts for <change-id>` |
| Apply | Build, una tarea por ejecución | Todas las tareas marcadas |
| Ronda N | Corrección tras el Build (`corrections.md`) | `apply review round N` y sus tareas hechas |
| Verify | `/opsx:verify` + comprobación en navegador de Product owner | Sin CRITICAL; WARNING resueltos o diferidos |
| Archive | `openspec archive` | `chore(openspec): archive <change-id>` |
| Merge | `develop` mergeado en la rama y la rama en `develop` | Rama borrada |

### Agentes

| Agente | Quién | Dónde |
|---|---|---|
| Arquitecto (OpenCode) | `opencode run --agent architect`, `xiaomi/mimo-v2.6-pro` | Worktree local |
| Build (OpenCode) | `opencode run --agent build`, `xiaomi/mimo-v2.6-pro` | Worktree local |
| Claude nube | Sesión `claude --cloud` como arquitecto o build | Rama `claude/<change-id>-<tarea>` en GitHub |
| Orquestador | Claude Code local (`.claude/CLAUDE.md`): asigna cada fase (§9), decide dentro de su autoridad, verifica, integra, handoff, tablero | Worktree local |
| Design lead | Subagente de Claude Code (`.claude/agents/design-lead.md`), invocado por el orquestador: resúmenes de diseño, revisión visual, prompts de la nube, análisis de dependencias. Nunca decide | Local |
| Product owner | Decisiones, revisión de artefactos, navegador, lanza sesiones en la nube, merges | — |

### Fila vacía (copiar)

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|
| `<change-id>` | `<cap>` | `feature/<change-id>` / `<carpeta>` | `<fase>` | `<qué está hecho>` | `<fase siguiente>` | `<agente>` | `<Q<n> o —>` | `<hash>` |

## Tablero

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|
| `add-auth` | auth, app-shell | — (rama borrada) | Merge | Archivado `1078876` (R2 fuera del backlog); `develop` mergeado en la rama (Q-merge en la nube, `1863f3b`); mergeado en `develop` `2b6a6ae` (6 oct), 1097 tests. W2 diferido por el archive | — | — | — | `2b6a6ae` |
| `refactor-badge-geometry` | feedback | — (rama borrada) | Merge | Archivado `acd2e66` (R6 fuera); mergeado `ffcd610` | — | — | — | `ffcd610` |
| `extract-offering-list-parts` | content-structure | — (rama borrada) | Merge | Archivado `350792a` (R7 fuera); mergeado `4ccf9b8` | — | — | — | `4ccf9b8` |
| `extract-page-section` | content-structure | — (rama borrada) | Merge | Archivado `cb8a3b4`; mergeado `fdff5e4` | — | — | — | `fdff5e4` |
| `fix-button-boundaries` | base-controls | — (rama borrada) | Merge | Verify en la nube sin hallazgos (Chromium: 40px, `border-box`, borde 1px, +2px de ancho). Archivado `3969e50`; mergeado `756c58b` | — | — | — | `756c58b` |
| `extract-filtered-offerings` (R12) | offering-catalog | `feature/extract-filtered-offerings` / `tazavera-front-r12` | Verify | Propose `d603f7a`; apply en la nube completo; `develop` `8803904` (con R9) mezclado `ebeb90c`: el widget usa `ClearFiltersButton` compartido. Tests (salvo el timeout conocido R15), lint, tsc y build en verde | Revisión visual del design lead (R9 + R12 en el catálogo); verify; archive; merge | Orquestador / design lead | — | `ebeb90c` |
| `refine-list-pagination` | content-structure, landing | `feature/refine-list-pagination` / `tazavera-front-pagination` | Apply | Tareas 1.1–2.2 (nube); arreglo de artefactos D3 fila 10 `b6cc6f3` | Apply desde 3.1 en la nube (`trig_011fVL34CTSeSMTtSabZVP9A`, `claude/refine-list-pagination-apply2`) | Claude nube | — | `b6cc6f3` |
| `add-coffeeshop-location` | offering-management, app-shell | `feature/add-coffeeshop-location` | Apply | Artefactos `7f627d7`; `develop` mezclado en `claude/add-coffeeshop-location-apply` (`7c849be`). La 0.1 paró por `isValidEmail`: el orquestador lo mueve a `@/entities/contact` | Actualización de artefactos + apply en la nube (`trig_01MQFoVTtn69bc7vqFSrt5p4`, `claude/add-coffeeshop-location-apply2`) | Claude nube | — | `7c849be` |
| `add-evaluation-facets` | filtering | `feature/add-evaluation-facets` / `tazavera-front-evfacets` | Apply | Artefactos actualizados `39a4504` (botón compartido, rutas de `develop`) | Apply en la nube (`trig_018Qa9oF9KJhqTLZf3ouxZEv`, `claude/add-evaluation-facets-apply`) | Claude nube | — | `39a4504` |
| `add-public-evaluations` | evaluations, offering-catalog | `feature/add-public-evaluations` / `tazavera-front-pubevals` | Revisión → Apply | Artefactos actualizados `8b13c84` (botón compartido) | Apply en la nube | Claude nube | Merge de evaluation-facets | `8b13c84` |
| `add-coffeeshop-directory` | offering-catalog, filtering, app-shell | `feature/add-coffeeshop-directory` | Revisión → Apply | Propose `892bc61`; artefactos actualizados `e67debf` | Actualización de artefactos (R9 y R12 mergeados) y apply en la nube | Claude nube | Merge de R12; ¿paginación con `?tab=`? (R12 Open 1) | `e67debf` |
| `fix-combobox-blur` | form-fields | `claude/fix-combobox-blur` | Resumen — borrador | Borrador del resumen en la rama de la nube | Aprobación | Product owner | — | — |
| `extract-clear-filters-button` (R9) | filtering | — (rama borrada) | Merge | Apply en la nube; verify sin hallazgos; archivado `8803904` (R9 fuera del backlog); mergeado (fast-forward) 7 oct, 2240 tests. Revisión visual cerrada para revisión (va con R12) | — | — | — | `8803904` |
| `add-user-contact` | user-account | — (rama borrada) | Merge | Revisión visual 4.1 PASS; verify sin hallazgos; spec del bloque modificado puesto al día `029992d`; archivado `77ca8b1`; mergeado `93d24f7` (7 oct) | — | — | — | `93d24f7` |
| `extract-access-and-status-pieces` (R11) | app-shell, feedback | — (rama borrada) | Merge | Revisión visual PASS sin cambios; verify sin CRITICAL; archivado `aee3428` (R11 fuera del backlog; seguimiento R13); mergeado `946fbe2` (7 oct), 2165 tests | — | — | — | `946fbe2` |
| `add-offering-facets` | filtering | — (rama borrada) | Merge | Archivado `b3e915c`; mergeado `8f1e416` (7 oct), 2159 tests. Cerrados para revisión: F3 (FacetCascade) y "Orden predeterminado" a 375 | — | — | — | `8f1e416` |
| `add-specialist-evaluations` | evaluations | — (rama mergeada) | Merge | Archivado `c3390f7`; mergeado `04c3abb` (7 oct). Cerrados para revisión: 10.2/11.5/12.8/13.5 | — | — | — | `04c3abb` |
| `adopt-section-card-in-account` | user-account | — (rama mergeada) | Merge | Archivado `8c3c3f4`; mergeado `27e6a3b` (7 oct). 4.2 cerrado para revisión | — | — | — | `27e6a3b` |
| `add-offering-management` | offering-management | — (rama mergeada) | Merge | Archivado `3920166`; mergeado (7 oct) | — | — | — | `3920166` |
| `fix-auth-return-query` | auth | — (rama mergeada) | Merge | Archivado `8cab0bf`; mergeado `6d34e2b` | — | — | — | `6d34e2b` |
| `fix-collapsible-overflow` | content-structure | — (rama mergeada) | Merge | Archivado `1b92cb7`; mergeado `6af19dc` | — | — | — | `6af19dc` |
| `refine-page-surfaces` | app-shell, theming, content-structure | — (rama mergeada) | Merge | Mergeado `2bc80ae` | — | — | — | `2bc80ae` |
| `add-user-account` | user-account, app-shell, auth | — (rama mergeada) | Merge | Mergeado `8f09b3f` | — | — | — | `8f09b3f` |
| `add-offering-catalog` | offering-catalog, content-structure | — (rama mergeada) | Merge | Archivado y mergeado (7 oct) | — | — | — | — |
| `add-flavor-wheel` | feedback | — (rama borrada) | Merge | Archivado `3c3a3ab`; mergeado `2bc37aa`. Q4, Q5 resueltos en `refine-flavor-wheel` | — | — | — | `2bc37aa` |
| `add-collapsible-section` | content-structure | — (rama borrada) | Merge | Archivado; mergeado `9364ced` (7 oct, noche) | — | — | — | `9364ced` |
| `refine-facet-controls` | filtering | — (rama sin worktree) | Merge | Mergeado `59f3bfb` (7 oct, noche) | — | — | — | `59f3bfb` |
| `refine-flavor-wheel` | feedback | — (rama sin worktree) | Merge | Archivado y mergeado `1642a8a` (7 oct, noche); D1 para revisión | — | — | — | `1642a8a` |
| `add-filter-controls` | — | — (rama y worktree borrados) | Sustituido | Dividido por Product owner en sidebar-slot, facet-controls, offering-facets y evaluation-facets | — | — | — | `ea7648c` |
| `add-facet-controls` | filtering, form-fields | — (rama borrada) | Merge | Verify con arreglos (combobox, coberturas); prueba del design lead (delegada) con F1/F2 arreglados `785c346`/`6b3a8f3`; archivado `e85c529`; mergeado `e85c529` (6 oct, noche), 1352 tests. Q1/Q2 (F3/F4) cerrados (registro de decisiones; `refine-facet-controls`) | — | — | — | `e85c529` |
| `add-sidebar-slot` | app-shell | — (rama borrada) | Merge | D2 cerrado por el orquestador (`@sidebar/page.tsx` + `[...rest]`); verify sin CRITICAL, W2 cubierto `e5a9298`, W1 diferido; archivado `3124e65`; mergeado `be2fe47` (6 oct, noche), 1223 tests | — | — | — | `be2fe47` |
| `add-evaluation-scales` | form-fields, feedback | — (rama borrada) | Merge | Verify en la nube sin CRITICAL; W1 cubierto `9546737`; archivado `16aeae5` (arquitecto local); mergeado `39d945c` (6 oct), 1197 tests | — | — | — | `39d945c` |
| `label-rating-badge` | landing | — (rama borrada) | Merge | Archivado `c5d7d00`; mergeado `b1037be` | — | — | — | `b1037be` |
| `replace-offering-card-session` | landing | — (rama borrada) | Merge | Archivado `07a1992`; mergeado `68123d0` (6 oct), 1101 tests | — | — | — | `68123d0` |
| `add-theme-tokens` | theming | — (rama borrada) | Merge | Archivado `e53c808`, mergeado `a3a96e2` | — | — | — | `a3a96e2` |
| `add-base-control` | base-controls | — (rama borrada) | Merge | Archivado `d492481`, mergeado `c4f70ad` | — | — | — | `c4f70ad` |
| `add-focus-ring-utility` | theming | — (rama borrada) | Merge | Archivado `fcc6e28`, mergeado `8d23918` | — | — | — | `8d23918` |
| `add-form-fields` | form-fields | — (rama borrada) | Merge | Archivado `6fbd517`, mergeado `c6fe64d` | — | — | — | `c6fe64d` |
| `add-app-shell` | app-shell, theming | — (rama borrada) | Merge | Archivado `935236d`, mergeado `8e300b8` | — | — | — | `8e300b8` |
| `refine-app-header` | app-shell | — (rama borrada) | Merge | Archivado `27ca840`, mergeado `124c048`. Pendiente: R4 (radio del panel) en el backlog | — | — | — | `124c048` |
| `add-landing` | landing, content-structure, feedback, app-shell | — (rama borrada) | Merge | Archivado `f6bce3b`, mergeado `2284399`. D4 cerrado (registro, "landing D4"; `label-rating-badge`); primitivo de sección hecho en `extract-page-section` | — | — | — | `2284399` |


## Cobertura del contrato

Las 32 operaciones de `contracts/openapi.yaml` (`develop` `eb3c8fa`, API `PROD ce52210`: contactos, locales y directorio de cafeterías) y el cambio que las consume (actualizado el 7 oct, 11:30). `listTheEvaluationsOfAUser` queda fuera del alcance.

| `operationId` | Cambio | Estado del cambio |
|---|---|---|
| `listOfferings` | `add-landing` (verificadas); `add-offering-catalog` (catálogo y "Mejor valorados"); `add-offering-management` (las propias); `add-coffeeshop-directory` (pestaña de ofertas, filtro `coffeeshop`) | Mergeado / verify / apply / resumen |
| `listOlfactoryTaxonomies` | `add-landing`; `add-offering-catalog` (rueda); `add-specialist-evaluations`; `add-offering-facets` | Mergeado / verify / propose |
| `logOut`, `getTheAuthenticatedUser` | `add-auth` | Mergeado |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `add-user-account` | Verify |
| `listMyEvaluations` | `add-specialist-evaluations`; `add-evaluation-facets` | Verify / propose |
| `createAnEvaluation`, `getMyEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `add-specialist-evaluations` | Verify |
| `getAnOffering` | `add-offering-catalog` (detalle); `add-specialist-evaluations` (datos de cada fila) | Verify |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`, `listCoffeeInventory` | `add-offering-management` | Apply |
| `listCoffees`, `listRoasteries` | `add-offering-facets` (opciones de las facetas; tostador con búsqueda) | Propose |
| `listEvaluations`, `getAnEvaluation` | `add-public-evaluations` (lista pública con filtro de oferta; pestaña "Evaluación provisional") | Propose |
| `listMyContacts`, `createMyPrimaryContact` | `add-user-contact` | Resumen — borrador |
| `listAUsersLocations`, `createALocation` | `add-coffeeshop-location` | Resumen — borrador |
| `listCoffeeShops`, `getACoffeeShop` | `add-coffeeshop-directory` | Resumen — borrador |
| `listTheEvaluationsOfAUser` | — fuera del alcance (Product owner, 6 oct) | — |
