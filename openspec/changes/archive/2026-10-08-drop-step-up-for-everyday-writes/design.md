## Context

Backlog R59 (production AUT finding 27). The step-up is reactive: every write goes with the current token and only a `403` shows `StepUpNotice`, whose "Confirm identity" calls `requestProfileWrite`. The contract now lets `POST /users/{user}/contacts` and `POST /locations` run with `profile:read`, so their step-up branches go. Settled by Product owner (option A) and by the orchestrator on the design lead's recommendation.

## Decisions

### D1. Contact and location creation drop the step-up (both capabilities)

- `src/features/user-account/api/contacts.ts`: `ContactWrite` loses `stepUp`; a `403` maps to `error`.
- `model/use-contact-form.ts`: `ContactFormOutcome` is `"error" | null`.
- `ui/ContactForm.tsx`: no `StepUpNotice` branch, no `requestProfileWrite` or `locale` props, no `stepUpText`/`stepUpButton` in `ContactFormTexts`. `ui/ContactSection.tsx`: no `requestProfileWrite` or `locale` props; `src/pages/account/ui/AccountClient.tsx` stops passing them.
- `src/features/location-management/model/types.ts`: `SubmitState` loses `"step-up"`; `model/submit-location.ts`: a `403` is `{ status: "error" }`.
- `ui/LocationForm.tsx`: no `StepUpNotice` branch, no `requestProfileWrite` or `locale` props, no step-up texts; `ui/LocationsPanel.tsx`: no `requestProfileWrite` or `locale` props; `src/pages/manage-locations/ui/ManageLocationsClient.tsx` stops passing them (it keeps `locale` for the sign-in route) and `ManageLocationsScreen.tsx` stops loading the step-up texts, which leave `messages/{es,en,ca}/location-management.json`.
- Kept: `ProfileForm`, `PasswordForm`, `DangerZone`, `NewOfferingForm`, the offering deletions, `authorize.ts`, `StepUpNotice` and the step-up keys of `messages/*/account.json`.

### D2. Account page in six section cards (user-account)

- Order: Profile, Contact details, Edit profile, Password, Security, Danger zone; the same `AccountSection` card, one column, `flex flex-col gap-4` as today.
- Profile: heading `profileHeading`, no description. A new `src/features/user-account/ui/ProfileDetails.tsx` renders `<dl className="grid gap-y-3">` with one `LabelValueRow` (`@/shared/ui`) per non-null value among `name`, `surname`, `email` and `role` of the session user, in that order, labelled `nameLabel`, `surnameLabel`, `emailLabel` and `roleLabel` — the same pattern as `ContactDetails`.
- Edit profile: heading `editProfileHeading` (new key in `messages/{locale}/account.json`: es "Editar perfil", en "Edit profile", ca "Editar el perfil"), description `profileDescription`; content is `ProfileForm` without the role row. `RoleRow.tsx` is deleted, with its exports from the slice index; `roleLabel` leaves `ProfileFormTexts` and moves to the `ProfileDetails` texts.
