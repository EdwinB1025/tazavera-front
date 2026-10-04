# Spec Delta

## Purpose

Gives the application its user session: signing in through the API's authorization page and back through the callback, the session states and the profile they carry, silent re-authentication on return, sign out, and the step-up to the write scope.

## ADDED Requirements

### Requirement: Sign in
Starting sign in SHALL take the user to the API's authorization page requesting the `profile:read` scope, and a completed authorization SHALL return the user to the route where sign in started with an authenticated session.

#### Scenario: Sign in starts from the current route
- **WHEN** the user starts sign in from a route
- **THEN** the application opens the API's authorization page requesting `profile:read` and keeps the route the user was on as the return destination

#### Scenario: The authorization page carries the theme and language
- **WHEN** the application opens the API's authorization page
- **THEN** the request carries the application's current theme and the locale of the active route, so the API's pages render in them

#### Scenario: Completing sign in
- **WHEN** the API approves the authorization and returns a code that answers the pending request
- **THEN** the application exchanges the code for tokens, opens the return destination, and the session is authenticated

### Requirement: Session states and profile
The session SHALL resolve to exactly one of three states — `loading`, `anonymous` or `authenticated` — and an authenticated session SHALL carry the profile returned by `GET /user`: `data.ulid`, `data.name`, `data.surname`, `data.email` and `data.role`. No user data SHALL come from any other source.

#### Scenario: The session is resolving
- **WHEN** the session is still being established
- **THEN** it stays in the `loading` state until the profile is loaded or the session turns anonymous

#### Scenario: An authenticated session carries the profile
- **WHEN** the session is authenticated
- **THEN** it carries `data.ulid`, `data.name`, `data.surname`, `data.email` and `data.role` from `GET /user` for its consumers

#### Scenario: The profile cannot be resolved
- **WHEN** the profile cannot be loaded and no recovery succeeds
- **THEN** the session becomes `anonymous` and no error is shown

### Requirement: Silent re-authentication
When the application loads and the user had signed in before in this browser, it SHALL try to restore the session without showing the API's login. When that fails for any reason, the user SHALL continue as anonymous with no sign-in page and no error shown.

#### Scenario: Returning user with a live API session
- **WHEN** the application loads and the user had signed in before while the API session is still live
- **THEN** the session is restored without the API's login appearing and without the user taking action

#### Scenario: Returning user whose API session is gone
- **WHEN** the application loads and the user had signed in before but the API session is gone
- **THEN** the user continues as anonymous, with no sign-in page shown and no error text

#### Scenario: First visit in this browser
- **WHEN** the application loads and the user has not signed in before
- **THEN** the session is anonymous and no authorization request starts

#### Scenario: Sign out stops the silent restore
- **WHEN** the user has signed out and the application loads again
- **THEN** the session stays anonymous and no authorization request starts

### Requirement: Keeping the session alive
A session SHALL survive the access token's lifetime without the user signing in again, and SHALL fall back to silent re-authentication and then to anonymous when its tokens are rejected.

#### Scenario: The access token expires
- **WHEN** an API request needs an access token that has expired
- **THEN** the application obtains a new one and the request succeeds without the user noticing

#### Scenario: The tokens are rejected and the API session is still live
- **WHEN** the API rejects the tokens and the API session is still live
- **THEN** the session is restored silently and the user keeps working

#### Scenario: The tokens are rejected and nothing restores them
- **WHEN** the API rejects the tokens and silent re-authentication also fails
- **THEN** the session becomes `anonymous` and no error is shown

#### Scenario: Public endpoints need no session
- **WHEN** a request targets a public endpoint
- **THEN** it is sent without credentials and succeeds

### Requirement: Sign out
Sign out SHALL end the session in the application, revoke the user's access and refresh tokens and their API web sessions on the server, and return the user to the root of the active locale.

#### Scenario: Signing out
- **WHEN** the user signs out
- **THEN** `POST /logout` revokes all of the user's tokens and ends their API web sessions, the session becomes `anonymous`, and the application opens the root of the active locale

#### Scenario: The server cannot be reached
- **WHEN** the user signs out and the revocation request fails
- **THEN** the session still becomes `anonymous`, the user still returns to the root of the active locale, and no error is shown

### Requirement: Step-up to the write scope
When a flow needs the `profile:write` scope, the application SHALL force a fresh sign in on the API's authorization page requesting `profile:write`, and SHALL return to the route that asked for it.

#### Scenario: Requesting the write scope
- **WHEN** a flow requests the write scope from a route
- **THEN** the API's authorization page asks the user to sign in again even when the API session is live, and a completed sign in returns to the route that asked

#### Scenario: The write sign in is declined or fails
- **WHEN** the user declines the write sign in or the authorization comes back with an error
- **THEN** the application returns to the route that asked with no error text and the session becomes `anonymous`

### Requirement: Return through the callback
The route the API returns to SHALL show only a loading indicator that announces the wait as status text, and SHALL NOT show the API's error text or any error page, whatever the outcome.

#### Scenario: Completing on the callback
- **WHEN** the callback receives a completed authorization
- **THEN** it shows a loading indicator while it completes, then opens the return destination

#### Scenario: The wait is announced
- **WHEN** the callback shows its loading indicator
- **THEN** it announces "Completing sign in…" as status text in the language of the return destination

#### Scenario: The authorization comes back with an error
- **WHEN** the callback receives an error response from the authorization
- **THEN** it shows no error text and the user continues at the return destination as anonymous

#### Scenario: The response does not answer a pending request
- **WHEN** the callback receives a response whose `state` does not match the pending request, or receives nothing that belongs to one
- **THEN** it shows no error text and the user continues at the return destination as anonymous, or at the root of the default locale when there is no pending request

### Requirement: Credential handling
Access and refresh tokens SHALL be kept in memory only and SHALL NOT be written to browser storage. The data a pending sign-in flow needs SHALL be removed when that flow ends, whatever its outcome. The only thing that may remain in the browser between flows is a marker carrying no credential that records that the user had signed in.

#### Scenario: During a sign-in flow
- **WHEN** a sign-in flow is pending
- **THEN** its flow data exists only until the flow ends and is removed on every outcome

#### Scenario: After sign in
- **WHEN** a sign-in completes
- **THEN** the tokens are held in memory and browser storage holds no token, code or verifier

#### Scenario: After sign out
- **WHEN** the user signs out
- **THEN** the marker is removed and the browser holds no trace of the session
