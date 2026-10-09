## MODIFIED Requirements

### Requirement: Profile settings
The Profile section SHALL show the session user's name (`data.name`), surname (`data.surname`), email (`data.email`) and role (`data.role`) read-only, each as the API returns it, one labelled row per non-null value in that order, with no field to edit, followed by an "Edit profile" action. Activating "Edit profile" SHALL start the identity check synchronously inside that click for the return route `/{locale}/account?edit=1` and SHALL open that route, where the page is in edit mode. In edit mode the Edit profile section SHALL hold a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, followed by a "Done" action that returns the page to read mode on the same route without sending anything. The form SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`. Before sending, the form SHALL check only the email's format; no field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422`, a server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: The profile is shown read-only
- **WHEN** the Profile section renders for an authenticated session
- **THEN** it shows one labelled row each for Name, Surname, Email and Role, in that order, with the session user's values as the API returns them, no row for a null value, and no field to edit

#### Scenario: The role is shown as returned
- **WHEN** the Profile section renders for an authenticated session
- **THEN** its Role row shows `data.role` of the session user exactly as the API returns it

#### Scenario: Opening edit mode
- **WHEN** the user activates "Edit profile"
- **THEN** the identity check starts synchronously inside that click for `/{locale}/account?edit=1` and that route opens

#### Scenario: Closing edit mode
- **WHEN** the user activates "Done" in edit mode
- **THEN** `/{locale}/account` opens in read mode and nothing is sent

#### Scenario: The form is prefilled from the session
- **WHEN** the Edit profile section renders for an authenticated session
- **THEN** its three fields hold `data.name`, `data.surname` and `data.email` of the session user

#### Scenario: Only the email format is checked
- **WHEN** the user submits the profile form with an email value that is not a valid address
- **THEN** the email field shows the email-format message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: An emptied field reaches the API
- **WHEN** the user empties any field of the profile form and submits
- **THEN** no client check blocks the submission and the API's `422` shows the generic form-level error

#### Scenario: The profile is updated
- **WHEN** the update answers `200`
- **THEN** the fields keep the submitted values, the success status renders above the actions, and the session profile is refreshed from `GET /user`

#### Scenario: The update is rejected or fails
- **WHEN** the update answers `422`, a server error or any other status except `403`, or the request fails
- **THEN** the generic form-level error renders above the actions and the field values are kept

### Requirement: Writes and the step-up
The profile update, the password change and the account deactivation and deletion SHALL be sent with the current token. The identity check — the write-scope sign in — SHALL also start before edit mode opens and before the Change password view opens; the front SHALL not track which scope the token holds, so it starts on every "Edit profile" and "Change password" activation. When one of the writes answers `403`, the step-up notice — its text and a "Confirm identity" action — SHALL render inside the section that sent the write, above its actions row, or inside the open dialog's error area for the destructive actions. Activating "Confirm identity" SHALL start the write-scope sign in synchronously inside that click for the account route, keeping the page and any input typed on it; after signing in again the user activates the action again and the write carries the new token. No other account write SHALL show the step-up notice.

#### Scenario: A write is rejected for its scope
- **WHEN** the profile update, the password change, or a confirmed deactivation or deletion answers `403`
- **THEN** the step-up notice renders inside the section that sent the write, above its actions row, or inside the open dialog's error area, and the dialog stays open

#### Scenario: Confirming identity
- **WHEN** the user activates "Confirm identity"
- **THEN** the write-scope sign in starts synchronously inside that click for the account route, keeping the page and any input typed on it

#### Scenario: The write is activated again
- **WHEN** the write-scope sign in has completed and the user activates the action again
- **THEN** the write is sent with the new token

## ADDED Requirements

### Requirement: Account page modes and their session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, the sections of its mode, each named by its heading. In read mode, the default, the sections SHALL be Profile, Contact details and Security, in that order; the Profile section is read-only and filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. In edit mode, `/{locale}/account?edit=1`, the profile form SHALL take the place of the read-only profile and the Danger zone SHALL follow Security. Each of the sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the section cards SHALL be 1rem apart with the page background showing between them. The heading block and the section cards SHALL fill the page container's width; from the medium breakpoint the content of each section card SHALL be at most 40rem wide, aligned to the card's start. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

#### Scenario: The session is resolving
- **WHEN** the account page opens while the session is still resolving
- **THEN** the heading block and one section card with no header band, holding the loading status, render in place of the sections

#### Scenario: Signed out
- **WHEN** the account page is open and the session is anonymous
- **THEN** one section card with no header band shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

#### Scenario: Signing in from the account page
- **WHEN** the user activates "Sign in" on the account page
- **THEN** sign in starts synchronously inside that click for the route the user is on, and the user stays on the page

#### Scenario: The session ends while the page is open
- **WHEN** the session becomes `anonymous` while the account page is open
- **THEN** the page shows the signed-out state, whatever ended the session

#### Scenario: The read-mode sections
- **WHEN** the session is authenticated and the page is in read mode
- **THEN** the page shows Profile, Contact details and Security in that order, each named by its heading, with no profile form, no Password section and no Danger zone

#### Scenario: The edit-mode sections
- **WHEN** the session is authenticated and the page is in edit mode
- **THEN** the page shows Edit profile, Contact details, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections hang from the page background
- **WHEN** the session is authenticated
- **THEN** the sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

#### Scenario: Sections fill the container
- **WHEN** the session is authenticated on a medium or larger viewport
- **THEN** the section cards span the page container's width and each card's content is at most 40rem wide, start-aligned


### Requirement: Grouped security section
The Security section SHALL carry a short text covering the password, two-factor authentication and passkeys, and three entries in order: "Change password", which starts the identity check synchronously inside the click for `/{locale}/account/password` and opens that route; "Two-factor authentication" and "Passkeys", each opening the API's security page as an external navigation in the same tab. The front SHALL send no request for the external entries.

#### Scenario: Changing the password
- **WHEN** the user activates "Change password"
- **THEN** the identity check starts synchronously inside that click for `/{locale}/account/password` and that route opens

#### Scenario: Two-factor authentication and passkeys
- **WHEN** the Security section renders
- **THEN** its "Two-factor authentication" and "Passkeys" entries open the API's security page as an external navigation in the same tab and no request is sent by the front


### Requirement: Change password view
The application SHALL offer the Change password view at `/{locale}/account/password`, with the account page's session gate and page shell: a back link to `/{locale}/account`, a heading block, and, for an authenticated session, one section card named "Change password" holding the password form of "Password change", its states and its reactive step-up unchanged.

#### Scenario: The password form
- **WHEN** the Change password view opens for an authenticated session
- **THEN** one section named "Change password" shows the current-password, new-password and confirmation fields of the password form

#### Scenario: Back to the account
- **WHEN** the Change password view renders and the user has no previous page of the application
- **THEN** its back link addresses `/{locale}/account`

#### Scenario: The view's session gate
- **WHEN** the Change password view opens and the session is anonymous
- **THEN** one section card with no header band shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

## REMOVED Requirements

### Requirement: Account page and its session gate
**Reason**: Product owner's AUT (backlog R65, 2026-10-09): the account page gets a read mode and an edit mode, so the scenarios "The six sections", "The four sections" and "Contact details is the second section" no longer hold. The OpenSpec CLI refuses a MODIFIED block that drops a scenario, so the requirement is replaced by "Account page modes and their session gate".
**Migration**: "Account page modes and their session gate" under ADDED Requirements replaces it, keeping every other scenario unchanged and adding "The read-mode sections" and "The edit-mode sections".

### Requirement: Security section
**Reason**: Product owner's AUT (backlog R65, 2026-10-09): the single "Manage security" link (scenario "The security link") is replaced by three entries.
**Migration**: "Grouped security section" under ADDED Requirements replaces it.
