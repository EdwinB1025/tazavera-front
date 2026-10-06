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
| `add-auth` | auth, app-shell | `feature/add-auth` / `tazavera-front-auth` | Verify | 34/34 tareas. F2 (W1, página en blanco tras `/callback`) integrado `4ac8129`: `router.replace` en lugar de `pushState`; 821 tests, lint y tsc en 0 re-ejecutados en local; Chromium en la nube: `/es` renderiza. Re-verify en la nube 13:42 (`trig_01RKwecou65A7MQbLASEifsM`) | Revisar re-verify; archive cuando lo pida Product owner; merge final con Q-merge | Claude nube | — | `4ac8129` |
| `refactor-badge-geometry` | feedback | `feature/refactor-badge-geometry` / `tazavera-front-badge` | Verify | 8/8 tareas (5.2 integrada `0f9cea3`). Verify en la nube: 0 CRITICAL, 1 WARNING (escenario "Chip matches the badge geometry" sin test; aún no existe ningún chip consumidor), validate --strict OK, 936 tests | Clasificar el WARNING; archive cuando lo pida Product owner; merge | Product owner | WARNING del verify | `0f9cea3` |
| `fix-button-boundaries` | base-controls | `feature/fix-button-boundaries` / `tazavera-front-buttons` | Propose hecho | Propose `13a054f`. Mock-up capturado (375/1280, claro/oscuro, `docs/design/fix-button-boundaries/mockup/`, sin trackear); contraste OK; redacción de Risk 2/3 y §2 corregida (sin commitear) | Revisión visual y de artefactos de Product owner; apply | Product owner | Revisión del mock-up (Open 2) | `13a054f` |
| `extract-offering-list-parts` | content-structure | `feature/extract-offering-list-parts` / `tazavera-front-listparts` | Apply | 1.1–4.1 hechas (nube, integrada `7e6b777`; 937 tests, lint y tsc en 0 re-ejecutados en local). 4.2 capturas + verify en la nube 13:32 (`trig_01JcQSWCXZMxRyahEB6NQEm8`; el design lead local no puede usar Bash en modo don't ask) | Integrar 4.2; archive cuando lo pida Product owner | Claude nube | — | `7e6b777` |
| `add-evaluation-scales` | form-fields, feedback | `feature/add-evaluation-scales` / `tazavera-front-scales` | Propose hecho | Propose `d3cce1e` (form-fields) y `706b99b` (feedback), sin revisar aún | Revisión del propose; apply cuando `refactor-badge-geometry` esté en `develop` | Orquestador | `refactor-badge-geometry` | `706b99b` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Explore + Propose | Respuestas del 6 oct commiteadas (`c379a98`); contrato con fechas en `develop` (`2d7d8b8`). Explore en la nube (13:09): sin propose, 3 preguntas bloqueantes (B1: la evaluación no trae dueño en el contrato, no se puede aplicar la respuesta 6a; B2–B3 en la sesión `session_01GHJ6upeYKZUVm3GjFNC7YW`) | Respuestas de Product owner; relanzar propose | Product owner | B1–B3 | `33f505c` |
| `add-user-account` | user-account | — | Resumen — en revisión | Borrador revisado por el design lead (`ed92b2b`); 9 puntos bloquean el propose | Respuestas de Product owner, aprobación | Product owner | Open 1 (sin 422 en el contrato) y Open 2 (step-up, afecta a offering-management) | `ed92b2b` |
| `add-filter-controls` | filtering, app-shell | — | Resumen — en revisión | Rehecho el 6 oct con facetas en el sidebar (sin commitear) | Respuestas de Product owner, Propose | Product owner | Librería del combobox; ranura `@sidebar`; depende de `add-auth` (shell) y `add-offering-catalog` | `0de9864` |
| `add-offering-management` | offering-management | — | Resumen — en revisión | Borrador (`b16697e`); 7 puntos bloquean el propose | Respuestas de Product owner, aprobación | Product owner | Open 1–7; refactors compartidos con catalog y evaluations | `b16697e` |
| `add-offering-catalog` | offering-catalog | — | Resumen — en revisión | Borrador (`1f01ce9`); 4 puntos bloquean el propose | Respuestas de Product owner, aprobación | Product owner | Open 1, 2, 5, 6; D4 de landing | `1f01ce9` |
| `add-theme-tokens` | theming | — (rama borrada) | Merge | Archivado `e53c808`, mergeado `a3a96e2` | — | — | — | `a3a96e2` |
| `add-base-control` | base-controls | — (rama borrada) | Merge | Archivado `d492481`, mergeado `c4f70ad` | — | — | — | `c4f70ad` |
| `add-focus-ring-utility` | theming | — (rama borrada) | Merge | Archivado `fcc6e28`, mergeado `8d23918` | — | — | — | `8d23918` |
| `add-form-fields` | form-fields | — (rama borrada) | Merge | Archivado `6fbd517`, mergeado `c6fe64d` | — | — | — | `c6fe64d` |
| `add-app-shell` | app-shell, theming | — (rama `feature/add-app-shell` aún existe en local) | Merge | Archivado `935236d`, mergeado `8e300b8` | — | — | — | `8e300b8` |
| `refine-app-header` | app-shell | — (rama borrada) | Merge | Archivado `27ca840`, mergeado `124c048`. Pendiente: R4 (radio del panel) en el backlog | — | — | — | `124c048` |
| `add-landing` | landing, content-structure, feedback, app-shell | — (rama borrada; carpeta vacía `tazavera-front-landing` por borrar) | Merge | Archivado `f6bce3b`, mergeado `2284399`. Pendiente: D4 (puntuación dos veces en la tarjeta); candidato de backlog: primitivo de sección compartido | Decisión D4 | Product owner | D4 | `2284399` |

Todas las operaciones tienen cambio asignado.

## Cobertura del contrato

Las 23 operaciones de `contracts/openapi.yaml` (`develop`) y el cambio que las consume. Mínimo de la entrega: todas consumidas. Las marcadas *(supuesto)* son asignaciones del orquestador por el nombre del cambio; Product owner las confirma al escribir el resumen.

| Operación | `operationId` | Cambio | Estado del cambio |
|---|---|---|---|
| `GET /offerings` | `listOfferings` | `add-landing` (verificadas); `add-offering-catalog` y `add-filter-controls` *(supuesto)* | Mergeado / por diseñar |
| `GET /taxonomies` | `listOlfactoryTaxonomies` | `add-landing`; `add-specialist-evaluations` | Mergeado / resumen |
| `POST /logout` | `logOut` | `add-auth` | Apply |
| `GET /user` | `getTheAuthenticatedUser` | `add-auth`; `add-user-account` | Apply / por diseñar |
| `POST /register` | `registerAUser` | `add-user-account` | Borrador |
| `PUT /user` | `updateAUser` | `add-user-account` | Borrador |
| `PUT /user` (contraseña) | `updateUserPassword` | `add-user-account` | Borrador |
| `DELETE /user` (desactivar) | `deactivateAUser` | `add-user-account` | Borrador |
| `DELETE /user` (borrado definitivo) | `permanentlyDeleteAUser` | `add-user-account` | Borrador |
| `GET /evaluations` | `listEvaluations` | `add-specialist-evaluations`; filtro en `add-filter-controls` | Resumen / por diseñar |
| `POST /evaluations` | `createAnEvaluation` | `add-specialist-evaluations` | Resumen |
| `GET /evaluations/{id}` | `getAnEvaluation` | `add-specialist-evaluations` | Resumen |
| `PUT /evaluations/{id}` | `updateAnEvaluation` | `add-specialist-evaluations` | Resumen |
| `PATCH /evaluations/{id}` | `closeAnEvaluation` | `add-specialist-evaluations` | Resumen |
| `DELETE /evaluations/{id}` | `deleteAnEvaluation` | `add-specialist-evaluations` | Resumen |
| `GET /offerings/{id}` | `getAnOffering` | `add-offering-catalog` (página de detalle) *(supuesto)* | Por diseñar |
| `POST /offerings` | `createOfferings` | `add-offering-management` *(supuesto)* | Por diseñar |
| `DELETE /offerings/{id}` | `deleteAnOffering` | `add-offering-management` *(supuesto)* | Por diseñar |
| `DELETE /offerings` (varias) | `deleteMultipleOfferings` | `add-offering-management` *(supuesto)* | Por diseñar |
| `GET /locations` | `listMyLocations` | `add-offering-management` *(supuesto)* | Por diseñar |
| `GET /coffeeInventory` | `listCoffeeInventory` | `add-offering-management` *(supuesto)* | Por diseñar |
| `GET /coffees` | `listCoffees` | `add-offering-management`; `add-filter-controls` (filtros de ofertas) | Por diseñar |
| `GET /roasteries` | `listRoasteries` | `add-offering-management`; `add-filter-controls` (filtros de ofertas) | Por diseñar |

Las rutas con `{id}` y los paréntesis son orientativos; la fuente es el `operationId` en el contrato. La entrada "Mejor valorados" de la cabecera tampoco tiene cambio asignado *(supuesto: `add-offering-catalog`)*.
