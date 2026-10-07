# Design

## Context

See proposal.md — Why. The approved design summary `docs/design/add-coffeeshop-location/design-summary.md` is the design source of truth: its §3.1 (what each response shows), §5 (components, states and accessible names), §7 (token pairs), §8 (layout and spacing) and §9 (texts) are normative here, and this document records the implementation decisions they leave to the architect. Current state it builds on:

- On `develop`: `Card` with `variant="section"` and the stacked content card, `PageSection`, `Field`, `Input`, `Textarea`, `Button`, `LINK_CLASSES`, the `Sidebar` parts (`src/shared/ui`), the `@sidebar` slot and `AppSidebar` (`src/widgets/app-sidebar`, whose `MANAGE_ROUTE` already treats `/{locale}/manage/*` as a management route), the auth seam `useSession()`, `signIn(returnRoute?)`, `requestProfileWrite(returnRoute)` (`@/features/auth`), the token client `request` (`@/shared/api`), `getMessages` (`@/shared/lib/i18n`), and the CSP in `proxy.ts`.
- Not merged at propose time, required before the apply (tasks.md group 0):
  - `add-offering-management`: the `offering-management` capability, the `@sidebar` entry blocks of the two offering routes and `ManagementSidebarEntries` (its design D8).
  - Backlog **R11**: moves the generic protected-route gate and the write-status pieces (today `SessionGate`, `StepUpNotice`, `FormStatus`, `LoadingStatus` in `features/user-account`, and `ManagementGate` in `features/offering-management`) to `src/shared/ui`. This change consumes them from `@/shared/ui` and builds no copy.
  - `add-user-contact`: the `contact` entity — `ContactFields` (the eight contact fields, controlled), `ContactDetails` (the read-only `<dl>` of non-null values, on `LabelValueRow` of `add-offering-catalog`), their types and the `contact` message area (its summary Open 5, recommendation b).
- Route files follow the App Router pattern in the repo: typed `PageProps<"/…">`, awaited `params`, no logic (Next.js guide `01-app/03-api-reference/03-file-conventions/page.md`; parallel routes `parallel-routes.md`). The build reads those guides and `not-found.md` before writing the route files.

### API endpoints consumed

| # | Operation | Method and path | Auth (contract) | Request | Response used | Errors |
|---|---|---|---|---|---|---|
| 1 | `listAUsersLocations` | `GET /users/{user_ulid}/locations`, `user_ulid` = session `user.ulid` | `profile:read` or `profile:write`, own user (policy) | — | 200 `{ data: [{ ulid, name, description, latitud, longitud, contacts: [{ ulid, isPrimary, phone, email, web, social, address, country, city, postalCode }] }] }` | `401` → the client's refresh chain; `403`, any other non-2xx, transport → the list error with "Try again" |
| 2 | `createALocation` | `POST /locations` | `coffeeshop` role + `profile:write` | JSON `{ name (required, ≤150), description? (≤255), latitud? (number, −90..90), longitud? (number, −180..180; each required when the other is sent), contact: { address (required, ≤255), city (required, ≤90), postal_code? (≤12), country? (≤60), phone? (≤25), email? (valid, ≤255), web? (valid URL, ≤255), social? (≤255) } }` | 201 (body not read: the list is re-read) | `403` → step-up notice; `422`, `5xx`, other, transport → generic form error |
| 3 | Nominatim search (external, not in the contract) | `GET https://nominatim.openstreetmap.org/search` | none | query `street`, `postalcode`, `city`, `country` (empty ones omitted), `format=jsonv2`, `limit=1` | 200 array; `[0].lat`, `[0].lon` (strings) | empty array, non-2xx (`429` included), transport, abort after 5 s → no coordinates |

Operations #1 and #2 go through `request` (token client). The session user's `ulid` comes from `getTheAuthenticatedUser` through `useSession()`. Note the request uses `postal_code` (snake case) while the response uses `postalCode`; the payload follows the contract's `requestBody` exactly. Operation #3 goes through plain `fetch` inside the geocoding entry point (D5), with no credentials and no custom header (a simple CORS request, no preflight).

