# Spec Delta

## Purpose

Lets a signed-in specialist record the sensory evaluations of an offering with the SCA CVA combined form: create a draft, complete and close it, review closed evaluations read-only, and manage the list of their own evaluations.

## ADDED Requirements

### Requirement: My evaluations list

The route `/{locale}/manage/evaluations` SHALL show the evaluations of the signed-in specialist and no others, 15 per page and ordered by `created_at` descending. Each row SHALL show the evaluation's `cuppingScore` with its "/100" scale and a rating badge carrying the tier word of that score, the status of the evaluation as a badge labelled "Open" or "Closed", the coffee name of the offering, the date of the row's state ("Created on" `createdAt` when the evaluation is open, "Closed on" `closedAt` when it is closed), and the coffeeshop and roaster captions built from the offering's `location.name` and `coffeeInventory.roastery.name`. An evaluation whose `offeringId` is `null` (its offering was deleted) SHALL show the "Offering no longer exists" message in place of the coffee name and the captions, and no offering SHALL be requested for it.

#### Scenario: Loading the list

- **WHEN** the specialist opens the list route and the evaluations have not arrived yet
- **THEN** a loading state is shown in the list's place until the page of evaluations and its offerings arrive

#### Scenario: Rows of a loaded page

- **WHEN** the evaluations of the specialist arrive with their offerings
- **THEN** one row per evaluation shows the score and rating badge of its `cuppingScore`, its status badge, the coffee name, the date of its state and the coffeeshop and roaster captions

#### Scenario: An open evaluation has no score yet

- **WHEN** a row's evaluation is open and its `cuppingScore` is absent
- **THEN** the row shows no score, no "/100" and no rating badge, and keeps the rest of its content

#### Scenario: A row whose offering was deleted

- **WHEN** an evaluation of the page arrives with `offeringId` `null`
- **THEN** its row shows the "Offering no longer exists" message in place of the coffee name and the coffeeshop and roaster captions, keeps its score, status badge and date, and no offering is requested for it while the other rows' offerings are

#### Scenario: Newest first across pages

- **WHEN** the specialist pages through the list
- **THEN** the rows stay ordered by `created_at` descending across the pages, Previous and Next move one page back or forward, Previous is disabled on the first page and Next on the last

#### Scenario: The specialist has no evaluations

- **WHEN** the list answers with an empty `data`
- **THEN** an empty message is shown in the list's place

#### Scenario: The list cannot be loaded

- **WHEN** the request fails for any reason other than an authentication failure
- **THEN** a failure message with a retry action is shown in the list's place

### Requirement: Row actions

Each row SHALL offer Edit for an open evaluation, View for a closed one or for any evaluation whose `offeringId` is `null`, and Delete with an explicit confirmation for all of them.

#### Scenario: Editing an open evaluation

- **WHEN** the specialist activates Edit on an open row
- **THEN** the form route `/{locale}/manage/evaluations/{ulid}` opens with the evaluation loaded for editing

#### Scenario: Viewing a closed evaluation

- **WHEN** the specialist activates View on a closed row
- **THEN** the same form route opens read-only

#### Scenario: A row whose offering was deleted

- **WHEN** a row's evaluation has `offeringId` `null`, open or closed
- **THEN** the row offers View, which opens the form route read-only, and Delete

#### Scenario: Deleting after confirmation

- **WHEN** the specialist confirms the deletion in the confirmation dialog
- **THEN** the confirm action shows its pending state, the row is removed and the list is refreshed on success

#### Scenario: Cancelling the deletion

- **WHEN** the specialist dismisses the confirmation dialog
- **THEN** nothing is sent and the list is unchanged

#### Scenario: The deletion is refused

- **WHEN** the deletion answers `403`
- **THEN** the dialog shows the "not yours" message and no retry is offered

### Requirement: Evaluation form

