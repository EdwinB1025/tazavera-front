Status: draft — pending Product owner review

# Design summary — add-register-landing

- **Change-id:** `add-register-landing`
- **Type:** `Change` (traditional workflow 3a; new screen, new texts, header behaviour change)
- **Capabilities:** `user-account` (registration landing and routes), `app-shell` (header "Register" action), `landing` (registration links removed from the entry page and About us)
- **Requested by Product owner:** 2026-10-21 (approved request, relayed by the orchestrator)
- **Constraint (decisions log 2026-10-07 "nada nuevo en el diseño"):** compose existing components, tokens and patterns. Anything new (an icon export, a new placement in the header) is listed under "Open".

## 1. Goal

Today a visitor reaches registration only through two text links in the entry-page hero (`src/pages/home/ui/HomeHero.tsx:80-87`) and in the "who it is for" section of About us (`src/pages/about/ui/AboutContent.tsx:116-123`). Product owner wants:

1. a "Register" action in the app header, next to the sign-in control, shown only while the visitor is not authenticated;
2. that action to open a new registration landing page that explains the two ways to join (specialist, coffee shop) and leads to each existing form;
3. the registration links removed from the entry page and About us, with their now-unused catalog texts;
4. the landing page (and the header action) unavailable to an authenticated user: a signed-in user who reaches the page is sent away.

## 2. Scope

**In:**
- a registration landing page under the `[locale]` segment (route: Open 1);
- a header "Register" action for anonymous sessions (placement below `md`: Open 2);
- removal of both registration link groups and their six catalog keys per locale;
- the session gate of the landing page, reusing the existing registration-route gate (§4);
- new texts in es/en/ca (§8).

**Out:**
- any change to the two registration forms, their fields, their success panel or `POST /register`;
- any change to the auth flow (popup, redirect, return route, `login_hint`, tokens);
- a "Already have an account? Sign in" line on the landing (Open 8);
- R45 (first location in coffee-shop registration): untouched.

## 3. Findings on the current code (verified by reading `develop` working tree)

| Fact | Source |
|---|---|
| The header shows "Sign in" only for `session.state === "anonymous"`, the user menu only for `"authenticated"`, and neither while `"loading"`. "Sign in" is `Button variant="nav-button"`. | `src/widgets/app-header/ui/AppHeader.tsx:143-155`; app-shell "Signed-out header", "Session states in the shell" |
| Auth state on the client comes from `useSession()` (`@/features/auth`); tokens live in memory only. The session is injected into `AppHeader` by `SessionShell`, header texts are composed in `src/app/shell/AppShell.tsx:70-94` from the `shell` catalog. | `AppShell.tsx`, decisions log 2026-10-05 add-auth |
| **Authenticated users are already sent away from every `/[locale]/register*` route**: `RegisterClient` shows `LoadingStatus` while the session resolves, renders nothing and calls `router.replace(\`/${locale}\`)` when authenticated (client-side navigation keeps the in-memory tokens). | `src/pages/register/ui/RegisterClient.tsx:43-51`; user-account "Registration routes", scenario "A signed-in visitor is taken to the entry page"; decisions log 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (last sentence); R78 `land-on-home-after-registration` |
| Gated screens for *authenticated* content use `SessionGate` (`@/shared/ui`) with a signed-out prompt; `EvaluationsGate` is that pattern's client seam. It is the inverse of what the landing needs (anonymous-only), so the landing reuses `RegisterClient`'s gate, not `SessionGate`. | `src/shared/ui/SessionGate.tsx`, `src/widgets/evaluations-gate/ui/EvaluationsGate.tsx` |
| No other code links to `/register`: the auth return route is generic (`currentRoute()`), `login_hint` carries the user's ULID (not a route), the success panel calls `signIn()` with the current route, the cancel action goes to `/{locale}`, the sidebar has no registration entry. Only `HomeHero`, `AboutContent`, their tests and the two route files reference the paths. | Grep of `src/`, `app/`, `qa/`, `proxy.ts`; `src/features/auth/api/authorize.ts:79-85`, `src/features/auth/model/return-route.ts`, `RegisterSuccessPanel.tsx`, `RegisterClient.tsx:66` |
| The signed-out header is tight at 375px: `fit-header-at-375` (2026-10-08) fixed a 2–14px overflow by hiding the locale code below `md` and tightening gaps; the Catalan label was shortened to "Entra" (`shorten-ca-header-sign-in`) because it wrapped. | archived proposals of both changes; app-shell scenarios "Header fits a small viewport", "Catalan sign-in label fits on one line" |
| The MVC has no registration chooser: its header shows only "Sign In" (`resources/views/components/welcome/navbar.blade.php:17`) and its register view is a single form without a role (`resources/views/livewire/auth/register.blade.php`). | MVC (found under `C:/Programing/Full Stack/Sprint5/tazavera-app`; the `C:/Porjects/...` path does not exist) |

