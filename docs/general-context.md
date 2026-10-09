# Contexto general — tazavera-front

Contexto del orquestador para retomar el trabajo. Lo mantiene el orquestador (`.claude/CLAUDE.md` §12): se reescribe para seguir vigente, salvo el registro de decisiones del final, al que solo se añade. Fuentes de verdad que este archivo no repite:
- `docs/change-progress.md`: fase, responsable y bloqueo de cada cambio, y la cobertura del contrato.
- `docs/backlog.md`: lo usan los agentes según `.claude/workflow_sdd.md` §4. El build reporta candidatos, Product owner los añade y el arquitecto los retira al archivar el cambio que los resuelve.
- `.claude/CLAUDE.md` y `.claude/agents/design-lead.md`: reglas del orquestador y del design lead.
- `AGENTS.md` y `.claude/workflow_sdd.md`: reglas y flujo de los agentes OpenCode.
- El `handoff.md` y el `corrections.md` de cada cambio.

**Actualizado:** 2026-10-07 20:30 UTC (22:30 local).

## Mandato de Product owner para la próxima sesión (7 oct ~20:50 UTC)

Texto literal: "verifica tus pendientes, eres autonomo de tomar decisiones segun las reglas de orchestrador, en esta sesion eres tu el orchestrador. si tu limite sesion diaria esta por debajo del 90%, puedes asignar trabajo en local, puedes siempre usar la nube, y openspec solo para propose, y archivar cambios. el objetivo es terminar mañana en la mañana."

- Objetivo: terminar la entrega la mañana del 8 oct.
- Trabajo local (design lead, capturas) solo si `~/.claude/usage-snapshot.json` marca menos del 90% en la ventana de 5 h. Si marca 90% o más, o no se puede leer, solo la nube. La nube se puede usar siempre.
- OpenSpec (el arquitecto de OpenCode) solo para propose y archive; todo lo demás va a la nube.

**Estado a las ~21:00 UTC (después de `git fetch`):**
- `origin/claude/refine-list-pagination-apply2` ha terminado: tareas 3.1–4.2 (`0cb6da7`, `1f329ba`, `ac482e0`, `2060b73`), en orden test→feat. Falta revisarlo, pasar los checks e integrarlo con `--ff-only` en `feature/refine-list-pagination` (worktree en `b6cc6f3`). Después, la 5.1 (checks) y la 5.2 (capturas).
- `origin/claude/test-reduction-plan` (`e5bda59`, `docs/testing/test-reduction-plan.md`): 159 archivos y 2.239 casos sobre `8803904`, con una acción por archivo. Espera a que Product owner revise los totales.
- Las sesiones en la nube de `add-coffeeshop-location` y `add-evaluation-facets` seguían en marcha (último evento 20:48).
- Pendiente de Product owner:
  - aplicar las viñetas corregidas de `## Testing` en AGENTS.md: alcance "spec" (`openspec/specs/` o el spec del cambio), no borrar ni mover tests durante un cambio, excepción para el test de un arreglo no planificado y para la cobertura que pase Product owner, y nombres de clase en lo que comprueba un test;
  - resolver el choque de `.claude/CLAUDE.md` §3 ("never remove or weaken a test") con la reducción.

## Al retomar (sesión cerrada el 7 oct ~20:30 UTC para reiniciar)

**Mergeado hoy en `develop` (`8803904`):** add-user-account, refine-page-surfaces, add-offering-catalog, fix-collapsible-overflow, fix-auth-return-query, add-offering-management, adopt-section-card-in-account, add-specialist-evaluations, add-offering-facets, extract-access-and-status-pieces (R11), add-user-contact, extract-clear-filters-button (R9).

**Pendiente de integrar o cerrar (por orden):**
1. **`extract-filtered-offerings` (R12):** worktree `tazavera-front-r12`, `feature/extract-filtered-offerings` `ebeb90c` (apply completo + `develop` `8803904` mezclado; conflicto con R9 resuelto: el widget `FilteredOfferingsResults` usa `ClearFiltersButton` de `@/shared/ui` con `keep={OFFERING_SORT_KEYS}`). Checks: 2245 tests (1 timeout conocido de `EvaluationForm`, R15; aislado en verde), lint, tsc, build en verde. **Falta:** revisión visual del design lead de R9 + R12 juntos en el catálogo (`/es/offerings`, estado vacío filtrado con "Limpiar filtros"; R9 sin revisión visual propia, cerrado para revisión), verify, archive (quita R12 del backlog), merge, borrar worktree y rama.
2. **Sesiones en la nube** (rutinas de un solo uso; leer con `RemoteTrigger list_runs` / `get_run_log`; integrar con `--ff-only` tras revisar commits y pasar checks):
   - `refine-list-pagination` apply desde la 3.1 → `claude/refine-list-pagination-apply2` (`trig_011fVL34CTSeSMTtSabZVP9A`, 20:12 UTC). Worktree `tazavera-front-pagination` en `b6cc6f3` (tareas 1.1–2.2 + arreglo de D3 fila 10). Abierto para el directorio: los enlaces de paginación descartan `?tab=` (R12 Propose status, Open 1).
   - `add-coffeeshop-location` actualización de artefactos + apply → `claude/add-coffeeshop-location-apply2` (`trig_01MQFoVTtn69bc7vqFSrt5p4`, 20:17 UTC). Decisión del orquestador: `isValidEmail` se mueve sin cambios a `@/entities/contact` (registro).
   - `add-evaluation-facets` apply → `claude/add-evaluation-facets-apply` (`trig_018Qa9oF9KJhqTLZf3ouxZEv`, 20:21 UTC). Worktree `tazavera-front-evfacets` en `39a4504` (artefactos actualizados: usa `ClearFiltersButton` compartido).
   - Plan de reducción de tests → `claude/test-reduction-plan`, `docs/testing/test-reduction-plan.md` (`trig_01CDd4hdvUPViuPzVLakGH4X`, 20:16 UTC). Solo análisis: pasar los totales a Product owner antes de borrar o mover nada.
