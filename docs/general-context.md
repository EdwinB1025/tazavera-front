# Contexto general — tazavera-front

Contexto del orquestador para retomar el trabajo. Lo mantiene el orquestador (`.claude/CLAUDE.md` §12): se reescribe para seguir vigente, salvo el registro de decisiones del final, al que solo se añade. Fuentes de verdad que este archivo no repite:
- `docs/change-progress.md`: fase, responsable y bloqueo de cada cambio, y la cobertura del contrato.
- `docs/backlog.md`: lo usan los agentes según `.claude/workflow_sdd.md` §4. El build reporta candidatos, Product owner los añade y el arquitecto los retira al archivar el cambio que los resuelve.
- `.claude/CLAUDE.md` y `.claude/agents/design-lead.md`: reglas del orquestador y del design lead.
- `AGENTS.md` y `.claude/workflow_sdd.md`: reglas y flujo de los agentes OpenCode.
- El `handoff.md` y el `corrections.md` de cada cambio.

**Actualizado:** 2026-10-06 17:40.

## Estado

- **Entrega del bootcamp esta semana; Product owner quiere cerrar todo hoy (6 oct) con todos los ejecutores.** Mínimo: consumir el contrato, salvo `listTheEvaluationsOfAUser`, fuera del alcance. `listEvaluations` y `getAnEvaluation` vuelven al alcance con la lista pública de evaluaciones (registro, "evaluaciones públicas y evaluación provisional").
- **En `develop`:** theme-tokens, base-control, focus-ring, form-fields, app-shell, refine-app-header, landing, auth, refactor-badge-geometry, extract-offering-list-parts, extract-page-section, fix-button-boundaries, label-rating-badge; contrato `84e29fe` (`/user/evaluations`).
- **Ejecutores:** OpenCode sin saldo desde ~18:30 del 6 oct: todo va a la nube hasta que Product owner recargue (lanzador `node launch.mjs <worktree> <agent> <title> <prompt-file> <log>` en el scratchpad de la sesión; recrearlo). Nube con rutinas de un solo uso. Claude local como build/arquitecto mientras el uso (5 h y 7 días) esté < 80 %. En modo don't ask: el orquestador no puede `git merge` en `develop` (lo lanza Product owner) ni editar `src/`/`openspec/`; `openspec archive` lo ejecuta el orquestador con `node run-in.mjs <dir> openspec archive <id> --yes` (el perfil del arquitecto lo deniega).
- **Fases por cambio:** ver el tablero.

## Al retomar (sesión cerrada el 6 oct ~19:10)

Ningún ejecutor queda corriendo, salvo quizá el verify de facet-controls en la nube. Todas las ramas están subidas y todos los cambios del alcance tienen propose.

1. **Merges que lanza Product owner en `develop`** (el orquestador no puede): `feature/replace-offering-card-session` (archivado `07a1992`, ya contiene `develop`). Los siguientes tras su verify y archive.
2. **Listos para verify y archive** (apply completo, checks en local en verde: tests, lint, tsc):
   - `add-evaluation-scales` (`3696411`, 16/16 tareas, 1193 tests).
   - `add-facet-controls` (`21ff097`, 19/19, 1217 tests). Su verify en la nube es `trig_01CJVCVrToKkY9FSrVtet5Fj`, sesión `cse_011oveaoVXLuJESmGKR1ngJo`: leer su informe con `get_run_log`.
   - `add-sidebar-slot` (`128dd36`). Faltan la 6.3 (comprobación de rutas con `npm run start`/navegador) y la 7.1 (checks finales, commit solo de casillas). En un worktree nuevo hay que correr `npx next typegen` antes de `tsc` (si no, falla con `LayoutProps.sidebar`).
   - `add-flavor-wheel` (`91ad0e4`). Falta la 7.2: capturas a 375 y 1280 px en `docs/design/add-flavor-wheel/captures/` (orquestador o design lead) y el resultado en el handoff. Lint avisa de `aria-selected` en el `treeitem` (`FlavorWheel.tsx:358`): candidato a arreglo no planificado.
