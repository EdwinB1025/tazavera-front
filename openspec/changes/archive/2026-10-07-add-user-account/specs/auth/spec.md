# Spec Delta

## MODIFIED Requirements

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
