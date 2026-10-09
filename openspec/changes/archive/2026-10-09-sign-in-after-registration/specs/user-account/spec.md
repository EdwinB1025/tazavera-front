## MODIFIED Requirements

### Requirement: Registration result
A registration answered with `201` whose body carries a `token` block SHALL sign the user in with that block and, once the session is authenticated, SHALL open `/{locale}/account` through client-side navigation, never a full page load, with no confirmation text, for both registration roles. A `201` without a `token` block, or whose block does not sign the user in, SHALL replace the form with a success panel carrying a heading, a text and a "Sign in" action, and focus SHALL move to the panel's heading. Activating "Sign in" SHALL start sign in synchronously inside that click. Every other outcome — a `422`, a server error, a network failure or any other status — SHALL show the generic form-level error above the actions, keep every entered value except the password and its confirmation, which are cleared, and render no message from the API.

#### Scenario: Signed in by the registration
- **WHEN** `POST /register` answers `201` with a `token` block that signs the user in
- **THEN** the session is authenticated and `/{locale}/account` opens through client-side navigation, with no success panel and no full page load

#### Scenario: The account is created
- **WHEN** `POST /register` answers `201` without a `token` block, or with one that does not sign the user in
- **THEN** the success panel replaces the form and focus moves to its heading

#### Scenario: Signing in from the success panel
- **WHEN** the user activates "Sign in" on the success panel
- **THEN** sign in starts synchronously inside that click and the user stays on the route

#### Scenario: The registration is rejected or fails
- **WHEN** `POST /register` answers `422`, a server error or any other status, or the request fails
- **THEN** the generic form-level error renders above the actions, every entered value is kept except the password and its confirmation, which are cleared, and the API's message is never rendered
