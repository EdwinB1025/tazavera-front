## MODIFIED Requirements

### Requirement: Grouped security section
The Security section SHALL carry a short text covering the password, email verification, two-factor authentication and passkeys, and its entries in order: "Change password", which starts the identity check synchronously inside the click for `/{locale}/account/password` and opens that route; then a list whose first item is the email verification entry, followed by "Two-factor authentication" and "Passkeys", each a link to the API's security page. While the session user's `data.emailVerifiedAt` is null, the email verification entry SHALL be a "Verify email" link to the API's email verification page (`{API}/email/verify`); when it is set, the entry SHALL be the plain text "Email verified" with no link; when the field is absent, there SHALL be no email verification entry. A plain primary click on any of these API links SHALL open its destination in a popup window synchronously inside the click, and the account tab SHALL NOT navigate, so it keeps the session; when the browser blocks the popup, the destination SHALL open in a new tab instead, the account tab still not navigating. The front SHALL send no request when an API link opens. When the popup window closes, the account page SHALL reload the session's profile from `GET /user`.

#### Scenario: Changing the password
- **WHEN** the user activates "Change password"
- **THEN** the identity check starts synchronously inside that click for `/{locale}/account/password` and that route opens

#### Scenario: Two-factor authentication and passkeys
- **WHEN** the Security section renders
- **THEN** its "Two-factor authentication" and "Passkeys" entries are links to the API's security page and no request is sent by the front

#### Scenario: Verifying the email
- **WHEN** the Security section renders for a session user whose `data.emailVerifiedAt` is null
- **THEN** the first item of its list, before "Two-factor authentication", is a "Verify email" link to `{API}/email/verify`

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
