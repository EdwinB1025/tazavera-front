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
| `add-auth` | auth, app-shell | `feature/add-auth` / `tazavera-front-auth` | Apply → Verify | 1.1–8.16 hechas; F1 integrado; 8.17 aceptada por Product owner (handoff, `ba94fd9`). Nube 12:52: checkbox 8.17 + verify (rama `claude/add-auth-817`) | Revisar e integrar la nube; archive cuando lo pida Product owner; merge final con Q-merge | Claude nube | — | `ba94fd9` |
| `refactor-badge-geometry` | feedback | `feature/refactor-badge-geometry` / `tazavera-front-badge` | Apply | 1.1–4.1 hechas (OpenCode, tests en verde). Nube 12:52: 5.1 (rama `claude/refactor-badge-geometry-5.1`) | Integrar 5.1; 5.2 (capturas del orquestador); verify, archive | Claude nube, luego orquestador | — | `dee343a` |
| `fix-button-boundaries` | base-controls | `feature/fix-button-boundaries` / `tazavera-front-buttons` | Propose hecho | Propose `13a054f`. Mock-up de botones: HTML en el scratchpad de la sesión del 6 oct, sin capturar | Capturar el mock-up, revisión de Product owner, apply | Orquestador, luego Product owner | Mock-up antes del apply | `13a054f` |
| `extract-offering-list-parts` | content-structure | `feature/extract-offering-list-parts` / `tazavera-front-listparts` | Apply | 1.1 hecha; 1.2 movida a 4.2 (capturas del orquestador, `ea1d370`). Nube 13:05: 2.1–4.1 (rama `claude/extract-offering-list-parts-apply`) | Integrar la nube; 4.2 capturas; verify, archive | Claude nube, luego orquestador | — | `61de4f6` |
| `add-evaluation-scales` | form-fields, feedback | `feature/add-evaluation-scales` / `tazavera-front-scales` | Propose hecho | Propose `d3cce1e` (form-fields) y `706b99b` (feedback), sin revisar aún | Revisión del propose; apply cuando `refactor-badge-geometry` esté en `develop` | Orquestador | `refactor-badge-geometry` | `706b99b` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Explore + Propose | Respuestas del 6 oct commiteadas (`c379a98`); contrato con fechas en `develop` (`2d7d8b8`). Nube 13:08: explore y propose (rama `claude/add-specialist-evaluations-propose`) | Revisar e integrar; apply tras scales, list parts, badge, auth y `develop` mergeados | Claude nube | Q9 (referencia visual del formulario, no bloquea propose) | `33f505c` |
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
