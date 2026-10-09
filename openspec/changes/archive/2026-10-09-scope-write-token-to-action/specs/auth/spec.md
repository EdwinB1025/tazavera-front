## MODIFIED Requirements

### Requirement: Step-up to the write scope
When a flow needs the `profile:write` scope, the application SHALL force a fresh sign in on the API's authorization page requesting `profile:write`, and SHALL return to the route that asked for it. Every step-up authorization request SHALL carry `login_hint` with the `ulid` of the user signed in when the step-up started; sign in SHALL carry none. The caller SHALL learn the step-up's outcome: `granted`, `cancelled` when the popup closes before completing, `failed` on the error path, or `other-account`. The new tokens SHALL be installed only after `GET /user`, sent with the new access token, returns the `ulid` of the user who was signed in when the step-up started; when it returns another user, the application SHALL keep the previous tokens and session unchanged, send `POST /logout` with the new token, discard the new tokens and report `other-account`. When a step-up popup comes back with `error=access_denied` and the request's `state`, the application SHALL keep the previous tokens, session and sign-in marker unchanged and report `other-account`. The write tokens SHALL last only the action that asked for them: the tokens in use before a granted step-up SHALL be kept in memory, and when the caller ends the action the write tokens SHALL be discarded and the kept tokens used again, with no request; a later write needs a new step-up.

#### Scenario: Requesting the write scope
- **WHEN** a flow requests the write scope from a route
- **THEN** the API's authorization page asks the user to sign in again in a popup even when the API session is live, and the route that asked — with any input typed on it — stays as it is

#### Scenario: The step-up names the expected user
- **WHEN** a step-up starts for a signed-in user
- **THEN** its authorization request carries `login_hint` with that user's `ulid`

#### Scenario: The write sign in is declined or fails
- **WHEN** the step-up authorization comes back with an error other than `access_denied`, or the code exchange fails
- **THEN** the application returns to the route that asked with no error text and the session becomes `anonymous`

#### Scenario: The step-up is granted
- **WHEN** the same user completes the write sign in in the popup
- **THEN** the new tokens replace the previous ones only after `GET /user` with the new access token returns that user's `ulid`, the session stays authenticated and the caller learns `granted`

#### Scenario: The write tokens last only the action
- **WHEN** the caller ends the action after a granted step-up
- **THEN** the write tokens are discarded, the tokens in use before the step-up are used again with no request, and the next write needs a new step-up

#### Scenario: The popup is closed during the step-up
- **WHEN** the user closes the step-up popup before completing it
- **THEN** the session stays as it was, no message is shown and the caller learns `cancelled`

#### Scenario: Another user completes the step-up
- **WHEN** the user signs in as another user in the step-up popup
- **THEN** the previous tokens and session stay as they were, `POST /logout` is sent with the new access token, the new tokens are not installed and the caller learns `other-account`

#### Scenario: The API refuses another user
- **WHEN** the step-up popup comes back with `error=access_denied` and the request's `state`
- **THEN** the previous tokens, session and sign-in marker stay as they were and the caller learns `other-account`

#### Scenario: Another user completes the step-up after a full-page redirect
- **WHEN** the popup cannot open, the step-up continues as a full-page redirect and another user signs in
- **THEN** at the callback `POST /logout` is sent with the new access token, the new tokens are not installed, the session ends `anonymous` with the sign-in marker removed and the return route opens
