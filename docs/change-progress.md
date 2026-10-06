# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-06 22:45, orquestador (Claude Code), noche autónoma.

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
| `add-flavor-wheel` | feedback | `feature/add-flavor-wheel` / `tazavera-front-wheel` | Archive → Merge | Ronda 1 integrada `4186ca9`; prueba del design lead (delegada) OK; fix del botón `f25b478`; archivado `3c3a3ab`. Merge con develop en conflicto aditivo en `openspec/specs/feedback` | Merge de develop en la nube (`trig_01NzH6pqU9a9YVH5RkatxZya`, `claude/add-flavor-wheel-merge`); merge a develop | Claude nube | Q4, Q5 (no bloquean) | `2f7429d` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Verify | Apply 41/42 en la nube, integrado `6e7034c` (1320 tests); falta 10.2 (navegador) | Verify en la nube (`trig_01BFGUxWqToP6iU6WPuaJzxH`); prueba del design lead; archive | Claude nube | — | `6e7034c` |
| `add-user-account` | user-account, app-shell, auth | `feature/add-user-account` / `tazavera-front-account` | Verify | Apply 17/18 integrado `86edaf0` (1287 tests); verify: 0 CRITICAL, W1 `refreshProfile` frente a un cierre de sesión | Fix en la nube (`trig_01LMPPzZAUJHQauKCiM28MaQ`, `claude/add-user-account-fix`); prueba 9.2 del design lead; archive | Claude nube | — | `86edaf0` |
| `add-offering-catalog` | offering-catalog, content-structure | `feature/add-offering-catalog` / `tazavera-front-catalog` | Propose → Apply | Artefactos ajustados `30ea60d` (consenso en tarjeta, `fetchOffering` único, constructor de descriptores en entities/taxonomy) | Apply | Claude nube | Merge de flavor-wheel | `30ea60d` |
| `add-offering-management` | offering-management | `feature/add-offering-management` / `tazavera-front-management` | Apply | `develop` (scales, sidebar-slot, facet-controls) mergeado `cf242d0` | Apply en la nube (`trig_01C4sERVWrEYBk3rNSbbSvsu`, `claude/add-offering-management-apply`) | Claude nube | — | `cf242d0` |
| `add-public-evaluations` | evaluations, offering-catalog | `feature/add-public-evaluations` / `tazavera-front-pubevals` | Propose → Apply | Resumen aprobado por el orquestador `4d08864`; propose `265cd9d` | Apply | Claude nube | Merge de catalog, specialist-evaluations y evaluation-facets | `265cd9d` |
| `add-offering-facets` | filtering | `feature/add-offering-facets` / `tazavera-front-offacets` | Propose → Apply | Propose en la nube `360c5bc` | Apply | Build | Merge de catalog, sidebar-slot y facet-controls | `360c5bc` |
| `add-evaluation-facets` | filtering | `feature/add-evaluation-facets` / `tazavera-front-evfacets` | Propose → Apply | Propose `8b8f0c0` | Apply | Build | Merge de sidebar-slot, facet-controls y specialist-evaluations | `8b8f0c0` |
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

Las 26 operaciones de `contracts/openapi.yaml` (`develop`, contrato `92328fc`: filtros `offeringId` y `evaluationType` en las tres listas de evaluaciones) y el cambio que las consume (actualizado el 6 oct, 20:00). `listTheEvaluationsOfAUser` queda fuera del alcance; `listEvaluations` y `getAnEvaluation` vuelven al alcance (registro, "evaluaciones públicas y evaluación provisional").

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
| `listEvaluations`, `getAnEvaluation` | `add-public-evaluations` (se recupera: lista pública con filtro de oferta, botón "Ver evaluaciones" del detalle); pestaña "Evaluación provisional" (`evaluationType=baseline`, filtros nuevos del API) | Resumen pendiente |
| `listTheEvaluationsOfAUser` | — fuera del alcance (Product owner, 6 oct) | — |

`listEvaluations` y `getAnEvaluation` tienen cambio asignado (`add-public-evaluations`), pero aún les falta el resumen de diseño.