The route `/{locale}/manage/evaluations/new?offering={ulid}` SHALL present the CVA combined form for a new evaluation of that offering and the route `/{locale}/manage/evaluations/{ulid}` the same form loaded from the evaluation. The form SHALL carry the header fields roast level (prefilled from the offering's `coffeeInventory.coffee.roastLevel`) and extraction method, and the eight groups in CVA order: Fragrance / Aroma, Flavor / Aftertaste, Acidity, Sweetness, Mouthfeel, Overall, Defects and Extrinsic. Every group with a descriptive part SHALL offer one intensity control per axis on the 0–15 scale and every group with an affective part one preference control per axis on the 1–9 scale, Overall having only the affective one. Defects SHALL offer only its descriptor block and Extrinsic only its optional notes field, sent as `extrinsics.generalObservation`. At every viewport each group SHALL be a collapsible section (content-structure "Collapsible section") whose header carries the group name and its completeness indicator; every group SHALL start collapsed in an editable form and expanded in a closed one, and while a group is collapsed its card SHALL show only its header row, with no separating border under it. Right after the Flavor / Aftertaste group, which holds Main tastes, the form SHALL show the informative collapsible section "Affective quality impression", the 1–9 legend: the nine values in order, each with a bean mark, its number and its label (1 Extremely low, 2 Very low, 3 Moderately low, 4 Slightly low, 5 Neither high nor low, 6 Slightly high, 7 Moderately high, 8 Very high, 9 Extremely high); it follows the groups' initial-state rule and has no completeness indicator. An evaluation whose `offeringId` is `null` SHALL open read-only, with the "Offering no longer exists" message in place of the offering header and the roast level, and keeps its extraction method.

#### Scenario: The form header

- **WHEN** the form opens with an offering that exists
- **THEN** it shows the coffee name, the coffeeshop and the roaster of that offering, the roast level control prefilled with `coffeeInventory.coffee.roastLevel`, and the extraction method choice among espresso, v60, chemex, aeropress, french_press, moka, cold_brew, siphon and kalita, each shown with its catalog label

#### Scenario: A stored extraction method outside the options

- **WHEN** a loaded evaluation carries an `extractionMethod` that is none of the nine options
- **THEN** the stored value is shown as-is and is sent back unchanged

#### Scenario: A new draft starts empty

- **WHEN** the form opens for a new evaluation
- **THEN** every intensity control shows 0, every preference control is unset, no note is open, the "Fragrance not evaluated — use aroma values" option is unchecked and only the roast level is required to save

#### Scenario: Groups of an editable form

- **WHEN** the form opens for a new evaluation or an open one, at any viewport
- **THEN** every group shows only its header row, with its name, its completeness indicator where the group has one, and the collapse control, and activating the header shows or hides that group's content

#### Scenario: Groups of a closed evaluation

- **WHEN** the form opens for a closed evaluation
- **THEN** every group starts expanded and can still be collapsed from its header

#### Scenario: The 1–9 legend

- **WHEN** the form opens
- **THEN** the "Affective quality impression" section sits between the Flavor / Aftertaste and Acidity groups, collapsed in an editable form and expanded in a closed one, and once expanded it lists the nine values from 1 to 9, each with its bean mark, its number and its label

#### Scenario: An evaluation of a deleted offering

- **WHEN** the evaluation route opens an evaluation whose `offeringId` is `null`, open or closed
- **THEN** no offering is requested, the form is shown read-only with every group and the legend expanded, the "Offering no longer exists" message replaces the coffee name, the coffeeshop and roaster captions and the roast level, the extraction method is shown read-only, and no save or close action is offered

#### Scenario: Loading an evaluation for edit

- **WHEN** the form opens for an existing open evaluation
- **THEN** the scores and notes of `descriptive` and `affective` fill their controls, each selection of `tastes` fills the descriptor block its `type` reports (`fragrance`, `aroma`, `flavor` or `aftertaste` for the two shared aromatic blocks, `mouthfeel`, `main_tastes`, `defects`), and `extractionMethod` fills its choice

#### Scenario: Reading a closed evaluation

- **WHEN** the form opens for a closed evaluation
- **THEN** the same content is shown with every control read-only and with no save, close, note or remove-note action

#### Scenario: An unknown offering or evaluation

- **WHEN** the new form is opened without an `offering` query value or with an unknown one, or the evaluation route names an evaluation that does not exist or belongs to another user
- **THEN** the 404 page is shown

#### Scenario: The form cannot be loaded

- **WHEN** the evaluation or its offering cannot be loaded for any reason other than an authentication failure
- **THEN** a failure message with a retry action is shown

### Requirement: Descriptor blocks

Each descriptor block SHALL offer the level-0 and level-1 nodes of `GET /taxonomies` whose `categories` contain the block's value (`aromatics`, `main_tastes`, `mouthfeel`, `defects`), as rows of the level-0 nodes with their matching level-1 children, plus one row of the matching level-0 nodes that have no matching child, with level 2 never shown and the node name of the route's locale as the label. A node matching several blocks SHALL appear in each of them. Selection SHALL be multiple with no limit on main tastes.

#### Scenario: A block's options

- **WHEN** the taxonomy tree arrives and a block is rendered
- **THEN** it shows one row per level-0 node with matching children, those children as its options, and one shared row with the matching level-0 nodes that have no matching child

#### Scenario: Selecting descriptors

- **WHEN** the specialist selects descriptors in a shared aromatic block
- **THEN** the selection is sent as `cata` on both axes of its pair (`fragrance` and `aroma`, or `flavor` and `aftertaste`), and the mouthfeel block sends `descriptive.mouthfeel.cata`, the main tastes block sends `descriptive.mainTastes` and the defects block sends `affective.defects`

### Requirement: Notes

Every axis and part SHALL hide its optional note behind an "Add note" control; once open, the note can be removed with a remove-note control and the note is sent as that axis's `note`.

#### Scenario: Adding a note

- **WHEN** the specialist activates "Add note" on an axis
- **THEN** a note text area appears with its label and the remove-note control

#### Scenario: Removing a note

- **WHEN** the specialist activates the remove-note control
- **THEN** the note and its text are dropped from the form and from what will be sent

### Requirement: Fragrance not evaluated

The Fragrance / Aroma group SHALL offer a visible "Fragrance not evaluated — use aroma values" option, unchecked on load. While it is checked, the group's completeness ignores the fragrance scores and the aroma descriptive and affective scores are sent as the fragrance scores of the same part.

#### Scenario: Using the aroma values for fragrance

- **WHEN** the option is checked and the specialist saves
- **THEN** the aroma descriptive and affective scores are sent as the fragrance scores of the same part

#### Scenario: The option is unchecked again

- **WHEN** the specialist unchecks the option before saving
- **THEN** the fragrance controls keep their own values and are sent as entered

### Requirement: Completeness indicator

Every group except Defects and Extrinsic SHALL show a completeness indicator beside its name: "Complete" with a check icon when the group is complete and "Incomplete" as text otherwise. A group's scores are complete when every score of the group is greater than 0. The descriptor requirement of the aromatic set (one descriptor across fragrance, aroma, flavor and aftertaste) SHALL be one requirement shared by the Fragrance / Aroma and Flavor / Aftertaste groups, the Flavor / Aftertaste group SHALL additionally require one main tastes descriptor, and the Mouthfeel group one mouthfeel descriptor. The indicator SHALL never convey its state by colour alone.

#### Scenario: A group with an unset score

- **WHEN** any score of a group is 0 or unset
- **THEN** the group shows "Incomplete"

#### Scenario: The shared aromatic requirement

- **WHEN** the aromatic set has no descriptor selected
- **THEN** both the Fragrance / Aroma and the Flavor / Aftertaste groups show "Incomplete" whatever their scores

#### Scenario: A complete group

- **WHEN** every score of a group is greater than 0 and its descriptor requirements are met
- **THEN** the group shows "Complete" with a check icon

### Requirement: Saving a draft

Save draft SHALL create the evaluation with `createAnEvaluation` the first time and update it with `updateAnEvaluation` afterwards, sending `offeringId` only on creation, `descriptive.roastLevel` and the entered parts. On the first success the route SHALL become `/{locale}/manage/evaluations/{ulid}` and a saved confirmation SHALL appear in a status region beside the actions.

#### Scenario: The first save

- **WHEN** the specialist saves a new form and the creation succeeds
- **THEN** the route becomes the evaluation's own route, later saves update it, and the saved confirmation appears

#### Scenario: A later save

- **WHEN** the specialist saves an already created evaluation and the update succeeds
- **THEN** the saved confirmation appears and the route stays

#### Scenario: The form is not valid

- **WHEN** the specialist saves without a roast level
- **THEN** the request is not sent and the roast level field shows its validation message

#### Scenario: The API refuses the write

- **WHEN** a save answers `403`
- **THEN** the "not yours" message appears; when it answers `409` the "already closed" message appears; when it answers `422` or fails for any other reason the generic failure message appears; no retry is offered and nothing is sent again automatically

### Requirement: Closing an evaluation

Close evaluation SHALL save the form and then call `closeAnEvaluation`. On success the form SHALL become the read-only view and a closed confirmation SHALL appear.

#### Scenario: Closing a complete evaluation

- **WHEN** the specialist closes the evaluation and the close succeeds
- **THEN** the read-only view replaces the form with every group expanded and the closed confirmation appears

#### Scenario: Closing an incomplete evaluation

- **WHEN** the close answers `409`
- **THEN** the incomplete message appears and the groups that are incomplete are highlighted and expanded, collapsed ones included

#### Scenario: Closing is refused

- **WHEN** the close answers `403`
- **THEN** the "not yours" message appears and no retry is offered

### Requirement: Sign-in to the evaluation routes

An anonymous visitor to any `/manage/evaluations` route SHALL see a message with a "Sign in" button that starts the sign-in for the current route when activated and leaves the visitor on the route. A signed-in user without the specialist role SHALL see the 404 page. While the session is loading the page SHALL wait before deciding.

#### Scenario: An anonymous visitor

- **WHEN** an anonymous visitor opens one of the routes and activates "Sign in"
- **THEN** the sign-in opens for that route and the visitor stays on it

#### Scenario: A user without the specialist role

- **WHEN** a signed-in user with another role opens one of the routes
- **THEN** the 404 page is shown

### Requirement: Evaluate action on the offering card

The Evaluate action of an offering card SHALL render only for a signed-in specialist and SHALL point at `/{locale}/manage/evaluations/new?offering={ulid}` with that offering's `ulid`. The View action SHALL keep rendering for every visitor.

#### Scenario: A signed-in specialist

- **WHEN** a signed-in specialist sees an offering card
- **THEN** the card shows the Evaluate action beside View and it opens the new form for that offering

#### Scenario: Any other visitor

- **WHEN** an anonymous visitor or a user with another role sees an offering card
- **THEN** the card shows no Evaluate action

### Requirement: Management sidebar entry

On the evaluation routes the management sidebar SHALL show the specialist area's one entry, "My evaluations", pointing at `/{locale}/manage/evaluations` and marked as the current page when the list is in view.

#### Scenario: The entry on the list route

- **WHEN** the specialist opens the list route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry marked as the current page

#### Scenario: The entry on a form route

- **WHEN** the specialist opens a form route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry without the current-page marking
