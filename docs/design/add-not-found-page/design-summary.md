Status: approved — by the orchestrator under Product owner's authorization of R14 (2026-10-08); no open points

# Design summary — add-not-found-page

- **Change-id:** `add-not-found-page`
- **Capability:** `app-shell` (backlog R14)
- **Authorised:** decisions log, 2026-10-07 "R14 autorizado si queda tiempo" and 2026-10-08 "Orden": after `add-coffeeshop-directory` and `add-public-evaluations`, before the final technical review. The orchestrator approves the summary if no point is left open.
- **Constraint (Product owner, decisions log 2026-10-07 "nada nuevo en el diseño"):** compose only existing components, tokens and patterns. No new token, colour, icon, component, variant, dependency or guard test.

## 1. Goal

Today the application has no `not-found` file, so every "not found" outcome shows Next.js's default 404 page: unstyled, in English only, outside the theme and without the shell (backlog R14). This change gives the `[locale]` segment a not-found page that sits inside the shell, follows the active theme and locale, and offers a way back to the home page of the active locale.

## 2. Scope

**In:**
- one not-found page for the `[locale]` segment, rendered inside the shell (header, theme, locale);
- it covers every way a route under a supported locale reaches "not found" today:
  - a path no route defines (`app/[locale]/default.tsx` calls `notFound()`; app-shell scenario "Unknown route stays not found");
  - an unsupported locale prefix, which the proxy redirects under `es`, where it resolves to the same page (app-shell scenario "Unsupported locale");
  - a signed-in user whose role the route does not allow (`SessionGate` `allows`, used by `/manage/offerings` and `/manage/offerings/new`; `EvaluationsAccess` on `/manage/evaluations*`; app-shell scenario "Role the route does not allow" and decisions log 2026-10-06 "acceso a rutas protegidas");
  - a resource the route reports as not found (`EvaluationDetail` on a `404`, `NewEvaluationScreen` on an unknown offering);
- three catalog texts in the `shell` area, es/en/ca.

**Out:**
- `global-not-found` (experimental flag in `next.config`, needs its own `<html>`/`<body>`): not needed, because the proxy prefixes every application URL with a locale (§3).
- A root `app/not-found.tsx`. Only paths the proxy leaves untouched reach the root (framework paths and paths with a file extension, plus `/callback`), and none of them is a page a user navigates to. Not built; no backlog entry proposed.
- Changing which screens call `notFound()`. The offering detail keeps its own error result for an unknown offering (`OfferingDetail`, catalog design); turning it into a 404 would change a settled design.
- A localised `<title>`: the root layout's metadata (`Tazavera`) stays (§3.3).
- Any change to the sidebar slot (§9, Unverified 3).