3. **Esperan dependencias en `develop`:** specialist-evaluations (scales y card-session), user-account (scales), catalog (scales, card-session y flavor-wheel), management (scales, card-session, sidebar-slot y facet-controls), offering-facets (catalog, sidebar-slot y facet-controls), evaluation-facets (sidebar-slot, facet-controls y specialist-evaluations). Antes de cada apply, mergear `develop` en la rama.
4. **Sin commitear en `develop` (de Product owner):** `docs/design/fix-button-boundaries/design-summary.md`, `docs/design/fix-button-boundaries/mockup/`, `docs/design/refactor-badge-geometry/captures/`.
5. **Limpieza:** borrar los worktrees y ramas `tazavera-front-ratingbadge`/`feature/label-rating-badge` (mergeada) y `tazavera-front-filters`/`feature/add-filter-controls` (sustituida), y las carpetas vacías `tazavera-front-header` y `tazavera-front-landing`.

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
- **API (`EdwinB1025/tazzavera-api`):** ramas `dev` y `PROD` alineadas en `4878ca5` (6 oct, `add-offering-baseline-seed`). Client OAuth público del front: `01a11276-fe3a-7029-896a-3622f7452ede` (cambia con cada `migrate:fresh --seed`) (`FrontClientSeeder`, redirect `http://localhost:3000/callback`). El `.env.local` del front lo crea Product owner (el orquestador no puede escribir `.env*`).
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
  - los combobox con datos de la API buscan mientras se escribe (`?name=`), desde el navegador: excepción aceptada a la regla de carga en servidor de los endpoints públicos. Aplica a Tostador y al alta de ofertas de offering-management (un solo combobox sobre `GET /coffeeInventory?coffeeName=` sustituye a los selects de tostador y café y a los radios del inventario; management deja de consumir `listCoffees` y `listRoasteries`). El combobox es genérico y reutilizable (`shared/ui`, lo construye filter-controls); cada consumidor le pasa la búsqueda y el contenido de la fila. Productor sigue cargándose una vez (punto 16). Hook propio (`fetch` + `AbortController` + espera de 300 ms), sin librería de datos; textos del combobox desde el catálogo es/en/ca.
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

### 2026-10-06 — rutas protegidas sin sesión: mensaje con botón (respuesta de Product owner)
- **Decisión:** sustituye la parte "ruta protegida sin sesión" de la entrada "escrituras, rutas protegidas y 422". Con `loading` se espera; con `anonymous` la página muestra un mensaje y un botón "Iniciar sesión" que llama a `signIn(rutaActual)` dentro del clic (ventana emergente; el usuario se queda en la ruta). Sin redirección automática. Usuario sin el rol: página 404. Además, `/[locale]/register*` con sesión `authenticated` lleva al inicio con navegación interna.
- **Por qué:** respuesta de Product owner: el mensaje le da al usuario idea de lo que está pasando.
- **Afecta:** add-user-account Open 4 y 5, add-offering-management Open 5, add-specialist-evaluations punto 9.

### 2026-10-06 — página única de cuenta (respuesta de Product owner)
- **Decisión:** la cuenta es una sola página `/[locale]/account` con secciones (Perfil, Contraseña, Seguridad como enlace externo a `{API}/user/security`, y "Zona peligrosa" con Desactivar y Borrar). El menú de usuario sustituye sus cinco entradas de cuenta por una sola "Mi cuenta"; Seguridad sigue como entrada externa. Lo que vive en la API (seguridad, recuperar contraseña) se queda en la API.
- **Por qué:** respuesta de Product owner a add-user-account Open 6.
- **Afecta:** add-user-account (delta de app-shell sobre `UserMenu.tsx`); cualquier cambio que enlace a las rutas de cuenta.

### 2026-10-06 — validación de formularios en el navegador (respuesta de Product owner)
- **Decisión:** los formularios son `noValidate` y, antes de enviar, el front valida solo lo que documenta el `requestBody` de cada operación en el contrato (obligatorios, formato de email, confirmación igual, enums y longitudes máximas), con mensajes del catálogo bajo cada `Field`. Lo que el contrato no detalla (fortaleza de contraseña, unicidad, contraseña actual) lo valida la API, con el 422 genérico hasta que R8 documente el 422.
- **Por qué:** respuesta de Product owner a add-user-account Open 9; Scribe documenta las reglas de los FormRequests en el `requestBody`, pero no la respuesta 422.
- **Afecta:** add-user-account, add-offering-management, add-specialist-evaluations (todos sus formularios).

### 2026-10-06 — entradas del sidebar de gestión (respuesta de Product owner)
- **Decisión:** cada área de gestión pone sus entradas en el sidebar con la misma ranura `@sidebar` de add-filter-controls (un solo mecanismo para facetas y entradas). `SidebarMenuButton` gana forma de enlace (`asChild`), lo que arregla F5.
- **Por qué:** respuesta de Product owner a add-offering-management Open 1.
- **Afecta:** add-offering-management, add-specialist-evaluations punto 10, add-filter-controls (dueño de la ranura).

### 2026-10-06 — petición de ofertas con query (respuesta de Product owner)
- **Decisión:** `add-offering-catalog` generaliza la petición de ofertas para que acepte una query; landing la llama con `verified=1` sin cambiar su comportamiento y el catálogo con la query de la URL. Paginación y taxonomías ya están extraídas (extract-offering-list-parts), así que offering-management Open 3 queda cubierto.
- **Por qué:** respuesta de Product owner a add-offering-catalog Open 1.
- **Afecta:** add-offering-catalog, add-offering-management Open 3, add-filter-controls (la lista que filtra).

