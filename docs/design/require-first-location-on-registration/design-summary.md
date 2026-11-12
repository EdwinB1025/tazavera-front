Status: approved

# Design summary — require-first-location-on-registration

- **Backlog:** R45, `Type: Change`, accepted 2026-10-29, option A (front only).
- **Capabilities:** user-account (registration result), offering-management (first-location step).
- **Contract operations:** `registerAUser` (`POST /register`), `createALocation` (`POST /locations`). No new operation, no contract change.
- **Builds on:** `add-register-landing` (R91, on `develop` `d245f72c`), `add-coffeeshop-location` (archived 2026-10-08: the location form, geocoding), `sign-in-after-registration` and `land-on-home-after-registration` (the `token` block and the redirect after registration), `widen-location-and-offering-forms`, `add-manage-locations-menu-entry`.

## 1. What changes (settled by R45 option A)

A coffee shop that registers on `/{locale}/register/coffeeshop` and is signed in by the `token` block of the `201` is asked for its first location before anything else: instead of opening `/{locale}`, the application opens a first-location step that holds the existing new-location form and sends `POST /locations` with the registration's token (`profile:read` is enough: contract `createALocation`, "no step-up re-authentication"). Manage locations (`/{locale}/manage/locations`) does not change and stays the place to add more locations.

The specialist registration does not change. The registration form, its fields, its checks, its `422` handling, Cancel, the success panel and the registration landing do not change.

The two calls are not atomic: the account exists from the `201` of `POST /register` on. Open 2 settles what happens when the step is left or fails.

Source: backlog R45 "Proposed change"; decisions log 2026-10-06 "directory by business…" (`POST /locations`, geocoded in the front); contract `registerAUser` description (token block, default scope `profile:read`).

## 2. Flow

| # | Situation | What the user gets |
|:-:|---|---|
| 1 | `POST /register` (coffeeshop) answers `201` with a `token` block that signs the user in | The first-location step opens through client-side navigation (replaces "opens `/{locale}`" for the coffeeshop role only). Path: Open 1 / Open 7 |
| 2 | `201` without a `token` block, or one that does not sign in | Unchanged: success panel; after "Sign in" the anonymous-only gate opens `/{locale}` (Open 5) |
| 3 | `422` or any other outcome of `POST /register` | Unchanged (user-account "Registration result") |
| 4 | On the step, the form is submitted and `POST /locations` answers `201` | The destination of Open 4 opens |
| 5 | On the step, `POST /locations` answers `422`, `403`, another status, or fails | Unchanged from offering-management "Location creation failures": messages under fields or the generic form error, the form stays open with every value kept |
| 6 | On the step, the user leaves (secondary action of Open 3, header, user menu, back) | The account stays without a location; Open 2 |
| 7 | Specialist registration with a `token` block | Unchanged: `/{locale}` |

## 3. Components (reuse, criterion C)

| Part | Component and variant | Source |
|---|---|---|
| Page frame | `PageSection surface="page"` inside `div.flex-1`, as `ManageLocationsScreen` | `src/pages/manage-locations/ui/ManageLocationsScreen.tsx` |
| Heading block | `h1.type-heading` with `tabIndex={-1}` and an id (takes focus, Open 6), `p.type-body` intro | same file |
| Session gate | `SessionGate` with `allows={(user) => user.role === "coffeeshop"}`, `LoadingStatus`, `SignedOutPrompt` | `ManageLocationsClient.tsx`; decisions log 2026-10-06 "protected routes without a session: message with a button" |
| Form | `LocationForm` unchanged: section card, `CardAside` band with "New location" (`h2.type-subheading`), the Location and Address and contact fieldsets, `ContactFields layout="paired"`, geocoding help and OpenStreetMap attribution, `FormStatus kind="error"`, `ActionGroup` with `Button variant="primary" size="base"` (Save) and `Button variant="action-4" size="base"` (secondary, Open 3) | `src/features/location-management/ui/LocationForm.tsx` |
| Submission | `submitLocation` (structured Nominatim lookup once, 5 s limit, cache per page) and the `422` mapping | `src/features/location-management/model/submit-location.ts`; offering-management "Address geocoding", "Location creation", "Location creation failures" |

