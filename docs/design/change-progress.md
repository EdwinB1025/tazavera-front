# Progreso de cambios

Tablero de los cambios OpenSpec de tazavera-front: solo lo que **no está resuelto**. Lo cerrado (archivado y en `develop`) sale del tablero: sus decisiones están en `openspec/changes/archive/`, en el handoff de cada cambio, en el registro de decisiones de `docs/design/general-context.md` y en el historial de git de este archivo.

**Última actualización:** 2026-11-05 — Tablero reducido a lo no resuelto (Product owner). Sesión del orquestador en espera por orden del Product owner (permisos de la sesión en revisión). Loop de asignación: job de sesión `88357f17`. Ninguna rutina programada ni ejecutor activo.

## Tablero

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|
| `add-register-landing` (R91, `Change`) | user-account, app-shell, landing | `feature/add-register-landing` / `tazavera-front-register-landing` | Revisión de artefactos | Propose integrado (`0c24bc4a`). Product owner: Q6 = A, Q7 = A, Q8 = A. Limpieza A1–A3 sin commit en el worktree. Peso del apply: largo (tres capabilities, ~15 tareas) → nube | (1) revisión del design lead del resultado del propose; (2) mensaje de revisión al arquitecto (Q6–Q8) y comprobación de duplicados; (3) apply en la nube | Orquestador → design lead, arquitecto | Ninguno del Product owner; crear rutinas en la nube (`RemoteTrigger` `create`) sin probar todavía en modo `default` | `7a8d53cd` |
| `require-first-location-on-registration` (R45, `Change`) | user-account, offering-management | — | En cola | Aceptado (2026-10-29), opción A, solo front: tras `POST /register` (con `token`) la cafetería crea su primera ubicación con `POST /locations` | Resumen — borrador (design lead) | Orquestador | Espera a que R91 llegue a `develop` (misma pantalla de registro) | — |
| `add-locale-e2e-test` (R1, `Change`) | testing | — (resumen en `develop`) | Resumen — borrador | Borrador `a661d9a1` con 9 puntos abiertos | Resumen — aprobado (commit del Product owner) | Product owner | Bloquean el propose: **1** dependencia `@playwright/test` (rec. A: versión exacta, solo Chromium); **3** rama base (R74 ya está en `develop`); **4** tercera suite y delta de `testing` (rec. A) | `a661d9a1` |
| R90 (dos cascadas de origen en las facetas) | filtering | — | Backlog | Parte front de dos entradas del backlog del API | — | Product owner | Cambios del API primero (filtros de municipio y de origen del tostador) | — |
| R83 (el API acepta cualquier descriptor por eje) | — (API) | — | Backlog | Hallazgo del Product owner (2026-10-13) | — | Product owner | ¿Se hace? | — |

## Espera al Product owner (sin respuesta registrada)

| # | Qué | Pregunta exacta |
|:-:|---|---|
| 1 | Lista Q7 del handoff de R74 (13 comprobaciones de R74 y revisión visual de R77–R82 y R81 en producción) | ¿Está hecha? Si lo está, sale del tablero |
| 2 | Ramas `claude/*` sin integrar a propósito: `unify-bean-outline`, `r64-list-spacing-analysis`, `share-active-locale-refactor`, `test-reduction-plan`; y `add-register-landing-propose` (ya integrada) | ¿Las borras en GitHub? (es tuyo) |
| 3 | Tarea del API (2026-10-11): la landing del front como sitio de retorno del callback | ¿Hecha? El orquestador solo actúa si cambia el contrato |
| 4 | Test intermitente `EvaluationForm.test.tsx` (falló una vez y pasó al repetir, 2026-10-11) | ¿Entrada en el backlog o se descarta? |

## Cobertura del contrato

Todas las operaciones de `contracts/openapi.yaml` están consumidas y en `master`, salvo `listTheEvaluationsOfAUser` (fuera del alcance, Product owner, 2026-10-06). R91 y R45 no añaden operaciones; R45 consume `registerAUser` y `createALocation`, ya cubiertas.

## Formato de fila

| Cambio | Capabilities | Rama / worktree | Fase | Estado | Siguiente fase | Agente | Bloqueo | Último commit |
|---|---|---|---|---|---|---|---|---|

- **Agente** es quien tiene el siguiente paso. **Bloqueo** remite a la pregunta del handoff (`Q<n>`) o es "—".
- Fases: Resumen (borrador, en revisión, aprobado) → Propose → Revisión de artefactos → Apply → Ronda N → Verify → Archive → Merge (`docs/agents/workflow_sdd.md` §3a y §3b).
- Al mergear un cambio en `develop`, su fila sale del tablero.
