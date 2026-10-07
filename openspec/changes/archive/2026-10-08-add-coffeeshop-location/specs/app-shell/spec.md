## MODIFIED Requirements

### Requirement: Content-Security-Policy
Every document response of the application SHALL carry a Content-Security-Policy that allows scripts only from the application itself and allows connections to the API origin and to the address geocoding service's origin (`https://nominatim.openstreetmap.org`). Static assets — framework paths under `/_next/` and file paths — are intentionally excluded from the policy, and `/callback` gets its policy from `add-auth`, which owns that route.

#### Scenario: Own scripts run
- **WHEN** the application's own scripts load on a page
- **THEN** the policy allows them and the page works

#### Scenario: Scripts from other origins are blocked
- **WHEN** a response attempts to load a script from an origin other than the application's
- **THEN** the policy blocks it

#### Scenario: Connections to the API are allowed
- **WHEN** the application connects to the API origin
- **THEN** the policy allows the connection

#### Scenario: Connections to the geocoding service are allowed
- **WHEN** the application looks up an address at `https://nominatim.openstreetmap.org`
- **THEN** the policy allows the connection, and connections to any other origin outside the application, the API and that service stay blocked

#### Scenario: Policy present on every document response
- **WHEN** verification inspects the responses of the application
- **THEN** each document response carries a Content-Security-Policy, while the excluded static assets and the `/callback` route carry none from this policy
