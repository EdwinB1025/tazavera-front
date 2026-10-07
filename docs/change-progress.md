# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-07 11:30, orquestador (Claude Code). Contrato del API `PROD ce52210` (contactos, locales, directorio) en `develop` `eb3c8fa`.

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
| `add-offering-catalog` | offering-catalog, content-structure | `feature/add-offering-catalog` / `tazavera-front-catalog` | Verify | Apply completo (1547 tests); falta 10.2 (navegador). Revisión con mock: F1–F5 → handoff Q1–Q5 | Respuestas de Product owner; ronda o fix; 10.2; archive | Product owner | Q1 (rueda "Perfil sensorial" nunca se pinta), Q2 (nunca 3 columnas) | `cfe6549` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Verify | Apply completo y ronda 1 (secciones plegables) aplicada (1586 tests); faltan 10.2 y 11.5 (navegador con sesión de especialista contra el API) | 10.2/11.5 en navegador; archive | Product owner | Q10 (leyenda 1–9), Q11 (puntos 4 y 5 de la ronda, del orquestador) | `554cd06` |
| `add-offering-management` | offering-management | `feature/add-offering-management` / `tazavera-front-management` | Apply | Tareas 1–7 integradas (1466 tests) | Tareas 8–10 | Claude nube | Q1 (barra lateral "Administrar ofertas" / "Administrar ubicaciones"; el mismo punto que location Q3) | `62ea91a` |
| `add-user-account` | user-account, app-shell, auth | `feature/add-user-account` / `tazavera-front-account` | Verify | Apply 17/18; verify sin CRITICAL; W1 arreglado `36d3144` | 9.2 en navegador contra el API; archive | Product owner | — | `36d3144` |
| `add-public-evaluations` | evaluations, offering-catalog | `feature/add-public-evaluations` / `tazavera-front-pubevals` | Propose → Apply | Resumen aprobado por el orquestador `4d08864`; propose `265cd9d` | Apply | Claude nube | Merge de catalog, specialist-evaluations y evaluation-facets | `265cd9d` |
| `add-offering-facets` | filtering | `feature/add-offering-facets` / `tazavera-front-offacets` | Propose → Apply | Propose en la nube `360c5bc` | Apply | Build | Merge de catalog | `360c5bc` |
| `add-evaluation-facets` | filtering | `feature/add-evaluation-facets` / `tazavera-front-evfacets` | Propose → Apply | Propose `8b8f0c0` | Apply | Build | Merge de specialist-evaluations | `8b8f0c0` |
| `add-user-contact` | user-account | — | Resumen — borrador | Borrador en `develop`. Su punto 1 (respuesta sin contacto) lo resuelve el contrato `eb3c8fa`: `{ data: [] }` | Aprobación; explore/propose | Product owner | Ninguno de propose; el apply espera a catalog (`LabelValueRow`) | — |
| `add-coffeeshop-location` | offering-management | — | Resumen — borrador | Borrador en `develop`. Punto 2: el contrato documenta `listAUsersLocations` para "Administrar ubicaciones" (con contactos) | Aprobación; explore/propose | Product owner | Punto 3 (= management Q1), punto 4 (refactor R10 antes) | — |
| `add-coffeeshop-directory` | offering-catalog | — | Resumen — borrador | Borrador en `develop`. Punto 2 resuelto por el contrato: cada cafetería de `GET /coffeeshops` trae `locations[]` con `latitud`/`longitud` | Aprobación; explore/propose | Product owner | Punto 4 (widget de ofertas filtradas antes), punto 5 (refactor R9 antes) | — |
| `add-flavor-wheel` | feedback | — (rama borrada) | Merge | Archivado `3c3a3ab`; mergeado `2bc37aa`. Q4, Q5 sin bloqueo | — | — | — | `2bc37aa` |
| `add-collapsible-section` | content-structure | — (rama borrada) | Merge | Archivado; mergeado `9364ced` (7 oct, noche) | — | — | — | `9364ced` |
| `refine-facet-controls` | filtering | — (rama sin worktree) | Merge | Mergeado `59f3bfb` (7 oct, noche) | — | — | — | `59f3bfb` |
| `refine-flavor-wheel` | feedback | — (rama sin worktree) | Merge | Archivado y mergeado `1642a8a` (7 oct, noche); D1 para revisión | — | — | — | `1642a8a` |
| `add-filter-controls` | — | — (rama y worktree borrados) | Sustituido | Dividido por Product owner en sidebar-slot, facet-controls, offering-facets y evaluation-facets | — | — | — | `ea7648c` |
| `add-facet-controls` | filtering, form-fields | — (rama borrada) | Merge | Verify con arreglos (combobox, coberturas); prueba del design lead (delegada) con F1/F2 arreglados `785c346`/`6b3a8f3`; archivado `e85c529`; mergeado `e85c529` (6 oct, noche), 1352 tests. Q1/Q2 (F3/F4) para Product owner | — | — | Q1, Q2 | `e85c529` |
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
| `add-landing` | landing, content-structure, feedback, app-shell | — (rama borrada) | Merge | Archivado `f6bce3b`, mergeado `2284399`. Pendiente: D4 (puntuación dos veces en la tarjeta); candidato de backlog: primitivo de sección compartido | Decisión D4 | Product owner | D4 | `2284399` |


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