No new shared component, variant, token, icon or dependency.

**Reuse note for the architect (not an open point):** `LocationsPanel` holds the submit handling around `LocationForm` (submit state, geocoding cache, `422` hand-back, about 25 lines). The step needs the same handling; the feature should expose one composition (for example a new-location form that owns `submitLocation` and the submit state, reporting the `201` outcome) that both `LocationsPanel` and the step use, instead of copying it into the page slice (AGENTS.md "Code structure", reuse before ~20 lines). The feature's public index exports only what the step imports.

## 4. States and accessible names of the step

| State | Renders |
|---|---|
| Session resolving | Heading block and `LoadingStatus` ("Loading…", `location-management.loading`) |
| Anonymous (for example after a reload: the registration grant lives only in memory, `src/shared/api/tokens.ts` `keepRegistrationGrant`) | Heading block, `SignedOutPrompt` with `location-management.signedOutText` and "Sign in" that calls `signIn(<step route>)` inside the click; no redirect |
| Signed in, role not `coffeeshop` | 404 page |
| Signed in coffeeshop | Heading block and the form; submit busy and failure states as offering-management states |

- The form is named by its band heading "New location" (`aria-labelledby`), as today.
- The page `h1` names the page; no landmark is added.

## 5. Layout and spacing (criterion A)

All values are those already rendered on `/{locale}/manage/locations` with the form open; nothing new.

| Element | Value | Source |
|---|---|---|
| Page section | Full width, background `surface-page`, vertical padding 3rem below 768px, 4rem from 768px | `PageSection` (`py-12 md:py-16`); decisions log D14 |
| Container | Centred, at most 72rem, side padding 1rem below 768px, 2rem from it | `PageSection` (`max-w-6xl px-4 md:px-8`) |
| Column | Heading block and the client region 2rem apart | `ManageLocationsScreen` (`gap-8`) |
| Heading block | `h1` and intro 0.5rem apart | `ManageLocationsScreen` (`gap-2`) |
| Form card | Section card filling the container's width at every breakpoint; border, radius and band from `Card variant="section"` (no change) | `LocationForm` `CARD_CLASSES`; offering-management "Location form" |
| Form content | Full width below 768px, at most 40rem from 768px, aligned to the card's start | `LocationForm` `CONTENT_CLASSES` (`md:max-w-160`) |
| Form blocks | Fieldsets, notes, alert and actions 1.5rem apart | `FORM_CLASSES` (`gap-6`) |
| Fieldsets | 2rem apart; no native border, padding or margin; legend 1rem above its first field | `GROUPS_CLASSES`, `FIELDSET_CLASSES`, `LEGEND_CLASSES` |
| Fields | 1.5rem apart; paired rows (Postal code + City, Phone + Email, Web + Social) share a row from 768px with a 1.5rem gap | `FIELDS_CLASSES`; `ContactFields` `PAIRED_ROW_CLASSES` |
| Help and attribution | 0.5rem apart | `NOTES_CLASSES` |
| Actions | `ActionGroup` (base-controls "Action group"), neither button full width | `LocationForm` |
| Sidebar | None (the catch-all `@sidebar/[...rest]` slot), unless Open 1 = B | `app/[locale]/@sidebar/[...rest]/page.tsx` (unverified for a nested path, see Unverified 3) |

Settled by criterion B (fewest changes): the form keeps its start alignment, not the registration card's centred content; the step reuses the form as it is rendered in Manage locations.

## 6. Responsive behaviour

Breakpoints as the project's: below 768px the fields stack in one column and the container padding is 1rem; from 768px the paired rows share a row, the form content is at most 40rem and the padding 2rem. Nothing changes at 1024px. Same as Manage locations today (offering-management "Location form", "Location cards fill the container").

## 7. Tokens and contrast (criterion D)