### 2026-10-06 — tokens contra la API local por HTTP (respuesta de Product owner)
- **Decisión:** `oauth4webapi` rechaza por defecto las peticiones que no van por HTTPS, así que el login no se completaba contra `http://localhost:8000`. Las dos peticiones de tokens (`exchangeCode`, `refreshTokens` en `src/shared/api/tokens.ts`) usan `allowInsecureRequests` solo cuando `NODE_ENV !== "production"`; en producción se sigue exigiendo HTTPS. Fix F3 de add-auth en la nube (`trig_01KCuPWQTXgQYqUshCkLMiPx`, rama `claude/add-auth-f3`).
- **Por qué:** respuesta de Product owner (opción a) al WARNING W1 del verify de add-auth tras `4ac8129`.
- **Afecta:** add-auth; todo cambio que pruebe el login en local (user-account, offering-management, specialist-evaluations).

### 2026-10-06 — CORS de la API para el navegador (hallazgo, pendiente de Product owner en la API)
- **Decisión:** el login real falla en el navegador porque `POST /oauth/token` desde `http://localhost:3000` no recibe `Access-Control-Allow-Origin` (consola de Product owner: "blocked by CORS policy"). Causa en `tazavera-api`: rutas sin prefijo (`bootstrap/app.php`, `apiPrefix: ''`) y sin `config/cors.php`, así que el CORS por defecto de Laravel solo cubre `api/*`. El arreglo va en la API (publicar `config/cors.php` con las rutas que el navegador llama y `allowed_origins` = `FRONT_URL`, sin credenciales); el front no cambia. Hasta entonces, cualquier llamada del navegador a la API falla.
- **Por qué:** prueba en navegador de add-auth (8.17 bis) con `php artisan serve`, usuario `edwin.specialist@tazavera.test`.
- **Afecta:** add-auth (prueba en navegador y archive), add-user-account, add-specialist-evaluations, add-offering-management, add-filter-controls (combobox con `?name=` desde el navegador).

### 2026-10-06 — medias SCA en el detalle con la escala de granos (respuesta de Product owner)
- **Decisión:** las medias de los atributos (1–9) del detalle de oferta se muestran con la escala de granos de solo lectura de add-evaluation-scales (un decimal, corte geométrico, valor también en texto). add-offering-catalog va después de que add-evaluation-scales esté mergeado.
- **Por qué:** respuesta de Product owner a add-offering-catalog Open 5.
- **Afecta:** add-offering-catalog (dependencia nueva), add-evaluation-scales (nuevo consumidor del modo `readOnly`).

### 2026-10-06 — pestañas del detalle de oferta (respuesta de Product owner)
- **Decisión:** el detalle tiene la cabecera con la ficha (como en el MVC) y debajo pestañas (Tabs de shadcn/Radix): "Datos del inventario" y "Consenso"; la pestaña activa va en la URL (`?tab=`). Una tercera pestaña con la evaluación provisional de la oferta, mostrada como el formulario de evaluación en solo lectura, queda para un cambio posterior: necesita que la API exponga esa evaluación.
- **Por qué:** respuesta de Product owner a add-offering-catalog Open 6.
- **Afecta:** add-offering-catalog; add-specialist-evaluations (su vista de solo lectura sería la base de la pestaña futura).

### 2026-10-06 — estilo de la pestaña futura de evaluación provisional (respuesta de Product owner)
- **Decisión:** sustituye la idea del formulario en solo lectura de la entrada anterior: la pestaña futura de la evaluación provisional usará el mismo estilo que la de Consenso (escalas de granos en solo lectura y la misma disposición). Product owner creará los seeders de la evaluación provisional.
- **Por qué:** respuesta de Product owner sobre add-offering-catalog Open 6.
- **Afecta:** el cambio posterior de add-offering-catalog (tercera pestaña); ya no depende de la vista de solo lectura de add-specialist-evaluations.

### 2026-10-06 — landing D4: texto de la insignia de valoración (respuesta de Product owner)
- **Decisión:** la insignia de valoración de la tarjeta de oferta deja de repetir `cuppingAvg` y muestra una palabra de nivel según la puntuación (por ejemplo "Excepcional", "Excelente", "Muy bueno"), con textos del catálogo es/en/ca. El número sigue mostrándose una vez (`type-score`). Los rangos siguen la escala SCA y deben verificarse en la fuente antes del propose (propuesta sin verificar: 90+ excepcional, 85–89,99 excelente, 80–84,99 muy bueno), junto con qué se muestra por debajo de 80 y sin puntuación. Landing está mergeado: es un cambio nuevo sobre la tarjeta.
- **Por qué:** respuesta de Product owner a landing D4 (Q17).
- **Afecta:** la tarjeta de oferta (`OfferingCard`, capability landing) y todo lo que la reutiliza (catálogo, gestión); el refactor de la ranura de `OfferingCard` toca la misma tarjeta.

