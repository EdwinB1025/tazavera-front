## MODIFIED Requirements

### Requirement: Saving a draft

Save draft SHALL create the evaluation with `createAnEvaluation` the first time and update it with `updateAnEvaluation` afterwards, sending `offeringId` only on creation, `descriptive.roastLevel` and the entered parts. On success the form SHALL navigate client-side, without a full page load, to the My evaluations route `/{locale}/manage/evaluations`. On failure the form SHALL stay with its message in a status region beside the actions.

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
- **THEN** the "not yours" message appears; when it answers `409` the "already closed" message appears; when it answers `422` or fails for any other reason the generic failure message appears; in every case the form stays without navigating, no retry is offered and nothing is sent again automatically
