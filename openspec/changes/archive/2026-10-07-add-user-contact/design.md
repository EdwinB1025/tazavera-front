# Design

## Context

See proposal.md for the motivation. The design source of truth is `docs/design/add-user-contact/design-summary.md` (`Status: approved`); its open points 2–5 take their recommendation (§ "Open"). The state this design builds on:

- `add-user-account` (archived 2026-10-07, on `develop`): the account page (`src/pages/account/ui/AccountScreen.tsx` server, `AccountClient.tsx` client injection seam, user-account D1), `AccountSection`, `LoadingStatus`, `FormStatus`, `StepUpNotice`, `SessionGate`, the email check `isValidEmail` (`src/features/user-account/model/email.ts`), `LINK_CLASSES` exported from `@/shared/ui` (user-account D4) and the `account` catalog area. Its decisions D1 (page-slice injection), D2 (client checks per operation), D6 (step-up), D9 (accessibility), D10 (layout) and D11 (tokens) apply unchanged.
- `add-offering-catalog` (not merged): creates `LabelValueRow` in `src/shared/ui` (its design.md D5: one `<div>` wrapping `<dt>` and `<dd>`, `flex flex-wrap items-baseline justify-between gap-4`, label `type-label`, value `type-body`, no spacing of its own; content-structure "Label/value row").
- `refine-page-surfaces` (archived): `Card variant="section"`. `AccountSection` still renders the plain `Card`/`CardContent`; a later small change of `add-user-account` adopts the section card (refine-page-surfaces Open 3 a).
- The API client: `request(path, init)` from `@/shared/api` sends the current token and runs the `401` chain (one refresh, one retry, silent re-authentication, then `anonymous`); any other status reaches the caller.
- No Next.js API is involved: the new components are client code rendered under the existing `"use client"` boundary of `AccountClient`, and `AccountScreen` keeps using `getMessages` (`src/shared/lib/i18n`). No Next.js guide applies.

### API endpoints consumed

From `contracts/openapi.yaml` (`290d22e`). `{user_ulid}` is the session user's `data.ulid`.

| `operationId` | Method and path | Auth | Request | Success response | Errors |
|---|---|---|---|---|---|
| `listMyContacts` | `GET /users/{user_ulid}/contacts` | `profile:read` or `profile:write`, own user only (policy) | — | `200 { data: [{ ulid, isPrimary, address, city, postalCode, country, phone, email, web (nullable), social }] }`; no contact → `{ data: [] }` | `401` (client chain), `403 { message }` |
| `createMyPrimaryContact` | `POST /users/{user_ulid}/contacts` | `profile:write`, permission to update the user (policy) | JSON body: `address` (required, max 255), `city` (required, max 90), `postal_code` (nullable, max 12), `country` (nullable, max 60), `phone` (nullable, max 25), `email` (nullable, valid email, max 255), `web` (nullable, valid URL, max 255), `social` (nullable, max 255); `isPrimary` is set by the API, never sent | `201 { data: { ulid, isPrimary, address, city, postalCode, country, phone, email, web, social }, message }` | `401` (client chain), `403 { message }`, `409 { message }`, `422 { message, errors }` |

The request body uses `postal_code` (snake case) while both responses use `postalCode`: the payload type and the read type are derived separately (below). The response schemas type `phone`, `email`, `social`, `address`, `country`, `city` and `postalCode` as optional non-nullable strings although the request accepts `null` for five of them; the front treats an absent and a `null` value alike (`value == null` → no row), so no type is widened.

### How API errors are presented

