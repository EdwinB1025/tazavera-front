# Spec Delta

## ADDED Requirements

### Requirement: Server-side reads at the internal API address
A read the application's server sends to the API SHALL go directly to the internal API address with the API's own path, without the `/api` prefix and without passing through the application's forwarding. A read sent from the browser SHALL go to the base of the JSON calls on the application's origin (`{application origin}/api`). The browser SHALL never receive or use the internal API address. When no internal API address is configured, a server-side read SHALL fail as an unreachable API does and the page SHALL show its existing error state; nothing is retried and no other address is tried.

#### Scenario: Server and browser reads take their own base
- **WHEN** the same read, such as `GET /offerings`, is sent once from the application's server and once from the browser
- **THEN** the server sends it to `{internal API address}/offerings` and the browser to `{application origin}/api/offerings`

## MODIFIED Requirements

### Requirement: Signed-in header and user menu
While the session is authenticated, the header SHALL show the brand logotype, the language selector, the theme switch and a user menu opened from a control carrying the initials of the user's name and surname and an accessible name. The control SHALL show an initials circle and, on a medium or larger viewport, the user's name and a chevron after the circle; below that viewport it SHALL show the circle alone. The menu SHALL offer one account entry pointing at the account page, the security entry as an external link to the API's security page at `/user/security` on the application's own origin, the management entries for the user's role — for a coffeeshop "Manage offerings", "Manage locations" and "Explore coffee inventory" in this order — for a specialist the offerings entry, and sign out. Each entry SHALL show a decorative icon that reflects its action before its text and SHALL take the header menu entry treatment, not the inline link treatment, while keeping its order, destination and behaviour.

#### Scenario: User control carries the user's initials
- **WHEN** the session is authenticated
- **THEN** the control that opens the user menu shows the initials built from `data.name` and `data.surname` of `GET /user`, and its accessible name identifies the user

#### Scenario: Name and chevron on a medium or larger viewport
- **WHEN** the header renders the user control on a medium or larger viewport
- **THEN** the control shows the initials circle followed by the user's name and a chevron

#### Scenario: Initials circle alone on a small viewport
- **WHEN** the header renders the user control below the medium breakpoint
- **THEN** the control shows the initials circle alone

#### Scenario: Initials circle in the traditional theme
- **WHEN** the header renders in the traditional theme
- **THEN** the initials circle keeps its current fill, text and hover colours and shows no boundary ring, `nav-avatar-border` being transparent in that theme

#### Scenario: Initials circle in the dark theme
- **WHEN** the header renders in the dark theme
- **THEN** the initials circle takes `nav-avatar` with `nav-text-dark` at rest and `nav-avatar-hover` on hover, those tokens holding in the dark theme the "Sign in" pair (`nav-button-bg` with `nav-button-text`) at rest and the `action-primary-hover` value on hover

#### Scenario: Circle boundary in the dark theme
- **WHEN** the initials circle renders in the dark theme
- **THEN** it carries a boundary in `nav-avatar-border`, which holds the `nav-button-border` value in the dark theme, so the circle is perceivable against the header surface

#### Scenario: Menu content
- **WHEN** the user opens the user menu
- **THEN** it offers the account entry, the external security entry, the management entries for the user's role and, for a specialist, the offerings entry, and the sign out action

#### Scenario: The account entry points at the account page
- **WHEN** the user opens the user menu
- **THEN** its account entry points at `/{locale}/account`

#### Scenario: The security entry points at the application's origin
- **WHEN** the user opens the user menu
- **THEN** its security entry is an external link to `{application origin}/user/security`, never the API's own address

#### Scenario: Management entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage offerings", pointing at the management area for offerings

#### Scenario: Manage locations entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Manage locations", pointing at `/{locale}/manage/locations`, right after "Manage offerings"

