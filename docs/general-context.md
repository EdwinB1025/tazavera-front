# Contexto general — tazavera-front

Contexto del orquestador para retomar el trabajo. Lo mantiene el orquestador (`.claude/CLAUDE.md` §12): se reescribe para seguir vigente, salvo el registro de decisiones del final, al que solo se añade. Fuentes de verdad que este archivo no repite:
- `docs/change-progress.md`: fase, responsable y bloqueo de cada cambio, y la cobertura del contrato.
- `docs/backlog.md`: lo usan los agentes según `.claude/workflow_sdd.md` §4. El build reporta candidatos, Product owner los añade y el arquitecto los retira al archivar el cambio que los resuelve.
- `.claude/CLAUDE.md` y `.claude/agents/design-lead.md`: reglas del orquestador y del design lead.
- `AGENTS.md` y `.claude/workflow_sdd.md`: reglas y flujo de los agentes OpenCode.
- El `handoff.md` y el `corrections.md` de cada cambio.

**Actualizado:** 2026-10-06.

## Estado

- **Entrega del bootcamp esta semana.** Mínimo: que el front consuma todas las operaciones del contrato. El contrato de `develop` tiene **23 operaciones, no 24**: aclarar qué cuenta el 24. El alcance no se reduce.
- **En `develop`:** `add-theme-tokens`, `add-base-control`, `add-focus-ring-utility`, `add-form-fields`, `add-app-shell`, `refine-app-header`, `add-landing`.
- **En Build:** `add-auth` (6.1–6.2 hechas en la nube; quedan 7.1 y 8.1–8.16).
- **Resúmenes por revisar o generar:** evaluations, user-account, evaluation-scales, filter-controls, offering-management, offering-catalog.

## Al retomar

1. Leer el tablero y aplicar `.claude/CLAUDE.md` §9: prioridad, ejecutores, límites del plan y pipeline de diseño.
2. **Auth:** asignar 7.1 y 8.x (nube u OpenCode). Al mergear `develop`, aplicar la entrada Q-merge del registro.
3. **Design lead:** revisar evaluations y user-account; generar los otros cuatro resúmenes.
4. **Carpetas:**
   - `tazavera-front` está en `develop`.
   - `tazavera-front-auth` está en detached HEAD en `feature/add-auth`.
   - Borrar las carpetas vacías `tazavera-front-header` y `tazavera-front-landing` cuando se cierren sus sesiones.
5. **GitHub:** `claude/add-auth-6.1-6.2-55prgc` ya está integrada. La rama local `feature/add-app-shell` está mergeada. Se borran con el "sí" de Product owner.
6. **Entorno de la nube:** `remote.defaultEnvironmentId` de los settings de usuario (`env_01JQuvJM…`) no coincide con el Default configurado (`env_01DTNNGR…`). Corregir con `/remote-env`.
7. **Seguridad:** revocar la clave de API expuesta (quitada de `~/.bash_profile`), si no está hecho.
8. **Candidato a backlog pendiente de Product owner:** primitivo de sección compartido. `HomeScreen.tsx` y `AboutContent.tsx` duplican las clases de sección y contenedor (D14 de landing).

## Forma de trabajar

- Claude elabora requerimientos; Product owner decide. Nada entra en el alcance sin su "sí". Lo no verificado se marca.
- Resúmenes de diseño en inglés en `docs/design/<change-id>/`, con estado `draft` y `approved`. Sin resumen aprobado no hay propose.
- Antes de cada archive: comprobación de Product owner en navegador real, con capturas a 375px y 1280px.
- Una vez empezado el Build, los cambios de decisiones van por `corrections.md` (Round N), salvo lo que el orquestador puede cerrar (§3).
- Etiquetas de la interfaz desde el catálogo y por props; los valores de la API se muestran tal cual (incluido `roastLevel`).
- Git: siempre `cd` explícito al worktree y comprobar la rama; nunca un merge con una sesión de Build activa en esa rama.
- **Lección de landing:** jsdom no ve el layout. Hay revisión visual tras cada tarea de UI, y ningún elemento nuevo sin márgenes, padding, gaps y bordes.

## Proyecto

- Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind 4, Vitest + RTL, FSD. Git Bash en Windows (`taskkill //PID <n> //F`). Base `C:\Porjects\Full Stack\Sprint5\`.
- **GitHub:** `EdwinB1025/tazavera-front` (privado), remoto `origin`, rama por defecto `develop`. Claude GitHub App instalada.
- **Contrato y tipos:** `develop` tiene el contrato y `schema.ts` regenerados (`a2de7cb`; Scribe: `APP_LOCALE=en php artisan scribe:generate`). En una carpeta nueva, `npx tsc --noEmit` falla hasta ejecutar `npx next typegen`.
- **Verificación visual:** la base de datos local no tiene ofertas. Se usa una API simulada de las lecturas y capturas por el protocolo DevTools (emulación real de 375px). Los scripts eran de sesión: recrearlos o guardarlos en `tools/`.
- **OpenCode:** `xiaomi/mimo-v2.6-pro` para el arquitecto y el build (GLM 5.2 descartado). El proveedor a veces se cuelga sin error (CPU a cero, log vacío): parar a los 15–20 min sin salida y relanzar. OpenCode Desktop deja huérfano `opencode-cli serve --service`.
- **Nube:**
  - Entorno Default, red Trusted, `NEXT_PUBLIC_API_URL=http://localhost:8000`, script de setup vacío (corre fuera del repo). El prompt arranca con `npm ci` y `npx next typegen`.
  - Product owner lanza las sesiones (`claude --cloud` exige terminal interactiva).
  - Detalle en `.claude/CLAUDE.md` §10.
- **Límites del plan Pro:** la barra de estado guarda el uso en `~/.claude/usage-snapshot.json` (5 h y 7 días). Reglas en `.claude/CLAUDE.md` §9.

## Decisiones de producto abiertas o vigentes

**add-auth:**
- **Vigentes:** ventana emergente, `/callback` con dos modos, COOP `same-origin-allow-popups` como delta de `app-shell`, nonce extendido a `/callback`.
- **Riesgo abierto:** el COOP de la API sin verificar en vivo (tarea 8.17).

**add-landing:** D4 abierto. El chip de valoración muestra `cuppingAvg`, así que la puntuación sale dos veces en la tarjeta. Si se cambia, en un cambio nuevo.

**add-specialist-evaluations (6 oct):**
- Sabores básicos sin límite.
- Descriptores desde `GET /taxonomies` por `categories` (`aromatics`, `main_tastes`, `mouthfeel`, `defects`):
  - nivel 0 con hijos de nivel 1 en la categoría → una fila, con esos hijos como chips;
  - nivel 0 sin hijos en la categoría → chips en una fila compartida;
  - el nivel 2 no se muestra.
- El diálogo de borrado va en `add-evaluation-scales`.

**add-evaluation-scales:** abierto si se usa shadcn AlertDialog o un componente propio.

**add-user-account:**
- **Cerrados:** 9.1 (`POST /register` en camelCase, `role` opcional) y 9.6 (contactos fuera).
- **Recomendados:** 9.2 ("cuenta creada" con botón de iniciar sesión) y 9.3 (step-up al enviar cada escritura).
- **Pendientes:** 9.7 depende de `tokensExpireIn`; 9.5 y 9.8 son de Product owner. Hay que verificar la clave del 422 de contraseñas.

**API:**
- `SESSION_LIFETIME=2`, `SESSION_EXPIRE_ON_CLOSE=true`, `FRONT_URL=http://localhost:3000`.
- Pendientes: `redirect_uri` de Passport = `{front}/callback`; que el login no envíe COOP.

## Registro de decisiones del orquestador

Solo se añade (`.claude/CLAUDE.md` §8). Una entrada por decisión del orquestador, o respuesta de Product owner, que afecta a otro cambio o a un diseño. "Afecta" nombra los cambios y los puntos de diseño.

### 2026-10-05 — add-auth
- **Decisión:** el punto de enganche de la sesión en `src/app/shell` es un `SessionShell.tsx` nuevo (`"use client"`). Llama a `useSession()` y pinta `ShellChrome` y la región del sidebar. `AppShell.tsx` sigue siendo Server Component: resuelve los textos del catálogo y se los pasa a `SessionShell`, junto con el override `session?`.
- **Por qué:** respuesta de Product owner a Q12–Q14, ronda 2 de add-auth (`dd8b126`).
- **Afecta:** refine-app-header (ya mergeado; el nombre del selector de idioma se compone en `AppShell.tsx`).

### 2026-10-06 — add-landing / refine-app-header → add-auth (Q-merge)
- **Decisión:** cuando auth mergee `develop`, hay que conservar dos cosas:
  - el arreglo de altura del shell de header (`cd536d2`, test `2d0da3f`), llevado de las clases de `AppShell.tsx` a `SessionShell.tsx`;
  - el hijo de relleno de landing en `AppShell.test.tsx`.

  El conflicto no se resuelve tomando el lado de auth. `src/shared/api/index.ts` se mergea solo; correr `tsc` después.
- **Por qué:** simulación de merge (`git merge-tree`) del 6 oct; aprobado por Product owner.
- **Afecta:** add-auth.

### 2026-10-06 — add-landing (D14)
- **Decisión:** layout de página común: secciones a todo el ancho, contenedor centrado de 72rem como máximo, padding lateral de 1rem/2rem, vertical de 3rem/4rem, y huecos explícitos entre grupos.
- **Por qué:** ronda 3 de add-landing.
- **Afecta:** todos los diseños de páginas nuevas (offering-catalog, user-account, evaluations).
