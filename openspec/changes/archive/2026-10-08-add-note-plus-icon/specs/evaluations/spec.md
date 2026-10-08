## MODIFIED Requirements

### Requirement: Notes

Every axis and part SHALL hide its optional note behind an "Add note" control, which shows a decorative plus icon after its text; once open, the note can be removed with a remove-note control and the note is sent as that axis's `note`.

#### Scenario: The Add note control shows a plus icon

- **WHEN** an axis's note is closed
- **THEN** the "Add note" control shows a plus icon after its text, hidden from assistive technology, and its accessible name is exactly its text

#### Scenario: Adding a note

- **WHEN** the specialist activates "Add note" on an axis
- **THEN** a note text area appears with its label and the remove-note control

#### Scenario: Removing a note

- **WHEN** the specialist activates the remove-note control
- **THEN** the note and its text are dropped from the form and from what will be sent
