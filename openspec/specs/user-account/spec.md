# user-account Specification

## Purpose
Lets a visitor create a Tazavera account as a specialist or as a coffeeshop, and lets a signed-in user manage it: view and edit the profile, change the password, reach the API's security settings, and deactivate or delete the account.

## Requirements

### Requirement: Registration routes
The application SHALL offer registration as a specialist at `/{locale}/register` and as a coffeeshop at `/{locale}/register/coffeeshop`, reachable from the entry page and the About us page, and each route SHALL send its own role with the registration. While the session is resolving a registration route SHALL wait with no form shown, and when the session is authenticated the application SHALL open the root of the active locale through client-side navigation. Each registration route SHALL present the loading status, the form and the success panel in one section card with no header band. The registration card SHALL fill the page container's width, its content at most 40rem wide from the medium breakpoint.

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
- **THEN** that content sits in one section card with no header band that spans the page container's width, and from the medium breakpoint that content is at most 40rem wide

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
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, five sections in order — Profile, Contact details, Password, Security and Danger zone — each named by its heading; the Profile section is filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. Each of the five sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the five section cards SHALL be 1rem apart with the page background showing between them. The heading block and the section cards SHALL fill the page container's width; from the medium breakpoint the content of each section card SHALL be at most 40rem wide, aligned to the card's start. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

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
- **THEN** the five sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

#### Scenario: Contact details is the second section
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Contact details, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: Sections fill the container
- **WHEN** the session is authenticated on a medium or larger viewport
- **THEN** the section cards span the page container's width and each card's content is at most 40rem wide, start-aligned

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

### Requirement: Contact details
The Contact details section SHALL read `GET /users/{data.ulid}/contacts` with the current token when it renders for an authenticated session and SHALL show the item of `data` whose `isPrimary` is `true`. While the read is pending the section SHALL show the loading status. A read answered with a primary contact SHALL show its non-null values read-only, one labelled row each, in the order Address (`address`), Postal code (`postalCode`), City (`city`), Country (`country`), Phone (`phone`), Email (`email`), Web (`web`) and Social media (`social`), each as the API returns it; the web value SHALL be a same-tab link only when it starts with `http://` or `https://`, and text otherwise. A read with no primary contact, or with one whose eight values are all null, SHALL show the empty text and an "Add contact details" action. A read that fails — a network failure, a server error, a `403` or any other status — SHALL show the section's error text and a "Try again" action that repeats the read, while the rest of the page keeps working. A `401` SHALL never be shown: the client's recovery chain runs and an `anonymous` end shows the page's signed-out state. The section SHALL render no message from the API.

#### Scenario: The contact is loading
- **WHEN** the Contact details section renders and the read is pending
- **THEN** the section shows the loading status and no contact, empty text or form

#### Scenario: A saved contact is shown read-only
- **WHEN** the read answers `200` with a `data` item whose `isPrimary` is `true`
- **THEN** the section shows that item's non-null values, one labelled row each, in the order Address, Postal code, City, Country, Phone, Email, Web and Social media, with no form and no action to edit

#### Scenario: A null value has no row
- **WHEN** the primary contact has `web` null and every other value set
- **THEN** the section shows seven rows and none for Web

#### Scenario: A web address becomes a link only for http and https
- **WHEN** the primary contact's `web` starts with `http://` or `https://`
- **THEN** the Web row shows it as a link that opens in the same tab, and any other value is shown as text and is never a link

#### Scenario: No contact yet
- **WHEN** the read answers `200` with `{ data: [] }`, or with no item whose `isPrimary` is `true`
- **THEN** the section shows the empty text and the "Add contact details" action

#### Scenario: The read fails
- **WHEN** the read answers a server error, a `403` or any other non-success status, or the request fails
- **THEN** the section shows its error text and a "Try again" action, and the other sections keep working

#### Scenario: Trying again
- **WHEN** the user activates "Try again"
- **THEN** the section shows the loading status and repeats the read

