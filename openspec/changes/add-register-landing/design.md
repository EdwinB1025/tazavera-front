# Design — add-register-landing

## Context

See proposal.md (Why, What Changes). This document is self-contained: it carries the settled values (layout, spacing, tokens, texts and responsive behaviour), the implementation decisions and the file plan, and the tasks point to it. `docs/design/add-register-landing/design-summary.md` (approved, `c6ac3ddf`) is only the propose input — the record of the design conversation — and no value is left there (Product owner, review Q6 = A).

Current state that constrains the approach (verified on `feature/add-register-landing`):

- Auth state on the client comes only from `useSession()` (`@/features/auth`); tokens live in browser memory, so the `/join` gate is client-side, as for the forms. `useSession()` reads `useLocale()` (next-intl), so a component test that renders it either mocks `@/features/auth` (as `RegisterClient.test.tsx` does) or provides the locale.
- `RegisterClient` (`src/pages/register/ui/RegisterClient.tsx`) holds the forms' gate: loading status while resolving, `null` plus `router.replace(\`/${locale}\`)` when authenticated.
- `RouteButton` (`@/shared/ui`) is a `Button` whose click calls `useRouter().push(href)` (App Router). It takes no `className`, so breakpoint visibility goes on a wrapper. `useRouter()` needs the App Router context: a component test that renders it mocks `next/navigation` (as `AppShell.test.tsx` and `RegisterClient.test.tsx` do). Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` (`router.push` and `router.replace` perform client-side navigation; `replace` adds no history entry).
- Route files receive `params` through the generated `PageProps<"/[locale]/…">` type (`app/[locale]/about/page.tsx`, `app/[locale]/register/page.tsx`); the type of a new route exists after `npx next typegen` or a build. Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`.
- `app/[locale]/@sidebar/[...rest]/page.tsx` already covers `/join` (no sidebar), and the proxy matcher covers every path under a locale: no slot or proxy change.
- `tsconfig.json` includes `qa/`, so `npx tsc --noEmit` also type-checks the QA suite.

API: no endpoint is consumed (navigation only). No API error is presented, so no error state exists for these screens; the only asynchronous state is the session (resolving, anonymous, authenticated).

## Goals / Non-Goals

**Goals:** one anonymous-only gate rule for `/register*` and `/join`; the settled layout with existing components, tokens and spacing only; every scenario of the three spec deltas covered by exactly one test.

**Non-Goals:** no new shared component, variant, token, icon or guard test; no change to `RegisterForm`, the success panel or Cancel; no lower-layer gate.

## Files

| Path | Layer | Change |
|---|---|---|
| `app/[locale]/join/page.tsx` | routing | new; awaits `params` and renders `RegisterLandingScreen` from `@/pages/register` |
| `src/pages/register/model/use-anonymous-only.ts` | pages (`register` slice, `model`) | new; D2 |
| `src/pages/register/ui/RegisterClient.tsx` | pages | uses D2's hook; rendering unchanged |
| `src/pages/register/ui/RegisterLandingScreen.tsx` | pages | new, server; D3 |
| `src/pages/register/ui/RegisterLandingClient.tsx` | pages | new, client; D3 |
| `src/pages/register/ui/RegisterOption.tsx` | pages | new; D3 |
| `src/pages/register/index.ts` | pages | also exports `RegisterLandingScreen` |
| `src/widgets/app-header/ui/AppHeader.tsx` | widgets | header action; `AppHeaderTexts.register`; D4 |
| `src/app/shell/AppShell.tsx` | app | passes `register` from the `shell` catalog; D4 |
| `src/pages/home/ui/HomeRegisterButton.tsx` | pages (`home` slice) | new, client; D5 |
| `src/pages/home/ui/HomeScreen.tsx` | pages | hero section layout and texts; D5, D6 |
| `src/pages/home/ui/HomeHero.tsx` | pages | one About us button; `HomeHeroTexts`; D6 |
| `src/pages/about/ui/AboutContent.tsx` | pages (`about` slice) | one `/join` link; `AboutContentTexts`; D6 |
| `src/pages/about/ui/AboutScreen.tsx` | pages | texts; D6 |
| `messages/{es,en,ca}/shell.json`, `account.json`, `landing.json` | catalogs | D7 |
| `README.md` | docs | route table: a `/join` row ("Choose how to register") next to the register rows |

## Decisions

### D1 — The landing lives in the `register` page slice

As the summary settles (§4.3): `RegisterLandingScreen` and its client region are in `src/pages/register`, exported from its public index, and `app/[locale]/join/page.tsx` imports it. A page slice cannot import another page slice, so this is what lets the forms and the landing share one gate (D2) without moving it to a lower layer. Alternative not taken: the gate in `features/auth` or a widget, which would put a page-specific redirect rule into a shared layer for two consumers of one flow.