### 2026-10-06 — landing D4: valores confirmados con el MVC (decisión delegada por Product owner)
- **Decisión:** precisa la entrada anterior. Las palabras son las del MVC (`offeringcard.blade.php:20-36`): Excepcional (≥ 90), Excelente (85–89,99), Bueno (80–84,99), Comercial (< 80); sin puntuación no hay insignia (comportamiento actual). Los rangos y las cuatro variantes ya existen en el front (`ratingTierFor`, `Badge`). Cambio nuevo `label-rating-badge`, resumen aprobado en `docs/design/label-rating-badge/`.
- **Por qué:** Product owner delegó la decisión ("revisa el MVC y confirma").
- **Afecta:** label-rating-badge; refactor de la ranura de `OfferingCard` (misma tarjeta).

### 2026-10-06 — lecturas de evaluaciones autenticadas (respuesta de Product owner a evaluations B1)
- **Decisión:** la API pasa `GET /evaluations` y `GET /evaluations/{ulid}` al grupo autenticado de especialistas; la lista devuelve solo las del usuario del token y el detalle responde 403/404 si no es suya. Product owner lo documenta en Scribe y regenera el contrato. En el front, lista y edición se cargan en el cliente con el token, sin `evaluatorId`; sin vista de solo lectura para no dueños (página 404); la de solo lectura queda para las cerradas propias. La evaluación provisional se define con la oferta y llegará dentro de `GET /offerings/{ulid}`: ninguna lectura pública de evaluaciones hace falta.
- **Por qué:** respuesta de Product owner a B1 del explore de add-specialist-evaluations (el recurso no trae dueño).
- **Afecta:** add-specialist-evaluations (punto 6 y propose, que espera al contrato), add-filter-controls (facetas de evaluaciones: sin `evaluatorId`), add-offering-catalog (pestaña provisional futura), cobertura del contrato.

### 2026-10-06 — lecturas de evaluaciones: decisión final (respuesta de Product owner)
- **Decisión:** sustituye la entrada anterior ("lecturas de evaluaciones autenticadas"), que contradecía el diseño de la API (`tazavera-documentation/end-points.md`: lecturas públicas de evaluaciones; la provisional es una evaluación `baseline` de la cafetería). Las lecturas públicas siguen públicas y anónimas. Nuevo `UserEvaluationController` en la API (rama `feature/user_evaluations`): `/user/evaluations` lista, detalle, crear, modificar, cerrar y borrar, solo del usuario del token (ajena → 404); las rutas anteriores de escritura siguen activas (`legacy.*`, fuera de la documentación). Nuevo público `GET /users/{user}/evaluations`. Contrato regenerado en inglés y tipos del front regenerados (sin commitear en `develop`, a la espera del merge de la rama de la API).
- **Por qué:** respuesta de Product owner a B1 tras revisar el diseño de la API y la seguridad (no exponer el evaluador en respuestas públicas).
- **Afecta:** add-specialist-evaluations (lista y edición sobre `/user/evaluations…`, sin vista de solo lectura para no dueños), add-filter-controls (facetas de evaluaciones sobre `listMyEvaluations`), cobertura del contrato (nuevas operaciones `listMyEvaluations`, `getMyEvaluation`, `listTheEvaluationsOfAUser`).

### 2026-10-06 — add-specialist-evaluations: preguntas del explore (respuestas de Product owner)
- **Decisión:**
  - Q1 403: las evaluaciones propias no necesitan `profile:write` ni step-up. La vista solo muestra las del usuario; si una escritura devuelve 403 (petición ajena lanzada por fuera), se muestra el mensaje de "no es tuya", sin pedir inicio de sesión. Sustituye, para este cambio, el step-up reactivo de la entrada "escrituras, rutas protegidas y 422".
  - Q3 fecha de la fila: abierta → "Creada el" `createdAt`; cerrada → "Cerrada el" `closedAt`; en `type-meta` bajo el nombre del café.
  - Q5 "Completo" por grupo: un grupo de puntuaciones está completo con todas sus puntuaciones; el descriptor del conjunto fragancia/aroma/sabor/retrogusto es un único requisito compartido entre esos grupos; Defectos y Extrínsecos sin indicador.
  - Q2 entrada: "Mis evaluaciones" del menú de usuario (ya existe, `UserMenu.tsx`) lleva a `/manage/evaluations`, donde se muestra el sidebar de gestión existente con su entrada. Sin dependencia de la ranura `@sidebar` de add-filter-controls.
  - Q4 orden por defecto `created_at desc` y Q6 propose ya (orquestador).
