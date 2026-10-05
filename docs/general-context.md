# Contexto general — tazavera-front: estado, decisiones y flujo de agentes

Para pegar al inicio de la próxima conversación. Adjuntar según el tema: `handoff.md` y `corrections.md` del cambio, `.claude/CLAUDE.md` y `.claude/settings.local.json` del orquestador, `AGENTS.md`, `docs/workflow_sdd.md`, `contracts/openapi.yaml`.

**Estado (6 oct 2026, actualizado por el orquestador).** Entrega del bootcamp esta semana; mínimo: que el front consuma todas las operaciones del contrato. El contrato de `develop` tiene **23 operaciones (`operationId`), no 24**: aclarar qué cuenta el 24. El alcance no se reduce.
- **Mergeados en `develop`:** `add-form-fields`, `add-app-shell`, `refine-app-header` (`124c048`) y `add-landing` (`2284399`, HEAD de `develop`).
- **En Build:** `add-auth`, 6.1–6.2 hechas en la nube (piloto).
- **Pendiente de propose:** `add-specialist-evaluations`.

## Primero, al retomar

1. **Auth:** quedan la 7.1 y la 8.1–8.16 (la 8.17 es de Product owner). Decidir si siguen en la nube (en lotes: 7.1, luego 8.x) o con OpenCode. Cuando auth mergee `develop`, aplicar Q-merge (sección 5).
2. **Rama de la nube ya integrada:** `claude/add-auth-6.1-6.2-55prgc` sigue en GitHub; borrarla si Product owner lo confirma.
3. **Carpetas:** `tazavera-front` está ahora en `feature/add-auth` (lo movió Product owner), `tazavera-front-auth` en detached HEAD en el mismo commit, y **`develop` no está en ninguna carpeta**. Para merges a `develop` hace falta volver a sacarlo. Quedan vacías `tazavera-front-header` y `tazavera-front-landing` (bloqueadas por shells abiertos): borrarlas al cerrar esas sesiones.
4. **Landing, D4:** el chip de valoración muestra `cuppingAvg`, así que la puntuación sale dos veces en la tarjeta. Pendiente de decisión de Product owner; si se cambia, va en un cambio nuevo.
5. **Evaluations:** aplicar al resumen los cambios de la sección 5, commitearlo y lanzar el propose (último commit `08c62a9`, "ready to repropose").
6. **Scales:** sesión del orquestador para redactar el resumen de `add-evaluation-scales` a partir del MVC.
7. **Reglas del orquestador para la nube:** la propuesta (sección 9 de `.claude/CLAUDE.md` y excepción de push en §3) está sin aplicar; Product owner la revisa y la aplica él. La versión aplicada por error fue revertida.
8. **Seguridad:** revocar en la Claude Console la clave de API expuesta (quitada de `~/.bash_profile`), si aún no está hecho.
9. Pendientes anteriores: `.opencode/agents/build.md` y `architect.md` (las definiciones no se tocan); anotar en las notas de la API la vida del access token de Passport (`tokensExpireIn`), que también decide el punto 9.7 de user-account.

## 1. Forma de trabajar

- Claude solo elabora requerimientos; Product owner decide. Nada entra en el alcance sin su "sí". Fuentes verificadas antes de objetar; lo no verificado se marca.
- Resúmenes de diseño en inglés, en `docs/design/<change-id>/`, commiteados en la rama del cambio. `design-summary.md` y `corrections.md` los verifican y commitean Product owner y Claude, nunca el orquestador. Excepción vivida: con instrucción expresa de Product owner, el orquestador escribió las rondas 2–4 de landing.
- Antes de cada archive: comprobación de Product owner en un navegador real, con la referencia visual y capturas a 375px y 1280px.
- Una vez empezado el Build, los cambios de decisiones van por `corrections.md` (Round N), salvo los puntos que el orquestador puede cerrar solo (sección 3).
- Componentes generales en `src/shared/ui/` (`form-fields`, `content-structure`, `feedback`); cada feature solo los usa.
- Etiquetas de la interfaz desde el catálogo del front y por props; los valores de los campos se muestran como los devuelve la API (incluido `roastLevel`).
- Comandos git: siempre con `cd` explícito al worktree y comprobando la rama; nunca un merge en un worktree con una sesión de Build activa.
- Commits del Build con el scope de la capability del encabezado de sección en `tasks.md`; en secciones sin capability, la del cambio.
- **Lección de landing:** los tests en jsdom no ven el layout. El orquestador revisa la página renderizada tras cada tarea de UI (capturas headless) y, en el explore, señala resúmenes que no fijan contenedor, márgenes, separaciones ni rejillas.