### D2 — The gate is one slice-local hook (summary Open 7 = A)

`src/pages/register/model/use-anonymous-only.ts` exports `useAnonymousOnly(locale: string): Session["state"]`: it reads `useSession()` from `@/features/auth` and `useRouter()` from `next/navigation`, calls `router.replace(\`/${locale}\`)` in an effect while the state is `"authenticated"`, and returns the session state. `RegisterClient` replaces its own `useSession`/`useRouter`/`useEffect` lines with it and keeps its rendering exactly: `null` when authenticated, the loading status or the form inside its section card otherwise. `RegisterLandingClient` uses the same hook. `RegisterClient` uses the returned state for its loading check; `signIn` and `signInWithRegistration` stay direct imports from `@/features/auth`.

Why a hook, not a component with `loading` and `children` slots: the two consumers draw the loading state in different places (the forms inside their section card, the landing in place of the options grid with no card), and the forms render nothing at all when authenticated. A wrapping component would either render the forms' card around nothing for an authenticated visitor or need the card passed in as a slot; the hook shares only the rule. Alternative rejected: copying the ten lines (two places for one redirect rule).

`RegisterClient.test.tsx` mocks `@/features/auth` and `next/navigation` by module, so its tests keep passing through the hook unchanged.

A session that cannot be resolved settles to `{ state: "anonymous" }` with no error (`src/features/auth/model/session.ts`), so the landing shows its heading, its introduction and its two options exactly as for an anonymous visitor (user-account "Registration landing session gate"). The scenario's test drives a real unresolvable session as `src/app/shell/AppShell.test.tsx:221` does — the sign-in marker set and `completeCallback` answering nothing that belongs to it — so it is a distinct test from the anonymous one (handoff decision D5).

### D3 — Landing screen, client region and option card