### How API errors are presented

Every API `message` and every geocoding response text is discarded; all interface text comes from the catalog.

| Operation | Pending | Empty | Error | 403 |
|---|---|---|---|---|
| list (#1) | `LoadingStatus` with `loading` in the list's place | the empty card (§5.2 of the summary) | `locationsLoadError` + `Button variant="action-4"` "Try again" (`retry`), re-runs the read | as Error |
| create (#2) | Save `loading`, Cancel disabled | — | `genericError` above the actions in the form's single alert region; values kept | `StepUpNotice` (`stepUpText`, `stepUpButton`) in the same region; values kept; the button calls `requestProfileWrite(\`/${locale}/manage/locations\`)` inside the click |
| geocoding (#3) | covered by Save `loading` | — | silent: the location is created without coordinates and the success status adds `locationCreatedNoMap` | — |

### Card sections filled from the API

`LocationCard` (`src/entities/location`) renders the shared `Card layout="stacked"` (content card) with `CardContent` only:

| Card section | Source |
|---|---|
| `h2` name | `name` |
| description (`type-body`), only when not null | `description` |
| contact details (`ContactDetails` of `@/entities/contact`, passed in as a slot, D9) | the item of `contacts` with `isPrimary: true`; its non-null `address`, `postalCode`, `city`, `country`, `phone`, `email`, `web`, `social` |
| no-map line (`MapPinOff` + `locationNoMap`, `type-meta`) | shown when `latitud === null` or `longitud === null` |

A location whose `contacts` has no primary item renders no contact details (the API creates one in the same transaction, so this is defensive only).

### Derived and UI-specific types (declared before any component)

Added to `src/shared/api/index.ts`, built on `operations` of the generated `schema.ts`; no generated type is edited, redefined or widened:

- `UserLocation` — one item of `listAUsersLocations` 200 `data`; `UserLocationsPayload` — its 200 body.
- `UserLocationContact` — one item of `UserLocation["contacts"]`.
- `CreateLocationPayload` — the `createALocation` `requestBody` JSON.

The generated response marks `description`, `latitud`, `longitud` and the contact fields as plain optional `string` although the contract example returns `null` for them; components treat `null` and `undefined` alike (`value == null` → absent), which needs no widened type.

UI-specific types, declared before their components:

- `src/shared/lib/geocoding`: `GeocodeQuery = { street: string; postalCode: string; city: string; country: string }`; `GeocodeOutcome = { status: "found"; lat: string; lon: string } | { status: "not-found" } | { status: "failed" }`.
- `src/features/location-management/model`: `LocationFormValues` (name, description and the contact entity's field values), `LocationFormErrors`, `ListState = { status: "loading" } | { status: "error" } | { status: "ready"; locations: UserLocation[] }`, `SubmitState = "idle" | "submitting" | "error" | "step-up"`, `LocationsPanelTexts`.

### Files created and modified

| Path | FSD layer | Change |
|---|---|---|
| `app/[locale]/manage/locations/page.tsx` | app (routing) | created: passes the locale to `ManageLocationsScreen`; no logic |
| `app/[locale]/@sidebar/manage/locations/page.tsx` | app (routing) | created: renders `ManageLocationsSidebarEntries` of `src/pages/manage-locations` |
| `src/pages/manage-locations/index.ts` | pages | created: public API (`ManageLocationsScreen`, `ManageLocationsSidebarEntries`) |
| `src/pages/manage-locations/ui/ManageLocationsScreen.tsx` | pages | created: server screen — loads the `location-management` and `contact` catalogs, renders `PageSection surface="page"`, the heading block (`h1` with `tabIndex={-1}`, intro) and `ManageLocationsClient` |
| `src/pages/manage-locations/ui/ManageLocationsClient.tsx` | pages | created: `"use client"` seam — reads `useSession()`, wraps the content in the shared gate (R11), injects `session.user.ulid`, `signIn` and `requestProfileWrite` into `LocationsPanel` (user-account D1 pattern) |
| `src/pages/manage-locations/ui/ManageLocationsSidebarEntries.tsx` | pages | created: `AppSidebar` with both coffee shop entries, locations current (D8) |
| `src/features/location-management/index.ts` | features | created: public API (`LocationsPanel`, `LocationsSidebarEntry` and their types) |
| `src/features/location-management/api/locations.ts` | features | created: `fetchOwnLocations(userUlid)`, `createLocation(payload)` through `request` |
| `src/features/location-management/model/location-form.ts` | features | created: `validateLocationForm(values)`, `toCreateLocationPayload(values, coordinates)`, the geocode cache key (D6, D7) |
| `src/features/location-management/model/submit-location.ts` | features | created: the submit sequence — cache lookup, geocoding, create — returning the outcome the panel renders (D6) |
| `src/features/location-management/ui/LocationsPanel.tsx` | features | created: list states, empty card, toolbar, status, reveal, focus moves (D3, D4) |
| `src/features/location-management/ui/LocationForm.tsx` | features | created: the section-card form — band, two fieldsets, `ContactFields`, help, attribution, alert region, actions |
| `src/features/location-management/ui/LocationsSidebarEntry.tsx` | features | created: the "Manage locations" `SidebarMenuItem` (D8) |
| `src/entities/location/index.ts` | entities | created: public API (`LocationCard`, `LocationCardProps`) |
| `src/entities/location/ui/LocationCard.tsx` | entities | created: one location in the content card (D9); reused by `add-coffeeshop-directory` |
| `src/shared/lib/geocoding/index.ts` | shared (lib) | created: the single geocoding entry point `geocodeAddress(query, signal?)` and `NOMINATIM_ORIGIN` (D5) |
| `src/entities/contact/ui/ContactFields.tsx` | entities | modified: optional `layout="paired"` (D12); default unchanged |
| `src/shared/api/index.ts` | shared (api) | modified: the four derived aliases above |
| `src/shared/ui/icons.ts` | shared (ui) | modified: `MapPin`, `MapPinOff`, and `Plus` if not yet exported (`lucide-react` is installed) |
| `src/features/offering-management/ui/ManagementSidebarEntries.tsx` | features | modified: optional `current` (default `true`) and `children` (D8) |
| `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx`, `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx` | pages | modified: add `LocationsSidebarEntry` (not current) as the second entry (D8) |
| `proxy.ts` | app (routing proxy) | modified: `connect-src` adds `https://nominatim.openstreetmap.org` (D10) |
| `proxy.test.ts` | — | modified: `expectedCsp` carries the new origin (D10) |
| `messages/{es,en,ca}/location-management.json` | message catalog | created: the area's keys (D11) |

Tests live beside each file (`*.test.ts(x)`); the `@sidebar` route-file test of `add-offering-management` (`app/[locale]/@sidebar/route-files.test.tsx`) gains the locations slot page.

## Goals / Non-Goals

**Goals:**
- No third copy of the gate and status pieces (R11), of the contact fields or of the contact details (`add-user-contact`).
- One geocoding request per distinct address per page, within the Nominatim usage policy, with no new dependency installed by this change.
- `LocationCard` reusable by the directory without importing another entity.

**Non-Goals:**
- A shared "management area entries" widget (summary Open 3, closed: no widget).
- Mapping `422` per field (backlog R8).
- Making the geocoding origin configurable by environment (summary Open 6 a: a constant in the entry point).

## Decisions

### D1. Capability and slice names

The requirements extend `offering-management` (summary §1.1: the coffee shop's management area), whose `config.yaml` description needs one line updated by Product owner (Open Questions). Slices: `src/pages/manage-locations` (route screen), `src/features/location-management` (business-domain name, the precedent of `add-offering-management` D13: it holds the list, the form and the create flow of one area), `src/entities/location` (singular noun). Commit scope is `offering-management` for every task, `app-shell` for the CSP task.

### D2. Gate and write-status pieces come from R11

`ManageLocationsClient` wraps the content in the shared protected-route gate that R11 places in `src/shared/ui`: `loading` → the heading block stays (it is server-rendered) and `LoadingStatus` with `loading` renders in the content's place; `anonymous` → `signedOutText` and a "Sign in" button calling `signIn(\`/${locale}/manage/locations\`)` synchronously inside the click; `authenticated` with a role other than `coffeeshop` → `notFound()`; `coffeeshop` → `LocationsPanel`. The panel uses R11's `LoadingStatus`, `FormStatus` and `StepUpNotice`. The exact component names and props are R11's; this design uses today's names (`SessionGate`, `LoadingStatus`, `FormStatus`, `StepUpNotice`). If R11 lands different names or props, the architect updates this section and the affected tasks before the apply starts (tasks.md 0.1); the behaviour stated in the spec does not change.

### D3. List, empty state and reveal

`LocationsPanel` reads the list on mount with `fetchOwnLocations(userUlid)` and renders, by `ListState`:

- `loading` → `LoadingStatus`; `error` → `locationsLoadError` (`type-body`) and "Try again" (`action-4`), 1rem apart, which sets `loading` and reads again.
- `ready` with no item → one `Card variant="section"` with body only (summary Open 11 a): `locationsEmptyText` and, 1rem below, `Button variant="primary" size="base" icon={Plus}` "Add location". Activating it renders `LocationForm` in that card's place (the form's own section card, with its band); focus moves to the Name input.
- `ready` with items → the toolbar (`Button variant="primary" size="base" icon={Plus}` "Add location", start-aligned) or, while the form is open, `LocationForm` in its place; then `FormStatus` when a creation status is set; then `<ul aria-labelledby={headingId}>` (flex column, 1.5rem gap) with one `<li>` per `LocationCard`, in the order returned.

Cancel closes the form, discards its values and moves focus to whichever "Add location" button renders after closing (the empty card's or the toolbar's). The creation status is cleared when "Add location" is activated. The page heading id and the `h1` element are passed from the screen so the panel can focus the heading after a creation and label the list.

### D4. Submit sequence and outcomes

On submit: `validateLocationForm` (D7); a failure sets the field errors, focuses the first failing field in form order (Name, Description, Address, Postal code, City, Country, Phone, Email, Web, Social) and stops. Otherwise `SubmitState` becomes `submitting` (Save `loading`, Cancel disabled; the fields stay editable, as the account forms) and `submitLocation` runs D6's sequence, then `createLocation`:

- `201` → the form closes, the status is set to `locationCreated`, plus `locationCreatedNoMap` after it on the same line when the payload carried no coordinates (`FormStatus` with `Check`), the list is read again (`loading` → `ready`), and focus moves to the `h1`.
- `403` → `step-up`: `StepUpNotice` in the form's single alert region above the actions; values kept.
- anything else, or a rejected fetch → `error`: `genericError` in the same region; values kept.

One alert region per surface (`add-offering-management` D5): the generic error and the step-up notice never render together.

### D5. Geocoding entry point (in-house, closed)

`src/shared/lib/geocoding/index.ts` is the single entry point for geocoding (AGENTS.md: one entry point per external library or service). It exports `NOMINATIM_ORIGIN = "https://nominatim.openstreetmap.org"` and `geocodeAddress(query: GeocodeQuery, signal?: AbortSignal): Promise<GeocodeOutcome>`, which never throws: a 2xx array with an item → `found` with `[0].lat`/`[0].lon` as returned; a 2xx empty array → `not-found`; a non-2xx, a transport error, an abort or an unparsable body → `failed`. Callers depend only on this signature.

**Body: in-house `fetch` to Nominatim** (summary Open 5, option C), with no new dependency. Closed by Product owner's mandate (decisions log "2026-10-07 — geocodificación propia y mandato de autonomía"). Rejected alternatives, as verified at propose (2026-10-07):

- `leaflet-geosearch@4.4.0` `OpenStreetMapProvider` (https://registry.npmjs.org/leaflet-geosearch/latest): its public `search({ query })` takes free text only, fetches with no abort signal and parses the body without checking the status (`src/providers/provider.ts` of the 4.4.0 tarball); the entry point would still own the `fetch`, the 5 s abort and the status check.
- `leaflet-control-geocoder@4.0.0` (https://registry.npmjs.org/leaflet-control-geocoder/latest): requires `leaflet` as a peer, a map library in a page with no map.

The CSP `connect-src` origin for Nominatim was already approved (decisions log "contactos y locales"; D10).

### D6. Geocoding sequence, cache and coordinates

- The query is built from the form's Address (`street`), Postal code (`postalcode`), City (`city`) and Country (`country`) values, trimmed; empty ones are omitted from the URL. Address and City are always present (required, D7). The URL carries `format=jsonv2` and `limit=1`; no `q`, no `email`, no custom header. The browser's default referrer policy (`strict-origin-when-cross-origin`; `proxy.ts` sets no `Referrer-Policy`) sends the page origin, which identifies the application as the policy asks.
- Timeout: `submitLocation` creates an `AbortController` and aborts it after 5000 ms (summary Open 10, recommendation kept); the abort yields `failed`.
- Cache: a `Map<string, GeocodeOutcome>` held by `LocationsPanel` (`useRef`), so it lives as long as the page is mounted. Key: the four trimmed values, lower-cased, joined with `"|"`. Only `found` and `not-found` are stored; `failed` is not, so a later submit may try again. A cache hit sends no request (spec: "Same address submitted again").
- Coordinates: the contract types `latitud`/`longitud` as `number`, so `found` sends `Number(lat)` and `Number(lon)`; both are sent or neither. This follows the contract over the summary's "strings as returned" (§5.5 step 3), which the summary itself subordinates to the contract (§3).
- No lookup while typing; Save is busy during the sequence, so a second submission cannot start.

### D7. Form fields, checks and payload

`LocationForm` is `<form noValidate aria-labelledby={newLocationHeadingId}>` in `Card variant="section"`: `CardAside` (the band) holds the `h2` `newLocationHeading` (`type-subheading`); `CardContent` holds two `<fieldset>`s with visible `<legend>` (`type-label`, no fieldset border or padding):

| Group | Field | Control | `autocomplete` | Checks / attributes |
|---|---|---|---|---|
| Location (`locationGroupLegend`) | Name (`locationNameLabel`) | `Input` | `organization` | `required` (marker), `maxLength` 150 |
| Location | Description (`locationDescriptionLabel`) | `Textarea` | `off` | `maxLength` 255 |
| Address and contact (`contactGroupLegend`) | the eight `ContactFields` of `@/entities/contact`, with the `contact` area labels | as `add-user-contact` defines them | idem | Address and City `required`; `maxLength` per the `createALocation` contract: address 255, postal code 12, city 90, country 60, phone 25, email 255, web 255, social 255; Email format when non-empty |

`validateLocationForm` returns `requiredError` for an empty (after trim) Name, Address or City, and `emailFormatError` for a non-empty Email that fails the contact entity's email check (the check `add-user-contact` exposes from `@/entities/contact` for `ContactFields`' Email). The web URL format and the lengths are not checked in code: `maxLength` stops typing past the maximum, and a malformed web value reaches the API, whose `422` shows the generic error (backlog R8). If `ContactFields` does not accept per-field `required` and `maxLength` from its consumer, or the email check is not exported by `@/entities/contact`, the architect updates this decision before the apply (tasks.md 0.1).

`toCreateLocationPayload` sends `name` (as typed), `description` only when non-empty, `latitud`/`longitud` per D6, and `contact` with `address` and `city` plus each non-empty optional field, with the request's names (`postal_code`, not `postalCode`). Empty optional fields are omitted rather than sent as `null` (both are valid for the contract; omission keeps the payload minimal and testable).

Below the fieldsets: `geocodingHelp` (`type-meta`), then the attribution line `geocodingAttribution`, whose `{link}` placeholder is replaced by a native `<a href="https://www.openstreetmap.org/copyright">` with `LINK_CLASSES` and the text `osmContributors`, same tab. The catalog string is split at `{link}`; the catalog holds no markup. Then the alert region, then the actions row: `Button variant="primary" type="submit"` "Save" (`save`, `loading` while submitting) and `Button variant="action-4" type="button"` "Cancel" (`cancel`, disabled while submitting).

### D8. Sidebar entries (summary Open 3, closed; `add-offering-management` D8)

The entries keep the coffee shop area's mechanism: each route's `@sidebar` slot page renders its page slice's entry block, which renders `AppSidebar entries={…}`. Changes:

- `ManagementSidebarEntries` (`features/offering-management`) gains `current?: boolean` (default `true`, so its existing tests keep passing) and `children?: ReactNode`, rendered after its own `SidebarMenuItem` inside the same `SidebarMenu`. With `current={false}` its link has no `aria-current` and `isActive` is false.
- `LocationsSidebarEntry` (`features/location-management`) renders one `SidebarMenuItem` with `SidebarMenuButton asChild isActive={current} icon={MapPin}` around a `next/link` to `/${locale}/manage/locations`, `aria-current="page"` only when `current`. Label: `sidebarEntry` of the `location-management` area.
- The page slices compose both (a page may import two features): `ManageLocationsSidebarEntries` renders `<ManagementSidebarEntries current={false} …><LocationsSidebarEntry current …/></ManagementSidebarEntries>`; `ManageOfferingsSidebarEntries` and `NewOfferingSidebarEntries` render `<ManagementSidebarEntries …><LocationsSidebarEntry current={false} …/></ManagementSidebarEntries>`. Each loads the two catalogs it needs.

No widget and no feature-to-feature import.

### D9. `LocationCard` takes the contact details as a slot

`entities/location` cannot import `entities/contact` (same layer). `LocationCard` takes `name: string`, `description?: string | null`, `details?: ReactNode` and `noMapText?: string` (the no-map line renders only when given). `LocationsPanel` fills `details` with `<ContactDetails …/>` of the primary contact and passes `noMapText` when `latitud` or `longitud` is null. The directory can fill the same props from its flat locations (summary Review notes; directory Open 13). Layout per summary §8: `CardContent` 1.5rem padding; name, description 0.5rem below, details 1rem below, no-map line 1rem below; `MapPinOff` 1rem, `aria-hidden`, 0.5rem from its text.

### D10. Content-Security-Policy

`proxy.ts` appends `https://nominatim.openstreetmap.org` to `connect-src` after the API origin: `connect-src 'self' <api-origin> https://nominatim.openstreetmap.org` (without an API origin: `connect-src 'self' https://nominatim.openstreetmap.org`). `proxy.ts` imports `NOMINATIM_ORIGIN` from `@/shared/lib/geocoding` (a plain module with no client directive, as `proxy.ts` already imports `@/shared/config/locales`), so the origin is written once. `proxy.test.ts` keeps its literal expected list with the origin written out. `/callback` gets the same directive list, as today. `add-coffeeshop-directory` edits `img-src` in the same array: whichever merges second resolves a one-line conflict.

### D11. Texts

`messages/{es,en,ca}/location-management.json` holds summary §9's keys and strings (`pageTitle`, `pageIntro`, `sidebarEntry`, `locationsEmptyText`, `addLocation`, `newLocationHeading`, `locationGroupLegend`, `contactGroupLegend`, `locationNameLabel`, `locationDescriptionLabel`, `geocodingHelp`, `geocodingAttribution`, `osmContributors`, `locationCreated`, `locationCreatedNoMap`, `locationNoMap`, `locationsLoadError`) plus the shared-purpose keys copied into the area, so no screen loads another area for them:

| Key | es | en | ca | Source |
|---|---|---|---|---|
| `save`, `cancel`, `loading`, `genericError`, `stepUpText`, `stepUpButton`, `signIn`, `requiredError`, `emailFormatError` | as `account` | as `account` | as `account` | copied verbatim from `messages/*/account.json` |
| `retry` | Reintentar | Try again | Torna-ho a provar | `add-user-contact` summary §8 |
| `signedOutText` | Inicia sesión para gestionar tus ubicaciones. | Sign in to manage your locations. | Inicia sessió per gestionar les teves ubicacions. | new, modelled on `offering-management` `signedOutMessage`; accepted as written (decisions log 2026-10-07) |

The `account` area's `signedOutText` ("…manage your account") does not fit this page, hence the new string. The eight contact field labels come from the `contact` area (`add-user-contact` Open 5 b), loaded by `ManageLocationsScreen` beside this area. The screens pass every text as props; no component reads a catalog.

### D12. Layout, tokens and contrast

Summary §7 and §8 are normative: no new token and no new pair (every pair is registered on `develop` or by `refine-page-surfaces`/`add-user-account`); page and card spacing as listed there. The build chooses the classes for the values design.md leaves free (the form card's 40rem maximum width from `md`, the toolbar, list and status spacing) and its tests assert what it chose. The two-column rows from `md` (Postal code + City, Phone + Email, Web + Social; two equal columns, 1.5rem gap; stacked below `md`) need a layout option on `ContactFields`, which `add-user-contact` keeps stacked in its 32rem column: this change adds an optional `layout?: "stacked" | "paired"` prop (default `"stacked"`, so the account form is unchanged) to `ContactFields`, unless `add-user-contact` already ships an equivalent, which task 0.1 checks. The guards (`color-guard`, `radius-guard`, `focus-guard`, `client-boundary`, `xss-guard`, `catalog-guard`, the literal-text guard, `icons.test.ts`) must pass unchanged.

## Risks / Trade-offs

- [Four unmerged dependencies: `add-offering-management`, R11, `add-user-contact` (with `add-offering-catalog`'s `LabelValueRow`), and the archive order] → tasks.md group 0 checks them before any code; the `offering-management` delta's MODIFIED requirement is archivable only after `add-offering-management` is archived (`openspec validate` reports it as information).
- [R11 or `add-user-contact` may land names or props different from D2/D7] → task 0.1 compares and stops for an artifact update; behaviour in the spec stays.
- [Nominatim's 1 request/s ceiling is per application, not per user] → one request per submit and the cache keep the load to the coffee shops' own creations; acceptable at the project's scale (policy: "moderate user bases"). A heavier load would need another provider, which the entry point allows with one edit.
- [A wrong first match cannot be corrected: no update endpoint] → accepted for the delivery (summary Open 7 a, Open 8): the location is saved directly.
- [`geocodingHelp` promises a map placement that may fail] → the no-map status sentence and the card's no-map line say so.
- [Browser calls need the API's CORS for the front origin] → as `add-offering-management`: real-browser verification waits for it; unit and component tests do not.
- [The directory edits the same CSP line] → one-line merge conflict, resolved by whichever merges second.

## Migration Plan

None: no data, no dependency and no contract change. Rolling back is reverting the change's commits; the CSP returns to its previous `connect-src`.

## Open Questions

- **`config.yaml` (Product owner's file):** update the `offering-management` line to `  - offering-management: coffeeshop management area (offerings: create from inventory by roaster and locations, list own, delete one or several; locations: list own and create with geocoded address)` (summary Open 1). Nothing in the specs or tasks depends on it.