No new token and no new pair: every text, boundary and button of the step is an element already rendered on `/{locale}/manage/locations` over the same backgrounds (`surface-page`, the section card) and already registered in the contrast matrix of `src/app/styles/theme-tokens.test.ts`. No measurement was run, because no pair is new. Guard pairs to register: none.

## 8. Texts (proposed; catalog `location-management`, passed as props)

New keys (wording proposed, Open 8):

| Key | es | en | ca |
|---|---|---|---|
| `firstLocationTitle` | Añade tu primera ubicación | Add your first location | Afegeix la teva primera ubicació |
| `firstLocationIntro` | Tu cuenta está creada. Indica dónde está tu cafetería para que aparezca en el directorio. | Your account is created. Tell us where your coffee shop is so it appears in the directory. | El teu compte s'ha creat. Indica on és la teva cafeteria perquè aparegui al directori. |
| `firstLocationLater` (only if Open 3 = A) | Más tarde | Later | Més tard |

The intro's "so it appears in the directory" is grounded on the decisions log 2026-10-06 ("`GET /coffeeshops`: coffee shop users with at least one location").

Reused keys: `loading`, `signedOutText`, `signIn`, and every key of `LocationFormTexts` from `location-management` and `contact` (as `ManageLocationsScreen` passes them).

## 9. Contract operations and response states

| `operationId` | Sent when | Response → interface |
|---|---|---|
| `registerAUser` | Unchanged | `201` + `token` that signs in → coffeeshop: the step (flow 1); specialist: `/{locale}`. `201` without a usable token → success panel. `422` → per-field messages. Other → generic error. (user-account "Registration result") |
| `createALocation` | The step's form passes its checks and the lookup settles | `201` → destination of Open 4. `422` → messages under fields (`name`, `description`, `contact.<key>`, `contact.postal_code`), generic error for keys with no field. `403`, other status, network failure → generic error, form kept. No API `message` is rendered. (offering-management "Location creation", "Location creation failures") |

The lookup to Nominatim is unchanged (single entry point `src/shared/lib/geocoding`, CSP `connect-src` already open: decisions log 2026-10-07 "own geocoding").

## 10. Spec deltas the architect will need (for orientation)

- user-account, MODIFIED "Registration result": a `201` with a `token` block that signs a coffeeshop in opens the first-location step instead of `/{locale}`; the specialist keeps `/{locale}`. Scenario "Signed in by the registration" splits by role.
- offering-management, ADDED "First location step" (route, gate, heading block, the form, the outcome of a `201`, the secondary action), referencing the existing form, checks, geocoding and failure requirements.
- Possibly user-account "Registration routes" scenario "A signed-in visitor is taken to the entry page": stays true for a coffeeshop that opens the route already signed in; the navigation to the step must win over the anonymous-only gate's `router.replace(/{locale})` (`src/pages/register/model/use-anonymous-only.ts`) right after the registration. Implementation risk for the architect.

## Open

1. **Where the step lives.**
   - A. A dedicated route holding the heading block of §8 and the reused form (§3–§5).
   - B. No new route: open `/{locale}/manage/locations` with the form already open (empty state), with its current heading "Manage locations" and no new texts.
   - C. In place on `/{locale}/register/coffeeshop`: the registration card swaps the form for the location form; needs an exception to the anonymous-only gate of `/register*` (decisions log 2026-10-06) and loses the step on reload.
   - **Recommendation:** A. R45 asks for the location "before anything else" and as part of registering; a dedicated heading says why the form is there, while B reads as an ordinary management page. C breaks a standing decision. Source: backlog R45; decisions log 2026-10-06 "protected routes without a session…".
   - **Blocks propose: yes.**

2. **What if the step is left or fails (non-atomic calls).**
   - A. Nothing more: the account stays without a location; the coffee shop adds it later in Manage locations (its empty state already offers "Add location"), and "New offering" already disables submit with no locations (offering-management "Creating offerings", scenario "No locations disables submit").
   - B. Every time a coffeeshop's session becomes authenticated with no location, the application opens the step (one `GET /users/{ulid}/locations` per session; touches auth or app-shell).
   - C. As B, only on the management routes.
   - **Recommendation:** A. It needs no extra request, no shell change, and the existing screens already handle a coffee shop with no location. B and C add scope beyond R45's text. Source: backlog R45 ("the design summary settles how the front handles it"); offering-management "Empty locations state".
   - **Blocks propose: yes.**

