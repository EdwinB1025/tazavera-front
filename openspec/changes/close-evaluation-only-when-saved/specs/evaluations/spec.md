## MODIFIED Requirements

### Requirement: Row actions

Each row SHALL offer Edit for an open evaluation, View for a closed one or for any evaluation whose `offeringId` is `null`, and Delete with an explicit confirmation for all of them. An open row whose `offeringId` is not `null` SHALL also offer Close evaluation between Edit and Delete, which calls `closeAnEvaluation` and reports its outcome in the row with the form's messages; on success the row SHALL show the closed state without a full page reload.

#### Scenario: Editing an open evaluation

- **WHEN** the specialist activates Edit on an open row
- **THEN** the form route `/{locale}/manage/evaluations/{ulid}` opens with the evaluation loaded for editing

#### Scenario: Viewing a closed evaluation

- **WHEN** the specialist activates View on a closed row
- **THEN** the same form route opens read-only

#### Scenario: A row whose offering was deleted

- **WHEN** a row's evaluation has `offeringId` `null`, open or closed
- **THEN** the row offers View, which opens the form route read-only, and Delete, and no Close evaluation

#### Scenario: Closing an open evaluation from its row

- **WHEN** the specialist activates Close evaluation on an open row
- **THEN** `closeAnEvaluation` is sent for the row's evaluation

#### Scenario: The row's close succeeds

- **WHEN** the close sent from a row succeeds
- **THEN** the row shows the closed confirmation, offers View instead of Edit and no longer offers Close evaluation

#### Scenario: The row's close finds the evaluation incomplete

- **WHEN** the close sent from a row answers `409`
- **THEN** the row shows the form's incomplete message and stays open

#### Scenario: No close on a closed row

- **WHEN** a closed row renders
- **THEN** it offers no Close evaluation

#### Scenario: Deleting after confirmation

- **WHEN** the specialist confirms the deletion in the confirmation dialog
- **THEN** the confirm action shows its pending state, the row is removed and the list is refreshed on success

#### Scenario: Cancelling the deletion

- **WHEN** the specialist dismisses the confirmation dialog
- **THEN** nothing is sent and the list is unchanged

#### Scenario: The deletion is refused

- **WHEN** the deletion answers `403`
- **THEN** the dialog shows the "not yours" message and no retry is offered

### Requirement: Closing an evaluation

Close evaluation SHALL appear in the form only when the evaluation exists: a form that edits a saved evaluation, including a new form once its first save created it. A new form with nothing saved SHALL NOT offer it. Close evaluation SHALL save the form and then call `closeAnEvaluation`. On success the form SHALL become the read-only view and a closed confirmation SHALL appear.

#### Scenario: No close on a new evaluation

- **WHEN** the form renders for a new evaluation with nothing saved
- **THEN** no Close evaluation action renders

#### Scenario: Close on a saved open evaluation

- **WHEN** the form renders a saved open evaluation
- **THEN** the Close evaluation action renders

#### Scenario: Closing a complete evaluation

- **WHEN** the specialist closes the evaluation and the close succeeds
- **THEN** the read-only view replaces the form with every group expanded and the closed confirmation appears

#### Scenario: Closing an incomplete evaluation

- **WHEN** the close answers `409`
- **THEN** the incomplete message appears and the groups that are incomplete are highlighted and expanded, collapsed ones included

#### Scenario: Closing is refused

- **WHEN** the close answers `403`
- **THEN** the "not yours" message appears and no retry is offered