3. **Después:** `add-public-evaluations` apply (worktree `tazavera-front-pubevals` en `8b13c84`, artefactos actualizados; espera el merge de evaluation-facets); `add-coffeeshop-directory` apply (espera R12 y la decisión de `?tab=` en la paginación).
4. **Esperan a Product owner:** `fix-combobox-blur` (borrador de resumen en `claude/fix-combobox-blur`); R15 (tests lentos de `EvaluationForm`, ¿lanzar?); texto de la sección Testing de AGENTS.md (abajo).

**Reducción de la suite de tests (Product owner, 7 oct):** en el repo solo quedan los tests que verifican las capacidades originales (requisitos de `openspec/specs/`), simplificados y unificados, más las guardas de reglas del proyecto. Lo de los refactors se borra o pasa a calidad. El resto va a la carpeta local `Sprint5/tazavera-front-qa` (git local, sin remoto, README creado), no se corre en cada cambio y se ejecuta una vez al final del proyecto. Los agentes escriben solo los tests que nombra cada tarea. Aplicar la limpieza cuando las ramas en vuelo estén integradas, para no crear conflictos.

**AGENTS.md (pendiente; Product owner lo autorizó, pero el permiso local deniega la edición):** añadir en `## Testing`, tras la primera viñeta, las cuatro viñetas de la regla de tests (texto en el mensaje del orquestador del 7 oct ~20:30 y en la memoria `test-suite-reduction`).

**Reglas nuevas de Product owner (7 oct):** nada se añade al diseño sin su autorización (trabajar con los componentes actuales; R14, la página 404, queda en el backlog con la última prioridad); OpenCode no se usa mientras el portátil vaya justo de memoria (todo a la nube); procesos pesados de uno en uno.

**Permisos:** en Bash, `taskkill` y `git merge` se deniegan; desde PowerShell funcionan (`taskkill /PID n /T /F`, `git -C <dir> merge`), sin tuberías. Recordar al final del proyecto restaurar el `ask` global de `git merge` en `~/.claude/settings.json`.

## Para revisión de Product owner

**Cerrado por el orquestador para tu revisión (7 oct):**
- Pruebas de navegador dadas por cerradas sin captura de todos los estados: accountcard 4.2 (carga/éxito); evaluations 10.2, 11.5, 12.8, 13.5 (expansión del 409 y estados de carga/fallo cubiertos por tests); R11 (estados de carga); user-contact (Guardar/Cancelar en curso y el 409, cubiertos por tests); R9 (sin revisión visual propia, va en la conjunta con R12).
- offering-facets F3: arreglo de `FacetCascade` (componente compartido); el texto "Orden predeterminado" se recorta a 375 con un filtro, aceptado tal cual (opcional: acortar `sortDefault` en `messages/es/filters.json`).
- refine-list-pagination: fila 10 de la tabla de D3 corregida para seguir la regla de D3 (no cambia lo que se ve).
- add-coffeeshop-location: `isValidEmail` se mueve sin cambios a `@/entities/contact`.
- Observaciones sin cambio: el "Ver" de la tarjeta de gestión queda ~4px más alto; el hueco barra–primera tarjeta del catálogo (8rem/6rem) viene del layout; aviso de lint ya existente en `FlavorWheel.tsx:516`.

**Anteriores, aún por revisar:** `Combobox` dentro de `Field` sin etiqueta ni ayuda propias (management C1); la rueda reescalada deja activa la nota bajo el puntero (refine-flavor-wheel D1); llamada de catalog a `FlavorWheel` con la interfaz real (catalog D1).

## Estado

