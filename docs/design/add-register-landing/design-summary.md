Status: draft — pending Product owner review

# Design summary — add-register-landing

- **Change-id:** `add-register-landing`
- **Type:** `Change` (traditional workflow 3a; new screen, new texts, header and entry-page behaviour change)
- **Capabilities:** `user-account` (registration landing at `/{locale}/join`), `app-shell` (header "Register" action from `md`; the "Registration" landmark dropped from "Named navigation landmarks"), `landing` (hero registration links replaced by one About us link; About us registration links replaced by one `/join` link; "Register" button on the entry page below `md`)
- **Requested by Product owner:** 2026-10-21 (approved request, relayed by the orchestrator); answers to the first draft's open points on the same day, the hero About us link on 2026-10-29, and on 2026-10-29 the About us links replaced by one `/join` link (Review log)
- **Constraint (decisions log 2026-10-07 "nada nuevo en el diseño"):** compose existing components, tokens and patterns. Anything new is listed under "Open".

## 1. Goal

Today a visitor reaches registration only through two text links in the entry-page hero (`src/pages/home/ui/HomeHero.tsx:80-87`) and in the "who it is for" section of About us (`src/pages/about/ui/AboutContent.tsx:116-123`). Product owner wants:

1. a "Register" action next to the sign-in control in the app header, shown only while the visitor is not authenticated; on small screens it is not in the header but on the entry page, above its first section;
2. that action to open a new registration landing page at `/{locale}/join` that explains the two ways to join (specialist, coffee shop) and leads to each existing form;
3. the two registration links of the entry-page hero replaced by one link to the About us page, and the two registration links of About us replaced by one link to the registration landing `/{locale}/join` (Product owner, 2026-10-29, Open 4 and Open 12), with their now-unused catalog texts;
4. the landing page (and the "Register" actions) unavailable to an authenticated user: a signed-in user who reaches `/join` is sent away.

## 2. Scope

**In:**
- the registration landing page at `/{locale}/join` (Product owner, Open 1 = B);
- the header "Register" action for anonymous sessions from `md` (768px);
- the entry-page "Register" button for anonymous sessions below `md` (Product owner, Open 2; reading to confirm in Open 11);
- removal of both registration link groups (entry-page hero, About us section 4) and their six catalog keys per locale;
- one About us link (`/{locale}/about`) in the entry-page hero in place of its link group, for every visitor, with one new `landing` text (Open 12);
- one registration-landing link (`/{locale}/join`) in About us section 4 in place of its link group, for every visitor, with one new `landing` text (Open 4, Open 12);
- the session gate of `/join`, reusing the existing registration-route gate (§4);
- new texts in es/en/ca (§8).