| Response | Where it shows | Text source |
|---|---|---|
| `GET` pending | the section body holds `LoadingStatus` | `loading` |
| `GET` `200` with no primary contact, or all eight values null | empty text and "Add contact details" | `contactEmptyText`, `contactAddButton` |
| `GET` network failure, `5xx`, `403`, any other non-`200` | the section's error text and "Try again" | `contactLoadError`, `retry` |
| Client check fails | under each failing field; nothing is sent | `requiredError`, `emailFormatError`, `urlFormatError` |
| `POST` `201` | success status above the created contact | `contactSaved` |
| `POST` `409` | status (not an error) above the re-read contact | `contactExists` |
| `POST` `403` | step-up notice above the actions | `stepUpText`, `stepUpButton` |
| `POST` `422`, `5xx`, network failure, any other status | generic form-level error above the actions; values kept | `genericError` |
| `401` anywhere | never shown: the client chain runs; an `anonymous` end shows the page's signed-out state | `signedOutText` |

The API's `message` and `errors` are never rendered (field mapping of `422` is backlog R8).

### Card sections filled from the API (shared card)

The section uses `AccountSection` (the shared `Card`), as it stands when the apply starts.

| Card part | Source |
|---|---|
| Header: heading and description | catalog texts `contactHeading`, `contactDescription`; no API data |
| Body, read-only list: Address, Postal code, City, Country, Phone, Email, Web, Social media | `address`, `postalCode`, `city`, `country`, `phone`, `email`, `web`, `social` of the `listMyContacts` item with `isPrimary: true`, or of the `createMyPrimaryContact` `201` `data` |
| Body, empty state, error state, form | no API data shown |

## Derived and UI-specific types

Defined before any component. The two derived types are built from `operations` of `src/shared/api/schema.ts` and exported from `src/shared/api/index.ts`, beside the existing aliases:

```ts
type ListMyContactsResponse =
  operations["listMyContacts"]["responses"][200]["content"]["application/json"];

/** One item of `GET /users/{user_ulid}/contacts` `data`. */
export type Contact = NonNullable<ListMyContactsResponse["data"]>[number];

/** Body of `POST /users/{user_ulid}/contacts` (`createMyPrimaryContact`). */
export type ContactCreatePayload =
  operations["createMyPrimaryContact"]["requestBody"]["content"]["application/json"];
```

The `201` `data` of `createMyPrimaryContact` is assignable to `Contact` (same keys; its `web` is `string`, a subset of `string | null`), so no third alias is added. `src/shared/api/schema.ts` and `contracts/openapi.yaml` are never edited.

UI-specific types, in `src/entities/contact/model/types.ts`, re-exported from `@/entities/contact`:

```ts
/** The eight form keys, in field order. */
export type ContactFieldKey =
  | "address" | "postalCode" | "city" | "country"
  | "phone" | "email" | "web" | "social";

/** What the eight fields hold while the user types. */
export type ContactFieldValues = Record<ContactFieldKey, string>;

/** Per-field error messages; a key without a message is valid. */
export type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

/** The eight labels, from the `contact` catalog area. */
export type ContactTexts = {
  contactAddressLabel: string;
  contactPostalCodeLabel: string;
  contactCityLabel: string;
  contactCountryLabel: string;
  contactPhoneLabel: string;
  contactEmailLabel: string;
  contactWebLabel: string;
  contactSocialLabel: string;
};
```

Each component's own texts type (`ContactSectionTexts`) is declared in its file before the component.

## Goals / Non-Goals

**Goals:**

- One section, two vertical slices: reading and showing the contact, then adding it.
- The contact field group and the read-only list exist once, in `src/entities/contact`, ready for `add-coffeeshop-location` and `add-coffeeshop-directory`.
- `features/user-account` stays one slice that imports no other feature; the session and `requestProfileWrite` keep arriving as props (user-account D1).

**Non-Goals:**

- No new token, contrast pair, primitive or shared component; `LabelValueRow` is consumed, not created.
- No change to `auth`, the API client, the step-up mechanism or the page's gate.
- No refactor of backlog R11 (gate and status pieces) or R8 (`422` mapping).

## Decisions

### D1. The `contact` entity holds the field group and the read-only list (summary §4, criterion C)

