# Contexto general — tazavera-front

Contexto del orquestador para retomar el trabajo. Lo mantiene el orquestador (`.claude/CLAUDE.md` §12): se reescribe para seguir vigente, salvo el registro de decisiones del final, al que solo se añade. Fuentes de verdad que este archivo no repite:
- `docs/change-progress.md`: fase, responsable y bloqueo de cada cambio, y la cobertura del contrato.
- `docs/backlog.md`: lo usan los agentes según `.claude/workflow_sdd.md` §4. El build reporta candidatos, Product owner los añade y el arquitecto los retira al archivar el cambio que los resuelve.
- `.claude/CLAUDE.md` y `.claude/agents/design-lead.md`: reglas del orquestador y del design lead.
- `AGENTS.md` y `.claude/workflow_sdd.md`: reglas y flujo de los agentes OpenCode.
- El `handoff.md` y el `corrections.md` de cada cambio.

**Actualizado:** 2026-10-06 13:45.

## Estado

- **Entrega del bootcamp esta semana.** Mínimo: que el front consuma todas las operaciones del contrato (23 en `develop`). El alcance no se reduce.
- **En `develop`:** `add-theme-tokens`, `add-base-control`, `add-focus-ring-utility`, `add-form-fields`, `add-app-shell`, `refine-app-header`, `add-landing`; contrato y tipos con `createdAt`/`closedAt` de evaluaciones (`2d7d8b8`).
- **OpenCode sin saldo desde el 6 oct 12:39.** Product owner: trabajar con la nube hasta que lo recargue.
- **Fases por cambio:** ver el tablero.

## Al retomar

1. **Bucle del orquestador** cada 15 min en la sesión (CronCreate, muere al cerrarla): revisar rutinas, integrar con `--ff-only` tras re-ejecutar tests, lint y tsc, asignar lo siguiente. En modo don't ask el design lead local no puede usar Bash: las capturas van a la nube (Chromium + API simulada).
   - Pendientes en la nube: `extract-offering-list-parts` 4.2 + verify (`trig_01JcQSWCXZMxRyahEB6NQEm8`, rama `claude/extract-offering-list-parts-4.2`); `add-auth` re-verify tras F2 (`trig_01RKwecou65A7MQbLASEifsM`, solo informe).
   - Estado: `RemoteTrigger list_runs` con el id y `get_run_log` para el informe.
2. **Listos para archivar cuando lo pida Product owner:** `refactor-badge-geometry` (8/8, verify sin CRITICAL; WARNING diferido, ver registro); `add-auth` tras el re-verify.
3. **Mock-up de `fix-button-boundaries`:** capturado (`docs/design/fix-button-boundaries/mockup/buttons-mockup-{375,1280}-{light,dark}.png`, worktree `buttons`, sin trackear); espera la revisión visual de Product owner (Open 2). Redacción de Risk 2/3 y §2 corregida sin commitear: entra en el commit de revisión del arquitecto.
4. **Revisar el propose de `add-evaluation-scales`** (`d3cce1e`, `706b99b`): Product owner.
5. **Esperan a Product owner:** evaluations B1–B3 del explore (B1: la evaluación no trae dueño en el contrato; B2–B3 en la sesión `session_01GHJ6upeYKZUVm3GjFNC7YW`); user-account, offering-management y offering-catalog (puntos abiertos de sus resúmenes); landing D4; archives.
6. **Servidor de desarrollo de auth** en `http://localhost:3000` desde el worktree `auth` (lanzado en la sesión del 6 oct; se cae al cerrarla).
7. **Pendientes antiguos:** borrar las carpetas vacías `tazavera-front-header` y `tazavera-front-landing`; en `develop` hay cambios sin commitear de Product owner (`docs/design/add-filter-controls/design-summary.md` rehecho por el design lead, borrados de `docs/design/define-agent-roles/`).

## Forma de trabajar

