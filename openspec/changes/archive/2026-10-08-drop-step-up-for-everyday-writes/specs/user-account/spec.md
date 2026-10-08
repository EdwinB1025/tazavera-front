## MODIFIED Requirements

### Requirement: Account page and its session gate
The account page at `/{locale}/account` SHALL show one heading block and, for an authenticated session, six sections in order — Profile, Contact details, Edit profile, Password, Security and Danger zone — each named by its heading; the Profile section is read-only and filled from the session user's `data.name`, `data.surname`, `data.email` and `data.role`. Each of the sections SHALL be a section card whose header band holds its heading and, where it has one, its description, and the section cards SHALL be 1rem apart with the page background showing between them. The heading block and the section cards SHALL fill the page container's width; from the medium breakpoint the content of each section card SHALL be at most 40rem wide, aligned to the card's start. While the session is resolving, the page SHALL show the heading block and one section card with no header band, holding the loading status, in place of the sections. While the session is anonymous — including after a declined step-up or a write whose `401` no recovery resolves — the page SHALL show the heading block and one section card with no header band, holding the signed-out text and a "Sign in" action, with no automatic redirect.

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

#### Scenario: The six sections
- **WHEN** the session is authenticated
- **THEN** the page shows Profile, Contact details, Edit profile, Password, Security and Danger zone in that order, each named by its heading

#### Scenario: The four sections
- **WHEN** the session is authenticated
- **THEN** Edit profile, Password, Security and Danger zone follow Contact details in that order, each named by its heading

#### Scenario: Sections hang from the page background
- **WHEN** the session is authenticated
- **THEN** the sections render as section cards 1rem apart with the page background showing between them, each card's header band holds its heading and, where it has one, its description, and the heading block sits 2rem above the sections

#### Scenario: The gate card has no header band
- **WHEN** the account page shows its loading card or its signed-out card
- **THEN** the card is a section card with no header band and its content sits in the card body

#### Scenario: Contact details is the second section
- **WHEN** the session is authenticated
- **THEN** the read-only Profile section comes first and Contact details second, each named by its heading

#### Scenario: Sections fill the container
- **WHEN** the session is authenticated on a medium or larger viewport
- **THEN** the section cards span the page container's width and each card's content is at most 40rem wide, start-aligned

### Requirement: Profile settings
The Profile section SHALL show the session user's name (`data.name`), surname (`data.surname`), email (`data.email`) and role (`data.role`) read-only, each as the API returns it, one labelled row per non-null value in that order, with no field to edit. The Edit profile section SHALL hold a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, which SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`. Before sending, the form SHALL check only the email's format; no field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422`, a server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: The profile is shown read-only
- **WHEN** the Profile section renders for an authenticated session
- **THEN** it shows one labelled row each for Name, Surname, Email and Role, in that order, with the session user's values as the API returns them, no row for a null value, and no field to edit

#### Scenario: The role is shown as returned
- **WHEN** the Profile section renders for an authenticated session
- **THEN** its Role row shows `data.role` of the session user exactly as the API returns it

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
The profile update, the password change and the account deactivation and deletion SHALL be sent with the current token. When one of them answers `403`, the step-up notice — its text and a "Confirm identity" action — SHALL render inside the section that sent the write, above its actions row, or inside the open dialog's error area for the destructive actions. Activating "Confirm identity" SHALL start the write-scope sign in synchronously inside that click for the account route, keeping the page and any input typed on it; after signing in again the user activates the action again and the write carries the new token. No other account write SHALL show the step-up notice.

#### Scenario: A write is rejected for its scope
- **WHEN** the profile update, the password change, or a confirmed deactivation or deletion answers `403`
- **THEN** the step-up notice renders inside the section that sent the write, above its actions row, or inside the open dialog's error area, and the dialog stays open

#### Scenario: Confirming identity
- **WHEN** the user activates "Confirm identity"
- **THEN** the write-scope sign in starts synchronously inside that click for the account route, keeping the page and any input typed on it

#### Scenario: The write is activated again
- **WHEN** the write-scope sign in has completed and the user activates the action again
- **THEN** the write is sent with the new token

### Requirement: Contact details form
Activating "Add contact details" SHALL replace the empty text and the action with a form in the same section and move focus to its first field. The form SHALL collect Address, Postal code, City, Country, Phone, Email, Web and Social media, and SHALL send `POST /users/{data.ulid}/contacts` with `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, an empty optional field being sent as `null`. Before sending, the form SHALL check only what the operation's request documents: Address and City are required, a non-empty email is a valid address, a non-empty web value is an absolute URL, and no field accepts more characters than its documented maximum (address 255, postal code 12, city 90, country 60, phone 25, email 255, web 255, social 255). A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending, the submit action SHALL show its busy state and "Cancel" SHALL be disabled. "Cancel" SHALL close the form, discard the typed values, show the empty state again and move focus to "Add contact details". A `201` SHALL close the form, show the success status above the created contact shown read-only and move focus to the section heading. A `409` SHALL close the form, show the text that a contact already exists, read the contact again and move focus to the section heading. A `403`, a `422`, a server error, a network failure or any other status SHALL show the generic form-level error above the actions and keep the values.

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
- **THEN** the generic form-level error renders above the actions, every typed value is kept, and no step-up notice renders

#### Scenario: The creation is rejected or fails
- **WHEN** the request answers any status except `201` and `409`, or the request fails
- **THEN** the generic form-level error renders above the actions, every typed value is kept, no step-up notice renders, and the API's message is never rendered

### Requirement: Contact section kept as one view
The Contact details section SHALL render its states — reading, read error with "Try again", empty with "Add contact details", the add form with its errors and generic error, and the read-only contact with its saved or exists status — with the same markup, texts, accessible names and focus moves, and SHALL send the contact read and creation and map their response statuses to outcomes in the account feature's request layer, never in the screen that shows them, however the section is organised internally. This requirement adds no behaviour: every state keeps what the "Contact details" and "Contact details form" requirements state.

#### Scenario: Contact states render as before
- **WHEN** the Contact details section renders for a given read response, form input and creation response
- **THEN** it shows the same state, texts, accessible names and focused element as before the refactor

#### Scenario: Contact requests unchanged
- **WHEN** the section reads the contacts or creates the primary contact
- **THEN** the API receives the same method, path, headers and body as before the refactor, and the status is mapped to an outcome by the account feature's request layer