- **Entrega del bootcamp esta semana.** Mínimo: consumir el contrato, salvo `listTheEvaluationsOfAUser`, fuera del alcance. Lo que queda del contrato: `listEvaluations`/`getAnEvaluation` (public-evaluations), `listAUsersLocations`/`createALocation` (location), `listCoffeeShops`/`getACoffeeShop` (directory).
- **Ejecutores:** Claude en la nube con rutinas de un solo uso (`RemoteTrigger create`, entorno `env_01DTNNGR37Cgqdaa5ym4Zagr`, modelo `claude-opus-5-5`, rama `claude/<change-id>-<tarea>`). Claude local (arquitecto, build y design lead como subagentes) mientras el uso esté < 90 % (7 días al 47 % a las 19:00 UTC). OpenCode en pausa por memoria. El orquestador mergea en `develop` y archiva con `node run-in.mjs <dir> openspec archive <id> --yes`.
- **Scripts de sesión** (scratchpad de la sesión `b545f592…`; recrearlos si se pierden): `check-noci.mjs` / `check-build.mjs <dir>` (install, typegen, tests, lint, tsc[, build]), `retry-push.mjs <dir> <rama>`, `watch-heads.mjs <min> <ramas…>`, `run-in.mjs <dir> <cmd…>`, mocks y capturas del design lead (`mock-proxy.mjs`, `mock-contact.mjs`, `pre6-r11.mjs`, `pre7-contact.mjs`).
- **Fases por cambio:** ver el tablero.

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
- **API (`EdwinB1025/tazzavera-api`):** ramas `dev` y `PROD` alineadas en `eec865e` (9 oct, verificación de email con `emailVerifiedAt`). Client OAuth público del front: `01a11c16-5def-73a2-8060-c018a8ea6a0f` (8 oct, nueva resiembra; sustituye a `01a11aee-170a-71bc-82aa-43344bf1b12d`, de la resiembra de los AUT tras los hotfix `6c2f482` y `18aa1c6` del API; cambia con cada `migrate:fresh --seed`, y como `NEXT_PUBLIC_OAUTH_CLIENT_ID` se incrusta al compilar, el build de producción del front se rehace tras cambiarlo) (`FrontClientSeeder`, redirect `http://localhost:3000/callback`). El `.env.local` del front lo crea Product owner (el orquestador no puede escribir `.env*`).
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

### 2026-10-06 — directorio de cafeterías (respuestas de Product owner)
- **Decisión:**
  - **CSP aprobada por Product owner:**
    - `connect-src` abierto al servicio de geocodificación (Nominatim de OpenStreetMap);
    - `img-src` abierto a los servidores de teselas del mapa.
  - **API**, en el mismo cambio `add-contacts-and-locations` para no chocar en `Location`, factories y seeders:
    - **Directorio público:** `GET /coffeeshops` (paginado; filtros `name`, `city`, `postalCode`, `verified`; orden por nombre) y `GET /coffeeshops/{location}`. La "cafetería" es el local (`Location`).
    - **Solo datos del negocio:** nombre, descripción, coordenadas, contacto principal del local y recuentos de ofertas. Nunca datos personales del usuario.
    - **Seeder** con una lista cerrada de cafeterías de especialidad reales de Barcelona, con dirección y coordenadas.
  - **Front, `add-coffeeshop-directory`:**
    - entrada "Explora coffees" en la cabecera;
    - lista con filtros en la barra lateral (nombre, código postal o barrio, con ofertas verificadas; orden por nombre), tarjetas y paginación, con los patrones de catálogo y facetas;
    - **mapa con Leaflet y teselas de OpenStreetMap:** conmutador lista/mapa y un icono de mapa en cada tarjeta que centra esa cafetería; en móvil, el mapa a pantalla completa;
    - **detalle de cafetería**, como el detalle de oferta: los datos del local y la lista de sus ofertas con la misma barra de filtros del catálogo (`locationId`).
  - El orquestador elige los filtros, la librería y el comportamiento, por delegación de Product owner.
- **Por qué:** respuestas de Product owner del 6 oct por la noche.
- **Afecta:** add-coffeeshop-directory (nuevo), add-coffeeshop-location (geocodificación), add-offering-catalog y add-offering-facets (reutilizados), app-shell (cabecera y CSP), API add-contacts-and-locations.

### 2026-10-06 — directorio por negocio, pestañas y barra lateral de la cafetería (respuestas de Product owner)
- **Decisión** (sustituye en lo que contradiga a la entrada anterior):
  - **La "cafetería" del directorio es el negocio** (usuario con rol `coffeeshop`), con uno o varios locales; no un local suelto.
    - API: `GET /coffeeshops` (usuarios cafetería con al menos un local; filtros `name`, `city`, `postalCode`, `verified` sobre cualquiera de sus locales; orden por nombre) y `GET /coffeeshops/{user}` (recuentos y `locations[]` con coordenadas y contacto del negocio). Solo datos del negocio.
    - Las ofertas de la cafetería se leen con `GET /offerings?coffeeshopUlid=` (filtro existente).
  - **Detalle de cafetería con dos pestañas:** "Ofertas" (con la barra de filtros del catálogo) y "Ubicaciones" (lista y mapa).
  - **Barra lateral de la cafetería:** "Administrar ofertas" y "Administrar ubicaciones"; la segunda lista los locales propios y permite crear más (`POST /locations`, geocodificado en el front). Sustituye la idea del local en el perfil.
  - **Contacto personal** (`add-user-contact`) se queda en el perfil.
  - **Estilo del API:** los endpoints nuevos copian el esquema, la sintaxis y la resolución de consultas en el modelo (scopes y `filter()`) de los existentes.