`src/entities/contact/` is a new entity slice with `model/types.ts` (the UI types above), `ui/ContactFields.tsx`, `ui/ContactDetails.tsx` and `index.ts` (public API: both components, their props types and the UI types). It imports only `@/shared/ui` and `@/shared/api`. Both components hold no state and send no request: the feature owns the values, the checks and the requests, so a second form (`add-coffeeshop-location`) reuses the pieces with its own request. Alternative considered: keeping both inside `features/user-account` — rejected, `features/location-management` could not import them (FSD forbids feature-to-feature imports).

- **`ContactFields`** — props `values: ContactFieldValues`, `errors: ContactFieldErrors`, `onChange(key, value)`, `texts: ContactTexts`, `disabled?: boolean` (unused here; the location form may need it). Renders the eight `Field`s (default variant) in the order of the table below, as a fragment so the consuming form's stack spaces them. Each `Input` carries `name` = its key, its `autoComplete`, its `type` and its `maxLength`:

  | Key | Label | `type` | `autoComplete` | `maxLength` | `required` marker |
  |---|---|---|---|---|---|
  | `address` | `contactAddressLabel` | `text` | `street-address` | 255 | yes |
  | `postalCode` | `contactPostalCodeLabel` | `text` | `postal-code` | 12 | no |
  | `city` | `contactCityLabel` | `text` | `address-level2` | 90 | yes |
  | `country` | `contactCountryLabel` | `text` | `country-name` | 60 | no |
  | `phone` | `contactPhoneLabel` | `tel` | `tel` | 25 | no |
  | `email` | `contactEmailLabel` | `email` | `email` | 255 | no |
  | `web` | `contactWebLabel` | `url` | `url` | 255 | no |
  | `social` | `contactSocialLabel` | `text` | `off` | 255 | no |

  The maximum lengths are the contract's (`requestBody` descriptions) and are enforced by the native `maxLength` attribute, which `noValidate` does not disable: it limits typing and pasting, so no message is needed. The required marker is `Field`'s `required` prop.

- **`ContactDetails`** — props `contact: Contact`, `texts: ContactTexts`. Renders one `<dl className="grid gap-y-3">` holding one `LabelValueRow` per value that is neither `null` nor absent, in the order of the table above (`postalCode` from the response). Every value renders as the API returns it inside a `<span className="break-words">`, so long emails and URLs wrap at 375px. `web` renders as a native `<a href={web} className={LINK_CLASSES}>` (same tab, no `target`) only when it starts with `http://` or `https://`; otherwise it is text, so no `javascript:` or relative value is ever a link (xss-guard keeps passing: no `dangerouslySetInnerHTML`). A contact whose eight values are all absent or `null` renders nothing (`null`); the section treats it as empty (D3). Server-compatible (no hook, no handler, no `"use client"`).

### D2. Texts: a shared `contact` area for the labels (Open 5, answer b) and the section's keys in `account`

New area `contact` — `messages/{es,en,ca}/contact.json` — with exactly the eight label keys of `ContactTexts`, so the location form loads the same copy. `AccountScreen` loads it with `getMessages("contact", locale)` beside the `account` catalog and passes the labels inside the texts it already builds. The section's own keys join the `account` area. es follows the brief's wording; en and ca are drafts; final copy is Product owner's.

**`contact` area**

| Key | es | en | ca |
|---|---|---|---|
| `contactAddressLabel` | Dirección | Address | Adreça |
| `contactPostalCodeLabel` | Código postal | Postal code | Codi postal |
| `contactCityLabel` | Ciudad | City | Ciutat |
| `contactCountryLabel` | País | Country | País |
| `contactPhoneLabel` | Teléfono | Phone | Telèfon |
| `contactEmailLabel` | Email | Email | Correu electrònic |
| `contactWebLabel` | Web | Website | Web |
| `contactSocialLabel` | Redes sociales | Social media | Xarxes socials |

**`account` area (added)**

