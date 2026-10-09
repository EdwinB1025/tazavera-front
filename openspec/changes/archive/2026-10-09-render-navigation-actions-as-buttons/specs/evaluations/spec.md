## MODIFIED Requirements

### Requirement: Evaluation form

The route `/{locale}/manage/evaluations/new?offering={ulid}` SHALL present the CVA combined form for a new evaluation of that offering and the route `/{locale}/manage/evaluations/{ulid}` the same form loaded from the evaluation. The form SHALL carry the header fields roast level (prefilled from the offering's `coffeeInventory.coffee.roastLevel`) and extraction method, and the eight groups in CVA order: Fragrance / Aroma, Flavor / Aftertaste, Acidity, Sweetness, Mouthfeel, Overall, Defects and Extrinsic. Every group with a descriptive part SHALL offer one intensity control per axis on the 0–15 scale and every group with an affective part one preference control per axis on the 1–9 scale, Overall having only the affective one. Defects SHALL offer only its descriptor block and Extrinsic only its optional notes field, sent as `extrinsics.generalObservation`. The header fields SHALL sit in a section card (content-structure "Section card") with no header band. At every viewport each group SHALL be a section card whose header band holds a collapsible section header (content-structure "Collapsible section") carrying the group name and, in the band's aside, its completeness indicator; groups SHALL sit 1rem apart and the form's top-level blocks 2rem apart; every group SHALL start collapsed in an editable form and expanded in a closed one, and while a group is collapsed its card SHALL show only its header band, with no separator under it. Right after the Flavor / Aftertaste group, which holds Main tastes, the form SHALL show the informative collapsible section "Affective quality impression", the 1–9 legend, as a section card with its collapsible header in the band: the nine values in order, each with a bean mark with its number inside it and its label (1 Extremely low, 2 Very low, 3 Moderately low, 4 Slightly low, 5 Neither high nor low, 6 Slightly high, 7 Moderately high, 8 Very high, 9 Extremely high); it follows the groups' initial-state rule and has no completeness indicator. An evaluation whose `offeringId` is `null` SHALL open read-only, with the "Offering no longer exists" message in place of the offering header and the roast level, and keeps its extraction method. A form shown read-only (a closed evaluation, or an evaluation whose `offeringId` is `null`), which has no actions, SHALL repeat the header's back button to `/{locale}/manage/evaluations`, with the same text, after the read-only status at the end of the form; an editable form SHALL show no second back button.

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

#### Scenario: Form sections

- **WHEN** the form renders in either theme, at any viewport
- **THEN** the roast level and extraction method sit in a section card with no header band, each group and the 1–9 legend are section cards with their collapsible header in the header band and no accent edge, the cards of the groups and the legend are 1rem apart, and the header, the context card, the groups and the actions are 2rem apart

#### Scenario: The 1–9 legend

- **WHEN** the form opens
- **THEN** the "Affective quality impression" section sits between the Flavor / Aftertaste and Acidity groups, collapsed in an editable form and expanded in a closed one, and once expanded it lists the nine values from 1 to 9, each with its number inside its bean mark and its label, the number remaining part of the item's text for assistive technology

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

#### Scenario: Back link at the end of a read-only evaluation

- **WHEN** the form opens for a closed evaluation
- **THEN** a second back button with the same text and destination as the header's renders after the last group and the read-only status, and an editable form renders only the header's back button

#### Scenario: Back buttons on the evaluation form
- **WHEN** the evaluation form renders
- **THEN** the header's back control, and the second one of a read-only form, are buttons, not links, that navigate to `/{locale}/manage/evaluations`

### Requirement: Read-only evaluation view
The system SHALL show, at `/{locale}/evaluations/{ulid}` to any visitor, one closed specialist evaluation: a header with the offering's identity (coffee name as the page heading, the coffeeshop and roaster captions, the "Closed on" line and a "View offering" link) and the read-only evaluation presentation below. The route SHALL offer a back button to the previous page, whose fallback destination is the plain list with no query. When the offering cannot be loaded, the header SHALL show the offering-unavailable message as the heading with no captions and no "View offering" link while the presentation still renders. When the evaluation's `offeringId` is null, no offering request SHALL be made and the header SHALL show the offering-missing message as the heading with no captions and no "View offering" link while the back button and the presentation still render. When the evaluation renders, the back button SHALL be repeated, with the same text and destination, at the end of the second section, after the presentation; the loading and error states SHALL keep only the first section's back button.

#### Scenario: Loading the view
- **WHEN** the view is being loaded
- **THEN** the first section shows the back button and three placeholder bars and the second section shows two placeholder cards

#### Scenario: Viewing a closed evaluation
- **WHEN** the request returns 200 with `status` closed
- **THEN** the header shows the offering's identity and the presentation shows the evaluation's results

#### Scenario: Opening an evaluation that is not closed
- **WHEN** the request returns 200 with `status` other than closed
- **THEN** the route renders the 404 page

#### Scenario: The offering cannot be loaded
- **WHEN** the evaluation loads but its offering request fails
- **THEN** the heading shows the offering-unavailable message with no captions and no "View offering" link, and the presentation renders the evaluation's results

#### Scenario: Viewing an evaluation whose offering was deleted
- **WHEN** the evaluation loads with `status` closed and `offeringId` null
- **THEN** no offering request is made, the heading shows the offering-missing message with no captions and no "View offering" link, and the back button and the presentation render as usual

#### Scenario: The evaluation cannot be loaded
- **WHEN** the evaluation request or the taxonomy request fails with any non-2xx status (an unknown ULID included, whose 404 is undocumented) or a transport failure
- **THEN** the first section keeps the back button and the second section shows the error message with a Retry control

#### Scenario: Retrying after a failure
- **WHEN** the visitor activates Retry
- **THEN** the view is requested again and moves through loading to either the evaluation or the same error message

#### Scenario: Back link at the end
- **WHEN** the view renders a closed evaluation
- **THEN** a second back button with the same text and destination renders after the presentation's last section

#### Scenario: Back buttons on the read-only evaluation view
- **WHEN** the read-only evaluation view renders
- **THEN** its back controls are buttons, not links, with the same text and destination

### Requirement: Cancelling the evaluation form
An editable evaluation form, new or existing, SHALL show a "Cancel" button after the Save draft and Close evaluation actions that opens the My evaluations route `/{locale}/manage/evaluations` without saving and without sending any request, and that stays usable while an action runs. Below 768px the sticky actions bar SHALL stack the status region, the two actions side by side with equal widths, and the Cancel button centred on its own line; from 768px the actions SHALL form one right-aligned row with Cancel last. A closed evaluation, shown read-only, SHALL have no Cancel button. No warning about unsaved input SHALL be shown.

#### Scenario: Cancel leaves for My evaluations without saving
- **WHEN** the editable evaluation form renders and the user activates "Cancel"
- **THEN** the button after Close evaluation navigates to `/{locale}/manage/evaluations` and no save or close request is sent

#### Scenario: No Cancel on a closed evaluation
- **WHEN** a closed evaluation renders read-only
- **THEN** no "Cancel" button renders

#### Scenario: Cancel is a button
- **WHEN** the editable evaluation form renders
- **THEN** "Cancel" is a button, not a link, and activating it navigates to `/{locale}/manage/evaluations`
