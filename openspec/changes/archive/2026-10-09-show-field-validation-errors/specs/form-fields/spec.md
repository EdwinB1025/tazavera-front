## ADDED Requirements

### Requirement: Server validation errors
A documented `422` body — Laravel's `{"message", "errors": {key: [messages]}}` — SHALL be turned into per-field messages by one shared mapping: each key of `errors` whose first message is a non-empty text maps to the form field the consuming form names for that key, and keys the form names no field for are reported as unmatched. A form SHALL show each mapped field's first message as that field's error message (the "Field structure and association" error presentation: below the control, the control marked invalid and described by the message, never colour alone), as the API returns it, with no catalog text in its place. A form SHALL show its existing form-level error only when the body has a key that maps to no field or carries no usable message. A field's server message SHALL clear as soon as the user edits that field, and every server message SHALL clear when the form is submitted again.

#### Scenario: A 422 maps to its fields
- **WHEN** a `422` body carries messages for keys the form names fields for and for a key it names no field for
- **THEN** each named field receives its first message, and the other key is reported as unmatched so the form-level error shows
