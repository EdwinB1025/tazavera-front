# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-06 19:20, orquestador (Claude Code).

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
| `add-evaluation-scales` | form-fields, feedback | `feature/add-evaluation-scales` / `tazavera-front-scales` | Verify | Apply completo en la nube, integrado (`3696411`) | Verify; capturas; navegador de Product owner; archive | Arquitecto (OpenCode) | — | `3696411` |
| `add-flavor-wheel` | feedback | `feature/add-flavor-wheel` / `tazavera-front-wheel` | Verify | Apply completo en la nube, integrado (`91ad0e4`) | Verify; capturas; navegador de Product owner; archive | Arquitecto (OpenCode) | — | `91ad0e4` |
| `add-sidebar-slot` | app-shell | `feature/add-sidebar-slot` / `tazavera-front-sidebarslot` | Apply | Apply en la nube integrado hasta `128dd36`; quedan 6.3 y 7.1 | Apply (6.3, 7.1); verify; archive | Build (OpenCode) | — | `128dd36` |
| `add-facet-controls` | filtering, form-fields | `feature/add-facet-controls` / `tazavera-front-facetctl` | Verify | Apply completo en la nube, integrado (`21ff097`) | Verify; capturas; navegador de Product owner; archive | Arquitecto (OpenCode) | — | `21ff097` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Propose → Apply | Propose `eadf858` | Apply | Build | Merge de scales | `eadf858` |
| `add-user-account` | user-account, app-shell, auth | `feature/add-user-account` / `tazavera-front-account` | Propose → Apply | Propose `59a3ec1`/`061492e`/`a65058f` (B1/B2 cerrados por el orquestador) | Apply | Build | Merge de scales (`ConfirmDialog`) | `a65058f` |
| `add-offering-catalog` | offering-catalog, content-structure | `feature/add-offering-catalog` / `tazavera-front-catalog` | Propose → Apply | Propose `ba6f642`/`c9408b4`; sin dividir | Apply | Build | Merge de scales y flavor-wheel | `c9408b4` |
| `add-offering-management` | offering-management | `feature/add-offering-management` / `tazavera-front-management` | Propose → Apply | Propose `30c878f`; erratas S1–S6 `2121983` | Apply | Build | Merge de scales, sidebar-slot y facet-controls | `2121983` |
| `add-offering-facets` | filtering | `feature/add-offering-facets` / `tazavera-front-offacets` | Propose → Apply | Propose en la nube `360c5bc` | Apply | Build | Merge de catalog, sidebar-slot y facet-controls | `360c5bc` |
| `add-evaluation-facets` | filtering | `feature/add-evaluation-facets` / `tazavera-front-evfacets` | Propose → Apply | Propose `8b8f0c0` | Apply | Build | Merge de sidebar-slot, facet-controls y specialist-evaluations | `8b8f0c0` |
| `add-filter-controls` | — | — (rama y worktree borrados) | Sustituido | Dividido por Product owner en sidebar-slot, facet-controls, offering-facets y evaluation-facets | — | — | — | `ea7648c` |
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

Las 26 operaciones de `contracts/openapi.yaml` (`develop`, contrato `84e29fe`) y el cambio que las consume (actualizado el 6 oct, 17:45). Tres operaciones públicas de evaluaciones quedan fuera del alcance por decisión de Product owner (registro, "evaluaciones públicas fuera del alcance").

| `operationId` | Cambio | Estado del cambio |
|---|---|---|
| `listOfferings` | `add-landing` (verificadas); `add-offering-catalog` (catálogo y "Mejor valorados"); `add-offering-management` (las propias) | Mergeado / propose / explore |
| `listOlfactoryTaxonomies` | `add-landing`; `add-offering-catalog` (rueda); `add-specialist-evaluations`; `add-offering-facets` | Mergeado / propose |
| `logOut`, `getTheAuthenticatedUser` | `add-auth` | Mergeado |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `add-user-account` | Propose |
| `listMyEvaluations` | `add-specialist-evaluations`; `add-evaluation-facets` | Propose |
| `createAnEvaluation`, `getMyEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `add-specialist-evaluations` | Propose |
| `getAnOffering` | `add-offering-catalog` (detalle); `add-specialist-evaluations` (datos de cada fila) | Propose |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`, `listCoffeeInventory` | `add-offering-management` | Propose |
| `listCoffees`, `listRoasteries` | `add-offering-facets` (opciones de las facetas; tostador con búsqueda) | Propose |
| `listEvaluations`, `getAnEvaluation`, `listTheEvaluationsOfAUser` | — fuera del alcance (Product owner, 6 oct) | — |

No queda ninguna operación del alcance sin cambio asignado.
