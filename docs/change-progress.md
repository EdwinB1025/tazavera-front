# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-06 13:00, orquestador (Claude Code).

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
| `label-rating-badge` | landing | `feature/label-rating-badge` / `tazavera-front-ratingbadge` | Archive → Merge | 2/2 tareas; verify en la nube sin hallazgos (Chromium es/en/ca); prueba de Product owner dispensada (sin ofertas en local). Archivado `c5d7d00`; `develop` mergeado en la rama (`9f47204`), 1101 tests | Merge a `develop` (Product owner) | Product owner | — | `9f47204` |
| `add-evaluation-scales` | form-fields, feedback | `feature/add-evaluation-scales` / `tazavera-front-scales` | Apply | Propose `d3cce1e`/`706b99b`; `develop` mergeado en la rama (badge dentro). Apply en OpenCode ("apply todo lo que esté listo") | Apply; verify; archive | Build (OpenCode) | — | `706b99b` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Explore | Explore en OpenCode contra el contrato `84e29fe` (ya en `develop` y en la rama). Orquestador cierra Q4 (`created_at desc`) y Q6 (propose ya) | Respuestas de Product owner (403, fecha de la fila, "Completo" por grupo, entrada del sidebar); propose | Product owner | Q1, Q2, Q3, Q5 | `33f505c` |
| `replace-offering-card-session` | landing | — | Resumen — aprobado | Aprobado (`143607f`); list-parts ya en `develop` | Worktree desde `develop` tras el merge de `label-rating-badge`; explore, propose | Orquestador | Merge de `label-rating-badge` | `143607f` |
| `add-user-account` | user-account | — | Resumen — en revisión | Borrador revisado por el design lead (`ed92b2b`); 9 puntos bloquean el propose | Respuestas de Product owner, aprobación | Product owner | Open 1 (sin 422 en el contrato) y Open 2 (step-up, afecta a offering-management) | `ed92b2b` |
| `add-filter-controls` | filtering, app-shell | — | Resumen — aprobado | Aprobado (`ea7648c`); puntos resueltos en el registro (combobox shadcn + `cmdk`, ranura `@sidebar`, facetas de evaluaciones sobre `listMyEvaluations`) | Explore y propose; apply después de `add-offering-catalog` | Orquestador | Apply: auth y catalog en `develop` | `ea7648c` |
| `add-offering-management` | offering-management | — | Resumen — en revisión | Borrador (`b16697e`); 7 puntos bloquean el propose | Respuestas de Product owner, aprobación | Product owner | Open 1–7; refactors compartidos con catalog y evaluations | `b16697e` |
| `add-offering-catalog` | offering-catalog | — | Resumen — aprobado | Aprobado (`923e2d7`); puntos resueltos en el registro (petición de ofertas con query, detalle con pestañas, medias con la escala de granos) | Explore y propose; apply tras scales, list parts, page section, card session y auth en `develop` | Orquestador | Apply: esas dependencias | `923e2d7` |
| `add-theme-tokens` | theming | — (rama borrada) | Merge | Archivado `e53c808`, mergeado `a3a96e2` | — | — | — | `a3a96e2` |
| `add-base-control` | base-controls | — (rama borrada) | Merge | Archivado `d492481`, mergeado `c4f70ad` | — | — | — | `c4f70ad` |
| `add-focus-ring-utility` | theming | — (rama borrada) | Merge | Archivado `fcc6e28`, mergeado `8d23918` | — | — | — | `8d23918` |
| `add-form-fields` | form-fields | — (rama borrada) | Merge | Archivado `6fbd517`, mergeado `c6fe64d` | — | — | — | `c6fe64d` |
| `add-app-shell` | app-shell, theming | — (rama `feature/add-app-shell` aún existe en local) | Merge | Archivado `935236d`, mergeado `8e300b8` | — | — | — | `8e300b8` |
| `refine-app-header` | app-shell | — (rama borrada) | Merge | Archivado `27ca840`, mergeado `124c048`. Pendiente: R4 (radio del panel) en el backlog | — | — | — | `124c048` |
| `add-landing` | landing, content-structure, feedback, app-shell | — (rama borrada; carpeta vacía `tazavera-front-landing` por borrar) | Merge | Archivado `f6bce3b`, mergeado `2284399`. Pendiente: D4 (puntuación dos veces en la tarjeta); candidato de backlog: primitivo de sección compartido | Decisión D4 | Product owner | D4 | `2284399` |


## Cobertura del contrato

Las 26 operaciones de `contracts/openapi.yaml` (`develop`, contrato `84e29fe`) y el cambio que las consume (actualizado el 6 oct, 17:45). Tres operaciones públicas de evaluaciones quedan fuera del alcance por decisión de Product owner (registro, "evaluaciones públicas fuera del alcance").

| `operationId` | Cambio | Estado del cambio |
|---|---|---|
| `listOfferings` | `add-landing` (verificadas); `add-offering-catalog` (catálogo y "Mejor valorados"); `add-offering-management` (las propias) | Mergeado / propose / explore |
| `listOlfactoryTaxonomies` | `add-landing`; `add-offering-catalog` (rueda); `add-specialist-evaluations`; `add-offering-facets` | Mergeado / propose |
| `logOut`, `getTheAuthenticatedUser` | `add-auth` | Mergeado |
| `registerAUser`, `updateAUser`, `updateUserPassword`, `deactivateAUser`, `permanentlyDeleteAUser` | `add-user-account` | Explore |
| `listMyEvaluations` | `add-specialist-evaluations`; `add-evaluation-facets` | Propose |
| `createAnEvaluation`, `getMyEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | `add-specialist-evaluations` | Propose |
| `getAnOffering` | `add-offering-catalog` (detalle); `add-specialist-evaluations` (datos de cada fila) | Propose |
| `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`, `listCoffeeInventory` | `add-offering-management` | Explore |
| `listCoffees`, `listRoasteries` | `add-offering-facets` (opciones de las facetas; tostador con búsqueda) | Propose |
| `listEvaluations`, `getAnEvaluation`, `listTheEvaluationsOfAUser` | — fuera del alcance (Product owner, 6 oct) | — |

No queda ninguna operación del alcance sin cambio asignado.
