# Spec Delta

## MODIFIED Requirements

### Requirement: Password change
The Password section SHALL collect the current password, a new password and its confirmation, and SHALL send `PUT /users/{data.ulid}/password` with `currentPassword`, `password` and `passwordConfirmation`, with an external link to the API's password reset, at `/forgot-password` on the application's own origin, under the current-password field. Before sending, the form SHALL check only the rules its request documents: the three fields are required and the confirmation equals the new password. A `200` SHALL clear the three fields and show the success status above the actions. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL clear the three fields. A server error, a network failure or any other status except `403` SHALL show the generic form-level error and clear the three fields.

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
- **THEN** its "Forgot your password?" link opens `{application origin}/forgot-password`, the API's password reset page, as an external navigation in the same tab, and the front sends no request for it

### Requirement: Grouped security section
The Security section SHALL carry a short text covering the password, email verification, two-factor authentication and passkeys, and its entries in order: "Change password", which starts the identity check synchronously inside the click for `/{locale}/account/password` and opens that route; then a list whose first item is the email verification entry, followed by "Two-factor authentication" and "Passkeys", each a link to the API's security page at `/user/security` on the application's own origin. While the session user's `data.emailVerifiedAt` is null, the email verification entry SHALL be a "Verify email" link to the API's email verification page on the application's own origin (`{application origin}/email/verify`); when it is set, the entry SHALL be the plain text "Email verified" with no link; when the field is absent, there SHALL be no email verification entry. A plain primary click on any of these API links SHALL open its destination in a popup window synchronously inside the click, and the account tab SHALL NOT navigate, so it keeps the session; when the browser blocks the popup, the destination SHALL open in a new tab instead, the account tab still not navigating. The front SHALL send no request when an API link opens. When the popup window closes, the account page SHALL reload the session's profile from `GET /user`.

#### Scenario: Changing the password
- **WHEN** the user activates "Change password"
- **THEN** the identity check starts synchronously inside that click for `/{locale}/account/password` and that route opens

#### Scenario: Two-factor authentication and passkeys
- **WHEN** the Security section renders
- **THEN** its "Two-factor authentication" and "Passkeys" entries are links to `{application origin}/user/security`, the API's security page, and no request is sent by the front

#### Scenario: Verifying the email
- **WHEN** the Security section renders for a session user whose `data.emailVerifiedAt` is null
- **THEN** the first item of its list, before "Two-factor authentication", is a "Verify email" link to `{application origin}/email/verify`

#### Scenario: The email is verified
- **WHEN** the Security section renders for a session user whose `data.emailVerifiedAt` is set
- **THEN** the first item of its list is the text "Email verified" and there is no "Verify email" link

#### Scenario: An API entry opens in a popup window
- **WHEN** the user clicks "Verify email", "Two-factor authentication" or "Passkeys" with the primary button and no modifier key
- **THEN** its destination opens in a popup window inside that click, the account tab does not navigate and no request is sent

#### Scenario: The popup window is blocked
- **WHEN** the user clicks one of those entries and the browser blocks the popup window
- **THEN** its destination opens in a new tab and the account tab does not navigate

#### Scenario: The popup window closes
- **WHEN** the popup window opened from one of those entries closes
- **THEN** the account page reloads the session's profile from `GET /user`
