## MODIFIED Requirements

### Requirement: Evaluation form

The route `/{locale}/manage/evaluations/new?offering={ulid}` SHALL present the CVA combined form for a new evaluation of that offering and the route `/{locale}/manage/evaluations/{ulid}` the same form loaded from the evaluation. The form SHALL carry the header fields roast level (prefilled from the offering's `coffeeInventory.coffee.roastLevel`) and extraction method, and the eight groups in CVA order: Fragrance / Aroma, Flavor / Aftertaste, Acidity, Sweetness, Mouthfeel, Overall, Defects and Extrinsic. Every group with a descriptive part SHALL offer one intensity control per axis on the 0–15 scale and every group with an affective part one preference control per axis on the 1–9 scale, Overall having only the affective one. Defects SHALL offer only its descriptor block and Extrinsic only its five optional text fields, in this order: Farming, Processing, Trading, Certifications and General observation, sent as `extrinsics.farming`, `extrinsics.processing`, `extrinsics.trading`, `extrinsics.certifications` and `extrinsics.generalObservation`; General observation keeps its "Add note" control and the other four each show a labelled text area, and none of the five counts towards completeness. The header fields SHALL sit in a section card (content-structure "Section card") with no header band. At every viewport each group SHALL be a section card whose header band holds a collapsible section header (content-structure "Collapsible section") carrying the group name and, in the band's aside, its completeness indicator; groups SHALL sit 1rem apart and the form's top-level blocks 2rem apart; every group SHALL start collapsed in an editable form and expanded in a closed one, and while a group is collapsed its card SHALL show only its header band, with no separator under it. As the form's first section, after the header and before the context fields, the form SHALL show the informative collapsible section "Affective quality impression", the 1–9 legend, as a section card with its collapsible header in the band: the nine values in order, each with a bean mark with its number inside it and its label (1 Extremely low, 2 Very low, 3 Moderately low, 4 Slightly low, 5 Neither high nor low, 6 Slightly high, 7 Moderately high, 8 Very high, 9 Extremely high); it follows the groups' initial-state rule and has no completeness indicator. An evaluation whose `offeringId` is `null` SHALL open read-only, with the "Offering no longer exists" message in place of the offering header and the roast level, and keeps its extraction method. A form shown read-only (a closed evaluation, or an evaluation whose `offeringId` is `null`), which has no actions, SHALL repeat the header's back control as a back button, with the same text and destination, after the read-only status at the end of the form; an editable form SHALL show no second back control. The header's back control SHALL be a back link to the previous page, whose fallback destination is `/{locale}/manage/evaluations`.

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
- **THEN** the roast level and extraction method sit in a section card with no header band, each group and the 1–9 legend are section cards with their collapsible header in the header band and no accent edge, the cards of the groups are 1rem apart, and the header, the legend, the context card, the groups and the actions are 2rem apart

#### Scenario: The 1–9 legend

- **WHEN** the form opens
- **THEN** the "Affective quality impression" section is the form's first section, after the header and before the context fields card, collapsed in an editable form and expanded in a closed one, and once expanded it lists the nine values from 1 to 9, each with its number inside its bean mark and its label, the number remaining part of the item's text for assistive technology

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
- **THEN** a second back button with the same text and destination as the header's renders after the last group and the read-only status, and an editable form renders only the header's back link


#### Scenario: Back buttons on the evaluation form
- **WHEN** the evaluation form renders for a user with no previous page of the application
- **THEN** the header's back control is a link and the second one of a read-only form is a button, both addressing `/{locale}/manage/evaluations`

#### Scenario: Editing and sending the extrinsic fields

- **WHEN** the specialist fills some of the Extrinsic group's five fields, leaves the rest empty and saves
- **THEN** the write body's `extrinsics` carries `farming`, `processing`, `trading`, `certifications` and `generalObservation`, each with its entered text, and an empty field as `null`

#### Scenario: Loading the extrinsic fields

- **WHEN** the form opens for an existing evaluation whose `extrinsics` holds values
- **THEN** each of the five Extrinsic fields shows its value from `extrinsics`, and a closed evaluation shows each non-empty value as text under its label

### Requirement: Read-only evaluation view
The system SHALL show, at `/{locale}/evaluations/{ulid}` to any visitor, one closed specialist evaluation: a header with the offering's identity (coffee name as the page heading, the coffeeshop and roaster captions, the "Closed on" line and a "View offering" button) and the read-only evaluation presentation below. The route SHALL offer a back link to the previous page, whose fallback destination is the plain list with no query. When the offering cannot be loaded, the header SHALL show the offering-unavailable message as the heading with no captions and no "View offering" button while the presentation still renders. When the evaluation's `offeringId` is null, no offering request SHALL be made and the header SHALL show the offering-missing message as the heading with no captions and no "View offering" button while the back link and the presentation still render. When the evaluation renders, the back control SHALL be repeated as a back button, with the same text and destination, at the end of the second section, after the presentation; the loading and error states SHALL keep only the first section's back link.

#### Scenario: Loading the view
- **WHEN** the view is being loaded
- **THEN** the first section shows the back link and three placeholder bars and the second section shows two placeholder cards

#### Scenario: Viewing a closed evaluation
- **WHEN** the request returns 200 with `status` closed
- **THEN** the header shows the offering's identity and the presentation shows the evaluation's results

#### Scenario: Opening an evaluation that is not closed
- **WHEN** the request returns 200 with `status` other than closed
- **THEN** the route renders the 404 page

#### Scenario: The offering cannot be loaded
- **WHEN** the evaluation loads but its offering request fails
- **THEN** the heading shows the offering-unavailable message with no captions and no "View offering" button, and the presentation renders the evaluation's results

#### Scenario: Viewing an evaluation whose offering was deleted
- **WHEN** the evaluation loads with `status` closed and `offeringId` null
- **THEN** no offering request is made, the heading shows the offering-missing message with no captions and no "View offering" button, and the back link and the presentation render as usual

#### Scenario: The evaluation cannot be loaded
- **WHEN** the evaluation request or the taxonomy request fails with any non-2xx status (an unknown ULID included, whose 404 is undocumented) or a transport failure
- **THEN** the first section keeps the back link and the second section shows the error message with a Retry control

#### Scenario: Retrying after a failure
- **WHEN** the visitor activates Retry
- **THEN** the view is requested again and moves through loading to either the evaluation or the same error message

#### Scenario: Back link at the end
- **WHEN** the view renders a closed evaluation
- **THEN** a second back button with the same text and destination renders after the presentation's last section

#### Scenario: Back buttons on the read-only evaluation view
- **WHEN** the read-only evaluation view renders a closed evaluation with its offering
- **THEN** the first section's back control is a link, "View offering" is a button that opens the offering's detail route, and the back control at the end is a button with the same text and destination as the link