## 3. Mechanism (Next.js 16)

Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` and `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`.

### 3.1 File and placement

- Route file `app/[locale]/not-found.tsx`. A `notFound()` thrown in a segment renders the nearest `not-found` boundary (functions doc, "the nearest parent `not-found` boundary renders, falling back to Next.js's default 404 page"); the file renders inside its segment's layout, so the page appears inside `AppShell` (header, theme, `<html lang>`).
- `app/[locale]/default.tsx` already calls `notFound()` for any unknown path under a locale, and the `@sidebar/[...rest]` catch-all gives the slot its default sidebar, so unknown paths land on this boundary.
- Next returns HTTP 404 for non-streamed responses and injects `<meta name="robots" content="noindex">` for 404 pages (file-convention doc, "Status Codes" and "Metadata"). Nothing to build.
- `notFound()` thrown from a Client Component (`SessionGate`, `EvaluationsAccess`, `EvaluationDetail`) reaches the same boundary (functions doc: "it travels up the call stack until something catches it"). Unverified in this project's browser: the visual verification task covers it (§10).

### 3.2 Locale

- `not-found.js` receives no props (file-convention doc, "Props"), so it cannot read `params`.
- It is a Server Component by default and may be `async` (doc, "Data Fetching" example reads `headers()`). The proxy already forwards the route's locale as the `x-locale` request header, and the root layout reads it the same way (`app/layout.tsx`).
- **Settled:** the route file is an `async` function that reads `x-locale` from `headers()`, falls back to `DEFAULT_LOCALE`, and renders `<NotFoundScreen locale={locale} />` from `src/pages/not-found`. It holds no other logic, like every other route file (AGENTS.md "Architecture"). `NotFoundScreen` is a synchronous Server Component (testable with Vitest), resolves an unsupported value to `DEFAULT_LOCALE` with `isSupportedLocale` exactly as `AppShell` does, reads the `shell` catalog with `getMessages`, and passes its texts as props. Why: same header the root layout uses; no client hook needed; keeps the async part thin (AGENTS.md "Testing").

### 3.3 Metadata

`not-found.js` cannot export `metadata` (the doc documents metadata only for `global-not-found.js`). The root layout's `generateMetadata` keeps the title `Tazavera` and the locale description. Settled: no title change.

## 4. FSD placement

| Piece | Layer / slice | Notes |
|---|---|---|
| `app/[locale]/not-found.tsx` | routing | reads `x-locale`, renders the screen |
| `NotFoundScreen` | `src/pages/not-found` (`ui/NotFoundScreen.tsx`, public `index.ts`) | composes shared UI only |
| `PageSection`, `Card` (`variant="section"`), `CardAside`, `CardContent`, `Link` (`variant="back"`) | `@/shared/ui` | reused as they are |

No new component in `shared`, `entities`, `features` or `widgets`. The screen imports only from `@/shared` (allowed for `pages`).

## 5. Layout and spacing (criterion A)

Composition, from the outside in. Every value comes from an existing component or page; the build picks no new value.

```
main area (shell, bg surface-page)
└─ wrapper div — flex-1                                   [RegisterScreen, AccountScreen]
   └─ PageSection surface="page"                          [content-structure "Page sections"]
      │  py 3rem (<768) / 4rem (≥768); container max 72rem, centred,
      │  px 1rem (<768) / 2rem (≥768); containerClassName "flex flex-col"
      └─ column — centred, full width up to 32rem (max-w-lg, mx-auto)   [RegisterScreen]
         └─ Card variant="section"                        [content-structure "Section card"]
            │  bg surface-card · 1px border, all sides, border-subtle ·
            │  radius rounded-container · shadow-lg · overflow-hidden
            ├─ CardAside (header band)
            │    bg surface-section · bottom border 1px border-subtle ·
            │    padding 1rem (<768) / 1rem top-bottom + 1.5rem sides (≥768) ·
            │    children in a column, 0.5rem apart (only the heading here)
            │    └─ h1 · type-subheading
            └─ CardContent (body)
                 padding 1rem sides, 1rem top, 1.25rem bottom (<768) / 1.5rem all sides (≥768)
                 children: column, items at the start, 1rem apart          [SignedOutPrompt, RegisterSuccessPanel]
                 ├─ p · type-body
                 └─ Link variant="back" → /{locale}
                      ArrowLeft 16px · 0.5rem between icon and text · underline · at its own width