- **Por qué:** respuestas de Product owner del 6 oct a las preguntas del explore.
- **Afecta:** add-specialist-evaluations (propose); add-filter-controls (la ranura ya no la necesita evaluations); add-user-account y add-offering-management (el step-up reactivo sigue para ellos).

### 2026-10-06 — catálogo: detalle y consenso; filtros: cascada y división (respuestas de Product owner)
- **Decisión:**
  - Cabecera del detalle sin puntuación. La puntuación vive en la pestaña "Consenso" (la `cuppingAvg` de la oferta, la misma de la tarjeta, solo si la oferta está verificada) y en la futura pestaña de la evaluación provisional.
  - Las tarjetas de árbol (`sensoryTaxonomy`, `cataConcordance`) se sustituyen por una **rueda de sabores estilo SCA** (sunburst) interactiva: se amplía del centro hacia fuera por niveles; la leyenda de cada segmento es "evaluadores que identifican la nota / total de evaluadores" (p. ej. 4/5); al pasar el ratón (y con foco de teclado) por un segmento se muestra la descripción de la olfactory taxonomy. Componente propio en SVG (sin dependencia nueva; decisión del orquestador).
  - Defectos y sabores principales: se reutilizan los componentes de selección de la evaluación (en solo lectura) y se añade la leyenda de consenso junto a cada tarjeta.
  - Concordancia (0–1, `max(0, 1 − σ/σmax)` por eje en `OfferingConsensusService`): escala con nombre según Koo y Li (2016): < 0,50 "Baja", 0,50–0,75 "Moderada", 0,75–0,90 "Alta", ≥ 0,90 "Excelente"; el valor se muestra también en texto (nunca solo color).
  - Q1 resto y Q2 (`LabelValueRow` y `Tabs` en `shared/ui`, content-structure) aceptados como los recomendó el orquestador.
  - Filtros F1: marcar un padre añade el padre y sus descendientes; marcar un hijo sin su padre envía solo ese hijo. F2: (a) control del shell para desplegar el sidebar plegado (tomado por el orquestador; Product owner aceptó el resto). F3: dividir en cuatro cambios — `add-sidebar-slot` (app-shell), `add-facet-controls` (filtering, form-fields), `add-offering-facets` (tras catálogo), `add-evaluation-facets` (tras evaluations) — y terminarlos hoy con todos los ejecutores.
- **Por qué:** respuestas de Product owner del 6 oct a las preguntas de los explores de catalog y filter-controls; escala de concordancia: Koo y Li (2016), bandas de coeficientes de acuerdo 0–1.
- **Afecta:** add-offering-catalog (detalle, consenso, nuevo componente de rueda), add-filter-controls (sustituido por los cuatro cambios), add-public-evaluations (podría reutilizar la rueda).

### 2026-10-06 — evaluaciones públicas fuera del alcance (respuesta de Product owner)
- **Decisión:** la vista pública de las evaluaciones es "Mejor valorados": la lista de ofertas verificadas ordenada por puntuación de `add-offering-catalog` (entrada de la cabecera, `verified=1&orderBy=cupping_avg&orderDirection=desc`). La página pública de un especialista (ver evaluaciones de otro especialista) queda fuera del alcance actual. `add-public-evaluations` se retira sin propose. Quedan sin consumidor en esta entrega `listEvaluations`, `getAnEvaluation` y `listTheEvaluationsOfAUser`.
- **Por qué:** respuesta de Product owner a las dos preguntas del borrador de add-public-evaluations.
- **Afecta:** add-offering-catalog ("Mejor valorados"), cobertura del contrato (tres operaciones públicas de evaluaciones fuera del alcance).

### 2026-10-06 — add-user-account: bloqueos del explore (decidido por el orquestador en ausencia de Product owner)
- **Decisión:** B1: las pantallas de `src/pages/register` y `src/pages/account` inyectan como props la sesión y las acciones de auth (`signIn`, `signOut`, `requestProfileWrite`, `refreshProfile`) en los componentes de `src/features/user-account`, como `SessionShell` hace con `AppHeader`; ningún feature importa otro feature; `features/user-account` sigue siendo un slice. B2: se cumple la regla "validación de formularios en el navegador": `updateAUser` no documenta campos obligatorios, así que el perfil solo valida el formato del email; un campo vaciado vuelve como el error genérico del 422.
- **Por qué:** Product owner delegó resolver lo resoluble durante su pausa ("si lo puedes resolver tú, resuélvelo"); B1 sigue el precedente del shell y FSD; B2 sigue su regla registrada. Product owner puede reabrirlo.
- **Afecta:** add-user-account; add-offering-management y add-specialist-evaluations (mismo patrón de inyección si sus features necesitan acciones de auth).