#### Scenario: Explore coffee inventory entry for a coffeeshop
- **WHEN** the authenticated user's `data.role` from `GET /user` is `coffeeshop`
- **THEN** the menu offers "Explore coffee inventory", pointing at `/{locale}/manage/inventory`, right after "Manage locations"

#### Scenario: Management entry for a specialist
- **WHEN** the authenticated user's `data.role` from `GET /user` is `specialist`
- **THEN** the menu offers "Manage evaluations", pointing at the management area for evaluations, followed by "Explore offerings", pointing at `/{locale}/offerings` with no query

#### Scenario: No management entry for the role
- **WHEN** the authenticated user's `data.role` is neither `coffeeshop` nor `specialist`
- **THEN** the menu offers the account entry and sign out with no management entry

#### Scenario: Sign out
- **WHEN** the user activates "Sign out"
- **THEN** the application signs the user out and the header renders as anonymous

#### Scenario: Menu entries carry icons and the header look
- **WHEN** the user opens the user menu
- **THEN** each entry shows a decorative icon hidden from assistive technology before its text, takes `nav-text` with `nav-text-hover` on hover and focus, and shows no underline and no link colour, in both themes

### Requirement: Content-Security-Policy
Every document response of the application SHALL carry a Content-Security-Policy that allows scripts only from the application itself, allows connections only to the application itself and to `https://nominatim.openstreetmap.org`, and allows images from the map tile server `https://tile.openstreetmap.org`. Every call to the API goes to the application's own origin, so the policy names no API origin. Static assets — framework paths under `/_next/` and file paths — are intentionally excluded from the policy, the paths the application forwards to the API carry no policy from the application, and `/callback` gets its policy from `add-auth`, which owns that route.

#### Scenario: Own scripts run
- **WHEN** the application's own scripts load on a page
- **THEN** the policy allows them and the page works

#### Scenario: Scripts from other origins are blocked
- **WHEN** a response attempts to load a script from an origin other than the application's
- **THEN** the policy blocks it

#### Scenario: Connections to the API are allowed
- **WHEN** a page of the application answers a request and the page then connects to the API through the application's own origin
- **THEN** the `connect-src` of its policy is `'self' https://nominatim.openstreetmap.org`, naming no API origin, and the connection is allowed as a connection to the application itself

#### Scenario: Connections to the geocoding service are allowed
- **WHEN** the application looks up an address at `https://nominatim.openstreetmap.org`
- **THEN** the policy allows the connection, and connections to any other origin outside the application and that service stay blocked

#### Scenario: Map images are allowed
- **WHEN** the map loads its images from the map tile server `https://tile.openstreetmap.org`
- **THEN** the policy allows them, and images from any other external origin stay blocked

#### Scenario: Policy present on every document response
- **WHEN** verification inspects the responses of the application
- **THEN** each document response carries a Content-Security-Policy, while the excluded static assets, the forwarded paths and the `/callback` route carry none from this policy

### Requirement: Cross-Origin-Opener-Policy
Every document response of the application except the callback route SHALL carry `Cross-Origin-Opener-Policy: same-origin-allow-popups`, so the application's pages stay isolated while a popup window keeps its opener. The paths the application forwards to the API are left untouched by this header.

#### Scenario: Opener kept outside the callback
- **WHEN** a page other than the callback route answers a request
- **THEN** its response carries `Cross-Origin-Opener-Policy: same-origin-allow-popups`

### Requirement: Response security headers
Every document response of the application SHALL carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` that allows geolocation only for the application's own origin and denies the camera, the microphone, payment and USB. No response the application produces itself SHALL carry `X-Powered-By`. Static assets — framework paths under `/_next/` and file paths — and the paths the application forwards to the API are left untouched by these headers, as by the Content-Security-Policy.

#### Scenario: Security headers on a page response
- **WHEN** a page of the application answers a request
- **THEN** its response carries `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`

#### Scenario: Framework not disclosed
- **WHEN** the production server answers a request it does not forward to the API
- **THEN** the response carries no `X-Powered-By` header