3. **The form's secondary action on the step.** `LocationForm` always renders "Cancel" (`action-4`), which in Manage locations closes the form.
   - A. Keep the button with a new label "Later" (§8), opening `/{locale}`, sending nothing.
   - B. Keep "Cancel" as labelled, opening `/{locale}`.
   - C. No secondary action on the step (Save only); the user can still leave by the header.
   - **Recommendation:** A. "Cancel" after the account already exists suggests the registration is undone; C needs the form to drop a button (a prop that changes the rendered tree) and still cannot stop the user leaving. Source: user-account "Cancelling registration" (Cancel opens `/{locale}` sending nothing); base-controls "Action variants by kind" (`action-4` kept).
   - **Blocks propose: yes.**

4. **Where a `201` of `POST /locations` leads.**
   - A. `/{locale}`, as after any registration today (decisions log 2026-10-12, point 5, R78), with no status.
   - B. `/{locale}/manage/locations`, where the new location shows in the list, with its "Not on the map" line when geocoding found nothing.
   - C. Stay on the step and show the "Location created." status with a link onward.
   - **Recommendation:** B. A drops the only feedback that the address was not found on the map; B shows the result with existing screens and no new text. The creation status is local to the panel, so it does not carry over; the list itself is the confirmation. Source: offering-management "Own locations list", "Location creation".
   - **Blocks propose: yes.**

5. **Registration without a usable `token` block** (success panel, then "Sign in").
   - A. Unchanged: after signing in the anonymous-only gate opens `/{locale}`; no step (falls under Open 2).
   - B. Open the step after that sign-in too (needs the front to remember across the sign-in popup that this account was just registered).
   - **Recommendation:** A. The contract makes this a fallback ("If the tokens cannot be issued, the user is still created…"); B adds state across the auth flow. Source: contract `registerAUser` description.
   - **Blocks propose: no** (A is today's behaviour).

6. **Focus when the step opens.**
   - A. The page `h1` (`tabIndex={-1}`), so the intro is read before the fields.
   - B. The Name field, as when "Add location" reveals the form.
   - **Recommendation:** A: the user arrives from another page and needs the reason first; the `h1` already takes focus after a creation in Manage locations. Source: offering-management "Location creation" (focus to the page heading).
   - **Blocks propose: no** (A by default).

7. **The step's path** (only if Open 1 = A).
   - A. `/{locale}/manage/locations/first`: inside the coffeeshop-only management area, no exception to `/register*`.
   - B. `/{locale}/register/coffeeshop/location`: reads as part of registration, but every `/register*` path is anonymous-only (decisions log 2026-10-06), so it needs an exception.
   - C. `/{locale}/welcome/location`.
   - **Recommendation:** A. Source: decisions log 2026-10-06 ("`/[locale]/register*` with an `authenticated` session goes to the home page").
   - **Blocks propose: yes** (the spec names the route).

8. **Wording of the new texts** (§8): accept as proposed, or give new wording. **Recommendation:** accept. **Blocks propose: no.**

9. **A coffeeshop that already has a location opens the step's path directly.**
   - A. It shows the form anyway (it only creates a location, like "Add location").
   - B. Read the locations first and open Manage locations when there is one.
   - **Recommendation:** A: no extra request and no harm. **Blocks propose: no.**

## Visual reference

Not in the folder yet. The step reuses the Manage locations form as rendered, so the reference should be captures of `/{locale}/manage/locations` with the form open at 375px and 1280px, in both themes (the step only adds its heading block above it). Capturing needs the local server (API, Caddy and the front); the design lead could not capture in this duty. The MVC was not read (see Review log).

## Review log

### 2026-11-12 — draft (design lead, generation mode)

- Settled (criterion B, fewest changes, choosing among what exists): the step reuses `LocationForm`, `submitLocation`, `SessionGate`, `SignedOutPrompt`, `LoadingStatus` and `ManageLocationsScreen`'s frame unchanged; all spacing values and tokens are taken from them (§3, §5, §7); the step's session states follow the protected-route decision of 2026-10-06 and the locations page (§4); the form keeps its start alignment.
- Semantic findings for the orchestrator (not changed here: the design lead does not edit the backlog):
  - `docs/design/backlog.md` "Priority order (2026-10-11)" row 5 still says R45 is "deferred, to review 2026-10-12; not to be designed yet", while the R45 entry says "accepted (2026-10-29), queued after R91" and the board says unblocked. The entry and the board are current; the table row is stale.
  - R45 "Affects" names R44, which is no longer in the backlog file.
- Not read: the MVC (`Sprint4/MVC/tazavera-app`) is outside this session's readable directories, so no MVC screen backs the step; the step is built only from the front's existing screens.

### 2026-11-12 — approval (orchestrator, on Product owner's delegation of 2026-11-11 for R45)

Product owner delegated R45's approvals to the orchestrator (2026-11-11: "independent", decisions taken as Product owner would, recommended options). Every open point takes the design lead's recommendation:
- Open 1: A, a dedicated route with its own heading and intro.
- Open 2: A, nothing more (Manage locations' empty state and New offering's "no locations" rule cover a skipped or failed step).
- Open 3: A, the secondary action "Later" opens `/{locale}`.
- Open 4: B, after `201` go to `/{locale}/manage/locations`.
- Open 5: A, no step after a registration without a usable token.
- Open 6: A, focus on the page `h1`.
- Open 7: A, path `/{locale}/manage/locations/first`.
- Open 8: the proposed es/en/ca wording is accepted.
- Open 9: A, the form is shown even if the coffee shop already has a location.
- Visual reference: the step reuses the Manage locations form unchanged; the captures of `/{locale}/manage/locations` with the form open (375 and 1280px, both themes) are taken at the first visual review, which needs Product owner's local server. Not a propose blocker (the screen exists; no new token, component or layout).
- The design lead's risk (the step's navigation must win over `useAnonymousOnly`'s replace) and reuse note (`LocationsPanel`'s submit handling shared, not copied) go to the architect with the propose.