### 2026-10-06 — add-offering-management: puntos del explore (decidido por el orquestador en ausencia de Product owner)
- **Decisión:** Q1 Open 23 (c): tras elegir el ítem del inventario se muestra `roastLot · productionDate` como ayuda del campo. Q2 retícula junto al sidebar: (a) 1 / 2 desde `lg` / 3 desde `2xl`. Q3 la lista propia (retícula, tarjetas, esqueletos) se compone en `src/pages/manage-offerings` con el estado y las acciones del feature; no se mueve nada de `widgets/offering-list`. Q4/Q5 en design.md (estado sin sesión en la ruta del formulario; una sola región `role="alert"` en el slot `error` del diálogo). Q6 selección solo de la página actual. B7: `listOfferings` de "Mis ofertas" se pide en el cliente con `publicRequest` porque el filtro es el `ulid` de la sesión (solo en el navegador): segunda excepción aceptada a la carga en servidor de endpoints públicos.
- **Requisitos para los cambios de filtros:** `add-facet-controls`: el combobox acepta el `variant` de `Input` (default además de inverse). `add-sidebar-slot`: la etiqueta de las entradas en hover usa `nav-text-hover` y el sidebar queda bajo `variant-inverse` para el anillo de foco (F3 de filter-controls = F2 de management).
- **Por qué:** delegación de Product owner durante su pausa; recomendaciones del explore y del design lead.
- **Afecta:** add-offering-management, add-facet-controls, add-sidebar-slot.

### 2026-10-06 — filtros: preguntas de los explore en la nube (decidido por el orquestador en ausencia de Product owner)
- **Decisión:** add-facet-controls Q1 cascada: opción (a). Cada fila padre tiene su propio control de desplegar/plegar, separado de su casilla, y un hijo se marca sin su padre, como pide la respuesta F1 de Product owner. Las casillas son independientes: marcar o desmarcar el padre no cambia a los hijos, y marcar todos los hijos no marca al padre. Los hijos se ocultan solo cuando el usuario pliega la fila, y una fila con algún descendiente marcado arranca desplegada. Q2: se mantiene `cmdk` (dependencia aprobada), con el arreglo dentro del componente: el `label` de cmdk recibe el texto de la etiqueta, y `aria-expanded` y el `for` de la etiqueta se fijan en el input tras el render. Queda como riesgo en design.md. add-sidebar-slot Q1: `SidebarProvider` sube a `SessionShell`, el sidebar de cada ruta informa por el contexto de que existe, y el shell muestra el control de reabrir (`PanelLeft`, botón `nav-button` con nombre accesible) solo en las rutas que tienen sidebar. El resto de puntos de las tres rutinas toma la recomendación del arquitecto.
- **Coexistencia:** add-specialist-evaluations (D5) llena la ranura `entries` del sidebar de app-shell según el rol desde `SessionShell`, y add-offering-management usa `@sidebar`. add-sidebar-slot debe dejar las dos vías compatibles.
- **Por qué:** delegación de Product owner durante su pausa.
- **Afecta:** add-facet-controls, add-sidebar-slot, add-offering-facets, add-evaluation-facets, add-specialist-evaluations, add-offering-management.

### 2026-10-06 — add-offering-catalog: preguntas del propose (decidido por el orquestador en ausencia de Product owner)
- **Decisión:** 1. No se divide el cambio: el apply va tarea a tarea, una ejecución por tarea, así que el tamaño de la sesión no limita; la frontera entre los grupos 6 y 7–9 queda como punto de corte si hiciera falta. 2. La leyenda de consenso de Defectos y Sabores principales es una línea `type-meta` por nota identificada, `{nombre} {n}/{total}`, y no aparece si el grupo está vacío (design.md D13), igual que la leyenda de la rueda. 3. Las props de `FlavorWheel` son las del resumen aprobado de add-flavor-wheel (`nodes`, `total`, `texts`, más `buildFlavorWheelNodes` en `entities/taxonomy`); la llamada de catalog (D14) se adapta a ellas en su apply.
- **Por qué:** delegación de Product owner durante su pausa.
- **Afecta:** add-offering-catalog, add-flavor-wheel.

### 2026-10-06 — evaluaciones públicas y evaluación provisional (respuesta de Product owner; corrige "evaluaciones públicas fuera del alcance")
- **Decisión:** la entrada "evaluaciones públicas fuera del alcance" leyó mal la respuesta de Product owner. "Mejor valorados" sigue siendo la lista de ofertas de `add-offering-catalog`, pero la **lista pública de evaluaciones existe y entra en el alcance**. Opción (b):
  - El detalle de la oferta tiene un botón "Ver evaluaciones" que abre la lista pública de evaluaciones con el filtro de esa oferta activo en la barra lateral.
  - El detalle tiene además una pestaña "Evaluación provisional" que muestra la evaluación `baseline` de la cafetería (`GET /evaluations?offeringId=<ulid>&evaluationType=baseline`).
  - `listEvaluations` y `getAnEvaluation` vuelven a tener consumidor. `listTheEvaluationsOfAUser` (la página pública de un especialista) sigue fuera del alcance.