- **Por qué:** respuestas de Product owner del 6 oct por la noche.
- **Afecta:** add-coffeeshop-directory, add-coffeeshop-location (página "Administrar ubicaciones"), add-offering-management (entradas de la barra lateral, tarea 8: pendiente de Product owner), API add-contacts-and-locations.

### 2026-10-07 — Combobox dentro de Field (orquestador, cerrado para revisión)
- **Decisión:** dentro de un `Field`, el `Combobox` compartido no pinta etiqueta ni ayuda propias y su input toma el id del `Field`; fuera de un `Field` (paneles de facetas) no cambia.
- **Por qué:** la tarea 6.2 de add-offering-management no se podía construir tal como estaba escrita (etiqueta duplicada y sin enlazar); la opción mantiene el texto de la tarea y el diseño de una sola etiqueta.
- **Afecta:** add-offering-management (D14, tareas 6.0a/6.0b), add-coffeeshop-location y cualquier formulario futuro con combobox.

### 2026-10-07 — API: borrar una oferta con evaluaciones (Product owner)
- **Decisión:**
  - Migración nueva en `tazavera-api` (`2026_10_07_083627_make_evaluation_offering_nullable_on_delete`): `evaluations.offering_id` pasa a nullable con `nullOnDelete()` (antes `restrictOnDelete()`, que daba 500 al borrar una oferta con evaluaciones).
  - `OfferingController::destroy` y `massDestroy` borran la evaluación baseline de la oferta en la misma transacción; las evaluaciones de especialistas se conservan con `offering_id` nulo.
  - El usuario que lista evaluaciones con oferta nula ve "oferta inexistente"; **se maneja en el front**.
  - Todo en la rama `feature/add-contacts-and-locations` (sin commitear; el commit lo hace Product owner). El directorio de cafeterías se retrabajó al estilo de `offerings` (`5874407`, `b8b7fe5`).
- **Pendiente en el API:** `update` y `close` de una evaluación con oferta nula (el servicio lee `evaluation->offering`) y `EvaluationResource` con oferta nula; el `configure()` del `OfferingFactory` de Product owner crea una baseline en todas las ofertas y deja 4 tests de `SpecialistTest` en rojo.
- **Por qué:** decisión de Product owner del 7 oct.
- **Afecta:** contrato (`offering` nulo en las evaluaciones); add-specialist-evaluations (lista, detalle y formulario: estado "oferta inexistente", sin editar ni cerrar) y add-public-evaluations (listados públicos) — corrección o ajuste de diseño cuando llegue el contrato.

### 2026-10-07 — consenso, barra lateral de gestión y leyenda 1–9 (respuestas de Product owner)
- **Decisión:**
  - **Consenso de la oferta:** la pestaña "Consenso" usa solo `cataConcordance` para la rueda y las tarjetas: una sola rueda (CATA, grupo `aromatics`), sin rueda "Perfil sensorial"; Main tastes y Defects leen `cataConcordance`. `mouthfeel` sigue en la rueda CATA como grupo de referencia aparte (separación más marcada, leyenda general de grupos, leyenda interna aromáticos/mouthfeel). `sensoryTaxonomy` se muestra como secciones plegables por eje (fragrance, aroma, flavor, aftertaste, mouthfeel), colapsadas, con el `Collapsible` compartido y `DescriptorChipGroup readOnly` sobre el constructor de filas compartido, con leyenda `n/total` por nota. Una oferta no verificada no muestra la tarjeta SCA, sino un mensaje de "aún no verificada".
  - **Rejilla del catálogo:** 3 columnas con un umbral de región más bajo (valor no fijado por Product owner; recomendado ~960px).
  - **Barra lateral de gestión de la cafetería:** una sola entrada "Administrar ofertas" (en "Manage offerings", ca "Gestionar ofertes"), hacia la lista y marcada como actual también en la ruta de crear; "Nueva oferta" desaparece de la barra (crear sigue accesible desde la lista). "Administrar ubicaciones" la añade add-coffeeshop-location junto a ella.
  - **Leyenda 1–9 del formulario de evaluación:** sección plegable informativa "Impresión de calidad afectiva" tras Main tastes, con las nueve etiquetas en orden SCA (textos es/en/ca en el handoff de add-specialist-evaluations, Q10); sigue la regla de estado inicial de la ronda 1.
  - **Backlog:** R10 (borde de error de las facetas de fila en el tema tradicional). El refactor de piezas de acceso y estado propuesto por add-coffeeshop-location pasa a R11.
