# auth Specification

## Purpose
Gives the application its user session: signing in through the API's authorization page and back through the callback, the session states and the profile they carry, silent re-authentication on return, sign out, and the step-up to the write scope.

## Requirements

### Requirement: Sign in
Starting sign in SHALL open the API's authorization page requesting the `profile:read` scope in a popup window while the route the user is on stays untouched, and a completed authorization SHALL leave the user on the route where sign in started with an authenticated session. When no popup can open, sign in SHALL fall back to a full-page redirect that keeps the return destination.

#### Scenario: Sign in starts from the current route
- **WHEN** the user starts sign in from a route
- **THEN** the application opens the API's authorization page requesting `profile:read` in a popup, keeps the route the user was on as the return destination, and navigates and reloads nothing — the route and any input typed on it stay as they are

#### Scenario: The authorization page carries the theme and language
- **WHEN** the application opens the API's authorization page
- **THEN** the request carries the application's current theme and the locale of the active route, so the API's pages render in them

#### Scenario: Completing sign in
- **WHEN** the API approves the authorization and returns a code that answers the pending request
- **THEN** the application exchanges the code for tokens and the session is authenticated, with the user on the route where sign in started

#### Scenario: The popup cannot be opened
- **WHEN** no popup window can open when sign in starts
- **THEN** the application runs the authorization as a full-page redirect keeping the return destination, and shows no message

#### Scenario: The popup is closed before completing
- **WHEN** the popup closes before the authorization completes
- **THEN** the session stays as it was, no flow data remains, and no message is shown

### Requirement: Session states and profile
The session SHALL resolve to exactly one of three states — `loading`, `anonymous` or `authenticated` — and an authenticated session SHALL carry the profile returned by `GET /user`: `data.ulid`, `data.name`, `data.surname`, `data.email` and `data.role`. No user data SHALL come from any other source.

#### Scenario: The session is resolving
- **WHEN** the session is still being established
- **THEN** it stays in the `loading` state until the profile is loaded or the session turns anonymous

#### Scenario: An authenticated session carries the profile
- **WHEN** the session is authenticated
- **THEN** it carries `data.ulid`, `data.name`, `data.surname`, `data.email` and `data.role` from `GET /user` for its consumers

#### Scenario: The profile cannot be resolved
- **WHEN** the profile cannot be loaded while the session is first established and no recovery succeeds
- **THEN** the session becomes `anonymous` and no error is shown

#### Scenario: Refreshing the profile
- **WHEN** a consumer refreshes the profile after changing it
- **THEN** the session settles with the `data` of a new `GET /user`, and the response of the change request itself is never written into the session

#### Scenario: A profile refresh that fails transiently
- **WHEN** a profile refresh meets a network failure or a server error
- **THEN** `GET /user` is requested once more after a short pause

#### Scenario: A profile refresh that fails twice
- **WHEN** that second request also fails
- **THEN** the session keeps the user it had and no message is shown

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
- **THEN** the API's authorization page asks the user to sign in again in a popup even when the API session is live, and the route that asked — with any input typed on it — stays as it is

#### Scenario: The write sign in is declined or fails
- **WHEN** the user declines the write sign in or the authorization comes back with an error
- **THEN** the application returns to the route that asked with no error text and the session becomes `anonymous`

### Requirement: Return through the callback
The route the API returns to SHALL render no text and no status region, and SHALL NOT show the API's error text or any error page, whatever the outcome. With an opener of the application's origin it SHALL forward the result to the application and close itself; without one it SHALL complete the flow and open the return destination through client-side navigation. The return destination SHALL be the route where the flow started, with its path and its query string and without its hash, and SHALL be opened only when it is a route of the application; any other return destination SHALL be replaced by the root of the default locale.

#### Scenario: Forwarding the result to the application
- **WHEN** the callback has an opener of the application's origin and receives the result of an authorization
- **THEN** it posts the result to the application's origin and closes itself, without exchanging the code

