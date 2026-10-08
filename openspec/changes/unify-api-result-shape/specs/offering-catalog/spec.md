# Spec Delta

## ADDED Requirements

### Requirement: One result shape for every API request
Every request function of the front's request layers (the public reads, the specialist's evaluation calls, the offering, location, account, registration and contact requests) SHALL report its outcome in one shared result shape, declared once in the shared API segment: a success carrying its data, or a failure carrying one kind among not-found, forbidden, conflict and the generic error. A request function SHALL never reject, and SHALL report only the failure kinds its consumers tell apart. The requests sent to the API and what users see for every status, transport failure and unreadable body SHALL stay the same. The OAuth token and authorize flows are not request functions in this sense.

#### Scenario: One result shape
- **WHEN** any request function of the front's request layers resolves
- **THEN** it resolves to the shared result shape, a success with its data or a failure with its kind, and never rejects

#### Scenario: Requests and states unchanged
- **WHEN** any request is sent and receives a given status, fails on the network or returns a body that cannot be read
- **THEN** the API receives the same method, URL, query string, headers, body and request options as before the refactor, and the user sees the same state and message as before the refactor