- **Por qué:** respuestas de Product owner del 7 oct (handoffs de add-offering-catalog Q1–Q5, add-offering-management Q1, add-specialist-evaluations Q10, refine-facet-controls Q1–Q2).
- **Afecta:** add-offering-catalog (ronda 1); add-public-evaluations (si reutiliza el panel de consenso o la pestaña "Evaluación provisional": solo `cataConcordance`, ejes como secciones plegables); add-offering-management (ronda 1, tareas 8–10); add-coffeeshop-location (resumen, Open 3: añade su entrada junto a "Administrar ofertas"; Open 4 → R11); add-specialist-evaluations (ronda 2); add-offering-facets y add-evaluation-facets (R10).

### 2026-10-07 — catálogo en una columna y `offeringId` nulo (respuestas de Product owner)
- **Decisión:**
  - **Catálogo:** la lista de ofertas pasa a una sola columna centrada y más estrecha que la región; varias columnas eran solo para la landing. Sustituye "3 columnas con un umbral más bajo" de la entrada anterior. Ancho: pendiente de una decisión complementaria de Product owner.
  - **Evaluación de una oferta borrada:** el front asume `offeringId` nullable en las evaluaciones (Product owner actualiza el API y pasa el contrato). La fila muestra "Oferta inexistente" sin pedir la oferta; la evaluación se abre en solo lectura, sin editar ni cerrar, y se puede borrar.
- **Por qué:** respuestas de Product owner del 7 oct.
- **Afecta:** add-offering-catalog (ronda 1, punto 4); add-specialist-evaluations (ronda 2, punto 2; las tareas que necesiten el tipo regenerado esperan al contrato); add-public-evaluations (filas y detalle públicos con `offeringId` nulo); add-coffeeshop-directory (la pestaña de ofertas de la cafetería sigue el mismo patrón de una columna).

### 2026-10-07 — `offeringId` nulo: el contrato ya lo comunica (Product owner; corrige la entrada anterior)
- **Decisión:** el contrato `290d22e` (API `PROD 37d499a`) comunica el caso en las descripciones de `deleteAnOffering` y `deleteMultipleOfferings` ("specialists' evaluations are kept without an offering"), aunque el esquema de respuesta no marca `offeringId` como `nullable`. El front amplía el tipo a `string | null` en un único punto de lectura (alias `EvaluationItem` / `EvaluationDetail`), sin editar `schema.ts`; ninguna tarea espera al contrato. Sustituye "las tareas que necesiten el tipo regenerado esperan al contrato" de la entrada anterior. Sin oferta, "Oferta inexistente" sustituye la cabecera de la oferta y el nivel de tueste que viene de su café; el método de extracción se mantiene (orquestador, desde la ronda 2 punto 2).
- **Por qué:** Product owner, 7 oct ("sí es comunicable"); informe del design lead.
- **Afecta:** add-specialist-evaluations (ronda 2, punto 2; resumen, Open 14); add-public-evaluations (resumen: fila y vista pública con "Oferta inexistente", sin enlace ni petición de la oferta; Open 12; necesita una actualización de artefactos, ya tiene propose).

### 2026-10-07 — superficies de página: fondo, bandas y secciones flotantes (Product owner)
- **Decisión:**
  1. El área principal del shell deja el crema y pasa a un fondo verde azulado claro, escalón entre el verde del header/sidebar y el crema de formularios y tarjetas (MVC `--color-neutral`). Propuesta del design lead: `surface-page` apunta a `sage-100` en el tema claro; el oscuro sin cambios (abierto para Product owner).
  2. La cabecera de cada sección va en una banda propia (`surface-section`), distinta del cuerpo crema.
  3. El cuerpo de la vista lleva un borde de 1px `border-subtle`.
  4. Las secciones cuelgan del fondo dentro de un contenedor de cuerpo, separadas por un gap (MVC, formulario de evaluaciones); aplica a las vistas en general (formularios, detalle, perfil). Propuesta: variante `section` de la `Card` compartida; contenedor solo de maquetación.
  - El catálogo usa `PageSection surface="page"` para que el fondo se vea en los márgenes laterales (ronda 1 de catalog, punto 4).
- **Por qué:** decisiones de Product owner del 7 oct; resumen del design lead `docs/design/refine-page-surfaces/design-summary.md`.
- **Afecta:** refine-page-surfaces (nuevo; va primero, antes de la comprobación en navegador y el archive de catalog); add-offering-catalog (ronda 1, punto 4; secciones por eje del consenso); add-specialist-evaluations y add-offering-management (adopción de la tarjeta de sección cuando se mergee); add-public-evaluations (actualización de artefactos antes del apply); add-user-account (resumen, Open 3); add-user-contact, add-coffeeshop-location y add-coffeeshop-directory (resúmenes).