**Out:**
- any change to the two registration forms, their routes (`/{locale}/register`, `/{locale}/register/coffeeshop`), fields, success panel or `POST /register`;
- any change to the auth flow (popup, redirect, return route, `login_hint`, tokens);
- a "Register" entry in the small-viewport navigation menu, and a new icon (dropped with Product owner's Open 2 answer);
- a "Already have an account? Sign in" line on the landing (Open 8);
- any other part of the About us page (sections 1–3 and 5, section 4's audience text, order and surfaces);
- R45 (first location in coffee-shop registration): untouched.

## 3. Findings on the current code (verified by reading `develop` working tree)

| Fact | Source |
|---|---|
| The header shows "Sign in" only for `session.state === "anonymous"`, the user menu only for `"authenticated"`, and neither while `"loading"`. "Sign in" is `Button variant="nav-button"`. Breakpoint-dependent parts are wrapped in a `span` with `hidden md:inline-flex` / `md:hidden` (the logotype). | `src/widgets/app-header/ui/AppHeader.tsx:121-155`; app-shell "Signed-out header", "Session states in the shell" |
| Auth state on the client comes from `useSession()` (`@/features/auth`); tokens live in memory only. Page slices already import it (`src/pages/register/ui/RegisterClient.tsx:5`). Header texts are composed in `src/app/shell/AppShell.tsx:70-94` from the `shell` catalog. | `AppShell.tsx`, `RegisterClient.tsx`, decisions log 2026-10-05 add-auth |
| **Authenticated users are already sent away from every `/[locale]/register*` route**: `RegisterClient` shows `LoadingStatus` while the session resolves, renders nothing and calls `router.replace(\`/${locale}\`)` when authenticated (client-side navigation keeps the in-memory tokens). | `RegisterClient.tsx:43-51`; user-account "Registration routes", scenario "A signed-in visitor is taken to the entry page"; decisions log 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (last sentence); R78 `land-on-home-after-registration` |
| Gated screens for *authenticated* content use `SessionGate` (`@/shared/ui`) with a signed-out prompt; `EvaluationsGate` is that pattern's client seam. It is the inverse of what `/join` needs (anonymous only), so `/join` reuses `RegisterClient`'s gate, not `SessionGate`. | `src/shared/ui/SessionGate.tsx`, `src/widgets/evaluations-gate/ui/EvaluationsGate.tsx` |
| `RouteButton` (`@/shared/ui`) takes `href`, `variant`, `size`, `icon`, `children` and no `className`, so breakpoint visibility goes on a wrapper element. | `src/shared/ui/RouteButton.tsx` |
| The entry page is a Server Component (`HomeScreen`) that composes `PageSection surface="page"` → `HomeHero`, then the offerings section. The hero's explore action is `ExploreButton`, a small client island in the same slice. | `src/pages/home/ui/HomeScreen.tsx:77-81`, `ExploreButton.tsx` |
| No code outside `HomeHero`, `AboutContent`, their tests and the two route files references the registration paths; the forms do not move, so the auth flow, success panel, cancel action and sidebar are untouched. | Grep of `src/`, `app/`, `qa/`, `proxy.ts` |
| The hero's actions block is `mt-2 flex flex-col items-start gap-4` (explore button, then the registration `nav` with `LINK_GROUP_CLASSES`); the QA suite asserts those five classes on the explore button's parent. Each `nav` is named by `texts.registerNavigation` (label-landmarks-and-headings D1), and app-shell "Named navigation landmarks" requires that name ("Registration") on both pages. `Link` (`@/shared/ui`, default variant) is an inline, always-underlined `next/link` run in `text-text-link` / `hover:text-text-link-hover` with the shared focus ring; About us is `/{locale}/about`, labelled `shell.aboutUs` in the header's primary navigation. | `HomeHero.tsx:46-56,78-88`; `qa/src/pages/home/ui/HomeHero.test.tsx:80-84`; app-shell spec "Named navigation landmarks"; `src/shared/ui/Link.tsx`; `nav-entries.ts:44` |
| The signed-out header is tight at 375px: `fit-header-at-375` (2026-10-08) fixed a 2–14px overflow; the Catalan label was shortened to "Entra" (`shorten-ca-header-sign-in`). | archived proposals of both changes; app-shell "Header fits a small viewport", "Catalan sign-in label fits on one line" |
| The MVC has no registration chooser: its header shows only "Sign In" (`resources/views/components/welcome/navbar.blade.php:17`) and its register view is a single form without a role (`resources/views/livewire/auth/register.blade.php`). | MVC (found under `C:/Programing/Full Stack/Sprint5/tazavera-app`; the `C:/Porjects/...` path does not exist) |

## 4. Session gates (settled)

### 4.1 `/{locale}/join`

`/join` sits outside the decisions-log rule for `/[locale]/register*`, but Product owner's request makes the landing available only to unauthenticated users. It therefore gets the same gate as the forms (settled from the request; mechanism from `RegisterClient`):

| Session state | `/join` shows |
|---|---|
| `loading` | the heading block and `LoadingStatus` (text `account.loading`) in place of the options; no option card |
| `anonymous` | the heading block and the two option cards |
| `authenticated` | nothing in the gated region; `router.replace("/{locale}")` (client-side, no reload, no message) |

- Server-side detection is impossible (tokens only in browser memory, settled), so the gate is client-side, as for the forms.
- The forms already redirect authenticated users: the orchestrator's first-draft default 3 is closed.

### 4.2 The "Register" actions

| Session state | Header action (from `md`) | Entry-page button (below `md`) |
|---|---|---|
| `loading` | hidden (same rule as "Sign in") | not rendered |
| `anonymous` | shown | shown |
| `authenticated` | hidden (user menu instead) | not rendered |

Neither action redirects; both only decide whether they render.

### 4.3 FSD placement of the `/join` gate (settled)

A page slice cannot import another page slice, so a separate `src/pages/join` slice could not reuse `RegisterClient`'s gate. **Settled: the landing screen lives in the existing `src/pages/register` slice** (it is part of the same registration flow, and the slice already hosts two routes), exported from its public `index.ts`, and the route file `app/[locale]/join/page.tsx` imports it (routing may import any page slice; AGENTS.md "Architecture"). The gate stays one slice-local piece used by the forms and the landing (Open 7).

Alternative considered and not chosen: moving the gate to a lower layer (e.g. `features/auth` or a widget). It would put a page-specific redirect rule ("send an authenticated user to `/{locale}`") into a shared layer for two consumers of one flow, and it is more change for the same result. The architect may still pick it in design.md; it changes nothing the user sees, so it is not a Product owner question.

## 5. Components and FSD placement

| Piece | Layer / slice | Reuse |
|---|---|---|
| `app/[locale]/join/page.tsx` | routing | thin route file importing `RegisterLandingScreen` from `@/pages/register` |
| `RegisterLandingScreen` (server; reads the `account` catalog, renders the heading block and the client region) | `src/pages/register/ui/` | mirrors `RegisterScreen` |
| `RegisterLandingClient` (client; gate + option cards) | `src/pages/register/ui/` | gate per §4.1 / Open 7 |
| Option card | composed in the slice from `Card layout="stacked"` (content variant), `CardContent`, `RouteButton` | About us "How we evaluate" cards (`AboutContent.tsx:90-109`); `RegisterSuccessPanel` heading/text pattern |
| Header "Register" action | `src/widgets/app-header/ui/AppHeader.tsx` | `RouteButton variant="nav-button"` in a `span` `hidden md:inline-flex` (logotype wrapper precedent, `AppHeader.tsx:129`) |
| Entry-page "Register" button (`HomeRegisterButton`, client island) | `src/pages/home/ui/` | `useSession()` from `@/features/auth` (pages → features, as `RegisterClient`); `RouteButton variant="action-1"`; client-island precedent `ExploreButton` |
| Hero About us link (Open 12) | `src/pages/home/ui/HomeHero.tsx` (stays server-rendered, no session) | `Link` (`@/shared/ui`, default variant), the component the registration links already use |
| About us `/join` link (Open 4, Open 12) | `src/pages/about/ui/AboutContent.tsx` (stays server-rendered, no session) | `Link` (`@/shared/ui`, default variant), as above |

`HomeScreen` stays a Server Component and passes `locale` and the label as props to `HomeRegisterButton`; only the island reads the session. The hero About us link and the About us `/join` link need no session and no client code (`/join` itself sends a signed-in visitor away, §4.1). No new shared component, variant, token or icon. No contract operation consumed.

## 6. Layout and spacing (criterion A)

### 6.1 Landing page (`/{locale}/join`)

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
                 ├─ option card (specialist)   ← first (request order, settled)
                 └─ option card (coffee shop)
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
           └─ RouteButton variant="action-1" size="base" → /{locale}/register or /{locale}/register/coffeeshop
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
| `RouteButton` | 1rem sides, height 2.5rem (base) | — | — (no icon) | 1px, all sides, `action-1-border` | `rounded-pill` | min width 10rem, grows with label, one line |

- A single button per card: the "Action group" two-column rule does not apply (it applies to two or more buttons).
- Treatment `action-1`: base-controls "Action variants by kind": registering creates an account, which is more specific than "navigate".
- Equal-height cards and aligned buttons follow from the grid's stretch plus `h-full`/`flex-1`/`mt-auto` (computed from the classes; unverified in a browser).
- At 1280px each card is 532px wide (computed: 72rem = 1152px − 2 × 32px side padding − 24px gap = 1064 / 2).
- At 375px each card is 343px wide (computed: 375 − 2 × 16); the longest es label "Regístrate como especialista" fits on one line inside 343 − 2 × 24 − 4 = 291px (estimate ≈ 260px including 32px padding; unverified).

### 6.2 "Register" actions

**Header action (from `md`, 768px):**
- **Component:** `RouteButton variant="nav-button"` → `/{locale}/join`; label `shell.register`. base-controls "Navigation controls by position": a navigation control outside a page header's first line is an action button that opens its route. Same treatment as "Sign in" (`nav-button-bg`, `nav-button-text`, 1px `nav-button-border`, hover `nav-button-*-hover`, `rounded-pill`, height 2.5rem, 1rem side padding, no action min-width: the navigation treatment keeps its own geometry).
- **Wrapper:** `span` with `hidden md:inline-flex` (the logotype precedent), because `RouteButton` takes no `className`. Below `md` the header is exactly today's header.
- **Position:** in the header's right group, **immediately before "Sign in"** (Open 3), so the session control keeps the rightmost slot it shares with the user menu. Gap to neighbours: the right group's existing `md:gap-4` (1rem).
- **Visibility:** §4.2. No `aria-current` (it is an action, not a navigation entry).

**Entry-page button (below `md`):**
- **Component:** `RouteButton variant="action-1" size="base"` → `/{locale}/join`; label `landing.heroRegisterAction` (§8). Treatment from base-controls "Action variants by kind" (create or start), the same as the landing cards' actions; a button, not a link, per "Navigation controls by position" (it is not a page header's first-line back control).
- **Where:** first child of the hero's `PageSection surface="page"` container, before `HomeHero` (Product owner: "above the first body"). The section and its container are unchanged: 3rem vertical padding below `md`, 1rem side padding, max 72rem, centred.
- **Container layout:** `HomeScreen` passes `containerClassName="flex flex-col gap-6"` to the hero section, giving 1.5rem between the button and the hero (source: About "How we evaluate" `gap-6` and the hero's 1.5rem action spacing). From `md` the button's wrapper is `display: none`, which flex `gap` ignores, so the hero's spacing from `md` is exactly today's.
- **Wrapper:** `div` with `md:hidden`, holding the island; the island renders nothing unless the session is anonymous (§4.2), so a signed-in or still-resolving visitor sees the hero at today's position.
- **Alignment and width:** start-aligned (left edge of the container, the hero text's edge), at its own width: the action min-width 10rem (160px) in every locale (computed: "Registrarse" ≈ 88px + 32px padding + 2px border = 122px < 160px; unverified), well inside the 343px container at 375px.
- **Border and radius:** 1px `action-1-border`, `rounded-pill` (from `Button`).
- **Hero below:** unchanged (eyebrow, heading, paragraph, explore button; photograph hidden below `md`).
- **Layout shift:** for an anonymous visitor the button appears once the session resolves and pushes the hero down by 4rem (computed: 2.5rem button + 1.5rem gap). Accepted in this design because the reading says "hidden while loading"; Open 11 asks Product owner to confirm.

| Element | Padding | Gap / margin to neighbours | Children gap | Border | Radius | Container / layout |
|---|---|---|---|---|---|---|
| Hero `PageSection` | unchanged (3rem / 4rem vertical; 1rem / 2rem sides) | unchanged | `flex flex-col`, 1.5rem | none | none | full width |
| `md:hidden` wrapper | none | 1.5rem above the hero (container gap) | — | none | none | container, start-aligned |
| `RouteButton` | 1rem sides, height 2.5rem | — | — | 1px, all sides, `action-1-border` | `rounded-pill` | min 10rem, own width |
| Header `hidden md:inline-flex` wrapper | none | 1rem to the theme switch and to "Sign in" | — | none | none | header right group |

### 6.3 Entry-page hero and About us after the link replacement

**Hero (Product owner, 2026-10-29, Open 12):** the two registration links are replaced by **one** text link to the About us page.

```
text column — flex flex-col, 1rem apart                     [HomeHero TEXT_COLUMN_CLASSES, unchanged]
├─ eyebrow · heading · paragraph                             [unchanged]
└─ actions block — mt-2 flex flex-col items-start gap-4      [HomeHero ACTIONS_CLASSES, unchanged]
   ├─ ExploreButton (action-3) → /{locale}/coffeeshops        [unchanged]
   └─ Link (default) → /{locale}/about   (landing.heroAboutLabel)
```

- **Component:** `Link` from `@/shared/ui`, default variant, `href` = `/{locale}/about`: a text link, not a button, as the orchestrator read Product owner's answer and as the registration links it replaces are today. **Tension:** base-controls "Navigation controls by position" (decisions log 2026-10-09 "enlace o botón de acción según la posición") makes every navigation control that is not on a page header's first line, or in running text, an action button; no exemption for the hero's links is recorded (none found in the decisions log or in the archived `apply-header-link-rule`). Open 12 asks Product owner to confirm the link (the architect then states the exception in the landing delta) or to take the button. Treatment from `Link`: underlined in every state, `text-text-link`, hover `text-text-link-hover`, shared `focus-visible:focus-ring`.
- **Where:** the actions block's second child, where the `nav` was: 1rem below the explore button (the block's existing `gap-4`), start-aligned at its own width (`items-start`). The explore button still sits 1.5rem below the paragraph (column `gap-4` + `mt-2`).
- **No wrapper, no landmark:** the `nav` element and `LINK_GROUP_CLASSES` go; the link is a direct child of the actions block. A single link is not a group of navigation links, and the About us destination is already inside the header's named "Main" navigation; keeping a one-link `nav` would add a landmark whose only entry duplicates the header's. `heroRegisterNavigation` is removed, not renamed (§8).
- **Visibility:** rendered for every visitor in every session state (like the links it replaces); `HomeHero` stays a Server Component.
- **Spacing and boundary (criterion A):** padding none; margin none (gap 1rem above, from the actions block; nothing below inside the block); no children gap (text only, no icon); no border (underline is the link treatment, not a boundary); no radius; container: the actions block of the hero's text column (left column from `md`, single column below).
- **Wrapping:** an inline text run; it wraps with its text if a locale's label ever exceeds the column (it does not at 375px: the column is 343px, computed; "Sobre nosaltres" is ≈ 120px, estimate, unverified).
- **Hero height:** unchanged in practice: one link line replaces one link row (both one line of `type-body` at every project width; computed from the classes, unverified in a browser).

**About us, section 4 ("who it is for") (Product owner, 2026-10-29, Open 4):** the two registration links (`/{locale}/register/coffeeshop`, `/{locale}/register`) are replaced by **one** text link to the registration landing `/{locale}/join`, in the same place.

```
PageSection surface="section" — container flex flex-col, 1rem apart   [AboutContent STACK_CLASSES, unchanged]
├─ p · type-body (audienceText)                                       [unchanged]
└─ Link (default) → /{locale}/join   (landing.aboutRegisterLabel), self-start
```

- **Component:** `Link` from `@/shared/ui`, default variant, `href` = `/{locale}/join`; the same treatment and the same text-link vs button tension as the hero link (Open 12).
- **Where:** the section stack's second child, where the `nav` was: 1rem below the audience text (the stack's existing `gap-4`).
- **Alignment:** start-aligned at its own width. The stack is a flex column with the default `stretch`, so a bare link would stretch to the full row (clickable area and focus ring across the container); the link takes `self-start` (`Link` passes `className` through; the hero gets the same result from its block's `items-start`).
- **No wrapper, no landmark (same reasoning as the hero):** one link is not a group of navigation links, so the `nav`, its name `aboutRegisterNavigation` and `LINK_GROUP_CLASSES` go; `/join` is also reachable from the header's "Register" action from `md`. `AboutContent` keeps its `Link` import.
- **Visibility:** every visitor in every session state, like today's links; `AboutContent` stays a Server Component. A signed-in visitor who follows it is sent to `/{locale}` by the `/join` gate (§4.1). Hiding it for signed-in visitors would need the session in a client island; not requested, so not designed.
- **Spacing and boundary (criterion A):** padding none; margin none (1rem above from the stack gap; nothing below inside the section); no children gap (text only, no icon); no border (the underline is the link treatment); no radius; container: section 4's stack (`flex flex-col gap-4`) in its `PageSection surface="section"`, max 72rem, centred, 1rem / 2rem sides, 3rem / 4rem vertical.
- **Section height:** unchanged in practice: one link line replaces one wrapping link row (computed from the classes; unverified in a browser). The five-section order and alternating surfaces are unchanged.

- **Spec consequences:** with no link group left on either page, the landing spec's "Link groups" scenario and the "Page layout" sentence "Groups of navigation links SHALL keep a visible gap…" lose their subject; the architect removes them in the delta (§12).

## 7. States, accessibility and semantic tokens

**Accessible names and structure:**
- `/join`: one `h1` (`registerLandingTitle`); each card an `h2`; each `RouteButton` named by its visible label (two distinct labels). No landmark of its own.
- Header action and entry-page button: named by their visible labels; keyboard reachable; shared focus ring (`focus-visible:focus-ring` in `Button`). The entry-page button comes before the hero's `h1` in reading order (Product owner's placement).
- Hero About us link: a `link` named by its visible label (`landing.heroAboutLabel`), addressing `/{locale}/about`; keyboard reachable after the explore button; no `nav` landmark around it (§6.3). From `md` the header's "About us" entry shows the same name for the same destination (an allowed duplicate: same name, same target).
- About us `/join` link: a `link` named by its visible label (`landing.aboutRegisterLabel`), addressing `/{locale}/join`; keyboard reachable after the audience text, before the closing action; no `nav` landmark (§6.3). From `md` the header's "Register" action has the same name for the same destination (allowed duplicate, as above).
- `LoadingStatus`: `role="status"`, spinner `aria-hidden`, honours `prefers-reduced-motion`.
- Focus: no programmatic focus on arrival, like the register forms.

**States:** buttons rest / hover / keyboard focus as the shared `Button`; no disabled or busy state (navigation only). `/join`: loading / options / redirected (§4.1). Actions: §4.2.

**Tokens and contrast (criterion D).** Every gated pair is already registered in `src/app/styles/theme-tokens.test.ts` (checked by Grep):

| Part | Tokens | Registered pair |
|---|---|---|
| `/join` `h1`, intro | `text-primary` on `surface-page` | existing (register and about pages) |
| Card heading and text | `text-primary` on `surface-card` | line 299 |
| Card action | `action-1-text` on `action-1-bg`; hover `action-1-text-hover` on `action-1-bg-hover`; border `action-1-border` on `surface-card` | lines 330, 334, 427 |
| Entry-page button | same text pairs; border `action-1-border` on `surface-page` | lines 330, 334, 426 |
| Header action | `nav-button-text` on `nav-button-bg` (border exempt) | lines 358, 394–395 |
| Hero About us link | `text-link` / `text-link-hover` on `surface-page` (the pair the removed registration links used) | lines 322, 530–531, 607, 773–774 (both themes, by Grep) |
| About us `/join` link | `text-link` / `text-link-hover` on `surface-section` (the pair today's About us links use) | lines 326–327, 611–612 (both themes, by Grep) |
| Focus ring | `focus-ring` on `surface-card` / `surface-page` | line 381 / existing |
| Card left border, shadow, page surfaces | decorative | not gated |

No new pair, token or guard test. Ratios were **not re-measured** in this draft (Unverified 1).

## 8. Texts (catalog areas, passed as props)

New keys. Proposed wording; Product owner may revise (Open 9).

**`shell` area** (`messages/{es,en,ca}/shell.json`, read by `AppShell`, passed through `AppHeaderTexts`):

| Key | es | en | ca |
|---|---|---|---|
| `register` | Registrarse | Register | Registra't |

**`landing` area** (`messages/{es,en,ca}/landing.json`; `hero*` keys read by `HomeScreen`, `about*` keys by `AboutScreen`):

| Key | es | en | ca |
|---|---|---|---|
| `heroRegisterAction` | Registrarse | Register | Registra't |
| `heroAboutLabel` | Sobre nosotros | About us | Sobre nosaltres |
| `aboutRegisterLabel` | Registrarse | Register | Registra't |

- `heroRegisterAction`: same wording as the header action.
- `heroAboutLabel` (Open 12): the hero About us link, passed to `HomeHero` as `texts.aboutLabel`; same wording as the header entry `shell.aboutUs`, so the destination has one name everywhere.
- `aboutRegisterLabel` (Open 4): the About us `/join` link, read by `AboutScreen` and passed to `AboutContent` as `texts.registerLabel`; same wording as `shell.register` and `landing.heroRegisterAction`, so `/join` has one name everywhere. **New key, not a reuse of `heroRegisterAction`** (same `landing` area, so reuse is technically possible): every About us text is an `about*` key and every hero text a `hero*` key; reading a `hero*` key on About us would tie the About us link to the entry-page button, so a later rewording of one would silently change the other. The cost is one duplicated string per locale, below the backlog threshold. Reusing `heroRegisterAction` is the alternative; it changes nothing visible, so it is the architect's call, not a Product owner question.
- **Why new keys, not reuse of `shell.register` / `shell.aboutUs`:** each capability reads its own catalog area (`HomeScreen` reads `landing`, `AppShell` reads `shell`); reusing a `shell` key would make `HomeScreen` read a second area for one string and tie the landing hero to the shell's catalog. The duplicated wording is two strings per locale, below the backlog threshold.
- **Landmark name:** `heroRegisterNavigation` is **removed, not renamed**: the single link has no `nav` landmark (§6.3), so no navigation name is needed. `aboutRegisterNavigation` is removed for the same reason (one link, no `nav`; §6.3).

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

- Reused: `account.loading` (loading status). The card action labels reuse the exact wording of the removed hero and About us labels. The card texts paraphrase the About us copy (`aboutStepCupping`, `aboutAudienceText`).
- The en catalog spells "coffeeshop" in the account area and "coffee shops" in the shell; the new card title uses "Coffee shop" as the header does (flag in Open 9).

**Removed keys** (`messages/{es,en,ca}/landing.json`, six per locale, no other consumer than `HomeScreen` and `AboutScreen` found by Grep): `heroCoffeeshopRegisterLabel`, `heroSpecialistRegisterLabel`, `heroRegisterNavigation`, `aboutCoffeeshopRegisterLabel`, `aboutSpecialistRegisterLabel`, `aboutRegisterNavigation`. Net per locale in `landing`: six removed, three added (`heroRegisterAction`, `heroAboutLabel`, `aboutRegisterLabel`).

**Props:**
- `HomeHeroTexts`: removes `coffeeshopRegisterLabel`, `specialistRegisterLabel` and `registerNavigation`; adds `aboutLabel: string` (required: the one production caller, `HomeScreen`, always passes it from `catalog.heroAboutLabel`). `HomeHero` keeps its `Link` import (now for the About us link) and drops `LINK_GROUP_CLASSES`. The QA fixture `qa/src/pages/home/ui/HomeHero.test.tsx` has no `aboutLabel`; a required prop makes it stale for the typecheck, which the build lists (AGENTS.md "Testing": never loosen production code for a QA fixture). The optional-prop alternative of label-landmarks-and-headings D1 is the architect's call.
- `AboutContentTexts`: removes `coffeeshopRegisterLabel`, `specialistRegisterLabel` and `registerNavigation`; adds `registerLabel: string` (required: the one production caller, `AboutScreen`, always passes it from `catalog.aboutRegisterLabel`). `AboutContent` keeps its `Link` import (now for the `/join` link) and drops `LINK_GROUP_CLASSES`. No QA test reads these props or keys (Grep of `qa/`).

The existing catalog guard ("an area is complete in every locale") covers additions and removals; no new test.

## 9. Responsive behaviour

Project breakpoints: `md` 768px (spacing steps, grid columns, header form, where "Register" moves from the entry page to the header), `lg` 1024px (fallback, below).

| Width | `/join` | Header | Entry page |
|---|---|---|---|
| 375px | one column; cards 343px; 1rem side padding; 3rem vertical section padding | unchanged from today (no "Register"); still fits as `fit-header-at-375` left it | anonymous: "Register" button (160px, computed) at the top of the hero section, 1.5rem above the eyebrow; every session: About us link 1rem below the explore button |
| 768px | two equal columns, 1.5rem gap; 2rem side padding; 4rem vertical | "Register" before "Sign in" **if it fits** beside the inline navigation; unmeasured (Unverified 2) | no button; hero as today, with the About us link in place of the registration links |
| 1280px | two columns of 532px (computed) | "Register" before "Sign in" | no button; hero as today, with the About us link in place of the registration links |

- **Fallback if the header overflows at 768px:** both breakpoints move together to `lg` — the header wrapper becomes `hidden lg:inline-flex` and the entry-page wrapper `lg:hidden` — so there is never a width without a way to "Register" on the entry page. The visual review measures it; the architect writes `md` unless the measurement says otherwise.
- **About us at every width:** the `/join` link 1rem below the audience text, start-aligned, in every session state; no breakpoint-dependent change.
- **Pages other than the entry page below `md`:** no "Register" action (only "Sign in"); `/join` stays reachable from the entry page and from the About us link. This follows Product owner's answer; Open 11 confirms it.
- No horizontal scroll is acceptable at 375px (app-shell "Signed-out header").

## 10. Visual reference (mock-up)

There is no MVC capture to take: the MVC has no registration chooser and no register action (§3).

**`/es/join`, 1280px, anonymous:**

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

**`/es` (entry page), 375px, anonymous:**

```
┌─────────────────────────────────────┐
│ [≡] [◉]          (🌐▾) (☾) (Iniciar sesión) │  header unchanged (no "Register")
├─────────────────────────────────────┤
│ 1rem                         1rem   │  surface-page, hero section
│        (3rem top padding)           │
│ ( Registrarse )   ← action-1, 160px min, start-aligned
│        (1.5rem)                     │
│ EYEBROW                             │
│ Tu café, el que merece cada sorbo   │  ← h1
│ paragraph…                          │
│        (1.5rem)                     │
│ ( Explora coffees )   ← action-3     │
│        (1rem)                       │
│ Sobre nosotros   ← Link, underlined, text-link
│        (3rem bottom padding)        │
├─────────────────────────────────────┤
│ verified offerings (surface-section)│
```

Signed in or while the session resolves, the same 375px page shows no button and the eyebrow starts right below the 3rem top padding (today's layout); the About us link shows in every state. From `md` the hero is today's two-column hero with the About us link in the left column where the registration links were.

(The mock-up's explore label "Explora coffees" is a placeholder; the real `heroExploreLabel` is "Explorar cafés".)

**`/es/join`, 375px:** header as today; title, intro, then the two cards stacked 1.5rem apart, each 343px wide.

Live references for the parts: the About us "How we evaluate" cards (`/es/about`) for the card look, `/es/register` for the heading block and loading state, the header's "Sign in" for the header action.

## 11. Routes and references

| Item | Today | After |
|---|---|---|
| `app/[locale]/join/page.tsx` | — | registration landing (`RegisterLandingScreen` from `@/pages/register`) |
| `app/[locale]/register/page.tsx` | specialist form | unchanged |
| `app/[locale]/register/coffeeshop/page.tsx` | coffee-shop form | unchanged |
| `HomeHero.tsx` links | `/register`, `/register/coffeeshop` | one link to `/{locale}/about` (Open 12) |
| `AboutContent.tsx` links | `/register`, `/register/coffeeshop` | one link to `/{locale}/join` (Open 4) |
| Header (from `md`), entry page (below `md`), About us | — | "Register" → `/{locale}/join` |
| `/join` cards | — | `/{locale}/register`, `/{locale}/register/coffeeshop` |
| Auth return route, `login_hint`, success panel, cancel, sidebar, `proxy.ts` | — | unaffected (no route literal; forms do not move) |
| `README.md:207` route table | `/register`, `/register/coffeeshop` | add a `/join` row ("Choose how to register") |

- `/join` uses the same English slug in every locale, like `/about`, `/offerings` and `/coffeeshops` (no localized slugs in the project).
- The proxy matcher and next-intl routing already cover any path under a locale: no proxy change (`proxy.ts:120-137`).

## 12. Affected capabilities, files and tests

**Spec deltas (architect):**
- `user-account`: ADDED "Registration landing" (`/{locale}/join`: content, the two destinations, its own gate: loading status while resolving, client-side navigation to `/{locale}` when authenticated; reachable from the header's "Register" action, the entry-page "Register" button and the About us link). MODIFIED "Registration routes" only for "reachable from the entry page and the About us page" → reachable from the registration landing; the form paths and every other scenario stay.
- `app-shell`: MODIFIED "Signed-out header" (a "Register" action before "Sign in" from the medium breakpoint, opening `/{locale}/join`; not shown below it, so the 375px scenarios keep holding), "Session states in the shell" (neither "Sign in" nor "Register" while resolving) and "Named navigation landmarks" (the "Registration" landmark of both pages leaves the requirement text, with its es/ca names "Registro"/"Registre"; scenario "Registration links named" removed; "Main" and "Management" unchanged).
- `landing`: MODIFIED "Entry page hero": the requirement's "two navigation links: one registering a coffeeshop and one registering as a specialist" becomes one link that opens the About us page of the active locale (`/{locale}/about`), shown to every visitor; "Hero presentation" lists the About us link instead of "both registration links"; "Registration destinations" becomes an About us scenario (the link, named by its label, addresses `/{locale}/about`, e.g. `/es/about`); "Specialist registration destination" removed; ADDED scenarios for the entry-page "Register" button (shown above the hero below the medium breakpoint for an anonymous session and opening `/{locale}/join`; not shown while resolving, when authenticated or from the medium breakpoint). "Page layout": scenario "Link groups" removed and the sentence "Groups of navigation links SHALL keep a visible gap…" removed, since no link group remains on either page. "About us page": the requirement's "who it is for, naming coffeeshops and specialists with their registration links" becomes "…with one link to the registration landing"; scenario "Registration links" becomes one registration-landing scenario (the link, named by its label, addresses `/{locale}/join`, e.g. `/es/join`). If Product owner confirms the text links (Open 12), both the hero and About us requirements state them as exceptions to base-controls "Navigation controls by position".

**Code (build):**
- routing: `app/[locale]/join/page.tsx` (new);
- `src/pages/register/ui/RegisterLandingScreen.tsx` (new), `src/pages/register/ui/RegisterLandingClient.tsx` (new), `src/pages/register/ui/RegisterClient.tsx` (gate reuse, Open 7), `src/pages/register/index.ts`;
- `src/pages/home/ui/HomeRegisterButton.tsx` (new), `src/pages/home/ui/HomeScreen.tsx` (hero texts: three keys out, `heroAboutLabel` in; register-button wrapper), `src/pages/home/ui/HomeHero.tsx` (link group → one About us `Link`; `HomeHeroTexts`);
- `src/pages/about/ui/AboutContent.tsx` (link group → one `/join` `Link`; `AboutContentTexts`), `src/pages/about/ui/AboutScreen.tsx` (three keys out, `aboutRegisterLabel` in);
- `src/widgets/app-header/ui/AppHeader.tsx`, `src/app/shell/AppShell.tsx` (one text);
- `messages/{es,en,ca}/{shell,account,landing}.json`, `README.md`.

Not touched any more: `NavigationMenu.tsx`, `nav-entries.ts`, `icons.ts`, the form route files.

**Validation tests touched:**
- `src/pages/home/ui/HomeHero.test.tsx`:
  - texts fixture (lines 36–46) and the Spanish case's catalog texts (lines 81–91): the two registration labels give way to `aboutLabel` / `catalog.heroAboutLabel`; "Hero presentation" (lines 61–73) then checks the About us label through the fixture loop;
  - "Registration destinations" (lines 110–122) becomes the About us destination test: the link named `TEXTS.aboutLabel` addresses `/es/about`;
  - "keeps the two registration links apart in a wrapping row" (lines 147–159, scenario "Link groups") loses its subject (scenario removed).
- `src/pages/about/ui/AboutContent.test.tsx`:
  - texts fixture (lines 64–65): the two registration labels give way to `registerLabel`;
  - "Sections and order" (lines 103–104 expect the two labels in section 4): expects `TEXTS.registerLabel` there instead;
  - "Registration links" (lines 160–174) becomes the `/join` test: the link named `TEXTS.registerLabel` addresses `/${LOCALE}/join`;
  - "keeps the two registration links apart in a wrapping row" (lines 222–230, scenario "Link groups") loses its subject (scenario removed).
- `src/widgets/app-header/ui/AppHeader.test.tsx` (header scenarios); new tests for the `/join` and entry-page button scenarios.
- No test of app-shell "Registration links named" found by Grep.
- How a test of a removed scenario is handled is the architect's call (AGENTS.md "Testing"). `RegisterClient.test.tsx` is untouched (its `/es/register` fixture stays valid).

**QA suite (not touched during the change; build lists them as stale):**
- `qa/src/pages/home/ui/HomeHero.test.tsx`: texts fixture lines 44–45 carry the removed labels and lack the required `aboutLabel`. Its layout test (lines 80–84) asserts `mt-2 flex flex-col items-start gap-4` on the explore button's parent; the design keeps those classes, so that assertion keeps holding.
- `qa/src/pages/home/ui/HomeScreen.test.tsx`: lines 73–74 read the removed keys.

- No QA test reads the About us registration props or keys (Grep of `qa/`).

**Shared files:** `messages/*/shell.json`, `account.json`, `landing.json`, `AppHeader.tsx`, `HomeScreen.tsx`, `AboutContent.tsx`. No active change in `openspec/changes/` (checked), so no merge simulation needed today.

## 13. Dependencies

- **Builds on:** `user-account` (register screens, `RegisterClient` gate, R78 `land-on-home-after-registration`), `app-shell` (header, `fit-header-at-375`, `shorten-ca-header-sign-in`), `landing` (hero, About us), `content-structure` (`PageSection`, `Card` stacked), `base-controls` (`RouteButton`, "Navigation controls by position", "Action variants by kind"), `feedback` (`LoadingStatus`), `auth` (`useSession`).
- **Contract:** no operation consumed (navigation only; `registerAUser` stays with the forms).
- **Backlog:** R45 (same registration area; not folded in, not touched). No entry resolved.
- **Decisions log:** 2026-10-06 "rutas protegidas sin sesión: mensaje con botón" (register* redirect, extended to `/join` by the request); 2026-10-06 D14 page layout; 2026-10-07 "nada nuevo en el diseño"; 2026-10-09 "enlace o botón de acción según la posición"; 2026-10-12 R78.

## Open

1. **Route of the landing.** **Answered by Product owner (2026-10-21): B, `/{locale}/join`** ("new route as /join"). The forms stay at `/{locale}/register` and `/{locale}/register/coffeeshop`. Design consequences in §4.1, §4.3, §11, §12.

2. **"Register" on small viewports.** **Answered by Product owner (2026-10-21): a new option, "in small screen the button is part of the landing above the first body".** Reading applied (orchestrator's): below `md` the header shows no "Register"; the entry page shows a "Register" button above the hero for anonymous sessions only; from `md` the header button stays. Designed in §6.2; the reading is confirmed in Open 11. The navigation-menu entry and the icon question (former Open 5) are dropped: with no menu entry there is no icon to choose.

3. **Order and treatment of the header action.**
   - Order: A. "Register" immediately before "Sign in" (session control keeps the rightmost slot, as the user menu does when signed in); B. after "Sign in".
   - Treatment: A. `nav-button`, same as "Sign in" (all pairs registered); B. `primary` to stress registration (new pair `action-primary` on `nav-header` to measure in both themes, possibly a new token).
   - **Recommendation: order A, treatment A** (reuse, no contrast work; base-controls "Navigation controls by position" → `RouteButton`).
   - **Blocks propose: no.**

4. **What replaces the registration links on each page.** **Answered by Product owner (2026-10-29), in two steps:** the links of the entry page change ("About us" was not part of the first answer; handoff D2 withdrawn), then "ok replace them for the new route register" for About us. Result:
   - entry-page hero → one link to `/{locale}/about` (Open 12);
   - About us section 4 → one link to `/{locale}/join`, in the same place, for every visitor, without a `nav` landmark (§6.3).
   This supersedes the earlier "settled by the request" (removed from both, About us with no replacement). Design consequences in §1, §2, §6.3, §7, §8, §11, §12. The text-link vs button question for both links is Open 12.

5. *(Dropped: the menu-entry icon is no longer needed; see Open 2.)*

6. **Order of the two option cards.** **Settled by the request** ("register as a specialist or register as a coffee shop"): specialist first.

7. **Sharing the anonymous-only gate.** With the landing in the `src/pages/register` slice (§4.3), sharing stays inside one slice.
   - A. One slice-local client piece in `src/pages/register/ui/` (session from `useSession`, replace to `/{locale}` when authenticated, `loading` and `children` slots) used by `RegisterClient` and `RegisterLandingClient`, inside this change. `RegisterClient`'s behaviour and test assertions unchanged.
   - B. Copy the ≈10 lines into the landing client (under the 20-line backlog threshold of AGENTS.md "Code structure").
   - **Recommendation: A** (criterion C, reuse; one place for the redirect rule).
   - **Blocks propose: no** (architect's design decision either way).

8. **"Already have an account? Sign in" line on the landing** (the MVC register view has one, `register.blade.php:71-74`).
   - A. Not added (the header shows "Sign in"; not requested).
   - B. Add a line with a sign-in action at the end of the page (new text, new element).
   - **Recommendation: A.**
   - **Blocks propose: no.**

9. **Wording of the new texts (§8)**, including "Coffee shop" vs "Coffeeshop" in en and the Catalan label "Registra't" (short, like "Entra").
   - A. Accept §8 as proposed.
   - B. Product owner's own wording.
   - **Recommendation: A**; Product owner may edit any string.
   - **Blocks propose: no.**

10. **Cancel action of the forms.** Today it opens `/{locale}` (user-account "Cancelling registration").
    - A. Keep `/{locale}` (no spec change).
    - B. Go back to the landing `/{locale}/join`.
    - **Recommendation: A** (fewest decisions changed; not requested).
    - **Blocks propose: no.**

11. **Confirm the reading of the Open 2 answer.** The design (§6.2, §9) applies this reading:
    - below `md`, "Register" is not in the header but is a button above the hero, **on the entry page only** (other pages below `md` offer only "Sign in");
    - it shows only for an anonymous session and is not rendered while the session resolves, so for an anonymous visitor it appears once the session resolves and moves the hero down 4rem (computed);
    - from `md`, the header shows "Register" before "Sign in" and the entry page shows no button.
    - Options: A. confirm as above; B. reserve the button's space while the session resolves (no shift for anonymous visitors, but a blank 4rem for signed-in ones); C. a different reading (e.g. above the first section of every page, or also kept at `md` and up).
    - **Recommendation: A** (follows the answer as relayed; no blank space for signed-in users).
    - **Blocks propose: no** (the design follows reading A; B is a one-line change in design.md).

12. **Hero link to About us, and About us link to `/join`: text links or buttons.** **Answered by Product owner (2026-10-29):** hero: "replace the registration link with a unique link that holds the route to the info page (about us)"; About us: "ok replace them for the new route register" (Open 4). Settled. The design (§6.3, §7, §8, §12) applies the orchestrator's reading:
    - in the entry-page hero the two registration links are replaced by **one** link to `/{locale}/about`, labelled like the header entry (new key `landing.heroAboutLabel`: "Sobre nosotros" / "About us" / "Sobre nosaltres"), in the hero's actions block 1rem below the explore button;
    - in About us section 4 the two registration links are replaced by **one** link to `/{locale}/join`, labelled like the header action (new key `landing.aboutRegisterLabel`: "Registrarse" / "Register" / "Registra't"), 1rem below the audience text, start-aligned;
    - both are shown to every visitor (not session-dependent), as text `Link`s (`@/shared/ui`, default variant), without a `nav` landmark (`heroRegisterNavigation` and `aboutRegisterNavigation` removed).
    - To confirm, for both links together:
      - A. the reading as above (text links);
      - B. both as action buttons, `RouteButton` with the treatment of their kind (base-controls "Navigation controls by position"; decisions log 2026-10-09): the hero link e.g. `action-3` in an action group with the explore button; the About us link e.g. `action-1` like the other "Register" actions, base size, start-aligned 1rem below the text;
      - C. a different reading (e.g. a different label such as "Conoce Tazavera" or "Únete a Tazavera", or one link as text and the other as a button).
    - **Recommendation: A**, because it follows the answers as relayed and keeps the registration links' place and treatment on both pages. Its cost: base-controls says every navigation control outside a page header's first line is an action button, so the landing delta must state both links as exceptions. The registration links carry the same tension today.
    - **Blocks propose: no.** The design follows A; B would change only the component (and, in the hero, add the action-group layout), with no new token or text: the `action-1` and `action-3` border pairs on `surface-section` are already registered (`theme-tokens.test.ts` lines 428, 438, 695, 707, by Grep).

**Closed:** whether the forms must also redirect authenticated users — they already do (`RegisterClient.tsx:43-51`; user-account "Registration routes"; decisions log 2026-10-06). `/join` gets the same gate (§4.1).

## Unverified

1. Contrast ratios of §7 were not re-measured: shell access (Bash/PowerShell) was denied in this session, so no script ran. Every pair is already registered in the theme matrix, which measures them.
2. Header width at 768px with the new action (§9), and the entry-page button width at 375px: estimates only; no browser capture was possible. The visual review must capture 375/768/1280 in es and ca, both themes, signed out and signed in.
3. Equal-height cards and bottom-aligned buttons (§6.1) are inferred from the classes, not seen in a browser.
4. Flex `gap` ignoring the `md:hidden` wrapper (§6.2) is standard CSS behaviour for `display: none` items; not seen in this project's browser.
5. The working tree was read as `develop` per the orchestrator; `git status`/`git show develop:` could not be run to confirm the branch and a clean tree (shell denied again on 2026-10-29).
6. The About us link's width and the unchanged hero height (§6.3), and the unchanged height of About us section 4 with the `/join` link, are estimates from the classes; no browser capture.

## Review log

- **2026-10-21 — generation (Design lead).** Drafted from Product owner's request (relayed by the orchestrator), the decisions log, the user-account, landing, app-shell and base-controls specs, `AppHeader`, `NavigationMenu`, `nav-entries`, `AppShell`, `RegisterScreen`, `RegisterClient`, `RegisterSuccessPanel`, `SessionGate`, `EvaluationsGate`, `HomeHero`, `HomeScreen`, `AboutContent`, `AboutScreen`, `Card`, `PageSection`, `Button`, `RouteButton`, `LoadingStatus`, `icons.ts`, the three catalogs, `proxy.ts`, the auth return-route code, the archived `fit-header-at-375` and `shorten-ca-header-sign-in` proposals and the MVC views. Settled under criterion B:
  - the landing's session gate = the existing register* rule (decisions log 2026-10-06; orchestrator's note of 2026-10-21); default 3 closed;
  - header action as `RouteButton` (base-controls "Navigation controls by position") and option-card actions as `action-1` (base-controls "Action variants by kind": registering creates an account, more specific than navigate);
  - all spacing values from `RegisterScreen`, About us cards, `RegisterSuccessPanel`, `HomeHero` and the shared components; no new value;
  - texts in `shell` (header) and `account` (landing) areas, matching the existing readers;
  - the six landing keys to remove, verified unused elsewhere by Grep.
- **2026-10-21 — Product owner's answers (Design lead, step 4).** Changes since the generation:
  - Open 1 answered (B, `/{locale}/join`): forms no longer move; §11 rewritten (new route file only); all text assuming `/register/specialist` removed (§3, §11, §12, user-account delta, README note, `RegisterClient.test.tsx` fixture no longer affected).
  - `/join` gate: the decisions-log rule covers only `register*`; the same gate is applied to `/join` from Product owner's request (§4.1). FSD placement settled in §4.3: the landing screen stays in the `src/pages/register` slice and is routed from `app/[locale]/join`, so the shared gate (Open 7) stays slice-local; the lower-layer alternative is recorded there as the architect's choice, not a Product owner question.
  - Open 2 answered with a new option; designed per the orchestrator's reading: header action from `md` only (`hidden md:inline-flex` wrapper), entry-page `RouteButton action-1` above the hero below `md` in a `HomeRegisterButton` client island of `src/pages/home` (§4.2, §6.2, §9, §10). New text `landing.heroRegisterAction` (§8). New Open 11 to confirm the reading (non-blocking).
  - Navigation-menu entry and former Open 5 (`UserPlus` icon) dropped: no menu entry means no icon; `NavigationMenu.tsx`, `nav-entries.ts` and `icons.ts` removed from the affected files.
  - Open 4 and Open 6 marked settled by the request (links removed from both pages; specialist card first).
  - Spec deltas updated: `landing` gains the entry-page button scenarios; `app-shell` "Signed-out header" shows "Register" only from the medium breakpoint; `user-account` only ADDs the landing and rewords "reachable from".
  - Opens 3, 7–10 unchanged in substance (7 re-worded for the slice placement, 10 option B now points to `/join`).
- **2026-10-29 — Product owner's answer on the hero link (Design lead, step 4).** The hero's two registration links are replaced by one About us `Link` to `/{locale}/about`, for every visitor, in the actions block 1rem below the explore button, with no `nav` landmark. About us only loses its links. Changes: §1, §2, §3 (new fact row), §5, §6.3 (rewritten), §7 (accessible name; `text-link` pairs, already registered), §8 (new `landing.heroAboutLabel`; why not `shell.aboutUs`; `heroRegisterNavigation` removed, not renamed; `HomeHeroTexts` gains `aboutLabel`), §9, §10 (375px mock-up), §11, §12 (landing delta, files, tests), Open 4, new Open 12 (settled, reading to confirm, non-blocking), Unverified 6. Settled under criterion B (semantic, contradiction between artifacts):
  - app-shell "Named navigation landmarks" names the registration landmarks, which this change removes; the first drafts missed it. It is added to the app-shell delta.
  - The validation-test list was incomplete; the missing AboutContent and HomeHero cases are added.
  - The mock-up's explore label is flagged as a placeholder.
  - Not settled: the tension between a text link and base-controls "Navigation controls by position". It changes what is built, so it goes to Open 12 (option B).
- **2026-10-29 — Product owner's correction: About us untouched (Design lead, step 4).** Only the entry-page hero's two registration links change (replaced by the one About us link); the About us page (`AboutContent.tsx`, `AboutScreen`, its texts, tests and spec scenarios) keeps its two registration links exactly as today. Removing them came from the orchestrator's misreading (handoff D2, withdrawn), not from Product owner. Changes: header capabilities line; §1 goal 3; §2 (in: three hero keys; out: About us); §6.3 (retitled; About us paragraph says "unchanged"; "Link groups" now applies to About us only, "Page layout" sentence stays); §8 (three removed keys instead of six; About us keys and `aboutRegisterNavigation` stay; `AboutContentTexts` unchanged; note on the card labels sharing wording with the About us labels); §11 (`AboutContent.tsx` links unchanged); §12 (`AboutContent.tsx`/`AboutScreen.tsx` out of the affected files; `AboutContent.test.tsx` untouched; landing delta rewords "Link groups" to About us only and leaves "About us page" out; app-shell delta keeps the About us "Registration" landmark and drops only the entry page's; user-account "reachable from the registration landing and the About us page"); §13; Open 4 answered (supersedes "settled by the request"); Open 12 loses its About us bullet and the "also kept on About us" option. Settled under criterion B: none new; every edit applies Product owner's answer.
- **2026-10-29 — Product owner's answer on About us: one `/join` link (Design lead, step 4).** Supersedes the previous entry for About us: section 4's two registration links become one text `Link` to `/{locale}/join` in the same place (1rem below the audience text, `self-start`), for every visitor; the hero change stays. Changes: header capabilities line; §1 goal 3; §2 (six keys removed again; About us `/join` link in scope); §5 (new row); §6.3 (retitled; About us block with layout, alignment, spacing; "Link groups" and the "Page layout" sentence on link groups now have no subject on either page); §7 (accessible name; `text-link` on `surface-section`, already registered); §8 (new `landing.aboutRegisterLabel`, Registrarse / Register / Registra't, rather than reusing `heroRegisterAction`; `aboutCoffeeshopRegisterLabel`, `aboutSpecialistRegisterLabel`, `aboutRegisterNavigation` removed; `AboutContentTexts` gains `registerLabel`); §9; §11; §12 (About files and `AboutContent.test.tsx` back; user-account "Registration routes" reachable from the registration landing only; `/join` reachable from header, entry-page button and About us; app-shell "Registration" landmark removed from both pages; landing "About us page" scenario addresses `/es/join`; "Link groups" removed); §13; Open 4 rewritten; Open 12 now covers both links. Settled under criterion B:
  - the About us `nav` landmark goes: one link is not a group, as for the hero (consistency, no visible change beyond what Product owner asked);
  - `self-start` on the About us link so it keeps its own width in the stretching flex column (a verified layout constraint; no visible change from today's links);
  - a new `about*` key instead of reusing a `hero*` key (wording identical; architect may reuse).
