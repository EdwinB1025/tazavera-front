## MODIFIED Requirements

### Requirement: Registration result
A registration answered with `201` whose body carries a `token` block SHALL sign the user in with that block and, once the session is authenticated, SHALL open `/{locale}/account` through client-side navigation, never a full page load, with no confirmation text, for both registration roles. A `201` without a `token` block, or whose block does not sign the user in, SHALL replace the form with a success panel carrying a heading, a text and a "Sign in" action, and focus SHALL move to the panel's heading. Activating "Sign in" SHALL start sign in synchronously inside that click. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL keep every entered value except the password and its confirmation, which are cleared. Every other outcome — a server error, a network failure or any other status — SHALL show the generic form-level error above the actions, keep every entered value except the password and its confirmation, which are cleared, and render no message from the API.

#### Scenario: Signed in by the registration
- **WHEN** `POST /register` answers `201` with a `token` block that signs the user in
- **THEN** the session is authenticated and `/{locale}/account` opens through client-side navigation, with no success panel and no full page load

#### Scenario: The account is created
- **WHEN** `POST /register` answers `201` without a `token` block, or with one that does not sign the user in
- **THEN** the success panel replaces the form and focus moves to its heading

#### Scenario: Signing in from the success panel
- **WHEN** the user activates "Sign in" on the success panel
- **THEN** sign in starts synchronously inside that click and the user stays on the route

#### Scenario: The registration is rejected or fails
- **WHEN** `POST /register` answers a server error or any other status except `201` and `422`, or the request fails
- **THEN** the generic form-level error renders above the actions, every entered value is kept except the password and its confirmation, which are cleared, and the API's message is never rendered

#### Scenario: The registration names invalid fields
- **WHEN** `POST /register` answers `422` with a message for `email`
- **THEN** that message renders under the Email field, which is marked invalid, no generic form-level error renders, and the message clears when the user edits the Email field

### Requirement: Profile settings
The Profile section SHALL show the session user's name (`data.name`), surname (`data.surname`), email (`data.email`) and role (`data.role`) read-only, each as the API returns it, one labelled row per non-null value in that order, with no field to edit; right after the email row it SHALL show an "Email verification" row whose value is the text "Verified" when `data.emailVerifiedAt` is set and "Not verified" when it is null, and no such row when the field is absent, the state never shown by colour alone; followed by an "Edit profile" action. Activating "Edit profile" SHALL start the identity check synchronously inside that click for the return route `/{locale}/account?edit=1` and SHALL open that route, where the page is in edit mode. In edit mode the Edit profile section SHALL hold a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, followed by a "Done" action that returns the page to read mode on the same route without sending anything. The form SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`. Before sending, the form SHALL check only the email's format; no field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL keep the values. A server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

#### Scenario: The profile is shown read-only
- **WHEN** the Profile section renders for an authenticated session
- **THEN** it shows one labelled row each for Name, Surname, Email and Role, in that order, with the session user's values as the API returns them, no row for a null value, and no field to edit

#### Scenario: The role is shown as returned
- **WHEN** the Profile section renders for an authenticated session
- **THEN** its Role row shows `data.role` of the session user exactly as the API returns it

#### Scenario: A verified email
- **WHEN** the Profile section renders for a session user whose `data.emailVerifiedAt` is set
- **THEN** right after the Email row it shows an "Email verification" row with the text "Verified"

#### Scenario: An unverified email
- **WHEN** the Profile section renders for a session user whose `data.emailVerifiedAt` is null
- **THEN** right after the Email row it shows an "Email verification" row with the text "Not verified"

#### Scenario: No verification state
- **WHEN** the Profile section renders for a session user without `data.emailVerifiedAt`
- **THEN** it shows no "Email verification" row

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
- **THEN** no client check blocks the submission and the API's `422` shows its messages under the fields they name

#### Scenario: The profile is updated
- **WHEN** the update answers `200`
- **THEN** the fields keep the submitted values, the success status renders above the actions, and the session profile is refreshed from `GET /user`

#### Scenario: The update is rejected or fails
- **WHEN** the update answers a server error or any other status except `200`, `403` and `422`, or the request fails
- **THEN** the generic form-level error renders above the actions and the field values are kept

#### Scenario: The update names invalid fields
- **WHEN** the update answers `422` with a message for `email`
- **THEN** that message renders under the Email field, which is marked invalid, the values are kept, and the message clears when the user edits the Email field

### Requirement: Password change
The Password section SHALL collect the current password, a new password and its confirmation, and SHALL send `PUT /users/{data.ulid}/password` with `currentPassword`, `password` and `passwordConfirmation`, with an external link to the API's password reset under the current-password field. Before sending, the form SHALL check only the rules its request documents: the three fields are required and the confirmation equals the new password. A `200` SHALL clear the three fields and show the success status above the actions. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL clear the three fields. A server error, a network failure or any other status except `403` SHALL show the generic form-level error and clear the three fields.

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
- **WHEN** the change answers a server error or any other status except `200`, `403` and `422`, or the request fails
- **THEN** the generic form-level error renders and the three fields are cleared

#### Scenario: The change names invalid fields
- **WHEN** the change answers `422` with a message for `currentPassword`
- **THEN** that message renders under the current-password field, which is marked invalid, the three fields are cleared, and the message clears when the user edits that field

#### Scenario: The password-reset link
- **WHEN** the Password section renders
- **THEN** its "Forgot your password?" link opens the API's password reset page as an external navigation in the same tab, and the front sends no request for it

### Requirement: Contact details form
Activating "Add contact details" SHALL replace the empty text and the action with a form in the same section and move focus to its first field. The form SHALL collect Address, Postal code, City, Country, Phone, Email, Web and Social media, and SHALL send `POST /users/{data.ulid}/contacts` with `address`, `postal_code`, `city`, `country`, `phone`, `email`, `web` and `social`, an empty optional field being sent as `null`. Before sending, the form SHALL check only what the operation's request documents: Address and City are required, a non-empty email is a valid address, a non-empty web value is an absolute URL, and no field accepts more characters than its documented maximum (address 255, postal code 12, city 90, country 60, phone 25, email 255, web 255, social 255). A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending, the submit action SHALL show its busy state and "Cancel" SHALL be disabled. "Cancel" SHALL close the form, discard the typed values, show the empty state again and move focus to "Add contact details". A `201` SHALL close the form, show the success status above the created contact shown read-only and move focus to the section heading. A `409` SHALL close the form, show the text that a contact already exists, read the contact again and move focus to the section heading. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form (the API's `postal_code` names the Postal code field), and SHALL keep the values. A `403`, a server error, a network failure or any other status SHALL show the generic form-level error above the actions and keep the values.

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
- **WHEN** the request answers any status except `201`, `409` and `422`, or the request fails
- **THEN** the generic form-level error renders above the actions, every typed value is kept, no step-up notice renders, and the API's message is never rendered

#### Scenario: The creation names invalid fields
- **WHEN** the request answers `422` with a message for `city`
- **THEN** that message renders under the City field, which is marked invalid, every typed value is kept, no generic form-level error renders, and the message clears when the user edits the City field
