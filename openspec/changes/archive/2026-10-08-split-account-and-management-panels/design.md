# Design

Sources: backlog R38 (`docs/backlog.md`); technical review §3.1, row R38 (`docs/review/technical-review.md`); the AGENTS.md size limits and code-structure rules; the designs of `add-user-account` (contact section D3, D4, D6, D7), `add-offering-management` (My offerings D1–D3, D6) and the locations change (D3, D4), whose behaviour is kept as it is. Fast lane: no design folder.

## Context

Current state on `qa` (`npm run lint` warnings, counting non-blank, non-comment lines):

- `src/features/user-account/ui/ContactSection.tsx` (316 lines raw): `ContactSectionTexts`, `ContactSectionProps`, the local `SectionState`, `FormOutcome`, `FocusTarget` types, `EMPTY_VALUES`, `FIELD_ORDER`, `readOutcome` (calls `fetchContact` and reads the status and body), and `ContactSection` (186 lines) with the read, the focus effect, the form state, `handleSubmit` (calls `createContact` and reads `201`, `409`, `403`) and the markup of every state.
- `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` (323 counted lines): `ManageOfferingsTexts`, `ManageOfferingsPanelProps`, the layout class constants, `SkeletonGrid`, `OwnOfferingsList`, `OwnOfferingsBody` (83 lines) and `ManageOfferingsPanel`. `ManageOfferingsScreen.tsx` imports `ManageOfferingsPanel` and `ManageOfferingsTexts` from `./ManageOfferingsPanel`; both `ManageOfferingsPanel.test.tsx` files import `ManageOfferingsPanel` from that file.
- `src/features/location-management/ui/LocationsPanel.tsx` (227 lines raw): `LocationsPanelTexts`, `LocationsPanelProps`, the layout class constants, `readOutcome` (calls `fetchOwnLocations` and reads the status and body), `hasNoMap` and `LocationsPanel` (138 lines).

The protecting tests mock `@/shared/api` with only `request` (and `publicRequest` for My offerings): the moved code imports nothing else at run time from `@/shared/api`.

## Goals / Non-Goals

**Goals:** every component, hook and function of the three panels at most 80 lines, every file at most 300 lines, complexity at most 15; response statuses read only in the slices' `api` segments; identical DOM, classes, texts, accessible names, focus moves and requests.

**Non-Goals:** no change to any public index, screen, entity, widget or shared component, message key or test.

## API

No new endpoint. The functions that send the requests stay where they are and keep their method, path, headers and body: `fetchContact` and `createContact` in `user-account/api/contacts.ts`, `fetchOwnLocations` in `location-management/api/locations.ts`. The new `api` functions wrap them and only map the status and body to an outcome. Types used: `Contact`, `ContactCreatePayload`, `UserLocation`, `UserLocationsPayload`, `TaxonomyNode` from `@/shared/api`; no new API type.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/features/user-account/api/contacts.ts` | features (api) | Modified | Adds `readPrimaryContact` and `submitContact` (D2) |
| `src/features/user-account/model/contact-checks.ts` | features (model) | Modified | Adds `EMPTY_CONTACT_VALUES`, `CONTACT_FIELD_ORDER`, `isEmptyContact` (D2) |
| `src/features/user-account/model/use-contact-form.ts` | features (model) | New | `useContactForm` (D2) |
| `src/features/user-account/ui/ContactForm.tsx` | features (ui) | New | The add form (D2) |
| `src/features/user-account/ui/ContactSectionStates.tsx` | features (ui) | New | `ContactReadError`, `ContactEmpty`, `ContactSaved` (D2) |
| `src/features/user-account/ui/ContactSection.tsx` | features (ui) | Modified | Types, read state, focus, composition (D2) |
| `src/pages/manage-offerings/ui/SkeletonGrid.tsx` | pages (ui) | New | `GRID_CLASSES`, `SkeletonGrid` (D3) |
| `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx` | pages (ui) | New | The success state: toolbar, cards, pagination (D3) |
| `src/pages/manage-offerings/ui/OwnOfferingsBody.tsx` | pages (ui) | New | The list's states (D3) |
| `src/pages/manage-offerings/ui/OwnOfferingsList.tsx` | pages (ui) | New | The own list with its delete flow (D3) |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` | pages (ui) | Modified | `ManageOfferingsTexts`, props, header, status, gate (D3) |
| `src/features/location-management/api/locations.ts` | features (api) | Modified | Adds `readOwnLocations` (D4) |
| `src/features/location-management/model/use-own-locations.ts` | features (model) | New | `useOwnLocations` (D4) |
| `src/features/location-management/ui/LocationsPanelStates.tsx` | features (ui) | New | `LocationsLoadError`, `LocationsEmptyCard`, `AddLocationButton` (D4) |
| `src/features/location-management/ui/LocationList.tsx` | features (ui) | New | The list of location cards with `hasNoMap` (D4) |
| `src/features/location-management/ui/LocationsPanel.tsx` | features (ui) | Modified | Types, form state, focus, composition (D4) |