### Requirement: Contact details form
Activating "Add contact details" SHALL replace the empty text and the action with a form in the same section and move focus to its first field. The form SHALL collect Address, Postal code, City, Country, Phone, Email, Web and Social media, and SHALL send `POST /users/{data.ulid}/contacts` with `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, an empty optional field being sent as `null`. Before sending, the form SHALL check only what the operation's request documents: Address and City are required, a non-empty email is a valid address, a non-empty web value is an absolute URL, and no field accepts more characters than its documented maximum (address 255, postal code 12, city 90, country 60, phone 25, email 255, web 255, social 255). A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending, the submit action SHALL show its busy state and "Cancel" SHALL be disabled. "Cancel" SHALL close the form, discard the typed values, show the empty state again and move focus to "Add contact details". A `201` SHALL close the form, show the success status above the created contact shown read-only and move focus to the section heading. A `409` SHALL close the form, show the text that a contact already exists, read the contact again and move focus to the section heading. A `403` follows "Writes and the step-up". A `422`, a server error, a network failure or any other status SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: Opening the form
- **WHEN** the user activates "Add contact details"
- **THEN** the form replaces the empty text and the action, and focus moves to the Address field

#### Scenario: A required field is empty
- **WHEN** the user submits the form with Address or City empty or only spaces
- **THEN** the field shows the required-field message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: An invalid email or web address
- **WHEN** the user submits the form with an email that is not a valid address or a web value that is not an absolute URL
- **THEN** the field shows its format message and is marked invalid, focus moves to the first failing field, and nothing is sent

#### Scenario: Maximum lengths
- **WHEN** the user types or pastes into a field more characters than its documented maximum
- **THEN** the field keeps at most that many characters

#### Scenario: The request carries the form
- **WHEN** every check passes and the user submits the form
- **THEN** `POST /users/{data.ulid}/contacts` is sent with the current token and the eight values under `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, each empty optional value as `null`, the submit action shows its busy state and "Cancel" is disabled

#### Scenario: Cancelling
- **WHEN** the user activates "Cancel" on the open form
- **THEN** the form closes, the typed values are discarded, the empty text and "Add contact details" render again and focus moves to "Add contact details"

#### Scenario: The contact is created
- **WHEN** the request answers `201`
- **THEN** the form closes, the success status renders above the created contact shown read-only, and focus moves to the section heading

#### Scenario: A contact already exists
- **WHEN** the request answers `409`
- **THEN** the form closes, the text that a contact already exists renders as a status, the contact is read again and shown read-only below it, and focus moves to the section heading

#### Scenario: The creation is rejected for its scope
- **WHEN** the request answers `403`
- **THEN** the step-up notice renders above the form's actions and every typed value is kept

#### Scenario: The creation is rejected or fails
- **WHEN** the request answers `422`, a server error or any other status except `201`, `403` and `409`, or the request fails
- **THEN** the generic form-level error renders above the actions, every typed value is kept, and the API's message is never rendered

### Requirement: Account requests through the slice's request layer
The registration form, the profile form, the password form and the account deactivation and deletion SHALL send their requests and map the response statuses to outcomes in the account feature's request layer, never in the screens that show them, and the registration and password forms SHALL share one new-password and confirmation fields part. What users see (markup, accessible names, texts and the message shown per status) and the requests sent to the API (method, path, body and headers) SHALL stay the same.

#### Scenario: Account write sent through the request layer
- **WHEN** a user submits the registration, profile or password form, or confirms the account deactivation or deletion
- **THEN** the request is sent and its status mapped to an outcome by the account feature's request layer, and the screen only shows the outcome

#### Scenario: Requests and outcomes unchanged
- **WHEN** any of those writes receives a given status, or fails on the network
- **THEN** the API receives the same method, path, body and headers as before the refactor, and the user sees the same outcome

#### Scenario: Shared new-password fields
- **WHEN** the registration form or the password form is shown
- **THEN** both render the new password with its help and the confirmation from one shared part, with the same labels, attributes and errors as before the refactor

### Requirement: Contact section kept as one view
The Contact details section SHALL render its states — reading, read error with "Try again", empty with "Add contact details", the add form with its errors, generic error and step-up notice, and the read-only contact with its saved or exists status — with the same markup, texts, accessible names and focus moves, and SHALL send the contact read and creation and map their response statuses to outcomes in the account feature's request layer, never in the screen that shows them, however the section is organised internally. This requirement adds no behaviour: every state keeps what the "Contact details" and "Contact details form" requirements state.

#### Scenario: Contact states render as before
- **WHEN** the Contact details section renders for a given read response, form input and creation response
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor

#### Scenario: Contact requests unchanged
- **WHEN** the section reads the contacts or creates the primary contact
- **THEN** the API receives the same method, path, headers and body as before the refactor, and the status is mapped to an outcome by the account feature's request layer
