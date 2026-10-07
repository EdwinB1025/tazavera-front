# Proposal

## Why

Every authenticated user has one primary contact (address, city, phone, email, web, social) that the API now stores and returns (`listMyContacts`, `createMyPrimaryContact` in `contracts/openapi.yaml`), but the front offers no way to see or add it. The decisions log ("contactos y locales", 2026-10-06) places it in the profile: a "Contact details" section of the account page that shows the saved contact or, when there is none, a short text and an action that opens the form in the same section.

## What Changes

- The account page gains a fifth section, **Contact details**, second in order (Profile, Contact details, Password, Security, Danger zone), for every authenticated role.
- The section reads `GET /users/{data.ulid}/contacts` and shows the primary contact (`isPrimary: true`) read-only; while reading it shows the loading status; a failed read shows an error text and a "Try again" action.
- With no contact (`{ data: [] }`) the section shows an explanatory text and an "Add contact details" action that reveals the form in the same section; "Cancel" closes it and discards the typed values.
- The form sends `POST /users/{data.ulid}/contacts`. Client checks are only those the operation's `requestBody` documents: address and city required, the email and web formats, and the documented maximum lengths. A `201` shows the saved contact with a success status; a `409` closes the form, says a contact already exists and re-reads it; a `403` shows the account page's step-up notice; any other outcome shows the generic form-level error and keeps the values.
- Two reusable pieces are created in a new `contact` entity: the eight contact fields as one group and the read-only contact list, both reused later by `add-coffeeshop-location` and `add-coffeeshop-directory`.
- A new `contact` message area holds the eight field labels shared by every contact form; the section's own texts join the `account` area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Account page and its session gate" lists five sections instead of four; a new requirement "Contact details" covers the read, the empty state, the form, its checks and its outcomes.

## Out of scope

- Editing or deleting a saved contact: the API offers only `GET` and `POST` (design summary Open 3, answer a).
- More than one contact per user, and non-primary contacts.
- The contacts of a coffee shop's locations (`add-coffeeshop-location`) and any public display of a contact (`add-coffeeshop-directory`).
- Mapping `422` messages to their fields (backlog R8): every `422` shows the generic form-level error.
- Moving the account page's gate and status pieces to `src/shared/ui` (backlog R11): this change uses them from wherever they live when its apply starts.

## Impact

- **Code (created):** `src/entities/contact/` (types, `ContactFields`, `ContactDetails`, public API); `src/features/user-account/api/contacts.ts`, `src/features/user-account/model/contact-checks.ts` and `src/features/user-account/ui/ContactSection.tsx`, with tests beside every file; `messages/{es,en,ca}/contact.json`.
- **Code (modified):** `src/shared/api/index.ts` (two derived contact types); `src/shared/ui/icons.ts` (`Plus`); `src/features/user-account/ui/AccountSection.tsx` (a focusable heading on request) and `src/features/user-account/index.ts`; `src/pages/account/ui/AccountClient.tsx` and `AccountScreen.tsx`; `messages/{es,en,ca}/account.json`; the tests that assert the four sections and the account texts.
- **API:** consumes `listMyContacts` and `createMyPrimaryContact`; `contracts/openapi.yaml` and `src/shared/api/schema.ts` are not edited.
- **Dependencies:** none added. The apply waits for `add-offering-catalog` (`LabelValueRow`) to merge and for the small change in which `add-user-account` adopts the section card of `refine-page-surfaces`.