No public index, screen, route or test file changes.

## Decisions

### D1 — Placement and imports

Every new part is a sibling of the panel it comes from, in the same slice and segment, imported by relative path (`./ContactForm`, `../model/use-contact-form`, `../api/contacts`), never through the slice's index. No public index gains an export: no part is imported by another slice. Parts with event handlers, state or effects carry `"use client"`, as the panels do today; the markup-only parts are imported only by client components and need none. Types are declared before the component or function in each file. Class constants move with the markup that uses them; a constant two files need (`GRID_CLASSES`) is exported from the file that declares it.

### D2 — Contact section (`user-account`)

The request layer reads the statuses; the UI only shows outcomes.

```ts
// api/contacts.ts — fetchContact and createContact unchanged
export type PrimaryContactRead =
  | { ok: false }                                  // non-200 or network/body failure
  | { ok: true; primary: Contact | undefined };    // the item with isPrimary === true
export function readPrimaryContact(ulid: string): Promise<PrimaryContactRead>;

export type ContactWrite =
  | { kind: "created"; contact: Contact }          // 201 with a readable `data`
  | { kind: "exists" }                             // 409
  | { kind: "stepUp" }                             // 403
  | { kind: "error" };                             // anything else, network, unreadable 201
export function submitContact(ulid: string, payload: ContactCreatePayload): Promise<ContactWrite>;

// model/contact-checks.ts — added beside checkContact and toContactPayload
export const EMPTY_CONTACT_VALUES: ContactFieldValues;   // today's EMPTY_VALUES
export const CONTACT_FIELD_ORDER: ContactFieldKey[];     // today's FIELD_ORDER
export function isEmptyContact(contact: Contact): boolean; // every field null or absent

// model/use-contact-form.ts
export type ContactFormHandlers = {
  onCreated: (contact: Contact) => void;
  onExists: () => void;
};
export function useContactForm(
  ulid: string,
  texts: ContactCheckTexts,
  formRef: RefObject<HTMLFormElement | null>,
  handlers: ContactFormHandlers,
): {
  values: ContactFieldValues;
  errors: ContactFieldErrors;
  pending: boolean;
  outcome: "error" | "stepUp" | null;
  update: (key: ContactFieldKey, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

// ui/ContactForm.tsx
export type ContactFormTexts = ContactTexts & ContactCheckTexts & {
  stepUpText: string; stepUpButton: string; save: string; cancel: string; genericError: string;
};
export type ContactFormProps = {
  ulid: string; locale: string; headingId: string; texts: ContactFormTexts;
  requestProfileWrite: (returnRoute: string) => void;
  onCreated: (contact: Contact) => void; onExists: () => void; onCancel: () => void;
};

// ui/ContactSectionStates.tsx
export type ContactReadErrorProps = { text: string; retryLabel: string; onRetry: () => void };
export type ContactEmptyProps = {
  text: string; addLabel: string; onAdd: () => void;
  actionsRef: RefObject<HTMLDivElement | null>;   // the add button's row, for focus on Cancel
};
export type ContactSavedProps = {
  contact: Contact; status: "saved" | "exists" | undefined; texts: ContactTexts & { contactSaved: string; contactExists: string };
};

// ui/ContactSection.tsx
export type ContactSectionTexts = ContactFormTexts & {
  contactHeading: string; contactDescription: string; contactEmptyText: string;
  contactAddButton: string; contactLoadError: string; contactSaved: string;
  contactExists: string; retry: string; loading: string;
};   // the same keys as today
```