```

| Element | Padding | Gap / margin to neighbours | Children gap | Border (width, side, token) | Radius | Container / layout |
|---|---|---|---|---|---|---|
| Wrapper `div` | none | fills the main area (`flex-1`) | — | none | none | main area of the shell |
| `PageSection` | 3rem / 4rem vertical; 1rem / 2rem sides (container) | sole section of the page | `flex flex-col` | none | none | full width of the main area |
| Column | none | centred in the container (`mx-auto`) | holds one card | none | none | full width up to 32rem |
| Section card | none (its parts pad) | sole block of the column | band above body, no gap | 1px, all sides, `border-subtle` | `rounded-container` | column |
| Header band (`CardAside`) | 1rem; from 768px 1rem top/bottom and 1.5rem sides | top of the card | 0.5rem (column) | 1px, bottom, `border-subtle` | inherits the card's clip | card |
| Body (`CardContent`) | 1rem sides, 1rem top, 1.25rem bottom; 1.5rem all sides from 768px | below the band | 1rem (column, items at the start) | none | none | card |
| Text `p` | none | 1rem above the link | — | none | none | body |
| Link | none | 1rem below the text | 0.5rem icon–text | none (underline) | none | body, at its own width |

- Vertical position: the card sits at the top of the content area, below the section's top padding, like every other page. Not centred vertically.
- The page has a single block, so the "2rem between top-level blocks" rule of a feature view (content-structure "Page sections") has nothing to separate.
- Values the build needs from the shared components (`PageSection`, `Card` section variant, `Link` back variant) are already in their classes. The screen adds only `flex-1` (wrapper), `flex flex-col` (container), `mx-auto w-full max-w-lg` (column) and `flex flex-col items-start gap-4` (body).

**Visual reference.** The MVC (`C:/Porjects/Full Stack/Sprint4/MVC/tazavera-app`) has no custom 404 view: `resources/views` holds no `errors/` folder, so Laravel's default page was used, with the title translated in `lang/es.json` ("Not Found" → "No encontrado"). There is no MVC capture to take. The wireframe above is the mock-up; its parts render exactly like the signed-out card of the account page (`AccountClient`, section card holding `SignedOutPrompt`) with a header band, which can serve as the live visual reference at `/es/account` while signed out.

## 6. Components, states and semantic tokens

| Part | Component / class | Semantic tokens | Pairs (already registered in `theme-tokens.test.ts`) |
|---|---|---|---|
| Page backdrop | `PageSection surface="page"` | `surface-page` | decorative |
| Card | `Card variant="section"` | `surface-card`, `border-subtle` | border decorative (not a button) |
| Header band | `CardAside` | `surface-section`, `border-subtle` | decorative |
| Heading | `h1`, `type-subheading` | `text-primary` | `text-primary` / `surface-section` (text) |
| Text | `p`, `type-body` | `text-primary` | `text-primary` / `surface-card` (text) |
| Link, rest / hover | `Link variant="back"` | `text-link` / `text-link-hover` | `text-link`, `text-link-hover` / `surface-card` (text) |
| Link, keyboard focus | `focus-visible:focus-ring` (in `Link`) | focus ring token | existing focus guard |
| Link icon | `ArrowLeft` from `@/shared/ui/icons` (inside `Link`) | `currentColor` | decorative: the text carries the meaning |

- **Contrast (criterion D):** the gated elements are the heading, the text and the link. Every pair they form is already registered in the theme matrix for both themes (lines 299–320 and 720–741 of `src/app/styles/theme-tokens.test.ts`, checked by Grep). No new pair, no new measurement, no new token. Ratios were not re-measured for this draft (the existing guard measures them).
- **States:** the page has one state. The link has rest, hover (colour change, underline kept), keyboard focus (focus ring) and active (browser default). No disabled, loading or error state: the page fetches nothing.
- **Session:** the page is the same for every session state. The header shows the session control as on any route.

## 7. Texts (catalog area `shell`, passed as props)

| Key | es | en | ca |
|---|---|---|---|
| `notFoundTitle` | Página no encontrada | Page not found | Pàgina no trobada |
| `notFoundText` | La página que buscas no existe o no tienes acceso a ella. | The page you are looking for does not exist or you do not have access to it. | La pàgina que cerques no existeix o no hi tens accés. |
| `notFoundHomeLink` | Volver al inicio | Back to the home page | Tornar a l'inici |

- Why `shell`: the page belongs to app-shell, and `shell` is that capability's catalog area (`AppShell` reads it). No new area file.
- Why the "no access" clause: the same page answers a signed-in user without the route's role (decisions log 2026-10-06 "acceso a rutas protegidas"); the text tells that user what happened without confirming whether the page exists.
- Title wording follows the MVC's translation of Laravel's 404 title ("No encontrado", `lang/es.json`), as a full phrase.
- `NotFoundScreen` takes `locale` and reads the three texts; it renders no literal text (app-shell "Localized interface texts"). The existing catalog guard ("An area is complete in every locale") covers the three keys in all locales: no new test.

## 8. Accessibility

- **Heading:** the page's only heading, `h1`, names the page ("Página no encontrada"). The shell header holds no `h1`, so it is the single `h1` of the document.
- **Link name:** the visible text ("Volver al inicio"); the `ArrowLeft` icon is decorative inside `Link` and adds nothing to the name. `href` is `/{locale}`, the root of the active locale (same destination as the brand link).
- **Focus:** no programmatic focus. The page arrives by navigation (Next's route announcer handles the change), and on a role-gated route it replaces a loading status that held no focus. In tab order: the header controls, then the link.
- **Keyboard:** the link is reachable and shows the shared focus ring.
- **Colour:** nothing is conveyed by colour alone; the page carries no error colour.
- **Landmarks:** the content sits in the shell's main area; `PageSection` renders a `<section>` without a label, as on every other page.

## 9. Responsive behaviour

Breakpoints: `md` 768px (spacing steps) from the shared components; nothing changes at `lg` or above.

- **375px:** container side padding 1rem; column and card 343px wide (computed: 375 − 2 × 16); band padding 1rem; body padding 1rem / 1.25rem bottom; the text wraps; the link stays at its own width. No horizontal scroll expected.
- **1280px:** container 72rem max with 2rem side padding; the column caps at 32rem and is centred; band 1.5rem side padding; body 1.5rem padding.
- Header and sidebar follow the shell's own rules on both widths.

## 10. Spec delta (app-shell)

ADDED requirement:

> ### Requirement: Not-found page
> When a route under a supported locale is not found — the path matches no route, or the route reports its content as not found or not allowed for the signed-in user — the application SHALL show its not-found page inside the shell, in the active locale and theme. The page SHALL show a heading that names the outcome, a short text that tells the user the page does not exist or is not available to them, and a link back to the root of the active locale. Every text SHALL come from the active locale's catalog.
>
> #### Scenario: Not-found page content
> - **WHEN** the not-found page renders for a supported locale
> - **THEN** it shows a level-one heading with that locale's not-found title and the not-found text, inside the shell's main area
>
> #### Scenario: Back to the home page
> - **WHEN** the not-found page renders for a supported locale
> - **THEN** it offers a link, named with that locale's "back to the home page" text, that opens the root of that locale

No MODIFIED requirement. The existing scenarios "Unknown route stays not found", "Unsupported locale" and "Role the route does not allow" already say these routes reach the application's not-found page; this requirement defines what that page shows. Their wording stays.

## 11. Tests and verification tasks

**Tests (one per scenario; AGENTS.md "Testing", decisions log 2026-10-08: no new guard tests):**
1. `src/pages/not-found/ui/NotFoundScreen.test.tsx`, scenario "Not-found page content": render `NotFoundScreen` with one locale; assert the `heading` of level 1 with the catalog title and the catalog text.
2. Same file, scenario "Back to the home page": assert the `link` named with the catalog link text has `href` `/{locale}`.

Not tested: the route file (async, reads a request header; kept thin), the HTTP status, and the boundary wiring (framework behaviour). They go to the visual verification task. The existing `app/[locale]/default.test.tsx` stays as it is.

**Visual verification task (Design lead, before archive):** run the dev server and capture with DevTools device emulation at 375px and 1280px, in both themes:
- `/es/no-existe`, `/en/no-such-page`, `/ca/no-existeix` (unknown path; texts per locale);
- `/xx/anything` (unsupported locale → `/es/xx/anything`, not-found page in Spanish);
- `/es/manage/offerings` as a signed-in specialist, and `/es/manage/evaluations` as a signed-in coffeeshop (role not allowed; local mock of `GET /user` if the database has no such user);
- `/es/manage/evaluations/<unknown ulid>` as a specialist (resource reported not found; mock of the read).

Check: card centred with the padding of §5, no horizontal scroll at 375px, icon beside the link text, focus ring on the link, Spanish/English/Catalan texts, header present, and which sidebar shows on the role-gated routes (Unverified 3).

## 12. Dependencies

- **Builds on:** `app-shell` (shell, locale routing, `default.tsx`), `content-structure` (`PageSection`, section `Card`), `base-controls` (`Link`), `theming` (tokens, focus ring), `extract-access-and-status-pieces` (R11: `SessionGate` `allows` calls `notFound()`).
- **Contract:** no operation consumed.
- **Backlog:** resolves R14 (removed when this change is archived). Touches no other entry.
- **Decisions log:** 2026-10-06 "acceso a rutas protegidas" and "rutas protegidas sin sesión: mensaje con botón" (the role case lands here; signed-out visitors keep the signed-in prompt, not this page); 2026-10-07 "nada nuevo en el diseño"; 2026-10-08 "reducción de la suite" (no new guards).
- **Shared files touched:** `messages/{es,en,ca}/shell.json` (three keys added at the end). Any in-flight branch that also edits `shell.json` would conflict on the closing lines; simulate with `git merge-tree` before the apply (orchestrator).
- **Board:** `add-not-found-page` has no row yet on `docs/change-progress.md` (checked on `develop`).

## Open

None. Every point is settled by an existing artifact, a decision-log entry or the Next.js docs (see §3–§11). Product owner may still revise the texts of §7.

## Unverified

1. `notFound()` thrown from the Client Components (`SessionGate`, `EvaluationsAccess`, `EvaluationDetail`) renders `app/[locale]/not-found.tsx` rather than Next's default page: expected from the functions doc, not yet seen in this project's browser (verification task §11).
2. `x-locale` is present on the requests that render the not-found boundary during client-side navigation: the proxy matcher covers every non-`_next` path, so it should be; checked in the verification task by navigating in-app to an unknown path.
3. On a role-gated management route (e.g. `/es/manage/offerings` as a specialist), the `@sidebar` slot still renders that route's sidebar entries beside the not-found page. Existing behaviour, not caused by this change. If the capture shows it, it is a finding for a new change or the backlog, not for this one.
4. Contrast ratios of §6 were not re-measured; they rely on the pairs already registered in the theme matrix.

## Review log

- **2026-10-08 — generation (Design lead).** Drafted from backlog R14, the decisions log, the app-shell and content-structure specs, `AppShell`, `proxy.ts`, `app/layout.tsx`, `app/[locale]/default.tsx`, every `notFound()` call site, `PageSection`, `Card`, `Link`, `SignedOutPrompt`, `RegisterSuccessPanel`, `RegisterScreen`, `AccountSection` and the local Next.js docs. Settled within criterion B:
  - placement `app/[locale]/not-found.tsx` and locale from `x-locale` (verified in the Next.js docs and the root layout);
  - composition: the section-card pattern Product owner's brief names, with the column and spacing of `RegisterScreen` and the body column of `SignedOutPrompt`;
  - `Link variant="back"` (existing variant and icon) for the way home;
  - texts in the `shell` area; title wording from the MVC's Laravel translation;
  - no metadata change (not supported by `not-found.js`), no root `not-found`, no `global-not-found`.

## Propose status

- **Change-id:** `add-not-found-page` (capability `app-shell`; backlog R14)
- **Date:** 2026-10-07
- **`openspec validate add-not-found-page --strict`:** valid
- **Artifacts:** `openspec/changes/add-not-found-page/` — `proposal.md`, `design.md` (D1–D6), `specs/app-shell/spec.md` (ADDED "Not-found page", two scenarios), `tasks.md` (1.1 tests, 1.2 screen and texts, 1.3 route file, 2.1 checks, 2.2 visual verification with Playwright at 375/1280 in both themes, captures under `captures/`, result appended to `handoff.md`).
- **Resolved:** nothing was open. One wording-only change to the §10 requirement to meet the 500-character limit: "a short text that tells the user the page does not exist" became "a short text saying the page does not exist" (494 characters); meaning unchanged.
- **Backlog:** resolves R14 (removed from `docs/backlog.md` when the change is archived).
- **Open:** none.
