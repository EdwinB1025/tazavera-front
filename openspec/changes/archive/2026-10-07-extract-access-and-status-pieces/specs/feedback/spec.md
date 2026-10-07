# Spec Delta

## ADDED Requirements

### Requirement: Request status messages
A view SHALL report the state of a request with the shared status presentations: a loading status for a request still running — a polite status region carrying its text beside a spinner that assistive technology ignores and that does not animate under reduced motion; a form status for a finished write — a success as a polite status region carrying its text beside a check icon that assistive technology ignores, and an error as an alert carrying its text, never colour alone; and a step-up notice for a write answered `403` — an alert carrying its text and a "Confirm identity" action that starts the write-scope sign in synchronously inside its click. Each presentation SHALL add no text of its own.

#### Scenario: Loading status
- **WHEN** a view reports a request that is still running
- **THEN** a polite status region renders its text beside a spinner that is hidden from assistive technology and stays still under reduced motion

#### Scenario: Form status success
- **WHEN** a form's write succeeds and the view reports it
- **THEN** a polite status region renders the success text beside a check icon that is hidden from assistive technology

#### Scenario: Form status error
- **WHEN** a form's write is rejected or fails and the view reports it
- **THEN** an alert renders the error text, conveyed by its text and never by colour alone

#### Scenario: Step-up notice
- **WHEN** a write is answered `403` and the view reports it
- **THEN** an alert renders the notice text with a "Confirm identity" action, and activating that action starts the write-scope sign in synchronously inside that click, keeping the page and its input

#### Scenario: Consumer text only
- **WHEN** any status presentation renders
- **THEN** every visible text comes from the consuming capability's message catalog and no text comes from the presentation itself
