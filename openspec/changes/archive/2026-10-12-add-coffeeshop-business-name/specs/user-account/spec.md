## MODIFIED Requirements

### Requirement: Registration form
The registration form SHALL collect name, surname, email, password and password confirmation, and on the coffeeshop route also the business name, after surname and before email. It SHALL send `POST /register` without credentials with `name`, `surname`, `email`, `password`, `passwordConfirmation` and the route's `role`, and on the coffeeshop route also `businessName`; the specialist route never sends `businessName`. Before sending, the form SHALL check only the rules its request documents: every field of the form is required, the business name keeps at most 150 characters, the email is a valid address and the confirmation equals the password. A failing check SHALL show its message under the field, mark the field as invalid, move focus to the first failing field and send nothing. While the request is pending the submit action SHALL show its busy state and the fields SHALL stay editable.

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
- **THEN** `POST /register` is sent without credentials with the form's field values and the route's role, and the submit action shows its busy state while the fields stay editable

### Requirement: Profile settings
The Profile section SHALL show the session user's name (`data.name`), surname (`data.surname`), for a coffee shop (`data.role` is `coffeeshop`) its business name (`data.businessName`), email (`data.email`) and role (`data.role`) read-only, each as the API returns it, one labelled row per non-null value in that order, with no field to edit; right after the email row it SHALL show an "Email verification" row whose value is the text "Verified" when `data.emailVerifiedAt` is set and "Not verified" when it is null, and no such row when the field is absent, the state never shown by colour alone; followed by an "Edit profile" action. Activating "Edit profile" SHALL start the identity check synchronously inside that click for the return route `/{locale}/account?edit=1` and SHALL open that route, where the page is in edit mode. In edit mode the Edit profile section SHALL hold a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, and for a coffee shop also the business name after surname and before email, prefilled with `data.businessName`, followed by a "Done" action that returns the page to read mode on the same route without sending anything. The form SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`, and for a coffee shop also `businessName`; for any other role it never sends `businessName`. Before sending, the form SHALL check only the email's format and, for a coffee shop, that the business name is not empty; the business name keeps at most 150 characters and no other field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL keep the values. A server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

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
- **THEN** its name, surname and email fields hold `data.name`, `data.surname` and `data.email` of the session user

#### Scenario: Only the email format is checked
- **WHEN** the user submits the profile form with an email value that is not a valid address
- **THEN** the email field shows the email-format message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: An emptied field reaches the API
- **WHEN** the user empties the name, surname or email field of the profile form and submits
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

## ADDED Requirements

### Requirement: Coffee shop business name
The coffee shop's business name SHALL be collected at registration and managed in the account page only for the coffeeshop role, labelled "Business name" in the active locale ("Nombre comercial", "Business name", "Nom comercial"), as a required text field that keeps at most 150 characters. Its value SHALL be sent as `businessName`, and a `422` message for `businessName` SHALL render under that field like the other fields' messages. For any other role the business name SHALL be neither shown nor sent.

#### Scenario: The coffee shop registration asks for the business name
- **WHEN** the registration form renders on `/{locale}/register/coffeeshop`
- **THEN** a required "Business name" field sits after Surname and before Email and keeps at most 150 characters

#### Scenario: An empty business name at registration
- **WHEN** the user submits the coffee shop registration form with an empty business name and every other field valid
- **THEN** the Business name field shows the required-field message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: The coffee shop registration sends the business name
- **WHEN** every check passes and the user submits the coffee shop registration form
- **THEN** `POST /register` carries the business name as `businessName` with `role: "coffeeshop"`

#### Scenario: The specialist registration has no business name
- **WHEN** the user submits the registration form on `/{locale}/register`
- **THEN** the form shows no Business name field and `POST /register` carries no `businessName`

#### Scenario: The registration names an invalid business name
- **WHEN** `POST /register` answers `422` with a message for `businessName`
- **THEN** that message renders under the Business name field, which is marked invalid, and no generic form-level error renders

#### Scenario: A coffee shop's business name is shown
- **WHEN** the Profile section renders for a session user whose `data.role` is `coffeeshop` and whose `data.businessName` is set
- **THEN** a "Business name" row shows `data.businessName` after the Surname row and before the Email row

#### Scenario: No business name for other roles
- **WHEN** the Profile section renders for a session user whose `data.role` is not `coffeeshop`
- **THEN** it shows no "Business name" row

#### Scenario: The coffee shop's profile form holds the business name
- **WHEN** the Edit profile section renders for a session user whose `data.role` is `coffeeshop`
- **THEN** a required "Business name" field after Surname and before Email holds `data.businessName` and keeps at most 150 characters

#### Scenario: An emptied business name in the profile
- **WHEN** a coffee shop empties the Business name field of the profile form and submits
- **THEN** the field shows the required-field message and is marked invalid, focus moves to it, and nothing is sent

#### Scenario: The coffee shop's update sends the business name
- **WHEN** a coffee shop submits the profile form
- **THEN** `PUT /users/{data.ulid}` carries the business name as `businessName` together with `name`, `surname` and `email`

#### Scenario: Other roles' profile form has no business name
- **WHEN** a session user whose `data.role` is not `coffeeshop` submits the profile form
- **THEN** the form shows no Business name field and `PUT /users/{data.ulid}` carries no `businessName`

#### Scenario: The update names an invalid business name
- **WHEN** a coffee shop's update answers `422` with a message for `businessName`
- **THEN** that message renders under the Business name field, which is marked invalid, and the values are kept