- Claude elabora requerimientos; Product owner decide. Nada entra en el alcance sin su "sí". Lo no verificado se marca.
- Resúmenes de diseño en inglés en `docs/design/<change-id>/`, con estado `draft` y `approved`. Sin resumen aprobado no hay propose.
- Antes de cada archive: comprobación de Product owner en navegador real, con capturas a 375px y 1280px.
- Una vez empezado el Build, los cambios de decisiones van por `corrections.md` (Round N), salvo lo que el orquestador puede cerrar (§3).
- Etiquetas de la interfaz desde el catálogo y por props; los valores de la API se muestran tal cual (incluido `roastLevel`).
- Git: comprobar la rama; nunca un merge con una sesión de Build activa en esa rama.
- **Permisos de la sesión local (`dontAsk`):** valen los comandos simples (`git -C`, `npm --prefix`, `node <archivo>`, un `cd` solo); se deniegan `cd` en comandos compuestos, `env -C`, prefijos `VAR=x`, `Start-Process`. OpenCode se lanza con el lanzador de node que fija `cwd`/`PWD` al worktree (memoria `opencode-launch-in-dontask`). Scribe se ejecuta desde la carpeta de la API (un `cd` solo antes). `Edit` está permitido salvo el `deny` de `.claude/settings.local.json` (código, configuración, `contracts/`, `openspec/specs/`, perfiles de agentes, reglas y permisos del orquestador, la app MVC).
- **Capturas:** las toma el orquestador y van en `docs/design/<change-id>/captures/` (Product owner, 6 oct). El Build no tiene navegador.
- **Propose sin esperar:** el orquestador lanza explore y propose de todo lo que esté listo sin aprobación previa; solo el apply espera la confirmación de Product owner (6 oct).
- **Lección de landing:** jsdom no ve el layout. Hay revisión visual tras cada tarea de UI, y ningún elemento nuevo sin márgenes, padding, gaps y bordes.

## Proyecto

- Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind 4, Vitest + RTL, FSD. Git Bash en Windows (`taskkill //PID <n> //F`). Base `C:\Porjects\Full Stack\Sprint5\`.
- **GitHub:** `EdwinB1025/tazavera-front` (privado), remoto `origin`, rama por defecto `develop`. Claude GitHub App instalada.
- **Contrato y tipos:** `develop` tiene el contrato de la API `21752be` y `schema.ts` regenerado (`2d7d8b8`). Scribe: desde `tazavera-api`, `php artisan optimize:clear` y `php artisan scribe:generate` (sin `--force`; el `.env` ya fija `APP_LOCALE=en`). Los ejemplos de respuesta salen de `storage/scribe/responses/*.json`. En una carpeta nueva, `npx tsc --noEmit` falla hasta ejecutar `npx next typegen`.
- **API (`EdwinB1025/tazzavera-api`):** ramas `dev` y `PROD` alineadas en `21752be`; las ramas mergeadas se borraron el 6 oct. Client OAuth público del front: `01a110a7-4d83-7079-8eca-3a5b2f2fa9cf` (`FrontClientSeeder`, redirect `http://localhost:3000/callback`). El `.env.local` del front lo crea Product owner (el orquestador no puede escribir `.env*`).
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

### 2026-10-06 — cobertura del contrato
- **Decisión:** `GET /coffees` y `GET /roasteries` los consumen `add-offering-management` (alta de ofertas) y `add-filter-controls` (filtros de la lista de ofertas).
- **Por qué:** respuesta de Product owner del 6 oct.
- **Afecta:** add-offering-management, add-filter-controls, add-offering-catalog (la lista que aloja esos filtros).

### 2026-10-06 — filtros (decisiones del 10-03 y respuesta de Product owner)
- **Decisión:** los filtros son facetas estilo Amazon en el sidebar (controles `inverse`), a pantalla completa en móvil con los estilos del sidebar, y el orden en el cuerpo de la página. Un sidebar plegado oculta los filtros. Las filterbars del MVC no son referencia. El sidebar aparece solo donde hace falta: la lista de ofertas (pública, cualquier visitante) y la lista de evaluaciones (ruta de gestión, solo especialistas). Requiere un delta de `app-shell` dentro de `add-filter-controls`.
- **Por qué:** `bycoding/contexto_diseño_claude_1003.md` §5–§6 y respuesta de Product owner del 6 oct.
- **Afecta:** add-filter-controls (rehecho), add-offering-catalog (la ranura de filtro del cuerpo solo lleva la barra con el botón Filtros y el orden; la retícula convive con el sidebar), add-specialist-evaluations (facetas en el sidebar de su lista), add-offering-management Open 1 (entradas del sidebar).

### 2026-10-06 — acceso a rutas protegidas
- **Decisión:** en `/manage/evaluations*`, un visitante sin sesión inicia sesión y vuelve a la ruta; un usuario sin el rol adecuado ve la página 404.
- **Por qué:** respuesta de Product owner al punto 9 de add-specialist-evaluations.
- **Afecta:** add-offering-management Open 5, add-user-account Open 5 (pendiente de la propuesta S2: el popup necesita un clic, así que "iniciar sesión" automático es una redirección).

### 2026-10-06 — refactors previos
- **Decisión:** tres cambios nuevos van antes que sus consumidores: `refactor-badge-geometry` (feedback, R6) expone la geometría del badge; `fix-button-boundaries` (base-controls) añade un borde de 1px con colores existentes a las variantes de Button que no llegan a 3:1; `extract-offering-list-parts` (content-structure, R7) mueve la lectura y el lookup de taxonomías a `entities/taxonomy` y la paginación a `shared/ui` con props `path` y `query`.
- **Por qué:** respuestas de Product owner a scales Open 3 y 6 y a evaluations Open 13; nombre y puntos abiertos cerrados por el orquestador.
- **Afecta:** add-evaluation-scales, add-specialist-evaluations, add-offering-catalog, add-filter-controls, add-offering-management (todos los que usan badges, botones, taxonomías o paginación).

### 2026-10-06 — escrituras, rutas protegidas y 422 (respuestas de Product owner)
- **Decisión:**
  - Step-up reactivo: la escritura se envía con el token actual; ante un `403` se muestra el aviso de step-up y el usuario repite la acción tras confirmarse.
  - Ruta protegida sin sesión: con `loading` se espera; con `anonymous` la página llama a `signIn(rutaActual)` sin clic, lo que termina en la redirección completa de add-auth (corrección 3) y vuelve a la ruta. Usuario sin el rol: página 404 (entrada anterior).
  - Cualquier 422 muestra el error genérico del formulario; el mapeo por campo queda en el backlog (R8).
- **Por qué:** respuestas de Product owner del 6 oct a las propuestas 1–3.
- **Afecta:** add-user-account Open 1, 2 y 5; add-offering-management Open 5, 6 y 7; add-specialist-evaluations (punto 9 y entrada de las escrituras).

### 2026-10-06 — primitivo compartido de sección (respuesta de Product owner)
- **Decisión:** un cambio de refactor en `content-structure` extrae las clases de sección y contenedor de D14 (hoy copiadas en `HomeScreen.tsx` y `AboutContent.tsx`) a un primitivo compartido, y Home y About lo adoptan. Va antes que las features que añaden páginas.
- **Por qué:** respuesta de Product owner a la propuesta 4.
- **Afecta:** add-user-account Open 8, add-offering-management Open 4, add-offering-catalog Open 2.

### 2026-10-06 — ranura de acción de `OfferingCard` (respuesta de Product owner)
- **Decisión:** un cambio de refactor en `landing` sustituye la prop `session` de `OfferingCard` por una ranura de acción que rellena quien usa la tarjeta. Va antes que las features que la usan.
- **Por qué:** respuesta de Product owner a la propuesta 5.
- **Afecta:** add-offering-management Open 2 (checkbox y Borrar), add-specialist-evaluations §8 (solo aporta `EvaluateLink`), add-offering-catalog (las tarjetas del catálogo).

### 2026-10-06 — refresco del perfil en la sesión (respuesta de Product owner)
- **Decisión:** add-auth expone `refreshProfile()`: vuelve a pedir `GET /user` (única fuente de los datos del usuario, D5) y actualiza la sesión; la respuesta del `PUT` no se escribe en la sesión. Ante fallo de red o 5xx reintenta una vez tras una pausa corta; si vuelve a fallar, la sesión conserva el usuario anterior, sin mensaje. El `401` ya lo recupera el cliente de add-auth.
- **Por qué:** respuesta de Product owner a la propuesta 6.
- **Afecta:** add-user-account Open 7; add-auth (módulo de sesión, `src/features/auth`).

### 2026-10-06 — librería del combobox (respuesta de Product owner)
- **Decisión:** el combobox es el de shadcn/ui (Radix Popover + `cmdk`), con estilo propio por tokens; dependencia nueva aprobada. El arquitecto verifica mantenimiento y tamaño de `cmdk` al proponer.
- **Por qué:** respuesta de Product owner a add-filter-controls Open 1.
- **Afecta:** add-filter-controls (facetas Productor y Tostador); cualquier cambio futuro que necesite un combobox.

### 2026-10-06 — add-filter-controls: resto de puntos (respuesta de Product owner)
- **Decisión:** se aceptan todas las recomendaciones del resumen. Las que tocan a otros cambios:
  - la ranura `@sidebar` (ruta paralela en `app/[locale]/`) es el mecanismo del shell para que una ruta ponga contenido en el sidebar;
  - los defectos F1 y F2 del sidebar se arreglan en el delta de app-shell de este cambio;
  - las filas de facetas añaden una presentación de fila a `Checkbox` y `RadioGroup` (delta de form-fields en este cambio);
  - borde de checkbox y radio en filas seleccionadas con `nav-button-border`; hover sin cambio de fondo;
  - el borde de `primary` en oscuro (F6) va a un cambio aparte de base-controls;
  - la retícula del catálogo con el sidebar abierto la decide `add-offering-catalog` (columnas según el ancho disponible).
  - el rango de puntuación admite, además del slider, escribir el mínimo y el máximo en dos campos "Desde / Hasta" sincronizados con él (punto 15, pendiente de detallar).
  - los combobox con datos de la API buscan mientras se escribe (`?name=`), desde el navegador: excepción aceptada a la regla de carga en servidor de los endpoints públicos. Aplica a Tostador y al select de café de offering-management; Productor sigue cargándose una vez (punto 16). Hook propio (`fetch` + `AbortController` + espera de 300 ms), sin librería de datos; textos del combobox desde el catálogo es/en/ca.
- **Por qué:** respuesta de Product owner a add-filter-controls Open 2–16.
- **Afecta:** add-offering-management Open 1 (entradas del sidebar, misma ranura), add-offering-catalog (retícula, punto 14), add-specialist-evaluations (facetas de su lista), fix-button-boundaries (F6).

### 2026-10-06 — geometría de chip compartida (respuesta de Product owner)
- **Decisión:** `refactor-badge-geometry` no añade el test del escenario "Chip matches the badge geometry" (WARNING del verify): aún no hay ningún chip que lo consuma. El primer cambio que cree un chip parte de `BADGE_GEOMETRY_CLASSES` (`@/shared/ui`), añade el test de ese escenario y declara sus diferencias (radio, alto, padding, hueco, tipografía) como tratamientos encima de esas clases, nunca como una segunda geometría.
- **Por qué:** respuesta de Product owner al WARNING del verify de refactor-badge-geometry.
- **Afecta:** add-filter-controls §6.2 "Chip" y §9.2 (chips aplicados); add-evaluation-scales (chip de descriptor sin seleccionar).

### 2026-10-06 — piezas extraídas disponibles (extract-offering-list-parts)
- **Decisión:** la lectura y el lookup de taxonomías viven en `src/entities/taxonomy` (`fetchTaxonomies`, `buildTaxonomyLookup`) y la paginación es `Pagination` de `@/shared/ui` (props `path`, `query`, `currentPage`, `lastPage`, textos). Los diseños nuevos los consumen; nadie vuelve a copiarlos desde `widgets/offering-list`.
- **Por qué:** tareas 1.1–4.1 de extract-offering-list-parts hechas (`7e6b777`).
- **Afecta:** add-filter-controls §9.2 (cascada de sabores), add-specialist-evaluations, add-offering-catalog, add-offering-management.