| Key | es | en | ca |
|---|---|---|---|
| `contactHeading` | Datos de contacto | Contact details | Dades de contacte |
| `contactDescription` | Tu información de contacto personal. | Your personal contact information. | La teva informació de contacte personal. |
| `contactEmptyText` | Aún no has añadido tus datos de contacto. | You have not added your contact details yet. | Encara no has afegit les teves dades de contacte. |
| `contactAddButton` | Agregar datos de contacto | Add contact details | Afegeix dades de contacte |
| `contactSaved` | Datos de contacto guardados | Contact details saved | Dades de contacte desades |
| `contactExists` | Ya tienes datos de contacto guardados. | You already have contact details saved. | Ja tens dades de contacte desades. |
| `contactLoadError` | No se pudieron cargar tus datos de contacto. | Your contact details could not be loaded. | No s'han pogut carregar les teves dades de contacte. |
| `retry` | Reintentar | Try again | Torna-ho a provar |
| `urlFormatError` | Introduce una URL válida. | Enter a valid URL. | Introdueix un URL vàlid. |

Reused from `account`: `save`, `cancel`, `loading`, `genericError`, `requiredError`, `emailFormatError`, `stepUpText`, `stepUpButton`. `urlFormatError` is not in the summary's §8: it is the message of the web check that the contract documents ("Must be a valid URL"; summary §5.4 "only what the contract documents"), worded like `emailFormatError`.

### D3. `ContactSection`: one state machine in the feature

`src/features/user-account/ui/ContactSection.tsx` (`"use client"`) renders `AccountSection` with `contactHeading` and `contactDescription` and owns the section's state. Props: `ulid: string`, `locale: string`, `texts: ContactSectionTexts` (`ContactTexts` & `StepUpNoticeTexts` & the `account` keys it uses), `requestProfileWrite: (returnRoute: string) => void`. States and transitions (summary §5.5):

| State | Renders | Leaves to |
|---|---|---|
| `reading` | `LoadingStatus` with `loading` | `details` (a primary contact with at least one value), `empty` (no primary item, or all values null), `readError` (anything else) |
| `readError` | `contactLoadError` (`type-body`) and `Button variant="action-4" size="base"` `retry` | `reading` on "Try again" |
| `empty` | `contactEmptyText` (`type-body`) and `Button variant="primary" size="base"` `contactAddButton` with the `Plus` icon (`aria-hidden`) before its label | `form` on activation |
| `form` (with `pending`) | the form of D4 | `details` + `contactSaved` on `201`; `reading` + `contactExists` on `409`; `empty` on Cancel; stays on `403`, `422`, `5xx`, network, other |
| `details` | optional status (`FormStatus kind="success"` with `contactSaved` or `contactExists`), then `ContactDetails` | — (no edit, Open 3 a) |

- The read runs on mount through `fetchContact(ulid)`; the primary contact is the first `data` item with `isPrimary === true`. A response received after unmount is ignored.
- After a `409` the section re-reads; the `contactExists` status is kept and shows above the details when the re-read finds a contact; an empty re-read shows the empty state with no status; a failed re-read shows `readError` with no status.
- The `contactExists` text uses `FormStatus kind="success"` (`role="status"` with the decorative `Check`): it is a status, not an error (summary §3.1).
- Focus: "Add contact details" → the Address input; Cancel → "Add contact details"; `201`, `409` and "Try again" → the section heading, because the control that had focus disappears. The heading takes focus through `AccountSection`'s new optional `headingRef` prop: when given, the `h2` receives the ref and `tabIndex={-1}`; without it, `AccountSection` renders exactly as before.
- Alternative considered: a separate `ContactForm` component — rejected; the form's outcomes change the section's state (close, re-read, focus the heading), so one component owns both.

### D4. The form, its checks and its request

`<form noValidate aria-labelledby={headingId}>` holding `ContactFields`, then the status area, then the actions row. `ContactFields` receives the typed values, the errors of the last failed check and `onChange`. The fields stay editable while pending (as the other account forms).