### 2026-10-07 — superficies de página: respuestas a Open 1–3 y refactors previos (Product owner y orquestador)
- **Decisión:**
  - Fondo claro: `surface-page` → `sage-100` (tema tradicional). Fondo oscuro sin cambios (`night-petrol-950`).
  - Adopción: catalog, specialist-evaluations y management reciben una ronda pequeña de adopción de la tarjeta de sección tras su ronda actual y antes de su archive (sin borde verde izquierdo, banda de cabecera, borde del panel de management 2px → 1px, padding lateral de la cabecera de evaluations 1rem → 1.5rem desde 768px). user-account adopta en un cambio pequeño posterior; add-user-contact se aplica después de ese cambio. public-evaluations adopta por actualización de artefactos antes de su apply.
  - Orquestador: el propose de add-coffeeshop-directory y add-coffeeshop-location puede ir antes de que se mergeen R9/R12 y R11; solo su apply espera a los refactors. Listas de directory y location en una columna.
- **Por qué:** respuestas de Product owner del 7 oct (P1a, P2a, P3a); resúmenes del design lead (`2ce2cd8`).
- **Afecta:** refine-page-surfaces; add-offering-catalog, add-specialist-evaluations, add-offering-management (ronda de adopción); add-user-account; add-user-contact; add-public-evaluations; add-coffeeshop-location; add-coffeeshop-directory.

### 2026-10-07 — mapa del directorio con Leaflet y `perPage` (Product owner)
- **Decisión:**
  - Se aprueba la dependencia `leaflet@1.9.4` + `@types/leaflet@1.9.22` (BSD-2-Clause) para el mapa del directorio de cafeterías (add-coffeeshop-directory D16): conmutador lista/mapa, vista de mapa, botón de mapa en la tarjeta, mapa a pantalla completa en móvil, mapa de la pestaña Ubicaciones, y la línea `img-src` de la CSP para las teselas.
  - API: `page` y `perPage` (estándar 15, máximo 50) en las cinco listas paginadas (hotfix `6eb8d0f`/`e84b444`). Product owner decide no documentarlo en Scribe: el front lo trata como comunicado por Product owner, igual que `offeringId` nullable. La landing pide `perPage=6` (refine-list-pagination, Q1 opción A).
  - `openspec/config.yaml` actualizado por Product owner (`bbf5e66`): `offering-catalog` incluye el directorio; `offering-management`, las ubicaciones; `user-account`, los datos de contacto.
- **Por qué:** respuestas de Product owner del 7 oct.
- **Afecta:** add-coffeeshop-directory (actualización de artefactos: tareas del mapa); refine-list-pagination; add-coffeeshop-location; add-user-contact.

### 2026-10-07 — geocodificación propia y mandato de autonomía (orquestador, por mandato de Product owner)
- **Decisión:**
  - Mandato de Product owner (7 oct, tarde): el orquestador cierra los puntos en autonomía, salvo los que cambien lo pactado en un design summary.
  - add-coffeeshop-location Open 5 / D5: geocodificación con un `fetch` propio a Nominatim en el único punto de entrada `src/shared/lib/geocoding` (opción C del resumen), sin dependencia nueva. `leaflet-geosearch` se descarta: solo acepta texto libre, no admite cancelar ni comprueba el estado (verificado en el propose). La CSP `connect-src` a Nominatim ya estaba aprobada (entrada "contactos y locales").
  - Textos propuestos en en/ca de los proposes del 7 oct (`urlFormatError`, `signedOutText`, `mapLoading`, `locationNoMap`, "Administra les ubicacions") se aceptan tal cual.
- **Por qué:** mandato de Product owner; resumen de add-coffeeshop-location (Open 5 ofrece C); recomendación del arquitecto.
- **Afecta:** add-coffeeshop-location (D5 cerrado; sin tarea de librería); add-user-contact; add-coffeeshop-directory.

### 2026-10-07 — revisión visual previa al archive: arreglos compartidos (orquestador y Product owner)
- **Decisión:**
  - Catalog pasa la revisión del design lead y se archiva y mergea (`589b358`). Evaluations y management cumplen sus rondas, pero esperan a dos arreglos de componentes compartidos ya mergeados, cada uno en su propio cambio: `fix-collapsible-overflow` (un `Collapsible` plegado sigue ocupando altura: hueco en blanco a 375 px) y `fix-combobox-blur` (el `Combobox` se cierra y vacía al llegar los resultados; impide elegir inventario al crear una oferta).
  - Product owner aprueba `fix-auth-return-query`: la ruta de vuelta tras iniciar sesión conserva la query (`pathname + search`), validada como ruta interna igual que hoy; sin tocar tokens, PKCE, CSP ni `proxy.ts`.
  - Catalog D13: si un bloque de selección no tiene notas, su tarjeta se ensancha (sin columna de leyenda); se mantiene como dice el diseño.
- **Por qué:** informe del design lead del 7 oct; mandato de autonomía; respuesta de Product owner ("sí, procede").
- **Afecta:** add-specialist-evaluations y add-offering-management (archive tras los arreglos); add-offering-facets, add-evaluation-facets y add-coffeeshop-location (usan `Combobox`/`Collapsible`); auth.

