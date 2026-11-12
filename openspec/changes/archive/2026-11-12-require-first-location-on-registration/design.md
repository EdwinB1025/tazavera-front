# Design — require-first-location-on-registration

## Context

See proposal.md (Why). The decisions come from `docs/design/require-first-location-on-registration/design-summary.md` (approved, `8a445e11`), Review log "2026-11-12 — approval": Open 1 = A (dedicated route with its own heading and intro), 2 = A (nothing more when the step is left or fails), 3 = A ("Later" opens `/{locale}`), 4 = B (`201` opens `/{locale}/manage/locations`), 5 = A (no step without a usable `token` block), 6 = A (focus on the page `h1`), 7 = A (path `/{locale}/manage/locations/first`), 8 = wording accepted, 9 = A (the form shows even with existing locations). Every value the build needs is restated here; the summary is not a source for the build.

Current state the design builds on:

- `src/pages/register/model/use-anonymous-only.ts` — `useAnonymousOnly(locale)` returns the session state and, while it is `authenticated`, calls `router.replace(\`/${locale}\`)` in an effect. `RegisterClient` (`src/pages/register/ui/RegisterClient.tsx`) uses it and renders `null` while authenticated; `RegisterLandingClient` uses it too. After a `201` with a `token` block, `RegisterForm` calls `signInWithToken` (wired to `signInWithRegistration` from `@/features/auth`), which keeps the grant in memory (`src/shared/api/tokens.ts`, `keepRegistrationGrant`), loads `GET /user` and settles the session `authenticated`; the gate then navigates and the form unmounts. A reload ends that session (no marker is set).
- `src/features/location-management/ui/LocationsPanel.tsx` — owns the submit handling around `LocationForm`: the per-page geocoding cache (`useRef(new Map<string, GeocodeOutcome>())`), the submit state (`SubmitState`), `submitLocation` (`model/submit-location.ts`), the `422` hand-back (`FieldErrors` returned to the form) and the `201` outcome (close, status, focus to the heading, reload). `LocationForm` takes `texts: LocationFormTexts` (its secondary label is `texts.cancel`), `submitState`, `onSubmit` and `onCancel`.
- `src/pages/manage-locations/ui/ManageLocationsScreen.tsx` — a server composition: loads the `location-management` and `contact` catalogs, renders `PageSection surface="page"` inside `div.flex-1`, a column `flex flex-col gap-8`, the heading block `flex flex-col gap-2` with `h1.type-heading` (`id`, `tabIndex={-1}`) and `p.type-body`, then `ManageLocationsClient` (`SessionGate` with `LoadingStatus`, `SignedOutPrompt` calling `signIn(route)` in the click, `allows={(user) => user.role === "coffeeshop"}`).

Contract (`contracts/openapi.yaml`), unchanged, no new operation:

