# user-account Specification

## Purpose
Lets a visitor create a Tazavera account as a specialist or as a coffeeshop, and lets a signed-in user manage it: view and edit the profile, change the password, reach the API's security settings, and deactivate or delete the account.

## Requirements

### Requirement: Registration routes
The application SHALL offer registration as a specialist at `/{locale}/register` and as a coffeeshop at `/{locale}/register/coffeeshop`, reachable from the entry page and the About us page, and each route SHALL send its own role with the registration. While the session is resolving a registration route SHALL wait with no form shown, and when the session is authenticated the application SHALL open the root of the active locale through client-side navigation. Each registration route SHALL present the loading status, the form and the success panel in one section card with no header band.

#### Scenario: The specialist route registers a specialist
- **WHEN** a visitor submits the registration form on `/{locale}/register`
- **THEN** the registration is sent with `role: "specialist"`

#### Scenario: The coffeeshop route registers a coffeeshop
- **WHEN** a visitor submits the registration form on `/{locale}/register/coffeeshop`
- **THEN** the registration is sent with `role: "coffeeshop"`

#### Scenario: The session is resolving
- **WHEN** a registration route opens while the session is still resolving
- **THEN** the heading and the loading status render and no form is shown until the session settles

#### Scenario: A signed-in visitor is taken to the entry page
- **WHEN** a registration route opens with an authenticated session, including right after signing in from the success panel
- **THEN** the application opens the root of the active locale through client-side navigation, with no reload and no message

#### Scenario: The registration card
- **WHEN** a registration route renders while the session resolves, while it shows the form, or after a `201` has replaced the form with the success panel
- **THEN** that content sits in one section card with no header band

### Requirement: Registration form
The registration form SHALL collect name, surname, email, password and password confirmation, and SHALL send `POST /register` without credentials with `name`, `surname`, `email`, `password`, `passwordConfirmation` and the route's `role`. Before sending, the form SHALL check only the rules its request documents: the five fields are required, the email is a valid address and the confirmation equals the password. A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending the submit action SHALL show its busy state and the fields SHALL stay editable.

#### Scenario: An empty required field
- **WHEN** the user submits the form with an empty required field
- **THEN** the field shows the required-field message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: An invalid email
- **WHEN** the user submits the form with an email that is not a valid address
- **THEN** the email field shows the email-format message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: A mismatched confirmation
- **WHEN** the user submits the form with a password confirmation that differs from the password
- **THEN** the confirmation field shows the mismatch message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: The request carries the form and the route's role
- **WHEN** every check passes and the user submits the form
- **THEN** `POST /register` is sent without credentials with the five field values and the route's role, and the submit action shows its busy state while the fields stay editable

### Requirement: Registration result
A registration answered with `201` SHALL replace the form with a success panel carrying a heading, a text and a "Sign in" action, and focus SHALL move to the panel's heading. Activating "Sign in" SHALL start sign in synchronously inside that click. Every other outcome — a `422`, a server error, a network failure or any other status — SHALL show the generic form-level error above the actions, keep every entered value except the password and its confirmation, which are cleared, and render no message from the API.

#### Scenario: The account is created
- **WHEN** `POST /register` answers `201`
- **THEN** the success panel replaces the form and focus moves to its heading

#### Scenario: Signing in from the success panel
- **WHEN** the user activates "Sign in" on the success panel
- **THEN** sign in starts synchronously inside that click and the user stays on the route

#### Scenario: The registration is rejected or fails
- **WHEN** `POST /register` answers `422`, a server error or any other status, or the request fails
- **THEN** the generic form-level error renders above the actions, every entered value is kept except the password and its confirmation, which are cleared, and the API's message is never rendered

### Requirement: Account page and its session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, four sections in order — Profile, Password, Security and Danger zone — each named by its heading and filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. Each of the four sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the four section cards SHALL be 1rem apart with the page background showing between them. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

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

#### Scenario: The four sections
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections hang from the page background
- **WHEN** the session is authenticated
- **THEN** the four sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