- **Cambio en el API, nuevo y en diseño:**
  - un seeder que crea al menos 3 ofertas por cafetería y una evaluación `baseline` cerrada por oferta (`evaluator_id` = la cafetería, creada con `EvaluationFactory`);
  - los scopes `offeringId` y `evaluationType` en `Evaluation::filter()`, en `GET /evaluations`, `GET /users/{user}/evaluations` y `GET /user/evaluations`.
  - La unicidad de la baseline la garantiza solo el seeder: el endpoint de la baseline de la cafetería sigue en el backlog del API (MVC `casos de uso.md:3`, README del API). El resource no cambia, porque ya expone `offeringId` y `evaluationType`.
- **Pendiente:**
  - si el botón y la pestaña entran en `add-offering-catalog` o en un cambio aparte;
  - el nombre del cambio del API;
  - si el seeder se engancha en `DatabaseSeeder`.
- **Por qué:** respuestas de Product owner del 6 oct (opción b) y documentos de diseño del MVC (`Diseño.md:96`, `:104`; `casos de uso.md:3`, `:100`).
- **Afecta:** add-public-evaluations (se recupera), add-offering-catalog (detalle: botón y pestaña), add-flavor-wheel (posible consumidor en la lista pública), cobertura del contrato, nuevo cambio del API.

### 2026-10-06 — API add-offering-baseline-seed: diseño final, integrado (respuestas de Product owner)
- **Decisión:** el cambio del API está mergeado en `dev` y `PROD` (`4878ca5`). Contrato y tipos actualizados en el front (`92328fc`).
  - **Filtros:** `offeringId` y `evaluationType` (`specialist` | `baseline`) en `GET /evaluations`, `GET /users/{user}/evaluations` y `GET /user/evaluations`. El resource no cambia.
  - **Comportamiento por defecto (1a):** el API sigue devolviendo los dos tipos. La lista pública del front envía siempre `evaluationType=specialist`, y la pestaña provisional envía `evaluationType=baseline`.
  - **Seeders, llamados desde `DatabaseSeeder`:**
    - `OfferingBaselineSeeder`: entre 1 y 5 ofertas por cafetería, cada una con su baseline cerrada (`evaluator_id` = la cafetería);
    - `VerifiedOfferingSeeder`: 15 ofertas con entre 5 y 9 evaluaciones de 10 especialistas, con `EvaluationClosed` por oferta para que se calcule el consenso.
    - Resultado en local: 73 ofertas, 15 verificadas, 73 baselines.
  - `GetAnOfferingSeeder` y `CreateOfferingSeeder` se mantienen. Sin tests nuevos.
  - La baseline queda en el backlog del API solo como endpoint de creación.
- **Datos de ejemplo:** `migrate:fresh --seed` recrea el cliente OAuth del front, así que hay que actualizar `NEXT_PUBLIC_OAUTH_CLIENT_ID` en cada `.env.local` después de sembrar.
- **Por qué:** respuestas de Product owner del 6 oct.
- **Afecta:** add-public-evaluations, add-offering-catalog (pestaña provisional y botón), toda prueba en navegador con datos (ahora hay ofertas verificadas).

### 2026-10-06 — add-public-evaluations aprobado y piezas compartidas (decidido por el orquestador en ausencia de Product owner)
- **Decisión:**
  - **Resumen de `add-public-evaluations` aprobado** con todas las recomendaciones del design lead:
    - el botón "Ver evaluaciones" y la pestaña provisional van en este cambio, no en uno aparte, como dijo Product owner;
    - faceta de oferta como lista de opción ("Cualquiera" + la oferta activa);
    - la tarjeta de fila pasa a `src/widgets/evaluation-row`;
    - las facetas públicas amplían `features/evaluation-facets`;
    - descriptores como chips; una evaluación abierta abierta por URL da 404; la baseline más reciente primero; sin entrada en la cabecera; "Ver evaluaciones" como enlace simple, siempre visible.
  - **`fetchOffering` único:** catalog (D3, lanza error) y specialist-evaluations (D1, `publicRequest` con encontrado / no encontrado / fallo) crean el mismo `src/entities/offering/api/offering.ts`. Vale una sola función con el contrato de D1. El segundo cambio que se mergee adapta su llamada.
  - **Constructor de filas de descriptores:** el primer cambio que lo aplique (catalog D13 o specialist-evaluations D7) lo deja en `src/entities/taxonomy`, y el otro lo reutiliza.
  - **Contraste en el consenso de catalog:** la puntuación sobre el fondo de sección da 4,38:1 en el nivel comercial del tema tradicional (medida del design lead). Se corrige sin token nuevo, poniendo esa fila dentro de una tarjeta. Pasa al arquitecto de catalog antes de su apply.