| Operation | Method and path | Auth | Request | Responses and how they show |
|---|---|---|---|---|
| `registerAUser` | `POST /register` | none | unchanged (`name`, `surname`, `email`, `password`, `passwordConfirmation`, `role`, `businessName` for a coffee shop) | `201` with `token` → sign in, then the coffeeshop route opens the step, the specialist route `/{locale}` (D1); `201` without a usable `token` → success panel; `422` → per-field messages; other → generic error. Unchanged except the coffeeshop destination. |
| `createALocation` | `POST /locations` | bearer (the registration's grant or the normal session; `profile:read` is enough, no step-up) | unchanged (`toCreateLocationPayload`) | `201` → `/{locale}/manage/locations` (D4); `422` → messages under `name`, `description`, `contact.<key>`, `contact.postal_code`, the generic form error for keys with no field; `403`, other status, network failure → generic form error, form kept. No API `message` renders. Same as on Manage locations. |

The Nominatim lookup is unchanged (single entry point `src/shared/lib/geocoding`; decisions log 2026-10-07 "own geocoding"). No API type is derived: the change reads no new API field.

## Goals / Non-Goals

**Goals:** the coffeeshop's post-registration navigation lands on the step and wins over the gate's default; the submit handling is shared, not copied; Manage locations behaves exactly as before.

**Non-Goals:** no `GET /users/{ulid}/locations` on the step (Open 9 = A); no state across the sign-in popup (Open 5 = A); no new shared component, token, icon, dependency or slot page.

## Files

| Path | Layer | Change |
|---|---|---|
| `app/[locale]/manage/locations/first/page.tsx` | app (routing) | New. Awaits `params` (`PageProps<"/[locale]/manage/locations/first">`) and renders `<FirstLocationScreen locale={locale} />`, as `app/[locale]/manage/locations/page.tsx` does. |
| `src/pages/manage-locations/ui/FirstLocationScreen.tsx` | pages | New. Server composition of the step (D3, D5). |
| `src/pages/manage-locations/ui/FirstLocationClient.tsx` | pages | New. Client region: gate, form, navigation, focus (D3, D4, D6). |
| `src/pages/manage-locations/lib/location-form-texts.ts` | pages | New. Slice-local helper building `LocationFormTexts` for a locale (D5). |
| `src/pages/manage-locations/ui/ManageLocationsScreen.tsx` | pages | Uses the helper; the texts it passes do not change (D5). |
| `src/pages/manage-locations/index.ts` | pages | Also exports `FirstLocationScreen`. |
| `src/features/location-management/ui/NewLocationForm.tsx` | features | New. The shared submit composition (D2). |
| `src/features/location-management/ui/LocationsPanel.tsx` | features | Renders `NewLocationForm`; its own submit handling goes (D2). |
| `src/features/location-management/index.ts` | features | Also exports `NewLocationForm` and the type `LocationFormTexts`. |
| `src/pages/register/model/use-anonymous-only.ts` | pages | Takes an optional destination (D1). |
| `src/pages/register/ui/RegisterClient.tsx` | pages | Passes the coffeeshop registration's destination to the gate (D1). |
| `messages/{es,en,ca}/location-management.json` | — | Three new keys (D5). |
| `README.md` | — | Route table row for the step. |

UI-specific types (declared before the component that uses them):

```ts
// src/features/location-management/ui/NewLocationForm.tsx
export type NewLocationFormProps = {
  texts: LocationFormTexts;
  /** The caller's per-page lookup cache (offering-management "Address geocoding"). */
  geocodeCache: Map<string, GeocodeOutcome>;
  onCancel: () => void;
  /** Called once on a `201`; `hadCoordinates` as `SubmitOutcome` gives it. */
  onCreated: (hadCoordinates: boolean) => void;
};

// src/pages/manage-locations/ui/FirstLocationClient.tsx
export type FirstLocationClientTexts = LocationFormTexts & {
  loading: string;
  signedOutText: string;
  signIn: string;
};
```

## Decisions

### D1 — The registration's destination is decided by the gate (point 1, risk)

The gate stays the only navigation after a signed-in registration, so nothing races it. `useAnonymousOnly(locale: string, destination: string = \`/${locale}\`)` replaces with `destination` instead of the fixed root; its effect depends on `destination` too. `RegisterLandingClient` keeps calling it with the locale only.

`RegisterClient` holds a "registered here" flag in React state, `false` on mount. The `signInWithToken` it passes to `RegisterForm` sets the flag to `true` before calling `signInWithRegistration(token)`, and back to `false` when that resolves `false`; it resolves what `signInWithRegistration` resolves. The flag is set synchronously before the call, and the session can only settle after `GET /user` answers, so the flag's render is committed no later than the render where the session is `authenticated`, and the gate's effect reads the destination of that render. `RegisterClient` passes `\`/${locale}/manage/locations/first\`` as the destination only when its `role` is `"coffeeshop"` and the flag is `true`; otherwise `\`/${locale}\``.

So: a coffeeshop signed in by its own registration goes to the step and `/{locale}` is never requested; a visitor who opens either route already authenticated (flag `false`), or signs in from the success panel (that path calls `signIn`, not `signInWithToken`), goes to `/{locale}`; the specialist route always goes to `/{locale}`. Everything stays client-side (`router.replace`), so the in-memory registration grant survives.

Alternatives rejected: navigating from `RegisterForm` after `signInWithToken` resolves (the gate has already replaced to `/{locale}` and unmounted the form by then — a race the gate would win); reading the session user's role in the gate (a coffeeshop opening `/register/coffeeshop` already signed in must still go to `/{locale}`, decisions log 2026-10-06 "protected routes without a session", so the role alone cannot decide); a module-level flag in `features/auth` (puts a page's navigation rule into a shared slice).