### 2026-10-07 — nada nuevo en el diseño y suite de tests reducida (Product owner)
- **Decisión:**
  - Nada se añade al diseño sin autorización de Product owner: se trabaja con los componentes actuales. Los puntos que el orquestador cierre se resuelven eligiendo entre lo ya pactado, nunca añadiendo. R14 (página 404 con tema) queda en el backlog con la última prioridad.
  - Tests: en el repo solo quedan los que verifican los requisitos de `openspec/specs/` (simplificados, uno por escenario) y las guardas de reglas del proyecto. Los de refactors se borran o pasan a calidad. El resto va a la carpeta local `Sprint5/tazavera-front-qa` (sin remoto), no se corre en cada cambio y se ejecuta una vez al final del proyecto. Cada cambio escribe solo los tests que nombran sus tareas. Antes de mover nada, un plan con totales (`claude/test-reduction-plan`) para Product owner.
  - OpenCode no se usa mientras el portátil vaya justo de memoria; proposes y applies van a la nube.
- **Por qué:** Product owner, 7 oct (unos 2.240 tests inmanejables; timeouts bajo carga, R15).
- **Afecta:** todos los cambios abiertos (prompts de build: solo los tests nombrados); AGENTS.md `## Testing` (texto pendiente de que Product owner lo aplique); add-public-evaluations, add-evaluation-facets, add-coffeeshop-location, add-coffeeshop-directory, refine-list-pagination.

### 2026-10-07 — R9 resuelto y piezas compartidas (orquestador)
- **Decisión:**
  - `ClearFiltersButton` vive en `@/shared/ui` (props `label`, `keep`). add-evaluation-facets y add-public-evaluations lo usan con `keep={["orderBy","orderDirection"]}` y no crean `ClearEvaluationFiltersButton` (artefactos actualizados `39a4504`, `8b13c84`). En R12, `FilteredOfferingsResults` (widget `offering-list`) lo usa con `keep={OFFERING_SORT_KEYS}`.
  - add-coffeeshop-location: el `isValidEmail` existente se mueve sin cambios a `@/entities/contact`; `user-account` lo importa de ahí. Sin copia.
  - refine-list-pagination D3: la fila "current 10" de la tabla se corrige para seguir la regla de D3 (puntos suspensivos separados si siguen a páginas distintas); lo visible no cambia.
  - Seguimientos en el backlog: R13 (`EvaluationsAccess` sobre el `SessionGate` compartido), R15 (tests lentos de `EvaluationForm`).
- **Por qué:** dos artefactos fijados que se contradecían o no se podían construir tal cual; se elige la opción que cambia menos y no añade nada.
- **Afecta:** add-evaluation-facets, add-public-evaluations, add-coffeeshop-directory (usa el botón y el widget compartidos; además necesita decidir si la paginación conserva `?tab=`), add-coffeeshop-location, refine-list-pagination.

### 2026-10-07 — paginación con `?tab=` en el directorio (orquestador, cerrado para revisión)
- **Decisión:** `FilteredOfferingsResults` (widget `offering-list`) gana una prop opcional que añade claves a la query de los enlaces de paginación, sin tocar la petición a la API. El catálogo no la pasa y no cambia. La pestaña "Ofertas" del directorio la usa con `tab`. La implementa la actualización de artefactos de add-coffeeshop-directory, junto con la adopción de R9 y R12.
- **Por qué:** el resumen del directorio (§5) y el de R12 (§3.2) dicen que la paginación conserva `tab`, pero el código no se puede construir así: `buildOfferingsQuery` descarta `tab` (R12, Open 1 y Risk 2). Es la opción que menos cambia y no añade nada visible fuera de lo pactado.
- **Afecta:** add-coffeeshop-directory; extract-filtered-offerings (Open 1 cerrado).

### 2026-10-07 — verificación con navegador en la nube (orquestador)
- **Decisión:** con el portátil sin memoria, las tareas de verificación visual, los checks y los verify se hacen en sesiones de la nube con Playwright y una API simulada. La sesión commitea las capturas y el resultado en el handoff (`docs(<cap>): update handoff for <change-id>`) antes de marcar el checkbox de la tarea.
- **Por qué:** el sistema detuvo los procesos locales por falta de memoria (7 oct, ~21:20 UTC); mandato de autonomía de Product owner ("tú eres autónomo", "no esperes por mí").
- **Afecta:** refine-list-pagination, add-coffeeshop-location, add-evaluation-facets, extract-filtered-offerings, y los siguientes applies (public-evaluations, coffeeshop-directory).

### 2026-10-07 — R14 autorizado si queda tiempo (Product owner)
- **Decisión:** R14 (página 404 localizada y con tema) entra si queda tiempo, después de public-evaluations, coffeeshop-directory y la reducción de tests. Cambio nuevo `add-not-found-page` (app-shell): el design lead redacta el resumen solo con componentes y tokens existentes; el orquestador lo aprueba si no deja puntos abiertos.
- **Por qué:** Product owner, 7 oct noche ("si te queda tiempo incluirá R14").
- **Afecta:** add-not-found-page (nuevo); backlog R14 (sale al archivar ese cambio).