- **Por qué:** mandato nocturno de Product owner; informe del design lead del 6 oct; regla de reutilizar (criterio C).
- **Afecta:** add-public-evaluations, add-offering-catalog (D3, D13, contraste del consenso), add-specialist-evaluations (D1, D7), add-evaluation-facets (facetas públicas).

### 2026-10-06 — secciones plegables, rueda y facetas (respuestas de Product owner)
- **Decisión:**
  - **Mecanismo compartido de sección plegable:** se toma del formulario de evaluación del MVC (`evaluation-axis.blade.php`, `evaluation-form.blade.php`).
    - La cabecera es un botón que ocupa todo el ancho: título a la izquierda y chevron a la derecha (abajo plegado, arriba abierto).
    - Lleva `aria-expanded` y `aria-controls`, foco visible y animación de apertura.
    - Va en `shared/ui` (content-structure, "collapsible"), en un cambio propio, `add-collapsible-section`, antes que sus usos.
  - **Formulario de evaluación (`add-specialist-evaluations`, ronda 1):** cada grupo del CVA y la leyenda 1–9 usan ese mecanismo, sin tocar la estructura. **Todas las secciones arrancan plegadas**, como en el MVC, **salvo en una evaluación cerrada (solo lectura), que arranca con todo abierto.**
  - **Rueda (`refine-flavor-wheel`, feedback):**
    - Q4 (b): los anillos se dimensionan según el nivel más profundo expandido en cada momento; la rueda se reescala al expandir.
    - Q5: el control de la lista de notas pasa a ser la cabecera plegable con chevron.
  - **Facetas (`refine-facet-controls`, filtering), antes del apply de `add-offering-facets`:**
    - Q1 (F3): ayuda y error bajo las facetas de fila con 0,75rem de padding lateral, alineados con la leyenda. Decidido por el orquestador por delegación de Product owner.
    - Q2 (F4): al salir del combobox o pulsar Escape con texto abandonado, sin haber elegido nada, el campo vuelve a mostrar la etiqueta elegida.
  - **Landing D4: cerrado.** La tarjeta muestra la leyenda del nivel según las reglas del MVC (`label-rating-badge`, mergeado).
- **Por qué:** respuestas de Product owner del 6 oct por la noche; formulario de evaluación del MVC.
- **Afecta:** add-collapsible-section (nuevo, content-structure), add-specialist-evaluations (ronda 1), refine-flavor-wheel (nuevo, feedback), refine-facet-controls (nuevo, filtering), add-offering-facets y add-offering-management (combobox), add-landing (D4 cerrado).

### 2026-10-06 — contactos y locales (respuestas de Product owner)
- **Decisión:**
  - **API, cambio `add-contacts-and-locations`** (rama `feature/add-contacts-and-locations` desde `dev`; el orquestador mergea a `dev` y `PROD` y actualiza documentación y tipos):
    - `GET` y `POST /users/{user}/contacts`: un solo contacto principal por usuario, `409` si ya existe; solo para el propio usuario.
    - `GET /users/{user}/locations`: solo el propio usuario.
    - `POST /locations`: rol `coffeeshop`; local y contacto en una transacción.
    - **Todos autenticados**: los datos solo se muestran a usuarios autenticados, como parte del perfil.
    - Migración: `latitud`, `longitud` y `description` pasan a ser opcionales.
    - Factories con direcciones reales de Barcelona.
  - **Coordenadas:** las calcula **el front** con una librería de geocodificación a partir de la dirección, y las envía en `latitud`/`longitud`. El API no geocodifica.
  - **Registro de cafetería:** como los endpoints son autenticados, el local no se envía en `POST /register`. La cafetería completa su local en el perfil tras su primer inicio de sesión, igual que la sección de contacto: si no hay datos, mensaje y botón que abre el formulario en la misma vista.
  - **Front:** `add-user-contact` (sección de contacto en el perfil) y `add-coffeeshop-location` (local de la cafetería en el perfil, con geocodificación).
- **Pendiente:** la geocodificación en el navegador llama a un servicio externo, lo que exige abrir `connect-src` de la CSP (seguridad: decisión de Product owner).
- **Por qué:** respuestas de Product owner del 6 oct por la noche.
- **Afecta:** add-user-account (perfil), add-user-contact, add-coffeeshop-location, la CSP de app-shell.