- `RegisterLandingScreen({ locale })` (server) reads the `account` catalog and renders the settled frame (summary §6.1, restated by its classes here) with `RegisterScreen`'s classes: wrapper `div.flex-1` → `PageSection surface="page" containerClassName="flex flex-col"` → column `flex w-full flex-col gap-8` → heading block `flex flex-col gap-2` (`h1.type-heading` = `registerLandingTitle`, `p.type-body` = `registerLandingIntro`) → `RegisterLandingClient`. Unlike `RegisterScreen`, the `h1` needs no id (no form is labelled by it).
- `RegisterLandingClient({ locale, texts })` (client): `useAnonymousOnly(locale)`; `"authenticated"` → `null`; `"loading"` → `LoadingStatus` with `texts.loading`; `"anonymous"` → the options grid `grid gap-6 md:grid-cols-2` holding two `RegisterOption`s, specialist first (`/${locale}/register`), then coffee shop (`/${locale}/register/coffeeshop`).
- `RegisterOption({ title, text, actionLabel, href })`: `Card layout="stacked"` (content variant; the stacked layout already applies `h-full` and the content's `flex-1`) → `CardContent` → `div` `flex h-full flex-col gap-4` → `h2.type-card-heading`, `p.type-body`, and an action row `mt-auto pt-2` holding `RouteButton variant="action-1" size="base"`. One component for both cards (no boolean variant). Equal heights and bottom-aligned buttons follow from the grid's stretch (summary Unverified 3: checked in the visual review).

UI types, declared before the components in their files:

```ts
export type RegisterLandingTexts = {
  loading: string;
  specialistTitle: string;
  specialistText: string;
  specialistAction: string;
  coffeeshopTitle: string;
  coffeeshopText: string;
  coffeeshopAction: string;
};

export type RegisterOptionProps = {
  title: string;
  text: string;
  actionLabel: string;
  href: string;
};
```

### D4 — Header "Register" action

In `AppHeader`, the `session.state === "anonymous"` branch renders, in this order, a `span.hidden.lg:inline-flex` holding `RouteButton variant="nav-button" href={\`/${locale}/join\`}` with `texts.register`, then the existing "Sign in" `Button` (unchanged, no wrapper). Both stay in the right group, so its `gap-2 md:gap-4` spaces them. No `aria-current`. While resolving and when authenticated the branch does not render, so the action follows "Sign in" (app-shell "Session states in the shell"). `AppHeaderTexts` gains `register: string` (required, D8); `AppShell` passes `register: texts.register!`, read from `shell.register` like the other header texts. The wrapper is `lg`, not `md`: the visual review measured the signed-out header overflowing at 768px with the action (content width 903px in es, 894px in ca, 823px in en, "Sign in" off screen) and nothing overflowing from 1024px in any locale, so the settled fallback of summary §9 applies, with D5's `lg:hidden` (handoff C3 = A, 2026-11-06).

### D5 — Entry-page "Register" button island renders its own wrapper

`HomeRegisterButton({ locale, label })` (client, `src/pages/home/ui/`) reads `useSession()` from `@/features/auth` and returns `null` unless the state is `"anonymous"`; when anonymous it returns `div.lg:hidden` holding `RouteButton variant="action-1" size="base" href={\`/${locale}/join\`}` with `label`. `HomeScreen` passes `containerClassName="flex flex-col gap-6"` to the hero's `PageSection` and renders `HomeRegisterButton` (label `catalog.heroRegisterAction`) before `HomeHero`.

Why the island renders the wrapper: the summary places a breakpoint-hidden wrapper around the island (`lg:hidden` since handoff C3) and requires the hero to start at today's position for a resolving or signed-in visitor (§6.2). A wrapper rendered by `HomeScreen` would stay in the flex column as an empty item even when the island renders nothing, and the column's `gap-6` would push the hero down 1.5rem below `lg` for exactly those visitors. Rendering the wrapper inside the island leaves no item at all in those states; from `lg` the wrapper is `display: none`, which flex `gap` ignores. The page does not change from `lg` for any visitor. Between 768px and 1023px the button sits above the two-column hero, 1.5rem above it (the hero section's `gap-6`, unchanged).

### D6 — The hero's About us button and the About us link

- `HomeHero`: the `nav` and `LINK_GROUP_CLASSES` go; the actions block (`ACTIONS_CLASSES`, unchanged: `mt-2 flex flex-col items-start gap-4`) holds `ExploreButton`, then `RouteButton variant="action-1" size="base" href={\`/${locale}/about\`}` with `texts.aboutLabel` — the treatment and size of the entry-page Register button (D5) and the `/join` option buttons (D3), with no new text, token or style (corrections Round 1, item 1). `HomeHeroTexts` drops `coffeeshopRegisterLabel`, `specialistRegisterLabel` and `registerNavigation` and gains `aboutLabel: string`. `HomeScreen` passes `catalog.heroAboutLabel`. The block's `items-start` gives the button its own width ("Link groups"). `RouteButton` calls `useRouter()`, so a component test that renders `HomeHero` mocks `next/navigation`.
- `AboutContent`: in section 4 the `nav` and `LINK_GROUP_CLASSES` go; after the audience text comes `Link href={\`/${locale}/join\`} className="self-start"` with `texts.registerLabel`. `AboutContentTexts` drops the same three keys and gains `registerLabel: string`. `AboutScreen` passes `catalog.aboutRegisterLabel`.
- The About us page's link is a text link (summary Open 12 = A); the landing delta states it as an exception to base-controls "Navigation controls by position". The hero's About us action is an action button (corrections Round 1, item 1: Product owner's browser check, 2026-11-11, found a button followed by a text link unbalanced), so it needs no exception.

### D7 — Catalog texts

The wording (proposed in the summary §8, accepted as proposed — Open 9 = A — and carried here by review Q6 = A):

| Key | es | en | ca |
|---|---|---|---|
| `shell.register` | Registrarse | Register | Registra't |
| `landing.heroRegisterAction` | Registrarse | Register | Registra't |
| `landing.heroAboutLabel` | Sobre nosotros | About us | Sobre nosaltres |
| `landing.aboutRegisterLabel` | Registrarse | Register | Registra't |
| `account.registerLandingTitle` | Únete a Tazavera | Join Tazavera | Uneix-te a Tazavera |
| `account.registerLandingIntro` | Elige cómo quieres participar en Tazavera. | Choose how you want to take part in Tazavera. | Tria com vols participar a Tazavera. |
| `account.registerLandingSpecialistTitle` | Especialista | Specialist | Especialista |
| `account.registerLandingSpecialistText` | Cata a ciegas las ofertas de las cafeterías con el protocolo de la SCA y registra tus evaluaciones. | Cup the coffee shops' offerings blind with the SCA protocol and record your evaluations. | Tasta a cegues les ofertes de les cafeteries amb el protocol de l'SCA i registra les teves avaluacions. |
| `account.registerLandingSpecialistAction` | Regístrate como especialista | Register as a specialist | Registra't com a especialista |
| `account.registerLandingCoffeeshopTitle` | Cafetería | Coffee shop | Cafeteria |
| `account.registerLandingCoffeeshopText` | Publica tus ofertas, recibe la evaluación de especialistas y muestra con pruebas lo que sirves. | Publish your offerings, have them evaluated by specialists and show with evidence what you serve. | Publica les teves ofertes, rep l'avaluació d'especialistes i mostra amb proves el que serveixes. |
| `account.registerLandingCoffeeshopAction` | Registra tu cafetería | Register your coffeeshop | Registra la teva cafeteria |

Removed, in es, en and ca: `landing.heroCoffeeshopRegisterLabel`, `heroSpecialistRegisterLabel`, `heroRegisterNavigation`, `aboutCoffeeshopRegisterLabel`, `aboutSpecialistRegisterLabel`, `aboutRegisterNavigation`. `account.loading` is reused for the loading status. `landing.aboutRegisterLabel` stays a new key rather than a reuse of `heroRegisterAction` (summary §8): every About us text is an `about*` key, and sharing a `hero*` key would tie the About us link's wording to the entry-page button. The existing catalog guard ("An area is complete in every locale") covers additions and removals.

### D8 — New text props are required

`HomeHeroTexts.aboutLabel`, `AboutContentTexts.registerLabel` and `AppHeaderTexts.register` are required: each has one production caller that always passes it, and a missing label would render an unnamed control. AGENTS.md forbids loosening production code for a QA fixture, so production code is not loosened. Because `next build` type-checks `qa/` (`tsconfig.json` includes it), the QA fixtures that lack them get only their types updated, by the build in task 5.1, so that `npx tsc --noEmit` and `npm run build` pass: `aboutLabel` in `qa/src/pages/home/ui/HomeHero.test.tsx` (its `TEXTS` fixture also drops the removed labels `coffeeshopRegisterLabel` and `specialistRegisterLabel`) and `register` in `qa/src/widgets/app-header/ui/AppHeader.test.tsx`. No assertion changes (Product owner, handoff Q12 = A, 2026-11-06).

### D9 — Tests of rewritten scenarios

The CLI refuses a MODIFIED block that drops a scenario name, so, as in `open-directory-from-hero` and `show-item-not-found-message`, the scenarios whose subject disappears keep their names with new content: landing "Link groups", "Registration destinations", "Specialist registration destination", "Registration links", and app-shell "Registration links named". Their existing tests are rewritten in the task that changes the behaviour, keeping one test per scenario; the two "Link groups" tests (one per page) stay two, as today. App-shell "Registration links named" has no test today and gets none: its outcome (no navigation landmark around either link) is the same check the landing tests of "Registration destinations" and "Registration links" make, which is not repeated. The five names are kept as they are and are renamed later by a hand edit of the main specs (Product owner, review Q8 = A).

## Risks / Trade-offs

- [Header width at 768px with the new action, unmeasured at propose (summary Unverified 2)] → measured by the visual review (2026-11-06): the signed-out header overflows at 768px in es (903px), ca (894px) and en (823px), and nothing overflows from 1024px in any locale; D4 and D5 moved to `lg` together, per summary §9 (handoff C3 = A).
- [The entry-page button appears once the session resolves and moves the hero down 4rem for an anonymous visitor below `md`] → accepted by Product owner (summary Open 11 = A).
- [Stale QA tests] → the fixture types of `qa/src/pages/home/ui/HomeHero.test.tsx` and `qa/src/widgets/app-header/ui/AppHeader.test.tsx` are updated in task 5.1 with no assertion changed (D8); the stale assertions (home, header, About us) stay failing and the build lists them in its final report for the QA run before the merge into `master`. `qa/src/pages/home/ui/HomeScreen.test.tsx` is not edited (it reads the removed keys inside an assertion), nor are the missing `@/features/auth` and `next/navigation` mocks:
  - `qa/src/pages/home/ui/HomeHero.test.tsx`: its texts fixture lacked `aboutLabel` (type error under `npx tsc --noEmit`, fixed in task 5.1) and carried the removed labels; its layout assertion on `ACTIONS_CLASSES` keeps holding.
  - `qa/src/pages/home/ui/HomeScreen.test.tsx`: reads the removed `heroCoffeeshopRegisterLabel` and `heroSpecialistRegisterLabel` keys, and renders `HomeScreen` without mocking `@/features/auth`.
  - `qa/src/widgets/app-header/ui/AppHeader.test.tsx`: its texts fixture lacked `register` (type error, fixed in task 5.1), and it renders the anonymous header without mocking `next/navigation`, which `RouteButton` needs.
- [Kept scenario names no longer describe their content (D9)] → the five scenarios keep their names with the new content and are renamed later by a hand edit of the main specs (Product owner, review Q8 = A; design.md D9).

## Migration Plan

None: front-only, no data or contract change. Rollback is reverting the change's commits; the old registration links come back with their texts.