Why "Registration routes" is MODIFIED too: its text says an authenticated session always opens the root; the smallest change adds the exception and states, in the scenario "A signed-in visitor is taken to the entry page", that the coffeeshop route is included and the step is never opened. The decisions log 2026-10-12 "autonomous night…", point 5 (land on `/{locale}` after a registration with a session, R78) is replaced for the coffeeshop role only.

### D2 — One new-location form composition in the feature (point 2, reuse)

`src/features/location-management/ui/NewLocationForm.tsx` renders `LocationForm` and owns what `LocationsPanel` holds today around it: the `SubmitState` (initially `"idle"`), a mounted guard, and the `onSubmit` handler that sets `"submitting"`, awaits `submitLocation(values, geocodeCache)`, and then does nothing when unmounted; on `invalid` sets `"idle"` and resolves the `FieldErrors`; on `error` sets `"error"` and resolves `null`; on `created` keeps `"submitting"` (Save stays busy and Cancel/Later unavailable while the caller closes the form or navigates), calls `onCreated(hadCoordinates)` and resolves `null`.

The geocoding cache is a prop owned by the caller, because offering-management "Address geocoding" keeps it for the page, across closing and reopening the form; an instance-owned cache would be lost on each reveal in Manage locations.

`LocationsPanel` keeps its `geocodeCache` ref, drops `submitState` and `handleSubmit`, and renders `<NewLocationForm texts={texts} geocodeCache={geocodeCache.current} onCancel={closeForm} onCreated={…} />` where its form was. Its `onCreated` does what its `201` branch does today: close the form, set the status (`locationCreated`, plus `locationCreatedNoMap` when `hadCoordinates` is `false`), focus the heading by `headingId`, reload. `openForm` no longer resets a submit state: the form is mounted fresh on each reveal, so it starts `"idle"` as today. Status text, focus moves and reload do not change; `LocationsPanel.test.tsx` passes unchanged.

The public index adds `NewLocationForm` and `export type { LocationFormTexts }` (both imported by `src/pages/manage-locations`); `LocationsPanel`, `LocationsPanelTexts` and `LocationsSidebarEntry` stay. Alternative rejected: a `useSubmitLocation` hook returning `submitState` and `onSubmit` — each caller would still wire `LocationForm` the same way; the component shares the whole wiring.

### D3 — The step lives in the `manage-locations` page slice (point 3, FSD)

`FirstLocationScreen` and `FirstLocationClient` go in `src/pages/manage-locations/ui/`, exported through the slice index, and `app/[locale]/manage/locations/first/page.tsx` imports `FirstLocationScreen` from `@/pages/manage-locations`. The step is a screen of the same route family (`/manage/locations/*`), uses the same catalogs, gate, frame and texts helper (D5); a page slice cannot import another page slice, so a new slice would have to copy the texts mapping. Precedent: `src/pages/register` holds the landing and both forms for the same reason.