## 4. Session gate of the landing (settled; reuse)

Settled by the decisions log (2026-10-06, "`/[locale]/register*` con sesión `authenticated` lleva al inicio con navegación interna") and the user-account requirement "Registration routes", which the landing joins because it lives under `/[locale]/register`. Mechanism, identical to `RegisterClient`:

| Session state | Landing shows | Header shows |
|---|---|---|
| `loading` | the heading block and `LoadingStatus` (text `account.loading`) in place of the options; no option card | neither "Sign in" nor "Register" (same rule as "Sign in", app-shell "Session states in the shell") |
| `anonymous` | the heading block and the two option cards | "Sign in" and "Register" |
| `authenticated` | nothing in the gated region; `router.replace("/{locale}")` (client-side, no reload, no message) | the user menu; no "Register" |

- Server-side detection is impossible (tokens only in browser memory, settled), so the gate is client-side, exactly as for the forms.
- The forms already redirect authenticated users: the orchestrator's default 3 is **closed** (no change needed, no open point).
- Reuse: the gate logic (≈10 lines: `useSession`, `useRouter`, the effect and the three branches) would otherwise be copied from `RegisterClient`. Both consumers live in the same page slice `src/pages/register`, so the recommendation is one slice-local client piece used by both (Open 7).

## 5. Components and FSD placement

