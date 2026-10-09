## MODIFIED Requirements

### Requirement: Saving a draft

Save draft SHALL create the evaluation with `createAnEvaluation` the first time and update it with `updateAnEvaluation` afterwards, sending `offeringId` only on creation, `descriptive.roastLevel` and the entered parts. On success the form SHALL navigate client-side, without a full page load, to the My evaluations route `/{locale}/manage/evaluations`. On failure the form SHALL stay with its message in a status region beside the actions. A `422` SHALL show the messages for `descriptive.roastLevel` and `extractionMethod` under the roast level and extraction method fields as form-fields "Server validation errors" states, and the generic failure message only when one of its keys names neither field.

#### Scenario: The first save

- **WHEN** the specialist saves a new form and the creation succeeds
- **THEN** the app router navigates to `/{locale}/manage/evaluations`

#### Scenario: A later save

- **WHEN** the specialist saves an already created evaluation and the update succeeds
- **THEN** the app router navigates to `/{locale}/manage/evaluations`

#### Scenario: The form is not valid

- **WHEN** the specialist saves without a roast level
- **THEN** the request is not sent and the roast level field shows its validation message

#### Scenario: The API refuses the write

- **WHEN** a save answers `403`
- **THEN** the "not yours" message appears; when it answers `409` the "already closed" message appears; when it answers any other non-2xx status except `422` or fails for any other reason the generic failure message appears; in every case the form stays without navigating, no retry is offered and nothing is sent again automatically

#### Scenario: The API names an invalid field

- **WHEN** a save answers `422` with a message for `descriptive.roastLevel`
- **THEN** that message renders under the roast level field, which is marked invalid, no failure message appears, the form stays without navigating, and the message clears when the specialist changes the roast level