## Propose status

- **Change-id:** require-first-location-on-registration
- **Date:** 2026-11-12
- **Type:** Change (traditional workflow 3a, step 6)
- **Source:** this summary (approved, `8a445e11`), Review log "2026-11-12 — approval" (Open 1–9 settled as recommended).
- **`openspec validate require-first-location-on-registration --strict`:** valid
- **Backlog entries resolved:** R45. No other entry affects the change.
- **Resolved by the architect (design.md):**
  - Navigation vs the anonymous-only gate → the gate stays the only navigation and takes the destination; the coffeeshop route sets a "registered here" state before `signInWithRegistration`, so the step wins and a coffee shop already signed in still goes to `/{locale}` (D1). user-account "Registration routes" is MODIFIED too, because its text said an authenticated session always opens the root.
  - Shared submit handling → `NewLocationForm` in `features/location-management`, used by `LocationsPanel` and the step; the geocoding cache stays the caller's, so Manage locations keeps its per-page cache (D2).
  - FSD → the step lives in the `manage-locations` page slice, with a slice-local `locationFormTexts(locale)` helper shared with Manage locations (D3, D5).
  - "Later" → `texts.cancel` set to `firstLocationLater`, `onCancel` pushes `/{locale}`; a `201` replaces with `/{locale}/manage/locations` (D4).
  - Focus → an effect on mount focuses the `h1` (D6).
  - Sidebar → no slot page; the catch-all `@sidebar/[...rest]` renders, as on `manage/evaluations/new` (D7).
  - Spec deltas → "Signed in by the registration" kept by name for the specialist route plus the new "A coffeeshop signed in by the registration"; the offering-management requirement is split in three to stay under strict validation's 500-character limit (D8).
- **Remains open:** none blocking. Visual reference captures at the first visual review (Review log).