| Piece | Layer / slice | Reuse |
|---|---|---|
| `app/[locale]/register/page.tsx` (landing) and the moved specialist route (Open 1) | routing | thin route files, like today |
| `RegisterLandingScreen` (server; reads the `account` catalog, renders the heading block and the client region) | `src/pages/register/ui/` | mirrors `RegisterScreen` |
| `RegisterLandingClient` (client; gate + option cards) | `src/pages/register/ui/` | gate per §4 |
| Option card | composed in the slice from `Card layout="stacked"` (content variant), `CardContent`, `RouteButton` | About us "How we evaluate" cards (`AboutContent.tsx:90-109`); `RegisterSuccessPanel` heading/text pattern |
| Header "Register" action | `src/widgets/app-header/ui/AppHeader.tsx` | `RouteButton variant="nav-button"` (base-controls "Navigation controls by position": a navigation control outside a page header's first line is an action button that opens its route) |
| Navigation-menu entry (if Open 2 = A) | `src/widgets/app-header/ui/NavigationMenu.tsx` | `DropdownMenuItem asChild` + `next/link`, as the existing entries |

No new shared component, variant or token. No contract operation consumed.

## 6. Layout and spacing (criterion A)

### 6.1 Landing page

```
main area (shell, bg surface-page)
└─ wrapper div — flex-1                                            [RegisterScreen]
   └─ PageSection surface="page"                                   [content-structure "Page sections"]
      │  py 3rem (<768) / 4rem (≥768); container max 72rem, centred,
      │  px 1rem (<768) / 2rem (≥768); containerClassName "flex flex-col"
      └─ column — flex flex-col, full width, 2rem between blocks   [RegisterScreen: gap-8]
         ├─ heading block — flex flex-col, 0.5rem apart             [RegisterScreen: gap-2]
         │    ├─ h1 · type-heading   (registerLandingTitle)
         │    └─ p  · type-body      (registerLandingIntro)
         └─ gated region
              loading:   LoadingStatus (centred row, 0.5rem icon–text)
              anonymous: options grid — 1 column; 2 equal columns from 768px; 1.5rem gap   [About "How we evaluate": gap-6]
                 ├─ option card (specialist)  ┐ order: Open 6
                 └─ option card (coffee shop) ┘
```

Option card (both identical in structure):

```
Card layout="stacked" (content variant)
│  bg surface-card · left border 4px border-accent · radius rounded-container · shadow-lg ·
│  flex column, fills the grid row height (h-full)
└─ CardContent (stacked): padding 1.5rem all sides; takes the free height (flex-1)
   └─ column — flex flex-col, full height, 1rem apart                      [RegisterSuccessPanel: gap-4]
      ├─ h2 · type-card-heading            (…Title)
      ├─ p  · type-body                    (…Text)
      └─ action row — pushed to the bottom (mt-auto), 0.5rem extra top space [HomeHero: mt-2 → 1.5rem below text]
           └─ RouteButton variant="action-1" size="base" → form route
```

| Element | Padding | Gap / margin to neighbours | Children gap | Border (width, side, token) | Radius | Container / layout |
|---|---|---|---|---|---|---|
| Wrapper `div` | none | fills the main area (`flex-1`) | — | none | none | shell main area |
| `PageSection` | 3rem / 4rem vertical; 1rem / 2rem sides | sole section | `flex flex-col` | none | none | full width |
| Column | none | — | 2rem (heading block ↔ gated region) | none | none | full container width |
| Heading block | none | 2rem below | 0.5rem (h1 ↔ intro) | none | none | column |
| `LoadingStatus` | none | 2rem below the heading block | 0.5rem icon–text | none | none | centred row |
| Options grid | none | 2rem below the heading block | 1.5rem (row and column) | none | none | 1 column; 2 equal columns from 768px |
| Option card | none (its content pads) | 1.5rem to the other card | single part | 4px, left, `border-accent` | `rounded-container` | grid cell, full row height |
| Card content | 1.5rem all sides | — | 1rem (column) | none | none | card |
| Card heading `h2` | none | 1rem above the text | — | none | none | content column |
| Card text `p` | none | 1.5rem above the action (1rem gap + 0.5rem) | — | none | none | content column |
| Action row | 0.5rem top | at the card's bottom (`mt-auto`) | — | none | none | start-aligned, button at its own width |
| `RouteButton` | 1rem sides, height 2.5rem (base) | — | 0.5rem icon–label (no icon) | 1px, all sides, `action-1-border` | `rounded-pill` | min width 10rem, grows with label, one line |

- A single button per card: the "Action group" two-column rule does not apply (it applies to two or more buttons).
- Equal-height cards and aligned buttons follow from the grid's stretch plus `h-full`/`flex-1`/`mt-auto` (computed from the classes; unverified in a browser).
- At 1280px each card is 532px wide (computed: 72rem = 1152px − 2 × 32px side padding − 24px gap = 1064 / 2).
- At 375px each card is 343px wide (computed: 375 − 2 × 16); the longest es label "Regístrate como especialista" fits on one line inside 343 − 2 × 24 − 4 = 291px (estimate ≈ 260px with 32px padding; unverified).

### 6.2 Header "Register" action

- **Component:** `RouteButton variant="nav-button"` → landing route; label `shell.register`. Same treatment as "Sign in" (`nav-button-bg`, `nav-button-text`, 1px `nav-button-border`, hover `nav-button-*-hover`, `rounded-pill`, height 2.5rem, 1rem side padding, no action min-width because the navigation treatment keeps its own geometry).
- **Position:** in the header's right group, **immediately before "Sign in"** (Open 3), so the session control keeps the rightmost slot it shares with the user menu. Gap to neighbours: the right group's existing `gap-2` (0.5rem) below `md`, `gap-4` (1rem) from `md`.
- **Visibility:** only for `session.state === "anonymous"`; hidden while loading and when authenticated (§4).
- **Small viewport:** Open 2 (blocks propose). Recommended: from `md` in the header; below `md` as an entry of the existing navigation menu (three-lines control), after "About us", shown only for anonymous sessions, with the menu-entry treatment (`nav-text`, `nav-text-hover`, decorative icon, no underline) and the menu's existing padding and gaps (no new values).
- **Current page:** the header action is not a navigation entry; it carries no `aria-current`. If Open 2 = A, the menu entry follows the menu rule and carries `aria-current="page"` on the landing route (same `path === currentPath` check).

### 6.3 Entry page and About us after the removal

- **Hero:** the actions block (`mt-2 flex flex-col items-start gap-4`) keeps only the explore button; the `nav` group and `LINK_GROUP_CLASSES` go. The hero's other spacing is unchanged. The explore button still sits 1.5rem below the paragraph.
- **About us, section 4 ("who it is for"):** keeps the audience text alone in its `PageSection surface="section"`; the `nav` group and `LINK_GROUP_CLASSES` go; `STACK_CLASSES` (1rem gap) stays harmless with one child. The five-section order and alternating surfaces are unchanged.
- The landing spec's "Link groups" scenario ("the two registration links render on either page") loses its subject; the architect removes or rewords it in the delta.

## 7. States, accessibility and semantic tokens

**Accessible names and structure:**
- Landing: one `h1` (`registerLandingTitle`); each card an `h2`; each `RouteButton` named by its visible label (two distinct labels). No landmark of its own (the old `nav aria-label="Registro"` disappears with the links).
- Header action: named by its visible label `shell.register`; keyboard reachable; shared focus ring (`focus-visible:focus-ring` in `Button`).
- `LoadingStatus`: `role="status"`, spinner `aria-hidden`, honours `prefers-reduced-motion`.
- Focus: no programmatic focus on arrival (route announcer handles the change), like the register forms.

**States:** buttons rest / hover / keyboard focus as the shared `Button`; no disabled or busy state (navigation only). Landing: loading / options / redirected (§4).

**Tokens and contrast (criterion D).** Every gated pair is already registered in `src/app/styles/theme-tokens.test.ts` (checked by Grep):

| Part | Tokens | Registered pair |
|---|---|---|
| `h1`, intro | `text-primary` on `surface-page` | existing (register and about pages) |
| Card heading and text | `text-primary` on `surface-card` | line 299 |
| Card action | `action-1-text` on `action-1-bg`; hover `action-1-text-hover` on `action-1-bg-hover`; border `action-1-border` on `surface-card` | lines 330, 334, 427 |
| Header action | `nav-button-text` on `nav-button-bg` (border exempt) | lines 358, 394–395 |
| Menu entry (Open 2 = A) | `nav-text` / `nav-text-hover` on the nav menu surface | existing entries' pairs |
| Focus ring | `focus-ring` on `surface-card` | line 381 |
| Card left border, shadow, page surfaces | decorative | not gated |

No new pair, token or guard test. Ratios were **not re-measured** in this draft: the session's shell access was denied, so no script could run (Unverified 1).

## 8. Texts (catalog areas, passed as props)

New keys. Proposed wording; Product owner may revise (Open 9).

**`shell` area** (`messages/{es,en,ca}/shell.json`, read by `AppShell`, passed through `AppHeaderTexts`):

| Key | es | en | ca |
|---|---|---|---|
| `register` | Registrarse | Register | Registra't |

**`account` area** (`messages/{es,en,ca}/account.json`, read by `RegisterLandingScreen`, like `RegisterScreen`):

| Key | es | en | ca |
|---|---|---|---|
| `registerLandingTitle` | Únete a Tazavera | Join Tazavera | Uneix-te a Tazavera |
| `registerLandingIntro` | Elige cómo quieres participar en Tazavera. | Choose how you want to take part in Tazavera. | Tria com vols participar a Tazavera. |
| `registerLandingSpecialistTitle` | Especialista | Specialist | Especialista |
| `registerLandingSpecialistText` | Cata a ciegas las ofertas de las cafeterías con el protocolo de la SCA y registra tus evaluaciones. | Cup the coffee shops' offerings blind with the SCA protocol and record your evaluations. | Tasta a cegues les ofertes de les cafeteries amb el protocol de l'SCA i registra les teves avaluacions. |
| `registerLandingSpecialistAction` | Regístrate como especialista | Register as a specialist | Registra't com a especialista |
| `registerLandingCoffeeshopTitle` | Cafetería | Coffee shop | Cafeteria |
| `registerLandingCoffeeshopText` | Publica tus ofertas, recibe la evaluación de especialistas y muestra con pruebas lo que sirves. | Publish your offerings, have them evaluated by specialists and show with evidence what you serve. | Publica les teves ofertes, rep l'avaluació d'especialistes i mostra amb proves el que serveixes. |
| `registerLandingCoffeeshopAction` | Registra tu cafetería | Register your coffeeshop | Registra la teva cafeteria |

- Reused: `account.loading` (loading status). The action labels reuse the exact wording of the removed hero/about labels, so the visible names stay familiar. The card texts paraphrase the About us copy (`aboutStepCupping`, `aboutAudienceText`).
- The en catalog spells "coffeeshop" in the account area and "coffee shops" in the shell; the new card title uses "Coffee shop" as the header does (semantic choice; flag in Open 9).

**Removed keys** (`messages/{es,en,ca}/landing.json`, six per locale, no other consumer found by Grep): `heroCoffeeshopRegisterLabel`, `heroSpecialistRegisterLabel`, `heroRegisterNavigation`, `aboutCoffeeshopRegisterLabel`, `aboutSpecialistRegisterLabel`, `aboutRegisterNavigation`. With them go the props `coffeeshopRegisterLabel`, `specialistRegisterLabel`, `registerNavigation` of `HomeHeroTexts` and `AboutContentTexts`, and the now-unused `Link` imports in both files.

The existing catalog guard ("an area is complete in every locale") covers additions and removals; no new test.

## 9. Responsive behaviour

Project breakpoints: `md` 768px (spacing steps, grid columns, header form), `lg` 1024px (not used here).

| Width | Landing | Header |
|---|---|---|
| 375px | one column; cards 343px; 1rem side padding; 3rem vertical section padding | Open 2. Without a decision, adding a ~130px pill (computed estimate: "Registrarse" ≈ 88px text + 32px padding + 2px border + 8px gap; unverified) to a header that overflowed by up to 14px before `fit-header-at-375` would overflow again (inference). |
| 768px | two equal columns, 1.5rem gap; 2rem side padding; 4rem vertical | Register beside Sign in **if it fits** with the inline navigation; unmeasured (Unverified 2) |
| 1280px | two columns of 532px (computed) | Register beside Sign in |

No horizontal scroll is acceptable at 375px (app-shell "Signed-out header").

## 10. Visual reference (mock-up)

There is no MVC capture to take: the MVC has no registration chooser and no header register action (§3). Mock-up, 1280px, anonymous, es:

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ [logo Tazavera]  Mejor valorados  Explora coffees  Sobre nosotros   (🌐 ES ▾) (☾) (Registrarse) (Iniciar sesión) │  nav-surface
├───────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                           │  surface-page
│   Únete a Tazavera                                                    ← h1 type-heading    │
│   Elige cómo quieres participar en Tazavera.                          ← type-body          │
│                                                           (2rem)                          │
│   ┃┌──────────────────────────────────────┐   ┃┌──────────────────────────────────────┐  │
│   ┃│ Especialista                ← h2     │1.5┃│ Cafetería                            │  │
│   ┃│ Cata a ciegas las ofertas de las     │rem┃│ Publica tus ofertas, recibe la       │  │
│   ┃│ cafeterías con el protocolo de la    │   ┃│ evaluación de especialistas y        │  │
│   ┃│ SCA y registra tus evaluaciones.     │   ┃│ muestra con pruebas lo que sirves.   │  │
│   ┃│                                      │   ┃│                                      │  │
│   ┃│ ( Regístrate como especialista )     │   ┃│ ( Registra tu cafetería )            │  │
│   ┃└──────────────────────────────────────┘   ┃└──────────────────────────────────────┘  │
│    ↑ 4px border-accent, surface-card, shadow-lg, rounded-container, 1.5rem padding        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

375px, anonymous, es (Open 2 = A): header `[≡] [logo] … (🌐▾) (☾) (Iniciar sesión)`; the ≡ menu lists Mejor valorados · Explora coffees · Sobre nosotros · Registrarse. Content: title, intro, then the two cards stacked 1.5rem apart.

Live references for the parts: the About us "How we evaluate" cards (`/es/about`) for the card look, `/es/register` for the heading block and loading state.

## 11. Routes and every reference to `/register` (Open 1 = A)

| Item | Today | After (Open 1 = A) |
|---|---|---|
| `app/[locale]/register/page.tsx` | specialist form | registration landing |
| `app/[locale]/register/specialist/page.tsx` | — | specialist form (`RegisterScreen role="specialist"`) |
| `app/[locale]/register/coffeeshop/page.tsx` | coffee-shop form | unchanged |
| `HomeHero.tsx`, `AboutContent.tsx` links | `/register`, `/register/coffeeshop` | removed |
| Auth return route, `login_hint`, success panel, cancel, sidebar | no route literal | unaffected (verified, §3) |
| `src/pages/register/ui/RegisterClient.test.tsx:40` | router mock `pathname: "/es/register"` | fixture only; assertion-neutral (architect decides whether to update it) |
| `README.md:171`, `:207` | lists `/register` as the specialist form | route table to update |
| user-account spec | `/{locale}/register` = specialist (Registration routes; Business name scenario at line 452) | specialist at `/{locale}/register/specialist`; landing at `/{locale}/register` |

Old links to `/es/register` keep working: they land on the chooser, one click from the form.

## 12. Affected capabilities, files and tests

**Spec deltas (architect):**
- `user-account`: MODIFIED "Registration routes" (paths; "reachable from the header's Register action" instead of "from the entry page and the About us page"); ADDED "Registration landing" (content, the two destinations, the same session gate: loading, redirect when authenticated). MODIFIED "Coffee shop business name" scenario path if Open 1 = A.
- `app-shell`: MODIFIED "Signed-out header" (Register action, order, fit at 375px), "Session states in the shell" (neither Sign in nor Register while resolving), and "Header brand and primary navigation" if Open 2 = A (menu entry for anonymous sessions).
- `landing`: MODIFIED "Entry page hero" (no registration links; scenarios "Registration destinations", "Specialist registration destination" removed; "Hero presentation" reworded), "About us page" ("who it is for" without links; scenario "Registration links" removed), "Page layout" (scenario "Link groups").

**Code (build):** `app/[locale]/register/page.tsx`, `app/[locale]/register/specialist/page.tsx` (new), `src/pages/register/ui/RegisterLandingScreen.tsx` (new), `src/pages/register/ui/RegisterLandingClient.tsx` (new), `src/pages/register/ui/RegisterClient.tsx` (gate reuse, Open 7), `src/pages/register/index.ts`, `src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-header/ui/NavigationMenu.tsx` and `src/widgets/app-header/lib/nav-entries.ts` (Open 2 = A), `src/app/shell/AppShell.tsx` (one text), `src/shared/ui/icons.ts` (Open 5 = A), `src/pages/home/ui/HomeHero.tsx`, `src/pages/home/ui/HomeScreen.tsx`, `src/pages/about/ui/AboutContent.tsx`, `src/pages/about/ui/AboutScreen.tsx`, `messages/{es,en,ca}/{shell,account,landing}.json`, `README.md`.

**Validation tests touched:** `src/pages/home/ui/HomeHero.test.tsx` (line 111, scenario removed), `src/pages/about/ui/AboutContent.test.tsx` (line 161, scenario removed), `src/widgets/app-header/ui/AppHeader.test.tsx` (new header scenarios), new tests for the landing scenarios. How a test of a removed scenario is handled is the architect's call (AGENTS.md "Testing").

**QA suite (not touched during the change; build lists them as stale):** `qa/src/pages/home/ui/HomeHero.test.tsx` (texts fixture lines 44–45), `qa/src/pages/home/ui/HomeScreen.test.tsx` (lines 73–74 read the removed keys).

**Shared files:** `messages/*/shell.json`, `account.json`, `landing.json`, `AppHeader.tsx`. No active change in `openspec/changes/` (checked), so no merge simulation needed today.

## 13. Dependencies

- **Builds on:** `user-account` (register screens, `RegisterClient` gate, R78 `land-on-home-after-registration`), `app-shell` (header, navigation menu, `fit-header-at-375`, `shorten-ca-header-sign-in`), `landing` (hero, About us), `content-structure` (`PageSection`, `Card` stacked), `base-controls` (`RouteButton`, "Navigation controls by position", "Action variants by kind"), `feedback` (`LoadingStatus`), `auth` (`useSession`).
- **Contract:** no operation consumed (navigation only; `registerAUser` stays with the forms).
- **Backlog:** R45 (same registration area; not folded in, not touched). No entry resolved.
- **Decisions log:** 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (register* redirect); 2026-10-06 D14 page layout; 2026-10-07 "nada nuevo en el diseño"; 2026-10-09 "enlace o botón de acción según la posición"; 2026-10-12 R78.

## Open

1. **Route of the landing.** Where does the landing live?
   - A. `/{locale}/register` becomes the landing; the specialist form moves to `/{locale}/register/specialist`; `/register/coffeeshop` unchanged. Symmetric URLs; old `/register` links land on the chooser. Touches the user-account spec paths, two route files, README.
   - B. A new route for the landing (e.g. `/{locale}/join`), forms unchanged. No path change in specs, but `/register` (specialist form) and `/join` coexist and the header points to a URL unrelated to the forms; the landing would need the gate outside the `register*` rule.
   - **Recommendation: A.** The §11 check found no route literal in the auth flow, success panel, sidebar or proxy, so the move is limited to the route files, two link groups being removed anyway, one test fixture and README. A keeps the landing under `register*`, where the decisions-log redirect rule already applies.
   - **Blocks propose: yes** (spec paths and route files).

2. **Header "Register" on small viewports.** The signed-out header has no room at 375px (§9).
   - A. From `md`: button in the header before "Sign in". Below `md`: an entry "Register" in the existing navigation menu after "About us", only for anonymous sessions, with a decorative icon (Open 5).
   - B. Below `md`: an icon-only `nav-button` (40px square, accessible name `shell.register`). Still +48px (computed: 40 + 8 gap) on a header that just fit; likely overflows (inference, unverified).
   - C. Text button on every viewport, shortening labels to fit. Wording change for Product owner, likely not enough in es ("Iniciar sesión" + "Registrarse").
   - D. One "account" menu holding Sign in and Register. New component; contradicts "nada nuevo en el diseño".
   - **Recommendation: A**, reusing the menu and its entry treatment (source: app-shell "Header brand and primary navigation", `NavigationMenu.tsx`). Additionally, measure at 768px during the visual review; if the inline navigation plus both pills overflow there, show the header button from `lg` instead of `md` and keep the menu entry up to that width (the navigation menu control itself is `md:hidden`, so this sub-case would need the entry elsewhere: report as a finding before apply).
   - **Blocks propose: yes** (visible behaviour and app-shell scenarios).

3. **Order and treatment of the header action.**
   - Order: A. "Register" immediately before "Sign in" (session control keeps the rightmost slot, as the user menu does when signed in); B. after "Sign in".
   - Treatment: A. `nav-button`, same as "Sign in" (all pairs registered); B. `primary` to stress registration (new pair `action-primary` on `nav-header` to measure in both themes, possibly a new token).
   - **Recommendation: order A, treatment A** (reuse, no contrast work; base-controls "Navigation controls by position" → `RouteButton`).
   - **Blocks propose: no** (the architect can write either; defaults to the recommendation).

4. **Remove the links from both pages?** The orchestrator's default 2. Product owner's request names both files (`HomeHero.tsx` 80–87 and `AboutContent.tsx` ~116).
   - A. Remove from both (request as written); About's "who it is for" keeps its text only.
   - B. Remove from the hero only, keep About's links (pointing to the forms).
   - **Recommendation: A** — it is what the request says; the header action replaces both. Recorded only for confirmation.
   - **Blocks propose: no.**

5. **Icon of the navigation-menu entry (only if Open 2 = A).** Each menu entry shows a decorative icon (app-shell spec).
   - A. `UserPlus` from `lucide-react`, added to the single entry point `src/shared/ui/icons.ts` (new export, no new dependency).
   - B. Reuse `User` (already exported; used for the account entry, so two entries would look alike).
   - **Recommendation: A** (distinct meaning; no dependency change). It is a new icon, so it needs Product owner's yes under "nada nuevo en el diseño".
   - **Blocks propose: no.**

6. **Order of the two option cards.**
   - A. Specialist first, coffee shop second (order of Product owner's request).
   - B. Coffee shop first (order of today's hero and About links).
   - **Recommendation: A** (follows the request; nothing else depends on it).
   - **Blocks propose: no.**

7. **Sharing the anonymous-only gate.** The landing needs the same gate as `RegisterClient` (§4).
   - A. One slice-local client piece in `src/pages/register/ui/` (session from `useSession`, replace to `/{locale}` when authenticated, `loading` and `children` slots) used by `RegisterClient` and the landing, inside this change. Same slice, no cross-slice import; `RegisterClient`'s behaviour and test assertions unchanged.
   - B. Copy the ≈10 lines into the landing client (under the 20-line backlog threshold of AGENTS.md "Code structure").
   - **Recommendation: A** (criterion C, reuse; one place for the redirect rule).
   - **Blocks propose: no** (architect's design decision either way).

8. **"Already have an account? Sign in" line on the landing** (the MVC register view has one, `register.blade.php:71-74`).
   - A. Not added (header already shows "Sign in"; not requested).
   - B. Add a line with a sign-in action at the end of the page (new text, new element).
   - **Recommendation: A.**
   - **Blocks propose: no.**

9. **Wording of the new texts (§8)**, including "Coffee shop" vs "Coffeeshop" in en and the Catalan header label "Registra't" (short, like "Entra").
   - A. Accept §8 as proposed.
   - B. Product owner's own wording.
   - **Recommendation: A**; Product owner may edit any string.
   - **Blocks propose: no.**

10. **Cancel action of the forms.** Today it opens `/{locale}` (user-account "Cancelling registration").
    - A. Keep `/{locale}` (no spec change).
    - B. Go back to the landing `/{locale}/register`.
    - **Recommendation: A** (fewest decisions changed; not requested).
    - **Blocks propose: no.**

**Closed (not open):** whether the forms must also redirect authenticated users — they already do (`RegisterClient.tsx:43-51`; user-account "Registration routes"; decisions log 2026-10-06). The landing joins the same rule.

## Unverified

1. Contrast ratios of §7 were not re-measured: shell access (Bash/PowerShell) was denied in this session, so no script ran. Every pair is already registered in the theme matrix, which measures them.
2. Header widths at 375px and 768px with the new action (§9): estimates only; no browser capture was possible in this session. The visual review must capture 375/768/1280 in es and ca, both themes.
3. Equal-height cards and bottom-aligned buttons (§6.1) are inferred from the classes, not seen in a browser.
4. The working tree was read as `develop` per the orchestrator; `git status`/`git show develop:` could not be run to confirm the branch and a clean tree.

## Review log

- **2026-10-21 — generation (Design lead).** Drafted from Product owner's request (relayed by the orchestrator), the decisions log, the user-account, landing, app-shell and base-controls specs, `AppHeader`, `NavigationMenu`, `nav-entries`, `AppShell`, `RegisterScreen`, `RegisterClient`, `RegisterSuccessPanel`, `SessionGate`, `EvaluationsGate`, `HomeHero`, `HomeScreen`, `AboutContent`, `AboutScreen`, `Card`, `PageSection`, `Button`, `RouteButton`, `LoadingStatus`, `icons.ts`, the three catalogs, `proxy.ts`, the auth return-route code, the archived `fit-header-at-375` and `shorten-ca-header-sign-in` proposals and the MVC views. Settled under criterion B:
  - the landing's session gate = the existing register* rule (decisions log 2026-10-06; orchestrator's note of 2026-10-21); default 3 closed;
  - header action as `RouteButton` (base-controls "Navigation controls by position") and option-card actions as `action-1` (base-controls "Action variants by kind": registering creates an account, more specific than navigate);
  - all spacing values from `RegisterScreen`, About us cards, `RegisterSuccessPanel`, `HomeHero` and the shared components; no new value;
  - texts in `shell` (header) and `account` (landing) areas, matching the existing readers;
  - the six landing keys to remove, verified unused elsewhere by Grep.
