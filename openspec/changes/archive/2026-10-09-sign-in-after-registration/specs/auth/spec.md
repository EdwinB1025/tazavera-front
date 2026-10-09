## ADDED Requirements

### Requirement: Sign-in from a registration grant
When a registration hands over the token block of its `201`, the application SHALL keep that block as the session's tokens in memory only, never writing it to browser storage, and SHALL settle the session with the profile of `GET /user`, without opening the API's authorization page, without passing through the callback and without setting the marker that records that the user had signed in. A block that does not carry `access_token`, `token_type` and `refresh_token` as text and `expires_in` as a number SHALL be refused and nothing kept; a refused block or a profile that cannot be loaded SHALL leave the session `anonymous` with no tokens kept and no error shown.

#### Scenario: Signing in with a registration grant
- **WHEN** a registration hands over a token block with the four fields
- **THEN** the tokens are held in memory, browser storage holds no token, the session becomes `authenticated` with the profile of `GET /user`, and the marker is not set

#### Scenario: A registration grant that cannot sign in
- **WHEN** the handed-over block lacks one of the four fields or has one of the wrong type, or the profile cannot be loaded
- **THEN** the session is `anonymous`, no tokens are kept, the marker is not set and no error is shown
