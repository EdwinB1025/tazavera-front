## MODIFIED Requirements

### Requirement: Step-up to the write scope
When a flow needs the `profile:write` scope, the application SHALL force a fresh sign in on the API's authorization page requesting `profile:write`, and SHALL return to the route that asked for it. The caller SHALL learn the step-up's outcome: `granted`, `cancelled` when the popup closes before completing, `failed` on the error path, or `other-account`. The new tokens SHALL be installed only after `GET /user`, sent with the new access token, returns the `ulid` of the user who was signed in when the step-up started; when it returns another user, the application SHALL keep the previous tokens and session unchanged, send `POST /logout` with the new token, discard the new tokens and report `other-account`.

#### Scenario: Requesting the write scope
- **WHEN** a flow requests the write scope from a route
- **THEN** the API's authorization page asks the user to sign in again in a popup even when the API session is live, and the route that asked — with any input typed on it — stays as it is

#### Scenario: The write sign in is declined or fails
- **WHEN** the user declines the write sign in or the authorization comes back with an error
- **THEN** the application returns to the route that asked with no error text and the session becomes `anonymous`

#### Scenario: The step-up is granted
- **WHEN** the same user completes the write sign in in the popup
- **THEN** the new tokens replace the previous ones only after `GET /user` with the new access token returns that user's `ulid`, the session stays authenticated and the caller learns `granted`

#### Scenario: The popup is closed during the step-up
- **WHEN** the user closes the step-up popup before completing it
- **THEN** the session stays as it was, no message is shown and the caller learns `cancelled`

#### Scenario: Another user completes the step-up
- **WHEN** the user signs in as another user in the step-up popup
- **THEN** the previous tokens and session stay as they were, `POST /logout` is sent with the new access token, the new tokens are not installed and the caller learns `other-account`

#### Scenario: Another user completes the step-up after a full-page redirect
- **WHEN** the popup cannot open, the step-up continues as a full-page redirect and another user signs in
- **THEN** at the callback `POST /logout` is sent with the new access token, the new tokens are not installed, the session ends `anonymous` with the sign-in marker removed and the return route opens
