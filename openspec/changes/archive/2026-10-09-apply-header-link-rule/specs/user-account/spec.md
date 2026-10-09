## MODIFIED Requirements

### Requirement: Change password view
The application SHALL offer the Change password view at `/{locale}/account/password`, with the account page's session gate and page shell: a back link to the previous page, whose fallback destination is `/{locale}/account`, a heading block, and, for an authenticated session, one section card named "Change password" holding the password form of "Password change", its states and its reactive step-up unchanged.

#### Scenario: The password form
- **WHEN** the Change password view opens for an authenticated session
- **THEN** one section named "Change password" shows the current-password, new-password and confirmation fields of the password form

#### Scenario: Back to the account
- **WHEN** the Change password view renders and the user has no previous page of the application
- **THEN** its back link addresses `/{locale}/account`

#### Scenario: The view's session gate
- **WHEN** the Change password view opens and the session is anonymous
- **THEN** one section card with no header band shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

#### Scenario: Back is a button
- **WHEN** the Change password view renders
- **THEN** its back control, on the first line of its header, is a link with the back arrow, not a button