#### Scenario: Completing on the callback
- **WHEN** the callback has no opener and receives a completed authorization
- **THEN** it exchanges the code for tokens, replaces its history entry so no code remains in the URL, and opens the return destination through client-side navigation

#### Scenario: The authorization comes back with an error
- **WHEN** the callback receives an error response from the authorization
- **THEN** it shows no error text and the user continues at the return destination as anonymous

#### Scenario: The response does not answer a pending request
- **WHEN** the callback receives a response whose `state` does not match the pending request, or receives nothing that belongs to one
- **THEN** it shows no error text and the user continues at the return destination as anonymous, or at the root of the default locale when there is no pending request

#### Scenario: The return destination keeps the query
- **WHEN** a flow that returns through the callback starts on a route with a query string, such as a reload of `/es/manage/evaluations/new?offering=01J0` with the silent restore
- **THEN** the callback opens `/es/manage/evaluations/new?offering=01J0`, path and query, without any hash the route had

#### Scenario: A query that only carries data
- **WHEN** the callback completes a flow whose return destination has a supported locale prefix and a query whose values name another site, such as `/es/offerings?next=https://evil.example`
- **THEN** it opens that same route of the application, and never navigates to the site named in the query

#### Scenario: A return destination that is not an application route
- **WHEN** the callback completes a flow whose return destination is not a route of the application — an absolute URL such as `https://evil.example/es`, a protocol-relative route such as `//evil.example/es`, a route with a backslash such as `/\evil.example` or `/es?next=\evil.example`, a route with a control character, or a route whose path resolves outside a supported locale prefix such as `/es/../evil` or `/xx/offerings`
- **THEN** it opens the root of the default locale instead, and the outcome of the flow is otherwise unchanged

### Requirement: Credential handling
Access and refresh tokens SHALL be kept in memory only — never assigned to `window` or to React state — and SHALL NOT be written to browser storage. The data a pending sign-in flow needs SHALL be removed when that flow ends, whatever its outcome. The only thing that may remain in the browser between flows is a marker carrying no credential that records that the user had signed in.

#### Scenario: During a sign-in flow
- **WHEN** a sign-in flow is pending
- **THEN** its flow data exists only until the flow ends and is removed on every outcome

#### Scenario: After sign in
- **WHEN** a sign-in completes
- **THEN** the tokens are held in memory and browser storage holds no token, code or verifier

#### Scenario: After sign out
- **WHEN** the user signs out
- **THEN** the marker is removed and the browser holds no trace of the session

### Requirement: Content-Security-Policy on the callback
Every document response of the callback route SHALL carry a Content-Security-Policy that allows only the page's own scripts and, in `connect-src`, the API origin, and SHALL carry no `Cross-Origin-Opener-Policy` header. The callback stays outside the locale redirect.

#### Scenario: Policy present on the callback
- **WHEN** the callback route answers a request
- **THEN** its response carries a Content-Security-Policy whose `connect-src` names the API origin, and carries no `Cross-Origin-Opener-Policy`

### Requirement: One active-locale derivation for the auth flows

Sign in, sign out and the return route SHALL take the active locale from the locale segment of the route through one shared derivation: the first segment of the route's path when it is a supported locale. Where no supported locale is found, sign in and sign out SHALL use the default locale and the return route SHALL be refused, as the requirements "Sign in", "Sign out" and "Return through the callback" state. This requirement adds no behaviour.

#### Scenario: The same locale for every auth flow

- **WHEN** a user on a route under a supported locale prefix, such as `/en/offerings`, signs in or signs out, or a flow returns to such a route
- **THEN** the authorization request carries that locale, sign out opens the root of that locale, and the return route is accepted

#### Scenario: A route without a supported locale

- **WHEN** the first segment of the route is not a supported locale, such as `/callback` or `/xx/offerings`
- **THEN** the authorization request carries the default locale, sign out opens the root of the default locale, and that return route is refused
