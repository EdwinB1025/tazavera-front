# Spec Delta

## ADDED Requirements

### Requirement: One public entry point
The application's origin SHALL be the only address the browser uses to reach the API. The application SHALL forward to the internal API address, keeping the method, the query string, the headers and the body:
- every path under `/api/`, with the `/api` prefix removed; `/api` alone is not forwarded;
- the API's web routes, with the path unchanged: `/oauth/authorize`; `/login`, `/two-factor-challenge`, `/forgot-password`, `/reset-password` and `/reset-password/{token}`, `/email/verify`, `/email/verify/{id}/{hash}` and `/email/verification-notification`; `/user/security`, `/user/confirm-password`, `/user/confirmed-password-status`, `/user/confirmed-two-factor-authentication`, `/user/two-factor-authentication`, `/user/two-factor-qr-code`, `/user/two-factor-recovery-codes`, `/user/two-factor-secret-key`, `/user/passkeys`, `/user/passkeys/options` and `/user/passkeys/{passkey}`; `/passkeys/login`, `/passkeys/login/options`, `/passkeys/confirm` and `/passkeys/confirm/options`; `/favicon.svg`; and every path under `/build/`, `/flux/` and `/livewire-<hex>/`.

`/logout` without the prefix is not a forwarded web route. Every forwarded request SHALL carry the application's public origin as `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port`, replacing any incoming value, and SHALL keep the client's `X-Forwarded-For`, its `Authorization` header and its cookies. A forwarded response SHALL be served as the API sends it, with none of the application's own response headers. When no internal API address is configured, a forwarded request SHALL answer `502` with an empty body and SHALL NOT be sent anywhere. Every other path SHALL keep its current handling.

#### Scenario: A path under the prefix is forwarded without it
- **WHEN** the application receives a request under `/api/`, such as `GET /api/offerings?page=2`, `POST /api/oauth/token`, `PUT /api/users/{ulid}` or `POST /api/logout`
- **THEN** it forwards the request to the internal API address at the same path without `/api` and with the same query, such as `{internal}/offerings?page=2`, `{internal}/oauth/token`, `{internal}/users/{ulid}` or `{internal}/logout`

#### Scenario: A listed web route is forwarded unchanged
- **WHEN** the application receives a request for one of the API's web routes, such as `GET /login`, `POST /oauth/authorize`, `GET /user/security`, `GET /reset-password/{token}?email=…`, `POST /livewire-<hex>/update`, `GET /flux/flux.js`, `GET /build/assets/app.css` or `GET /favicon.svg`
- **THEN** it forwards the request to the internal API address with the same path and query

#### Scenario: A forwarded response is served as the API sends it
- **WHEN** the application forwards a request
- **THEN** the response carries no Content-Security-Policy, no Cross-Origin-Opener-Policy and none of the application's security headers

#### Scenario: The forwarded request carries the public origin
- **WHEN** the application forwards a request
- **THEN** the forwarded request carries `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port` of the application's public origin, whatever values the incoming request carried

#### Scenario: No internal API address
- **WHEN** a request that would be forwarded arrives while no internal API address is configured
- **THEN** it answers `502` with an empty body and is not forwarded

#### Scenario: Paths that are not forwarded
- **WHEN** the application receives `/logout` without the prefix, `/api` alone, a path under `/_next/`, `/favicon.ico`, `/callback`, a route under a supported locale such as `/es/offerings`, or an API path without the prefix such as `/user` or `/offerings`
- **THEN** none of them is forwarded and each keeps its current handling

## MODIFIED Requirements

### Requirement: Sign in
Starting sign in SHALL open the API's authorization page, reached at `/oauth/authorize` on the application's own origin, requesting the `profile:read` scope in a popup window while the route the user is on stays untouched, and a completed authorization SHALL leave the user on the route where sign in started with an authenticated session. When no popup can open, sign in SHALL fall back to a full-page redirect that keeps the return destination. Every authorization request the application starts — sign in, the silent restore and the step-up — SHALL open the authorization page on the application's own origin, with the same parameters.

#### Scenario: Sign in starts from the current route
- **WHEN** the user starts sign in from a route
- **THEN** the application opens the API's authorization page requesting `profile:read` in a popup, keeps the route the user was on as the return destination, and navigates and reloads nothing — the route and any input typed on it stay as they are