`FirstLocationClient({ locale, headingId, texts })` mirrors `ManageLocationsClient`: `useSession()` and `signIn` from `@/features/auth`; `SessionGate` with `loading={<LoadingStatus text={texts.loading} />}`, `signedOut={<SignedOutPrompt text={texts.signedOutText} signInLabel={texts.signIn} onSignIn={() => signIn(\`/${locale}/manage/locations/first\`)} />}` and `allows={(user) => user.role === "coffeeshop"}`; its children render `NewLocationForm` with `texts`, the client's own `useRef(new Map()).current` cache, `onCancel` and `onCreated` of D4. It sends no locations read (Open 9 = A).

### D4 — "Later" and the `201` destination (point 4; Open 3 = A, Open 4 = B)

The step passes `LocationForm`'s existing secondary action its label through `texts.cancel`, set to the catalog's `firstLocationLater` by `FirstLocationScreen` (D5); there is no new prop and one render tree. `onCancel` calls `router.push(\`/${locale}\`)` (a forward navigation, as Cancel on the registration form, `RouteButton`); nothing is sent. `onCreated` ignores `hadCoordinates` and calls `router.replace(\`/${locale}/manage/locations\`)`: the step is done, so Back does not return to it; the new location and, when geocoding found nothing, its "Not on the map" line show in that list (offering-management "Own locations list"). No creation status renders on the step. `useRouter` from `next/navigation` (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`: `push` adds a history entry, `replace` does not; both are client-side navigations).

### D5 — Screen, texts and layout

`FirstLocationScreen({ locale })` is a server composition, as `ManageLocationsScreen`: `<div className="flex-1"><PageSection surface="page">` › `div.flex.flex-col.gap-8` › heading block `div.flex.flex-col.gap-2` with `<h1 id="first-location-heading" tabIndex={-1} className="type-heading">{catalog.firstLocationTitle}</h1>` and `<p className="type-body">{catalog.firstLocationIntro}</p>`, then `<FirstLocationClient locale headingId="first-location-heading" texts />`. Every value is the one Manage locations renders today: section padding 3rem below 768px and 4rem from it, container at most 72rem with 1rem / 2rem side padding (`PageSection`, decisions log D14), heading block and client region 2rem apart, `h1` and intro 0.5rem apart; the form card fills the container, its content at most 40rem from 768px and aligned to the card's start (`LocationForm` unchanged). No new token, class family or component; no contrast pair is new.

`src/pages/manage-locations/lib/location-form-texts.ts` exports `locationFormTexts(locale: string): LocationFormTexts`, reading `getMessages("location-management", locale)` and `getMessages("contact", locale)` and returning exactly the `LocationFormTexts` keys `ManageLocationsScreen` maps today (`newLocationHeading` … `emailFormatError` from `location-management`, the eight `contact*Label` keys from `contact`, `cancel` from `location-management.cancel`). `ManageLocationsScreen` spreads it and adds its panel keys, so the object it passes is unchanged. `FirstLocationScreen` builds `{ ...locationFormTexts(locale), cancel: catalog.firstLocationLater, loading: catalog.loading, signedOutText: catalog.signedOutText, signIn: catalog.signIn }`.

New `location-management` keys (Open 8, wording accepted):

| Key | es | en | ca |
|---|---|---|---|
| `firstLocationTitle` | Añade tu primera ubicación | Add your first location | Afegeix la teva primera ubicació |
| `firstLocationIntro` | Tu cuenta está creada. Indica dónde está tu cafetería para que aparezca en el directorio. | Your account is created. Tell us where your coffee shop is so it appears in the directory. | El teu compte s'ha creat. Indica on és la teva cafeteria perquè aparegui al directori. |
| `firstLocationLater` | Más tarde | Later | Més tard |

The intro's "appears in the directory" rests on the decisions log 2026-10-06 "directory by business, tabs and the coffee shop sidebar" (`GET /coffeeshops` lists coffee shops with at least one location). Reused keys: `loading` ("Loading…"), `signedOutText`, `signIn`, and every `LocationFormTexts` key.

### D6 — Focus on the page heading (Open 6 = A)

`FirstLocationClient` moves focus to `document.getElementById(headingId)` in an effect that runs once on mount, whatever the session state, so the heading and intro are read before the fields. Next.js does not move focus on a client-side navigation (`node_modules/next/dist/client/components/layout-router.js`: the scroll handler "intentionally leaves focus untouched"), so nothing overrides it; the registration form's busy submit button, which held focus, is gone by then.

### D7 — The step has no sidebar of its own (point 5)

No `app/[locale]/@sidebar/manage/locations/first/page.tsx` is created. `@sidebar/manage/locations/page.tsx` matches only `/manage/locations`; for `/manage/locations/first` the slot's catch-all `app/[locale]/@sidebar/[...rest]/page.tsx` (`DefaultSidebarScreen`) matches, on a client-side navigation and on a full load alike, since a catch-all slot page matches any deeper path (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md`, "Behavior" and the `[...catchAll]` example). The repository already relies on this: `app/[locale]/@sidebar/route-files.test.tsx` asserts that `manage/evaluations/new` and `manage/evaluations/[ulid]` have no slot page next to `manage/evaluations/page.tsx`, and add-evaluation-facets "Form routes have no facets" holds there. The sidebar is not a spec scenario of this change (no behaviour is added) and no test is added for it.