### 2026-10-08 — reducción de la suite aprobada, con prioridad alta (Product owner)
- **Decisión:**
  - Se aprueba el plan `docs/testing/test-reduction-plan.md` (rama `claude/test-reduction-plan`): de 2.239 casos quedan en el repo solo los que verifican escenarios de `openspec/specs/` (uno por escenario) y las guardas; el resto pasa a `../tazavera-front-qa` o se borra.
  - Las guardas se simplifican a un test general por regla: `theme-tokens` pasa de 707 casos a 4 (temas completos, contraste de los pares registrados, tipografía, radios y foco); `icons` pasa de 13 a 1. Los valores de diseño sin escenario van a QA. Objetivo: unos 820 casos en total.
  - No se crean guardas nuevas. Un token nuevo solo registra su par en la matriz existente.
  - Esto autoriza la excepción a `.claude/CLAUDE.md` §3 ("never remove or weaken a test") para lo que mueve o borra este plan.
  - Se aplica en dos pasadas: ahora sobre `develop`, sin tocar los tests que modifican las ramas en vuelo; la segunda pasada, cuando esas ramas estén mergeadas.
- **Por qué:** Product owner, 8 oct ("esa cantidad de test no es manejable", "OK con alta prioridad").
- **Afecta:** todos los cambios abiertos (sus prompts de build: no crear guardas); AGENTS.md `## Testing` (viñeta "no new guard tests", pendiente de Product owner); `.claude/CLAUDE.md` §3.

### 2026-10-08 — última tarea: revisión técnica ISO 25010 y hoja de ruta de refactorización (Product owner)
- **Decisión:** al final, con todos los cambios mergeados, una sesión en la nube de solo lectura escribe `docs/review/technical-review.md` (lo commitea el orquestador en `develop`). Contenido:
  - Cuadro de mando ISO/IEC 25010 con nota A–E por característica (la peor de sus indicadores).
  - Mantenibilidad: SOLID en React/FSD, coherencia, sobredimensionamiento; métricas SIG ligeras (tamaño, complejidad ESLint, `jscpd`, `dependency-cruiser`, `knip`, props por componente).
  - Testabilidad (escenarios cubiertos, duración de la suite), adecuación funcional (contrato y escenarios), seguridad (`npm audit`, CSP, cabeceras, tokens), usabilidad (guardas y axe con Playwright en 5–6 pantallas con la API simulada), rendimiento (bundle por ruta de `next build`).
  - Hoja de ruta de refactorización: hallazgos agrupados en cambios propuestos (change-id y capability), esfuerzo S/M/L con total, impacto (nota actual → objetivo), prioridad, orden por dependencias FSD y riesgo. Candidatos al backlog desde R17.
  - Herramientas solo con `npx`, sin dependencias nuevas.
- **Por qué:** petición de Product owner, 8 oct.
- **Afecta:** cierre del proyecto; backlog.
- **Orden (Product owner, 8 oct):** directory y public-evaluations → `add-not-found-page` (R14, ya no condicionado a que sobre tiempo) → revisión técnica.

### 2026-10-08 — refactorización por vía rápida en `qa` y tipos de cambio (Product owner)
- **Decisión:** `develop` pasa a `master` para las UAT. Las refactorizaciones van en rondas sobre la rama `qa` (vía rápida: sin design summary, explore ni revisión de artefactos; archivo al pasar validación, suite QA, tsc, lint, build y verify) y `qa` vuelve a `develop` al final de cada ronda tras la revisión visual. Cada cambio y entrada del backlog lleva `Type: Refactor (fast lane)` o `Change`. Toda la hoja de ruta de la revisión técnica (R20–R39) va por vía rápida, incluidas R30 (caché de referencias a 1 h; cambia D9 de add-public-evaluations, resuelve R19), R31 (cabeceras de seguridad, manteniendo permitidos el mapa y la ubicación) y R32 (etiquetas es/en/ca que escribe el arquitecto, con R17). Los tests de QA pasan a `qa/` en el repo del front (`npm run test:qa`). El orquestador lleva las conversaciones de diseño; explore ya no se ejecuta.
- **Por qué:** Product owner, 8 oct.
- **Afecta:** add-public-evaluations (D9), todas las rondas de refactorización, `AGENTS.md` (Refactor changes, Testing), `.claude/CLAUDE.md` §13.

### 2026-10-08 — respuestas sobre R4, R5, R8 y R18 (Product owner)
- **Decisión:** R18: un elemento que no existe muestra en su propia vista un mensaje "<elemento> no encontrado" (o "sin resultados"), sin Reintentar; el estado HTTP no se toca. R5: una sola función de idioma en `src/shared/lib/i18n`; el idioma solo se elige con el botón de idioma de la cabecera. R4: menús de tarjeta a 16px (se ajusta `base-controls`). R8: antes, la API documenta sus 422 y los 404 de lecturas por identificador con ficheros de ejemplo de Scribe (R40, en `tazavera-api`, local).
- **Por qué:** Product owner, 8 oct.
- **Afecta:** offering-catalog y evaluations (R18), auth (R5), base-controls (R4), formularios (R8), `tazavera-api` (R40).
