## ADDED Requirements

### Requirement: Response security headers
Every document response of the application SHALL carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` that allows geolocation only for the application's own origin and denies the camera, the microphone, payment and USB. No response of the application SHALL carry `X-Powered-By`. Static assets — framework paths under `/_next/` and file paths — are left untouched by these headers, as by the Content-Security-Policy.

#### Scenario: Security headers on a page response
- **WHEN** a page of the application answers a request
- **THEN** its response carries `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)`

#### Scenario: Framework not disclosed
- **WHEN** the production server answers any request
- **THEN** the response carries no `X-Powered-By` header
