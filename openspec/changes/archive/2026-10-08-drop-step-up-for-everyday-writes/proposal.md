Type: Refactor (fast lane)

## Why

Product owner's production AUT (finding 27, backlog entry R59): the front asks for the step-up (`requestProfileWrite`) before writes that, by Product owner's decision (option A), no longer need `profile:write`. The API changed first (`tazavera-api` `dev` `71bc91b`), and the contract in `contracts/openapi.yaml` now shows that `POST /users/{user}/contacts` and `POST /locations` accept `profile:read` or `profile:write`. Updating the profile, changing the password, deactivating and deleting the account, creating offerings (`POST /offerings` still requires `profile:write`) and deleting offerings keep it. Unlike other fast-lane changes, this one changes specified behaviour by Product owner's decision after the API change; Product owner typed it as fast lane for AUT corrections.

## What Changes

- Adding a contact (account page) and adding a location (Manage locations) no longer show the step-up notice: a `403` on either now shows the generic form error and keeps the values, like any other failure. The step-up stays reactive everywhere else (no proactive gate, no auth change).
- The account page shows six section cards in order: Profile (read-only rows Name, Surname, Email and Role from the session user, a null value with no row), Contact details, Edit profile (the name/surname/email form, which keeps its reactive step-up), Password, Security and Danger zone. The role moves from the form to the read-only Profile card.
- One new account text, `editProfileHeading` (es "Editar perfil", en "Edit profile", ca "Editar el perfil"); the Edit profile card reuses `profileDescription`. The location form's step-up texts are removed from the three `location-management` catalogs.
- Locations stay on the Manage locations page.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: "Account page and its session gate" (six sections), "Profile settings" (read-only Profile, form in Edit profile), "Writes and the step-up" (only the profile update, the password change and the account deactivation and deletion), "Contact details form" (a `403` shows the generic error), "Contact section kept as one view" (no step-up notice).
- `offering-management`: "Location creation failures" (a `403` shows the generic form error).

## Non-goals

- No change to `auth`, `StepUpNotice`, `ProfileForm`'s, `PasswordForm`'s or `DangerZone`'s step-up, the new-offering form or the offering deletions.
- No proactive scope check before any write.
- No change to `contracts/openapi.yaml` or the API.
- Locations are not moved to the account page.
- No other backlog entry is folded in.

## Impact

- Modified (user-account): `src/features/user-account/api/contacts.ts`, `model/use-contact-form.ts`, `ui/ContactForm.tsx`, `ui/ContactSection.tsx`, `ui/ProfileForm.tsx`, `index.ts`, new `ui/ProfileDetails.tsx`, removed `ui/RoleRow.tsx`; `src/pages/account/ui/AccountClient.tsx`, `AccountScreen.tsx`; `messages/{es,en,ca}/account.json`.
- Modified (offering-management): `src/features/location-management/model/types.ts`, `model/submit-location.ts`, `ui/LocationForm.tsx`, `ui/LocationsPanel.tsx`; `src/pages/manage-locations/ui/ManageLocationsClient.tsx`, `ManageLocationsScreen.tsx`; `messages/{es,en,ca}/location-management.json`.
- Tests updated: `ContactSection.test.tsx` (the `403` test now asserts the generic error), `AccountClient.test.tsx` (six sections), `ProfileForm.test.tsx` (its role-row test moves to `ProfileDetails.test.tsx`), `LocationForm.test.tsx` (its step-up state test is deleted because the state no longer exists), `LocationsPanel.test.tsx`, `ManageLocationsClient.test.tsx` (props, texts and mocks only). Tests added: `ProfileDetails.test.tsx` (read-only rows), a `403` case in `submit-location.test.ts`.

## Propose status

- Change-id: `drop-step-up-for-everyday-writes`
- Date: 2026-10-08
- `openspec validate drop-step-up-for-everyday-writes --strict`: valid
- Resolves backlog entry: R59
- Resolved (Product owner, option A): only `POST /users/{user}/contacts` and `POST /locations` drop the step-up; the profile update, the password, the account deactivation and deletion, the offering creation and the offering deletions keep it.
- Resolved by the orchestrator on the design lead's recommendation, for Product owner's review: (1) the step-up stays reactive (a write goes with the current token and only a `403` shows the notice; no proactive gate); (2) locations stay on the Manage locations page, not on the account page.
- Deviation from the requested spec wording: OpenSpec 1.13.2 refuses a MODIFIED block that drops a scenario (and a requirement both REMOVED and ADDED), so the scenarios to remove keep their names with bodies rewritten to the new behaviour: user-account "The four sections" (Edit profile, Password, Security and Danger zone follow Contact details) and "Contact details is the second section" (Profile first, Contact details second), both consistent with the new "The six sections" and covered by its order test; "The creation is rejected for its scope" (a `403` shows the generic error, no step-up notice), covered by the updated `403` test; offering-management "Step-up after 403" (a `403` shows the generic form error, no notice), covered by the new `submit-location` `403` test, and "Confirming identity" (saving again resends with the current token, no write-scope sign in), which has no test of its own.
- Open: nothing.
