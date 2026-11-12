## MODIFIED Requirements

### Requirement: Registration routes
The application SHALL offer registration as a specialist at `/{locale}/register` and as a coffeeshop at `/{locale}/register/coffeeshop`, reachable from the registration landing, and each route SHALL send its own role with the registration. While the session is resolving a registration route SHALL wait with no form shown, and when the session is authenticated the application SHALL open the root of the active locale through client-side navigation, except right after the coffeeshop route's own registration has signed the user in, which opens the first location step as "Registration result" states. Each registration route SHALL present the loading status, the form and the success panel in one section card with no header band. The registration card SHALL fill the page container's width, its content at most 40rem wide and centred horizontally in the card from the medium breakpoint.

#### Scenario: The specialist route registers a specialist
- **WHEN** a visitor submits the registration form on `/{locale}/register`
- **THEN** the registration is sent with `role: "specialist"`

#### Scenario: The coffeeshop route registers a coffeeshop
- **WHEN** a visitor submits the registration form on `/{locale}/register/coffeeshop`
- **THEN** the registration is sent with `role: "coffeeshop"`

#### Scenario: The session is resolving
- **WHEN** a registration route opens while the session is still resolving
- **THEN** the heading and the loading status render and no form is shown until the session settles

#### Scenario: A signed-in visitor is taken to the entry page
- **WHEN** a registration route, the coffeeshop route included, opens with an authenticated session, including right after signing in from the success panel
- **THEN** the application opens the root of the active locale through client-side navigation, with no reload and no message, and never the first location step

#### Scenario: The registration card
- **WHEN** a registration route renders while the session resolves, while it shows the form, or after a `201` has replaced the form with the success panel
- **THEN** that content sits in one section card with no header band that spans the page container's width, and from the medium breakpoint that content is at most 40rem wide and centred horizontally in the card

### Requirement: Registration result
A registration answered with `201` whose body carries a `token` block SHALL sign the user in with that block and, once the session is authenticated, SHALL open through client-side navigation, never a full page load, with no confirmation text, the first location step `/{locale}/manage/locations/first` on the coffeeshop route and `/{locale}` on the specialist route. A `201` without a `token` block, or whose block does not sign the user in, SHALL replace the form with a success panel carrying a heading, a text and a "Sign in" action, and focus SHALL move to the panel's heading. Activating "Sign in" SHALL start sign in synchronously inside that click. A `422` SHALL show each field's first message under that field as form-fields "Server validation errors" states, and the generic form-level error only when one of its keys names no field of the form, and SHALL keep every entered value except the password and its confirmation, which are cleared. Every other outcome — a server error, a network failure or any other status — SHALL show the generic form-level error above the actions, keep every entered value except the password and its confirmation, which are cleared, and render no message from the API.

#### Scenario: Signed in by the registration
- **WHEN** `POST /register` on the specialist route answers `201` with a `token` block that signs the user in
- **THEN** the session is authenticated and `/{locale}` opens through client-side navigation, with no success panel and no full page load

#### Scenario: A coffeeshop signed in by the registration
- **WHEN** `POST /register` on the coffeeshop route answers `201` with a `token` block that signs the user in
- **THEN** the session is authenticated and `/{locale}/manage/locations/first` opens through client-side navigation, with no success panel, no full page load, and `/{locale}` never opened

#### Scenario: The account is created
- **WHEN** `POST /register` answers `201` without a `token` block, or with one that does not sign the user in
- **THEN** the success panel replaces the form and focus moves to its heading

#### Scenario: Signing in from the success panel
- **WHEN** the user activates "Sign in" on the success panel
- **THEN** sign in starts synchronously inside that click and the user stays on the route

#### Scenario: The registration is rejected or fails
- **WHEN** `POST /register` answers a server error or any other status except `201` and `422`, or the request fails
- **THEN** the generic form-level error renders above the actions, every entered value is kept except the password and its confirmation, which are cleared, and the API's message is never rendered

#### Scenario: The registration names invalid fields
- **WHEN** `POST /register` answers `422` with a message for `email`
- **THEN** that message renders under the Email field, which is marked invalid, no generic form-level error renders, and the message clears when the user edits the Email field
