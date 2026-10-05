# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: en qué fase está cada uno, qué falta y quién lo tiene. Complementa `docs/general-context.md` (contexto y decisiones) y el `handoff.md` de cada cambio (detalle de cada sesión).

**Última actualización:** 2026-10-06, orquestador (Claude Code).

## Cómo se usa

- Una fila por cambio, en orden de prioridad para la entrega.
- Quien cambia la fase de un cambio actualiza su fila en el mismo momento: el orquestador al cerrar una sesión, Product owner al decidir.
- **Agente** es quien tiene el siguiente paso, no quien hizo el último.
- **Bloqueo** remite a la pregunta del handoff (`Q<n>`) o a la decisión pendiente; "—" si no hay.
- Al mergear un cambio, su fila pasa a "Cerrados".

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
| Arquitecto (OpenCode) | `opencode run --agent architect`, MiMo | Worktree local |
| Build (OpenCode) | `opencode run --agent build`, MiMo | Worktree local |
| Claude nube | Sesión `claude --cloud` como arquitecto o build | Rama `claude/<change-id>-<tarea>` en GitHub |
| Orquestador | Claude Code local: decide dentro de su autoridad, verifica, integra, handoff | Worktree local |
| Product owner | Decisiones, revisión de artefactos, navegador, lanza sesiones en la nube, merges | — |

### Fila vacía (copiar)

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|
| `<change-id>` | `<cap>` | `feature/<change-id>` / `<carpeta>` | `<fase>` | `<qué está hecho>` | `<fase siguiente>` | `<agente>` | `<Q<n> o —>` | `<hash>` |

## Tablero

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|
| `add-auth` | auth, app-shell | `feature/add-auth` / `tazavera-front` (y `tazavera-front-auth` en detached HEAD) | Apply | 1.1–6.2 hechas (6.1–6.2 en la nube). Rondas 1–3 procesadas | Apply: 7.1, luego 8.1–8.16; 8.17 de Product owner | Claude nube o Build (OpenCode), a decidir | Elegir ejecutor del resto del apply. Q-merge al mergear `develop` | `2cbb293` |
| `add-specialist-evaluations` | evaluations | `feature/add-specialist-evaluations` / `tazavera-front-evaluations` | Resumen | Resumen revisado ("ready to repropose"); falta aplicar los cambios del 6 oct | Propose | Product owner (resumen), luego Arquitecto | — | `08c62a9` |
| `add-evaluation-scales` | form-fields | — | Resumen | Sin resumen | Resumen | Orquestador (redacta desde el MVC) | Diálogo: shadcn AlertDialog o propio | — |
| `add-user-account` | user-account | — | Resumen | Borrador de `design-summary.md` sin commitear | Revisión del resumen | Product owner | 9.5, 9.7 (`tokensExpireIn`), 9.8 | — |
| `add-filter-controls` | filtering | — | Resumen | Por escribir; incluye el filtro de evaluaciones | Resumen | Product owner | — | — |
| `add-offering-management` | offering-management | — | Resumen | Por escribir | Resumen | Product owner | — | — |
| `add-offering-catalog` | offering-catalog | — | Resumen | Por escribir | Resumen | Product owner | — | — |

Operaciones sin cambio asignado: `GET /coffees`, `GET /roasteries`.

## Cerrados

| Cambio | Capabilities | Archivado | Merge en `develop` | Pendiente tras el merge |
|---|---|---|---|---|
| `add-form-fields` | form-fields | Sí | Sí | — |
| `add-app-shell` | app-shell | Sí | Sí | — |
| `refine-app-header` | app-shell | `27ca840` | `124c048` | R4 (radio del panel) en el backlog |
| `add-landing` | landing, content-structure, feedback, app-shell | `f6bce3b` | `2284399` | D4 (puntuación dos veces en la tarjeta); candidato de backlog: primitivo de sección compartido |
