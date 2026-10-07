# Spec Delta

## ADDED Requirements

### Requirement: Protected content gate
A protected view SHALL show its loading presentation while the session resolves; while the session is anonymous it SHALL show the view's signed-out message and a "Sign in" action in place of the content, with no redirect and sign in starting synchronously inside the click; for a signed-in user the route does not allow it SHALL show the application's not-found page; and for an allowed signed-in user it SHALL show the view's content. The gate SHALL add no text of its own.

#### Scenario: Session resolving
- **WHEN** a protected view opens while the session is still resolving
- **THEN** the view's loading presentation renders in place of the content and no signed-out message shows

#### Scenario: Anonymous visitor
- **WHEN** a protected view is open and the session is anonymous
- **THEN** the view's signed-out message and its "Sign in" action render in place of the content, no content renders, and the view does not redirect

#### Scenario: Signing in from the gate
- **WHEN** the visitor activates "Sign in" on a protected view
- **THEN** sign in starts synchronously inside that click for the route the user is on, and the user stays on the route

#### Scenario: Role the route does not allow
- **WHEN** the session is authenticated and the route does not allow the signed-in user
- **THEN** the application's not-found page renders instead of the content

#### Scenario: Allowed signed-in user
- **WHEN** the session is authenticated and the route allows the signed-in user
- **THEN** the view's content renders for that user and no loading presentation or signed-out message renders

#### Scenario: The gate adds no text of its own
- **WHEN** any state of a protected view renders
- **THEN** every visible text comes from the consuming capability's message catalog and no text, frame or layout comes from the gate itself
