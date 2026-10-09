## MODIFIED Requirements

### Requirement: Cancelling registration
Both registration forms, specialist and coffee shop, SHALL show a "Cancel" button under the full-width submit action, centred, that opens the root of the active locale `/{locale}` without sending anything. The success panel and the loading state SHALL have no Cancel button. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel opens the locale root without sending anything
- **WHEN** the registration form renders and the user activates "Cancel"
- **THEN** the button under the submit action navigates to `/{locale}` and no `POST /register` is sent

#### Scenario: Cancel is a button
- **WHEN** the registration form renders
- **THEN** "Cancel" is a button, not a link, and activating it navigates to `/{locale}`

### Requirement: Change password view
The application SHALL offer the Change password view at `/{locale}/account/password`, with the account page's session gate and page shell: a back button to `/{locale}/account`, a heading block, and, for an authenticated session, one section card named "Change password" holding the password form of "Password change", its states and its reactive step-up unchanged.

#### Scenario: The password form
- **WHEN** the Change password view opens for an authenticated session
- **THEN** one section named "Change password" shows the current-password, new-password and confirmation fields of the password form

#### Scenario: Back to the account
- **WHEN** the Change password view renders and the user has no previous page of the application
- **THEN** its back button addresses `/{locale}/account`

#### Scenario: The view's session gate
- **WHEN** the Change password view opens and the session is anonymous
- **THEN** one section card with no header band shows the signed-out text and a "Sign in" action, no section renders, and the page does not redirect

#### Scenario: Back is a button
- **WHEN** the Change password view renders
- **THEN** its back control is a button, not a link, that navigates to the destination it addresses