`ContactSectionProps` does not change. The form owns its values, errors, pending flag and outcome through `useContactForm`, so each opening starts from empty values as `openForm` does today. The form takes focus on Address in its own mount effect, which runs in the commit that shows it, as the section's effect does today; the section keeps the focus on the heading (retry, created, exists) and on "Add contact details" after Cancel. `handleSubmit` keeps today's order: the pending guard, the checks with focus on the first failing field, then `submitContact`; on `created` and `exists` it calls the section's handlers, otherwise it sets the outcome. The section's local `readOutcome` maps `readPrimaryContact` with `isEmptyContact` to its `SectionState`.

### D3 — My offerings panel (`offering-management`, page `manage-offerings`)

The code moves unchanged; each file declares the texts type of the keys it reads.

```ts
// SkeletonGrid.tsx
export const GRID_CLASSES: string;
export function SkeletonGrid(): ReactNode;

// OwnOfferingsGrid.tsx — today's success branch of OwnOfferingsBody
export type OwnOfferingsGridTexts = OfferingCardTexts & PaginationTexts &
  OfferingActionsTexts & SelectionToolbarTexts & { viewLabel: string };
export type OwnOfferingsGridProps = {
  offerings: OfferingSummary[]; currentPage: number; lastPage: number;
  route: string; locale: string; lookup: TaxonomyLookup;
  selection: OwnOfferings["selection"]; onDelete: (target: DeleteTarget) => void;
  texts: OwnOfferingsGridTexts;
};

// OwnOfferingsBody.tsx — loading, error, empty, then OwnOfferingsGrid
export type OwnOfferingsBodyTexts = OwnOfferingsGridTexts & {
  listEmptyMessage: string; listEmptyCreateLink: string; listErrorMessage: string; retryLabel: string;
};
export type OwnOfferingsBodyProps;   // today's props, with texts: OwnOfferingsBodyTexts

// OwnOfferingsList.tsx — the list, the delete flow and the step back after a delete
export type OwnOfferingsListTexts = OwnOfferingsBodyTexts & DeleteOfferingsDialogTexts;
export type OwnOfferingsListProps;   // today's props, with texts: OwnOfferingsListTexts

// ManageOfferingsPanel.tsx
export type ManageOfferingsTexts = OwnOfferingsListTexts & {
  signedOutMessage: string; signInLabel: string; deletedStatus: string;
  eyebrow: string; listHeading: string; newOfferingLink: string;
};   // the same keys as today
```

`OfferingSummary` is the element type of the list's `data` as `useOwnOfferings` returns it; the build uses whichever named type that is. `ManageOfferingsPanelProps`, `ManageOfferingsPanel` and the panel's header, status and gate markup do not change; the layout constants move with the markup that uses them (`SUCCESS_CLASSES` and `LIST_CLASSES` to `OwnOfferingsGrid.tsx`, `MESSAGE_CLASSES` to `OwnOfferingsBody.tsx`). The page slice has no `api` segment: its requests and status mapping already live in `features/offering-management`.

### D4 — Locations panel (`offering-management`, feature `location-management`)

```ts
// api/locations.ts — fetchOwnLocations and createLocation unchanged
export function readOwnLocations(
  userUlid: string,
): Promise<Exclude<ListState, { status: "loading" }>>;   // today's readOutcome

// model/use-own-locations.ts — the read on mount and the reload
export function useOwnLocations(userUlid: string): {
  list: ListState;
  reload: () => void;                        // sets loading, then reads
  mounted: RefObject<boolean>;               // false once the panel unmounts
};

// ui/LocationsPanelStates.tsx
export type LocationsLoadErrorProps = { text: string; retryLabel: string; onRetry: () => void };
export type LocationsEmptyCardProps = { text: string; children: ReactNode };  // children: the add button
export type AddLocationButtonProps = { label: string; onAdd: () => void };

// ui/LocationList.tsx
export type LocationListProps = {
  locations: UserLocation[]; headingId: string;
  texts: ContactTexts & { locationNoMap: string };
};
```

`LocationsPanelTexts`, `LocationsPanelProps` and `LocationsPanel`'s focus effect, form state and `handleSubmit` stay in `LocationsPanel.tsx`; `handleSubmit` uses the hook's `mounted` and `reload`. The `data-add-location` attribute stays on the add button's row, which the focus effect queries.