- **Checks** — `src/features/user-account/model/contact-checks.ts` exports `checkContact(values, texts): ContactFieldErrors`, a pure function run on submit, in field order: `address` and `city` empty after `trim()` → `requiredError`; `email` non-empty and `!isValidEmail(email)` → `emailFormatError`; `web` non-empty and not parseable as an absolute URL (`URL.canParse(web)` is `false`) → `urlFormatError`. No other check (the length limits are D1's `maxLength`). With any error, focus moves to the first failing input (by `name`) and nothing is sent. Kept in the feature, not the entity, because `isValidEmail` lives in this feature and an entity cannot import it.
- **Request** — `src/features/user-account/api/contacts.ts` exports `fetchContact(ulid): Promise<Response>` (`GET /users/${ulid}/contacts`, `Accept: application/json`) and `createContact(ulid, payload: ContactCreatePayload): Promise<Response>` (`POST /users/${ulid}/contacts`, JSON body, `Accept` and `Content-Type: application/json`), both through `request`. `toContactPayload(values)` in `contact-checks.ts` maps the form values to the body: `address` and `city` as typed, `postalCode` → `postal_code`, and each of the six optional values as typed or `null` when empty after `trim()`.
- **Outcomes** — `201` reads `data` from the body and goes to `details` with `contactSaved`; `409` goes to `reading` with `contactExists`; `403` shows `StepUpNotice` (its "Confirm identity" calls `requestProfileWrite(\`/${locale}/account\`)` inside the click, user-account D6); every other status, a body that cannot be read on `201`, and a network failure show `FormStatus kind="error"` with `genericError`. Values are kept in every case that stays on the form.
- **Actions** — `Button type="submit" variant="primary" size="base"` `save` with `loading` while pending; `Button type="button" variant="action-4" size="base"` `cancel`, `disabled` while pending. Save first.

### D5. Placement and injection (Open 2, answer a; user-account D1)

`AccountClient` renders `ContactSection` second, between the Profile and Password sections, with `ulid={user.ulid ?? ""}`, `locale`, `texts` and the injected `requestProfileWrite`. `AccountClientTexts` adds `ContactSectionTexts`; `AccountScreen` builds the added keys from the `account` catalog and the eight labels from the `contact` catalog. `ContactSection`, its props and texts types, and `AccountSection`'s new prop are exported from `src/features/user-account/index.ts`.

### D6. Accessibility

- The section is a region named by its `h2` (`AccountSection`); the form is named by the same heading.
- Loading: `LoadingStatus` (`role="status"`). Success and exists statuses: `role="status"`. Generic error and step-up notice: `role="alert"`. The read error text is plain text followed by "Try again" (focus does not move to it on first load; after "Try again" focus is on the heading).
- Field errors: text under the field, `aria-invalid`, the boundary change (`Field`); never colour alone.
- The `Plus` icon and the status `Check` are `aria-hidden`; the button's name is its label.
- The web link carries `LINK_CLASSES`, which includes the focus ring; its name is the URL text.
- Autofill names as D1's table. Every text arrives as a prop.

### D7. Layout and spacing (summary §7, criterion A)

- The section renders `AccountSection` as it stands when the apply starts, with no section styling of its own (the section card of `refine-page-surfaces` after `add-user-account`'s adoption change).
- Empty state: `flex flex-col gap-4` — the text, then the actions row (`flex flex-wrap gap-3`), the button at its own width, start-aligned.
- Error state: the same stack, the text then "Try again".
- Form: `flex flex-col gap-6` — 1.5rem between fields, between the last field and the status / step-up notice, and between those and the actions row; every field full width at every size (Postal code and City stay stacked). Actions row: `flex flex-wrap gap-3`, Save first, buttons at their own width, start-aligned.
- Details: the optional status, then the `<dl>` 1.5rem below (`flex flex-col gap-6` wrapper); the `<dl>` is `grid gap-y-3` in a single column at every width; the rows are `LabelValueRow`'s own.
- Responsive: the page's own (user-account D10): no horizontal scroll at 375px; values wrap with `break-words`.

### D8. Tokens and contrast

Semantic tokens only; no new token and no new pair. Every element reuses a pair registered in `src/app/styles/theme-tokens.test.ts`: `text-primary`, `text-label` and `text-secondary` on `surface-card`; `text-link` / `text-link-hover` on `surface-card`; `feedback-error` on `surface-card`; the `primary` and `action-4` button pairs. Not gated: the `Plus` and `Check` icons beside their text (decorative). The `Plus` icon is added to the export list of `src/shared/ui/icons.ts` (the single `lucide-react` entry point).

## Routes, components and files

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/api/index.ts` | shared (`api`) | modified: `Contact`, `ContactCreatePayload` |
| `src/shared/ui/icons.ts`, `icons.test.ts` | shared (`ui`) | modified: exports `Plus` |
| `src/entities/contact/model/types.ts` | entities | created: the UI types |
| `src/entities/contact/ui/ContactFields.tsx`, `.test.tsx` | entities | created: the eight fields (D1) |
| `src/entities/contact/ui/ContactDetails.tsx`, `.test.tsx` | entities | created: the read-only list (D1) |
| `src/entities/contact/index.ts` | entities | created: public API |
| `src/features/user-account/api/contacts.ts`, `.test.ts` | features | created: `fetchContact`, `createContact` (D4) |
| `src/features/user-account/model/contact-checks.ts`, `.test.ts` | features | created: `checkContact`, `toContactPayload` (D4) |
| `src/features/user-account/ui/ContactSection.tsx`, `.test.tsx` | features | created: the section (D3, D4) |
| `src/features/user-account/ui/AccountSection.tsx`, `.test.tsx` | features | modified: optional `headingRef` (D3) |
| `src/features/user-account/index.ts` | features | modified: exports `ContactSection` and its types |
| `src/pages/account/ui/AccountClient.tsx`, `.test.tsx` | pages | modified: `ContactSection` second (D5) |
| `src/pages/account/ui/AccountScreen.tsx`, `.test.tsx` | pages | modified: loads the `contact` area; the added texts (D2, D5) |
| `messages/{es,en,ca}/contact.json` | message catalog | created: the `contact` area (D2) |
| `messages/{es,en,ca}/account.json` | message catalog | modified: the nine added keys (D2) |

No route file changes. `contracts/openapi.yaml` and `src/shared/api/schema.ts` are never edited.

## Risks / Trade-offs

- [`LabelValueRow` is not merged (`add-offering-catalog`)] → the apply waits for that merge (summary Open 4, answer a); no local row is built.
- [`AccountSection` changes when `add-user-account` adopts the section card] → the apply waits for that change too (summary §9) and modifies `AccountSection` as it then stands; only the `headingRef` prop is added.
- [The response schemas type the optional values as non-nullable strings although the API stores `null`] → `ContactDetails` treats absent and `null` alike; no type is widened. Reported to Product owner as a contract observation.
- [The web check (`URL.canParse`) may accept a value the API's `url` rule rejects, e.g. an unusual scheme] → the API's `422` shows the generic error; the link rule of D1 keeps any non-`http(s)` value as text.
- [`checkContact` lives in `features/user-account`] → `add-coffeeshop-location` needs the same checks and cannot import this feature; it is the same kind of duplication as backlog R11, to be decided when that change applies (the entity cannot hold it while `isValidEmail` lives in this feature).
- [The API answers the browser with no CORS headers (decisions log, pending in the API)] → the real-browser check of group 4 needs the API's CORS or a local mock; the unit suite is unaffected.

## Migration Plan

None: no data, no dependency, no route. Rolling back is reverting the change's commits.

## Open Questions

None that change the specs, the approach or the tasks. Copy confirmation (en, ca and `urlFormatError`) is Product owner's, as for every catalog.