## 2. Proyecto

- Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind 4, Vitest + RTL, FSD. Git Bash en Windows (`taskkill //PID <n> //F`, con doble barra). Base `C:\Porjects\Full Stack\Sprint5\`.
- **GitHub:** `EdwinB1025/tazavera-front` (privado), remoto `origin`, rama por defecto `develop`. Subidas: `develop`, `master`, `feature/add-auth`, `feature/add-specialist-evaluations`. Claude GitHub App instalada.
- **Worktrees:** `tazavera-front` (hoy en `feature/add-auth`), `tazavera-front-auth` (detached), `tazavera-front-evaluations` (`feature/add-specialist-evaluations`). Header y landing eliminados tras su merge.
- `develop` tiene el contrato y `schema.ts` regenerados desde la API (`a2de7cb`; Scribe en inglés: `APP_LOCALE=en php artisan scribe:generate`), incluido `/coffees`. En una carpeta recién creada, `npx tsc --noEmit` falla hasta ejecutar `npx next typegen`.
- **Verificación visual sin datos reales:** la base de datos local no tiene ofertas. Landing se revisó con una API simulada (6 ofertas verificadas en `/offerings`, `/taxonomies` reenviado a la API real) y capturas con Chrome por el protocolo DevTools (emulación real de 375px; una ventana headless normal no baja de unos 500px). Los scripts vivían en el scratchpad de la sesión y se pierden con ella: recrearlos o guardarlos en `tools/` si se quieren reutilizar.

## 3. Orquestador (Claude Code)

- Prompt base en `.claude/CLAUDE.md` + un prompt de tarea por sesión. Copiado con `settings.local.json` y `.claude/agents/` a los worktrees. Diseño y borradores en `docs/design/define-agent-roles/`.
- **Dos agentes Claude (6 oct):**
  - **Orquestador:** la sesión principal. Asigna cada fase del tablero (§9) a OpenCode, a la nube o al design lead, según las dependencias, la prioridad y los límites del plan.
  - **Design lead:** subagente `.claude/agents/design-lead.md`. Se ocupa de los resúmenes (pipeline: borrador, revisión, aprobado por Product owner antes de propose), la revisión visual, los prompts de la nube y las dependencias. Sus criterios: espaciado primero, los mismos criterios de resolución que el orquestador, reutilizar antes de añadir, contraste sin dilatación, y como fuentes el MVC, la API y las specs.
- **Límites del plan Pro:**
  - La barra de estado guarda el uso en `~/.claude/usage-snapshot.json` (5 h y 7 días).
  - OpenCode se usa en cualquier momento y en paralelo. La nube hace los cambios pesados. Claude local solo orquesta y verifica.
  - Con un 80 % o más de uso, la nube asume el rol de design lead.
- Arrancar siempre desde una carpeta con `.claude/`. `--permission-mode dontAsk` para sesiones desatendidas; modo normal para merges. Antes de `claude`: `unset ANTHROPIC_API_KEY`; `/status` debe mostrar la suscripción.
- **Ejecuciones en paralelo permitidas.** OpenCode Desktop deja huérfano `opencode-cli serve --service` al cerrarse: terminarlo a mano y mantener la app cerrada durante las sesiones.
- **Proveedor de OpenCode (`xiaomi/mimo-v2.6-pro`):** se quedó sin saldo una vez ("Insufficient account balance") y a veces el stream se queda colgado sin error (CPU a cero, log vacío). OpenCode no tiene timeout. Si una ejecución no escribe nada en unos 15–20 min, pararla y relanzar (diagnóstico en el handoff de auth, D17–D18).
- **Autoridad del orquestador:** cierra puntos bloqueantes sin ronda cuando lo acordado no se puede construir tal cual o dos artefactos se contradicen (sin alcance, dependencias, colores ni cambios visibles; sin seguridad ni API), y lo registra como "Closed for review". Arregla redacción y orden de artefactos sin cambiar lo que exigen. Elimina duplicados exactos. En fallos de contraste, prepara el arreglo medido por script.
- **Nunca** edita sus propias reglas ni se amplía permisos: los cambios a `.claude/CLAUDE.md` se le pasan a Product owner como texto para revisar. Nunca resuelve un conflicto de merge sin autorización expresa para esa resolución concreta.
- Commits del orquestador: el handoff tras cada actualización; arreglos de artefactos durante el apply; eliminación de duplicados. Siempre `git add <ruta exacta>`.
- **Registros que mantiene el orquestador** (`.claude/CLAUDE.md` §12, en `develop`, commit y push propios):
  - `docs/change-progress.md`, la fuente de verdad del progreso de los cambios;
  - `docs/orchestrator-decisions.md`, solo añadir; alimenta los diseños;
  - este `docs/general-context.md`, al final de cada sesión.
- **Permisos:** Product owner los cambió el 6 oct para permitir los push del flujo con la nube (detalle en `.claude/settings.local.json`). Merges a `develop` siempre con confirmación de Product owner.
- Reglas con agentes: no preguntan en la sesión (escriben la pregunta en su informe y paran); sin pipes en shell; las definiciones de `.opencode/agents/` nunca se tocan; no se commitean `.claude/` ni los perfiles restringidos.

## 4. Flujo híbrido con la nube (Claude Code on the web)

- **Decidido el 6 oct:** OpenCode sigue con los apply normales. Las rondas de corrección y los refactors van a sesiones de Claude en la nube. A veces el orquestador asume el rol de arquitecto o build en la nube. El orquestador integra las ramas `claude/*` con `git merge --ff-only`.
- **Ciclo:**
  1. El orquestador commitea y sube la rama del cambio.
  2. Product owner lanza la sesión. `claude --cloud` exige terminal interactiva, así que el orquestador no puede lanzarla: entrega el prompt listo. Desde terminal se lanza desde la carpeta que ya tiene la rama; `--cloud` clona la rama actual desde GitHub, no la copia local.
  3. La nube trabaja en su propia rama `claude/<change-id>-<tarea>` (GitHub le añade un sufijo) y la sube.
  4. El orquestador hace `git fetch`, revisa los commits (orden test → implementación, solo archivos permitidos, formato), repite los checks en un worktree temporal y verifica en local lo que la nube no puede (API, mock, capturas).
  5. Integra con `--ff-only`, sube la rama y actualiza el handoff.
- **Entorno de la nube:** `Default` (`env_01DTNNGR37Cgqdaa5ym4Zagr`), red Trusted, variable `NEXT_PUBLIC_API_URL=http://localhost:8000`. **Script de setup vacío:** los setup scripts corren fuera del repositorio (no ven `package-lock.json`). El prompt de cada sesión empieza con `npm ci` y `npx next typegen`. Alternativa documentada: un hook SessionStart en `.claude/settings.json` del repo (cambio de configuración, requiere aprobación).
- **Lo que viaja a la nube:** `AGENTS.md` y el `CLAUDE.md` raíz sí; `.claude/CLAUDE.md` del orquestador no (está excluido de git), así que el prompt incluye las reglas que apliquen.
- **Límites:** la nube no ve esta máquina (API, mock, servidor de desarrollo). Comparte los límites de uso del plan; no hay cargo aparte por la VM.
- **Piloto (6 oct):** auth 6.1–6.2. Commits `3f433ec` (test) y `68130c9` (feat), 808 tests en verde en local, integrados por fast-forward y subidos (`feature/add-auth` en `2cbb293`).

## 5. Cambios

| Cambio | Estado |
|---|---|
| `add-form-fields`, `add-app-shell` | Mergeados |
| `refine-app-header` | Archivado y mergeado (`124c048`). Incluye la navegación principal como ítems de cabecera y el shell a toda la altura de la ventana |
| `add-landing` | Archivado y mergeado (`2284399`). Rondas 1–4: tipos derivados (D2), delta de `app-shell` "Root of a supported locale", layout de página (D14: contenedor de 72rem, secciones, rejilla de tarjetas 1/2/3, tarjeta apilada), y etiqueta de taxonomía por tema medida sobre el fondo renderizado (720 pares ≥ 4,5:1). Abierto: D4 |
| `add-auth` | 1.1–6.2 hechas (6.1–6.2 en la nube). Quedan 7.1 y 8.1–8.16; 8.17 es de Product owner. Rondas 1–3 procesadas |
| `add-specialist-evaluations` | Resumen listo con los cambios de esta sección; propose pendiente |
| `add-evaluation-scales` | Por redactar por el orquestador: escala de granos, slider, grupo de chips de descriptores y diálogo de confirmación (`form-fields`) |
| `add-filter-controls` | Por escribir; incluye el filtro de evaluaciones |
| `add-user-account` | Borrador de `design-summary.md` (6 operaciones), sin commitear |
| `add-offering-management`, `add-offering-catalog` | Por escribir |

Operaciones sin cambio asignado: `GET /coffees` y `GET /roasteries`.

## 6. Decisiones

**add-auth:**
- **Ronda 2 (Q12–Q14):** `SessionShell.tsx` (`"use client"`) en `src/app/shell` llama a `useSession()` y pinta `ShellChrome` y la región del sidebar. `AppShell.tsx` sigue siendo Server Component y le pasa textos y el override `session?`.
- **Q17:** la edición parcial de la 6.1 se descartó; la nube rehízo la 6.1.
- **Q-merge, abierto:** cuando auth mergee `develop`, se espera conflicto en `AppShell.tsx` y `AppShell.test.tsx`:
  - El arreglo de altura de header (`cd536d2`, test `2d0da3f`) vive en clases de `AppShell.tsx` y tiene que pasar a `SessionShell.tsx`, o se pierde.
  - Se mantiene el hijo de relleno de landing en `AppShell.test.tsx`.
  - `src/shared/api/index.ts` se mergea solo; correr `tsc` después.
- Decisiones anteriores sin cambios: ventana emergente, `/callback` con dos modos, COOP `same-origin-allow-popups` como delta de `app-shell`, nonce extendido a `/callback`. Riesgo abierto: COOP de la API sin verificar en vivo (tarea 8.17).

**add-landing:** D4 pendiente (ver "Primero, al retomar").

**add-specialist-evaluations (6 oct):**
- Sabores básicos sin límite: se quita "(max 2)" de la tabla de la §2 y la frase de los chips deshabilitados de la §3.
- §3, regla genérica de descriptores: `GET /taxonomies` devuelve el árbol entero sin filtros. Por bloque se toman los nodos de nivel 0 y 1 cuya `categories` contiene `aromatics`, `main_tastes`, `mouthfeel` o `defects` (un nodo puede estar en varias).
  - Cada nodo de nivel 0 con algún hijo de nivel 1 en la categoría es una fila, con esos hijos como chips (aunque el padre no esté en la categoría).
  - Los nodos de nivel 0 de la categoría sin hijos en ella son chips, en una fila compartida.
  - El nivel 2 no se muestra.
- Diálogo de confirmación del borrado: en `add-evaluation-scales`.
- Resto sin cambios.

**add-evaluation-scales:** abierto para Product owner: shadcn AlertDialog o componente propio para el diálogo.

**add-user-account:** las seis operaciones coinciden con el contrato.
- **Cerrados:**
  - 9.1: `POST /register` con campos en camelCase; `role` opcional.
  - 9.6: contactos fuera.
- **Recomendados:**
  - 9.2: "cuenta creada" con botón de iniciar sesión.
  - 9.3: step-up al enviar cada escritura.
- **Otros:**
  - 9.4: el diálogo de scales.
  - 9.7: depende de `tokensExpireIn`.
  - 9.5 y 9.8: de Product owner.
- **Por verificar:** la clave del 422 de contraseñas.

**API:**
- `SESSION_LIFETIME=2`, `SESSION_EXPIRE_ON_CLOSE=true`, driver `database`; "Recuérdame" se mantiene.
- `FRONT_URL=http://localhost:3000` confirmado en el `.env` de la API.
- Pendientes: `redirect_uri` del cliente Passport = `{front}/callback`; comprobar que el login de la API no envía COOP.

## 7. Backlog

**En `docs/backlog.md`:**
- R1–R4 en `develop`.
- R5 en `feature/add-auth`: derivación única del locale activo en `src/features/auth`.
- **Candidato nuevo de landing (sin añadir):** primitivo de sección compartido. `HomeScreen.tsx` y `AboutContent.tsx` duplican las clases de sección y contenedor (D14).

**Otros pendientes:**
- **Front:**
  - página 404 con marca y traducida;
  - `/callbackfoo` sin redirección;
  - limitación de jsdom con el foco de Radix;
  - colores del logo de la API a tokens;
  - traducciones es/ca del catálogo `shell`;
  - radio del panel base del DropdownMenu (16px frente a 8px).
- **Tests:**
  - test de extremo a extremo del cambio de idioma;
  - tests de la exclusión de `/callback` y del fallback de `connect-src`;
  - comentario y título de test de `tokens.test.ts` con tres campos.
- **Repositorio y herramientas:**
  - 5 vulnerabilidades de `npm audit` (revisar antes de entregar);
  - `.gitattributes` para LF;
  - hook SessionStart para `npm ci` en la nube.
- **Auth y API:**
  - descripción de `GET /evaluations` en Scribe;
  - entradas de `## Propose status` que faltan en auth;
  - cuerpo del commit `c77945d` con `Refs: add-auth` repetido.
- **Después del bootcamp:** BFF.