### Requirement: Profile settings
The Profile section SHALL show the user's `data.role` as the API returns it, as a read-only value, and a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, which SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`. Before sending, the form SHALL check only the email's format; no field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422`, a server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: The role is shown as returned
- **WHEN** the Profile section renders for an authenticated session
- **THEN** it shows `data.role` of the session user exactly as the API returns it

#### Scenario: The form is prefilled from the session
- **WHEN** the Profile section renders for an authenticated session
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

### Requirement: Password change
The Password section SHALL collect the current password, a new password and its confirmation, and SHALL send `PUT /users/{data.ulid}/password` with `currentPassword`, `password` and `passwordConfirmation`, with an external link to the API's password reset under the current-password field. Before sending, the form SHALL check only the rules its request documents: the three fields are required and the confirmation equals the new password. A `200` SHALL clear the three fields and show the success status above the actions. A `422`, a server error, a network failure or any other status except `403` SHALL show the generic form-level error and clear the three fields.

#### Scenario: An empty required field
- **WHEN** the user submits the password form with an empty field
- **THEN** the field shows the required-field message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: A mismatched confirmation
- **WHEN** the user submits the password form with a confirmation that differs from the new password
- **THEN** the confirmation field shows the mismatch message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: The password is changed
- **WHEN** the change answers `200`
- **THEN** the three fields are cleared and the success status renders above the actions

#### Scenario: The change is rejected or fails
- **WHEN** the change answers `422`, a server error or any other status except `403`, or the request fails
- **THEN** the generic form-level error renders and the three fields are cleared

#### Scenario: The password-reset link
- **WHEN** the Password section renders
- **THEN** its "Forgot your password?" link opens the API's password reset page as an external navigation in the same tab, and the front sends no request for it

### Requirement: Security section
The Security section SHALL carry a short text and a "Manage security" action that opens the API's security page as an external navigation in the same tab. The front SHALL send no request for it.

#### Scenario: The security link
- **WHEN** the Security section renders
- **THEN** its "Manage security" action opens the API's security page as an external navigation in the same tab and no request is sent by the front

### Requirement: Account deactivation and deletion
The Danger zone SHALL offer deactivation and permanent deletion, each with its heading, its explanation and one action. Activating the action SHALL open its confirmation dialog and send nothing before the user confirms. While a confirmed request is pending, the dialog's confirm action SHALL show its busy state, its cancel action SHALL be disabled and Escape SHALL not close the dialog. A `200` SHALL sign the user out — the session becomes `anonymous` and the user lands on the root of the active locale — with no message shown there. A server error or a network failure SHALL show the generic error inside the dialog and allow retry.

#### Scenario: Confirming deactivation
- **WHEN** the user confirms deactivation in its dialog
- **THEN** `DELETE /users/{data.ulid}` is sent, and nothing was sent before the confirmation

#### Scenario: Confirming deletion
- **WHEN** the user confirms deletion in its dialog
- **THEN** `DELETE /users/{data.ulid}/force` is sent, and nothing was sent before the confirmation

#### Scenario: The pending confirmation
- **WHEN** a confirmed request is pending
- **THEN** the dialog's confirm action shows its busy state, its cancel action is disabled and Escape does not close the dialog

#### Scenario: The account is deactivated or deleted
- **WHEN** a confirmed request answers `200`
- **THEN** the user is signed out and lands on the root of the active locale, with no message shown there

#### Scenario: The destructive action fails
- **WHEN** a confirmed request answers a server error or the request fails
- **THEN** the dialog stays open with the generic error and the user may retry

### Requirement: Writes and the step-up
Every account write SHALL be sent with the current token. When a write answers `403`, the step-up notice — its text and a "Confirm identity" action — SHALL render inside the section that sent the write, above its actions row, or inside the open dialog's error area for the destructive actions. Activating "Confirm identity" SHALL start the write-scope sign in synchronously inside that click for the account route, keeping the page and any input typed on it; after signing in again the user activates the action again and the write carries the new token.

#### Scenario: A write is rejected for its scope
- **WHEN** an account write answers `403`
- **THEN** the step-up notice renders inside the section that sent the write, above its actions row, or inside the open dialog's error area, and the dialog stays open

#### Scenario: Confirming identity
- **WHEN** the user activates "Confirm identity"
- **THEN** the write-scope sign in starts synchronously inside that click for the account route, keeping the page and any input typed on it

#### Scenario: The write is activated again
- **WHEN** the write-scope sign in has completed and the user activates the action again
- **THEN** the write is sent with the new token
