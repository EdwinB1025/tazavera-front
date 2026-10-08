# Spec Delta

## ADDED Requirements

### Requirement: Account requests through the slice's request layer
The registration form, the profile form, the password form and the account deactivation and deletion SHALL send their requests and map the response statuses to outcomes in the account feature's request layer, never in the screens that show them, and the registration and password forms SHALL share one new-password and confirmation fields part. What users see (markup, accessible names, texts and the message shown per status) and the requests sent to the API (method, path, body and headers) SHALL stay the same.

#### Scenario: Account write sent through the request layer
- **WHEN** a user submits the registration, profile or password form, or confirms the account deactivation or deletion
- **THEN** the request is sent and its status mapped to an outcome by the account feature's request layer, and the screen only shows the outcome

#### Scenario: Requests and outcomes unchanged
- **WHEN** any of those writes receives a given status, or fails on the network
- **THEN** the API receives the same method, path, body and headers as before the refactor, and the user sees the same outcome

#### Scenario: Shared new-password fields
- **WHEN** the registration form or the password form is shown
- **THEN** both render the new password with its help and the confirmation from one shared part, with the same labels, attributes and errors as before the refactor
