Type: Refactor (fast lane)

# Proposal

## Why

Three panels break the size limits of AGENTS.md (a component or function of at most 80 lines, a file of at most 300 lines, a cyclomatic complexity of at most 15), as `npm run lint` reports (backlog R38; technical review §3.1, row R38):

- `src/features/user-account/ui/ContactSection.tsx`: `ContactSection` runs 186 lines, and its `handleSubmit` (complexity 14) and the module's `readOutcome` read the response statuses inside the UI segment.
- `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`: 323 counted lines in one file, with `OwnOfferingsBody` at 83 lines.
- `src/features/location-management/ui/LocationsPanel.tsx`: `LocationsPanel` runs 138 lines, and its `readOutcome` reads the response status inside the UI segment.

Nothing the user sees changes, and no request changes.

## What Changes

- **Contact section** (`user-account`): the status mapping of the contact read and the contact creation moves to the slice's `api` segment; the form's state and submit move to a `model` hook; the form, the read error, the empty state and the details state become sibling parts of the `ui` segment; `ContactSection` keeps its props and texts type and composes them (design.md D2).
- **My offerings panel** (`offering-management`, page slice `manage-offerings`): the skeleton grid, the own list with its delete flow, the list's states and the success grid move to sibling files of the page's `ui` segment, each with the texts type of the keys it reads; `ManageOfferingsTexts` keeps exactly its keys (design.md D3).
- **Locations panel** (`offering-management`, feature slice `location-management`): the status mapping of the locations read moves to the slice's `api` segment; the list read state moves to a `model` hook; the error state, the empty card, the add button and the list become sibling parts of the `ui` segment; `LocationsPanel` keeps its props and texts type (design.md D4).
- No markup, class name, accessible name, text, focus move, request or requirement changes. Public indexes do not change.

## Out of scope (non-goals)

- The other components of the three slices, their public indexes, the shared, entity and widget components the panels use, and the message files.
- `ManageOfferingsScreen.tsx` and the account and locations screens that render the panels: unchanged.
- No new test, no changed assertion, no new token, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: one ADDED requirement, "Contact section kept as one view", stating the observable property the refactor keeps. It adds no behaviour.
- `offering-management`: one ADDED requirement, "Management panels kept as one view", stating the observable property the refactor keeps. It adds no behaviour.

## Impact

- **Code**: `src/features/user-account/` (`api/contacts.ts`, `model/contact-checks.ts`, new `model/use-contact-form.ts`, `ui/ContactSection.tsx`, new `ui/ContactForm.tsx`, new `ui/ContactSectionStates.tsx`); `src/pages/manage-offerings/ui/` (`ManageOfferingsPanel.tsx`, new `SkeletonGrid.tsx`, `OwnOfferingsList.tsx`, `OwnOfferingsBody.tsx`, `OwnOfferingsGrid.tsx`); `src/features/location-management/` (`api/locations.ts`, new `model/use-own-locations.ts`, `ui/LocationsPanel.tsx`, new `ui/LocationsPanelStates.tsx`, new `ui/LocationList.tsx`). Files are listed in design.md, Files.
- **Tests**: none added or changed. Protecting tests: `ContactSection.test.tsx` (`src/features/user-account/ui/` and `qa/src/features/user-account/ui/`), `ManageOfferingsPanel.test.tsx` (`src/pages/manage-offerings/ui/` and `qa/src/pages/manage-offerings/ui/`) and `LocationsPanel.test.tsx` (`src/features/location-management/ui/`).
- **API**: none. The same requests (`GET` and `POST /users/{ulid}/contacts`, `GET /users/{ulid}/locations`, the offering list and delete requests) go through the same functions with the same method, path, headers and body.
- **Dependencies, contract, texts, tokens**: none.
- **Resolves**: backlog R38.

## Propose status

- **Change-id:** `split-account-and-management-panels`
- **Date:** 2026-10-08
- **Validation:** `openspec validate split-account-and-management-panels --strict` → "Change 'split-account-and-management-panels' is valid".
- **Resolves:** backlog R38.
- **Resolved:** the contact read and write status mapping moves to `user-account/api/contacts.ts` (`readPrimaryContact`, `submitContact`), the empty-contact rule and the field order to `model/contact-checks.ts`, the form state to `model/use-contact-form.ts`, and the form and the read error, empty and details states to sibling `ui` parts (design.md D2); the My offerings panel splits into `SkeletonGrid`, `OwnOfferingsList`, `OwnOfferingsBody` and `OwnOfferingsGrid`, each with the texts type of its keys, `ManageOfferingsTexts` keeping its keys (design.md D3); the locations read status mapping moves to `location-management/api/locations.ts` (`readOwnLocations`), the list state to `model/use-own-locations.ts`, and the error state, the empty card, the add button and the list to sibling `ui` parts (design.md D4). The form takes focus on its own mount instead of from the section's effect, in the same commit as its render (design.md D2).
- **Open:** nothing.