#### Scenario: The authorization page carries the theme and language
- **WHEN** the application opens the API's authorization page
- **THEN** the request carries the application's current theme and the locale of the active route, so the API's pages render in them

#### Scenario: The authorization page is on the application's origin
- **WHEN** the application opens the API's authorization page, in a popup, as a full-page redirect, for the silent restore or for a step-up
- **THEN** it opens `{application origin}/oauth/authorize` with the same parameters as before, never the API's own address

#### Scenario: Completing sign in
- **WHEN** the API approves the authorization and returns a code that answers the pending request
- **THEN** the application exchanges the code for tokens and the session is authenticated, with the user on the route where sign in started

#### Scenario: The popup cannot be opened
- **WHEN** no popup window can open when sign in starts
- **THEN** the application runs the authorization as a full-page redirect keeping the return destination, and shows no message

#### Scenario: The popup is closed before completing
- **WHEN** the popup closes before the authorization completes
- **THEN** the session stays as it was, no flow data remains, and no message is shown

### Requirement: Silent re-authentication
When the application loads and the user had signed in before in this browser, it SHALL try to restore the session without showing the API's login, through the authorization page on the application's own origin. When that fails for any reason, the user SHALL continue as anonymous with no sign-in page and no error shown.

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

### Requirement: Step-up to the write scope
When a flow needs the `profile:write` scope, the application SHALL force a fresh sign in on the API's authorization page, on the application's own origin, requesting `profile:write`, and SHALL return to the route that asked for it. Every step-up authorization request SHALL carry `login_hint` with the `ulid` of the user signed in when the step-up started; sign in SHALL carry none. The caller SHALL learn the step-up's outcome: `granted`, `cancelled` when the popup closes before completing, `failed` on the error path, or `other-account`. The new tokens SHALL be installed only after `GET /user`, sent with the new access token, returns the `ulid` of the user who was signed in when the step-up started; when it returns another user, the application SHALL keep the previous tokens and session unchanged, send `POST /logout` with the new token, discard the new tokens and report `other-account`. When a step-up popup comes back with `error=access_denied` and the request's `state`, the application SHALL keep the previous tokens, session and sign-in marker unchanged and report `other-account`. The write tokens SHALL last only the action that asked for them: the tokens in use before a granted step-up SHALL be kept in memory, and when the caller ends the action the write tokens SHALL be discarded and the kept tokens used again, with no request; a later write needs a new step-up.

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

### Requirement: Credential handling
Access and refresh tokens SHALL be kept in memory only — never assigned to `window` or to React state — and SHALL NOT be written to browser storage. The data a pending sign-in flow needs SHALL be removed when that flow ends, whatever its outcome. The only thing that may remain in the browser between flows is a marker carrying no credential that records that the user had signed in. The code exchange and the refresh SHALL be sent to `/oauth/token` under the base of the JSON calls, which is the application's own origin followed by `/api`.

#### Scenario: During a sign-in flow
- **WHEN** a sign-in flow is pending
- **THEN** its flow data exists only until the flow ends and is removed on every outcome

#### Scenario: After sign in
- **WHEN** a sign-in completes
- **THEN** the tokens are held in memory and browser storage holds no token, code or verifier

#### Scenario: After sign out
- **WHEN** the user signs out
- **THEN** the marker is removed and the browser holds no trace of the session

#### Scenario: The token requests go to the application's origin
- **WHEN** the application exchanges a code or refreshes its tokens
- **THEN** the request is sent to `{base of the JSON calls}/oauth/token`, that is `{application origin}/api/oauth/token`

### Requirement: Content-Security-Policy on the callback
Every document response of the callback route SHALL carry a Content-Security-Policy that allows only the page's own scripts and, in `connect-src`, only the application itself and `https://nominatim.openstreetmap.org`, and SHALL carry no `Cross-Origin-Opener-Policy` header. The callback stays outside the locale redirect.

#### Scenario: Policy present on the callback
- **WHEN** the callback route answers a request
- **THEN** its response carries a Content-Security-Policy whose `connect-src` is `'self' https://nominatim.openstreetmap.org`, naming no API origin, and carries no `Cross-Origin-Opener-Policy`