### D8 — Spec deltas and their tests (points 6 and 7)

- user-account "Registration routes" (MODIFIED): text gains the exception; all five scenarios kept by name; "A signed-in visitor is taken to the entry page" keeps its name with new content (coffeeshop route included, never the step).
- user-account "Registration result" (MODIFIED): "Signed in by the registration" keeps its name, now for the specialist route (the validator refuses a MODIFIED block that drops a scenario, as in `add-register-landing`); new scenario "A coffeeshop signed in by the registration". The other four scenarios are kept verbatim.
- offering-management ADDED "First location step", "First location step session gate" and "First location step form" (split in three because `openspec validate --strict` refuses a requirement text over 500 characters). They reference "Location form", "Location form checks", "Address geocoding", "Location creation" and "Location creation failures" instead of restating them.

One test per new or changed scenario: three in `src/pages/register/ui/RegisterClient.test.tsx` (two updated, one new) and seven in the new `src/pages/manage-locations/ui/FirstLocationScreen.test.tsx`. The referenced form requirements keep their existing tests (`LocationsPanel.test.tsx`, `LocationForm.test.tsx`, `submit-location.test.ts`), which now run through `NewLocationForm`.

No text prop becomes required on an existing type: `LocationFormTexts`, `LocationsPanelTexts`, `ManageLocationsClientTexts` and `RegisterClientTexts` keep their keys, and `useAnonymousOnly`'s new parameter is optional. No QA fixture under `qa/` goes stale (`qa/src/pages/register/ui/RegisterClient.test.tsx` renders the specialist route and its anonymous and loading states; `qa/src/pages/manage-locations/ui/ManageLocationsScreen.test.tsx` records unchanged props).

## Risks / Trade-offs

- [The step's navigation must win over the gate's default (summary §10)] → D1 makes the gate the single navigation and decides its destination from state set before the sign-in starts; `RegisterClient.test.tsx` asserts both the step and that `/es` is never requested.
- [The two calls are not atomic: a coffee shop that leaves the step or whose creation fails has an account with no location] → accepted (Open 2 = A): Manage locations' empty state offers "Add location" and New offering disables submit without locations.
- [A reload on the step ends the registration session (the grant lives only in memory)] → the step shows its signed-out prompt; "Sign in" returns to the step (decisions log 2026-10-06).
- [Moving the submit handling could change Manage locations] → D2 keeps every outcome; `LocationsPanel.test.tsx` runs unchanged after the move (task 1.2).

## Migration Plan

None: front only, no data or contract change. Rollback is reverting the change's commits; registration then lands on `/{locale}` again.
