## MODIFIED Requirements

### Requirement: Profile settings
The Profile section SHALL show the session user's name (`data.name`), surname (`data.surname`), email (`data.email`) and role (`data.role`) read-only, each as the API returns it, one labelled row per non-null value in that order, with no field to edit; right after the email row it SHALL show an "Email verification" row whose value is the text "Verified" when `data.emailVerifiedAt` is set and "Not verified" when it is null, and no such row when the field is absent, the state never shown by colour alone; followed by an "Edit profile" action. Activating "Edit profile" SHALL start the identity check synchronously inside that click for the return route `/{locale}/account?edit=1` and SHALL open that route, where the page is in edit mode. In edit mode the Edit profile section SHALL hold a form for name, surname and email prefilled with `data.name`, `data.surname` and `data.email`, followed by a "Done" action that returns the page to read mode on the same route without sending anything. The form SHALL send `PUT /users/{data.ulid}` with `name`, `surname` and `email`. Before sending, the form SHALL check only the email's format; no field is required. A failing check SHALL show its message under the field, mark the field as invalid, move focus to it and send nothing. A `200` SHALL keep the submitted values in the form, show the success status above the actions, and refresh the profile in the session from `GET /user`, so the rest of the interface follows. A `422`, a server error, a network failure or any other status except `403` SHALL show the generic form-level error above the actions and keep the values.

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
- **THEN** no client check blocks the submission and the API's `422` shows the generic form-level error

#### Scenario: The profile is updated
- **WHEN** the update answers `200`
- **THEN** the fields keep the submitted values, the success status renders above the actions, and the session profile is refreshed from `GET /user`

#### Scenario: The update is rejected or fails
- **WHEN** the update answers `422`, a server error or any other status except `403`, or the request fails
- **THEN** the generic form-level error renders above the actions and the field values are kept

### Requirement: Grouped security section
The Security section SHALL carry a short text covering the password, email verification, two-factor authentication and passkeys, and its entries in order: "Change password", which starts the identity check synchronously inside the click for `/{locale}/account/password` and opens that route; then a list whose first item is the email verification entry, followed by "Two-factor authentication" and "Passkeys", each opening the API's security page as an external navigation in the same tab. While the session user's `data.emailVerifiedAt` is null, the email verification entry SHALL be a "Verify email" link opening the API's email verification page (`{API}/email/verify`) as an external navigation in the same tab; when it is set, the entry SHALL be the plain text "Email verified" with no link; when the field is absent, there SHALL be no email verification entry. The front SHALL send no request for the external entries.

#### Scenario: Changing the password
- **WHEN** the user activates "Change password"
- **THEN** the identity check starts synchronously inside that click for `/{locale}/account/password` and that route opens

#### Scenario: Two-factor authentication and passkeys
- **WHEN** the Security section renders
- **THEN** its "Two-factor authentication" and "Passkeys" entries open the API's security page as an external navigation in the same tab and no request is sent by the front

#### Scenario: Verifying the email
- **WHEN** the Security section renders for a session user whose `data.emailVerifiedAt` is null
- **THEN** the first item of its list, before "Two-factor authentication", is a "Verify email" link to `{API}/email/verify` that opens in the same tab

#### Scenario: The email is verified
- **WHEN** the Security section renders for a session user whose `data.emailVerifiedAt` is set
- **THEN** the first item of its list is the text "Email verified" and there is no "Verify email" link
