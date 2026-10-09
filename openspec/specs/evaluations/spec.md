# evaluations Specification

## Purpose
Lets a signed-in specialist record the sensory evaluations of an offering with the SCA CVA combined form: create a draft, complete and close it, review closed evaluations read-only, and manage the list of their own evaluations.

## Requirements

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

### Requirement: Descriptor blocks

Each descriptor block SHALL offer, as a descriptor cascade, the level-0, level-1 and level-2 nodes of `GET /taxonomies` whose `categories` contain the block's value (`aromatics`, `main_tastes`, `mouthfeel`, `defects`), with the node name of the route's locale as the label; a node whose parent is not offered SHALL NOT be offered. Loading a saved draft in which a node is chosen without its parent SHALL also choose every ancestor of that node. A node matching several blocks SHALL appear in each of them. Selection SHALL be multiple with no limit on main tastes.

#### Scenario: A block's options

- **WHEN** the taxonomy tree arrives and a block is rendered
- **THEN** it shows every matching level-0 node as a chip and, while a matching node is chosen, its matching children, down to level 2, and no node whose parent is not offered

#### Scenario: Draft load chooses ancestors

- **WHEN** a saved draft is loaded whose descriptors hold a level-1 or level-2 node without its parent
- **THEN** the block shows that node chosen together with every ancestor of it

#### Scenario: Selecting descriptors

- **WHEN** the specialist selects descriptors in a shared aromatic block
- **THEN** the selection is sent as `cata` on both axes of its pair (`fragrance` and `aroma`, or `flavor` and `aftertaste`), and the mouthfeel block sends `descriptive.mouthfeel.cata`, the main tastes block sends `descriptive.mainTastes` and the defects block sends `affective.defects`

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

### Requirement: Sign-in to the evaluation routes

An anonymous visitor to any `/manage/evaluations` route SHALL see a message with a "Sign in" button that starts the sign-in for the current route when activated and leaves the visitor on the route. A signed-in user without the specialist role SHALL see the 404 page. While the session is loading the page SHALL wait before deciding.

#### Scenario: An anonymous visitor

- **WHEN** an anonymous visitor opens one of the routes and activates "Sign in"
- **THEN** the sign-in opens for that route and the visitor stays on it

#### Scenario: A user without the specialist role

- **WHEN** a signed-in user with another role opens one of the routes
- **THEN** the 404 page is shown

### Requirement: Evaluate action on the offering card

The Evaluate action of an offering card SHALL be an action button that renders only for a signed-in specialist and opens `/{locale}/manage/evaluations/new?offering={ulid}` with that offering's `ulid`. The View action SHALL render, as an action button, for every signed-in user and for no anonymous visitor.

#### Scenario: A signed-in specialist

- **WHEN** a signed-in specialist sees an offering card
- **THEN** the card shows the Evaluate action button beside View and activating it opens the new form for that offering

#### Scenario: Any other visitor

- **WHEN** an anonymous visitor or a user with another role sees an offering card
- **THEN** the card shows no Evaluate action, and the View action shows only when the visitor is signed in

### Requirement: Management sidebar entry

On the evaluation routes the management sidebar SHALL show the specialist area's entries: "My evaluations" pointing at `/{locale}/manage/evaluations` (marked as the current page when the list is in view) followed by "Explore offerings" pointing at `/{locale}/offerings` with no query, never marked as the current page.

#### Scenario: The entry on the list route

- **WHEN** the specialist opens the list route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry marked as the current page

#### Scenario: The entry on a form route

- **WHEN** the specialist opens a form route with the sidebar visible
- **THEN** the sidebar shows the "My evaluations" entry without the current-page marking

#### Scenario: The explore entry

- **WHEN** the specialist opens an evaluation route with the sidebar visible
- **THEN** the sidebar shows "Explore offerings" right after "My evaluations", in the same list, pointing at `/{locale}/offerings` with no query and without the current-page marking

### Requirement: Public evaluations list
The system SHALL show, at `/{locale}/evaluations`, a list of the closed specialist evaluations open to any visitor with or without a session, ordered newest first by default. Each row SHALL show the evaluation's `cuppingScore` with its rating word (absent when the score is null), its `closedAt` as a date in the route's locale under a "Closed on" label (absent when null), and, from the offering, the coffee name as the row heading with the coffeeshop and the roaster as captions. Every listing request SHALL carry `evaluationType=specialist` and `status=closed` regardless of the URL, and any `status` or `evaluationType` value in the URL SHALL be ignored. Each row SHALL offer an action button to its evaluation ("View") and one to its offering ("View offering"), never links, each action's accessible name being its visible text plus a visually hidden coffee name so that the names are unique and start with the visible text. A row without a coffee name (its `offeringId` is null or its offering request failed) SHALL use as hidden suffix its heading text plus its closed date. A row whose `offeringId` is null SHALL show the offering-missing message as its heading with no captions and no "View offering" action, and no offering request SHALL be made for it. The list SHALL paginate with Previous/Next controls that keep every current query key and replace only the page.

#### Scenario: Loading the list
- **WHEN** the list is being loaded
- **THEN** three row placeholders render in the list area, marked hidden from assistive technology, and the list region reports itself as busy

#### Scenario: Successful list
- **WHEN** the request returns 200 with items
- **THEN** one row per evaluation renders with its score, rating word, closing date, coffee name, coffeeshop caption and roaster caption, and the Previous/Next pagination renders below the rows

#### Scenario: Fixed request keys
- **WHEN** the list is requested from any URL
- **THEN** the request carries `evaluationType=specialist` and `status=closed` together with the applied facet keys and the sort keys

#### Scenario: Unique row link names
- **WHEN** rows with an offering render their two actions
- **THEN** each action is an action button whose accessible name is its visible text followed by a visually hidden " {coffee name}", so no two of those rows share an action name and no action name is ambiguous

#### Scenario: Row actions open their routes
- **WHEN** the visitor activates a row's "View" or "View offering" action
- **THEN** the evaluation view or the offering detail of that row opens in the active locale

#### Scenario: Link name on a row without a coffee name
- **WHEN** a row whose `offeringId` is null or whose offering request failed renders its "View" action
- **THEN** the action's accessible name is its visible text followed by a visually hidden " {row heading}, {closed date}"

#### Scenario: Paging
- **WHEN** the visitor activates Previous or Next
- **THEN** the list loads the neighbouring page keeping every other query key, and the new page number replaces the old one in the URL

#### Scenario: Empty list without a filter
- **WHEN** the request returns 200 with an empty `data` and no facet is applied
- **THEN** the list area shows the empty message of the message catalog

#### Scenario: Empty list with a filter
- **WHEN** the request returns 200 with an empty `data` while any facet is applied
- **THEN** the list area shows the no-matches message and the "Clear all" control, including when the list was opened from an offering without evaluations

#### Scenario: One offering cannot be loaded
- **WHEN** the offering request of one row fails while the others succeed
- **THEN** that row shows the offering-unavailable message as its heading with no captions and no "View offering" action, and the other rows are unaffected

#### Scenario: A row whose offering was deleted
- **WHEN** the list returns an evaluation with `offeringId` null
- **THEN** no offering request is made for it, and that row shows the offering-missing message as its heading with no captions and no "View offering" action, keeping its score, closing date and "View" action, and the other rows are unaffected

#### Scenario: Request failure
- **WHEN** the listing request fails with any non-2xx status (422 included) or a transport failure
- **THEN** the list area shows the error message with a Retry control, and the applied facet values are kept

#### Scenario: Retrying after a failure
- **WHEN** the visitor activates Retry
- **THEN** the list is requested again with the same facet and sort values and moves through loading to either the rows or the same error message

### Requirement: Public evaluations filter sidebar
The list SHALL offer its filters in a sidebar panel exposed as a search landmark: an Offering facet (the values "Any" and the active offering, shown only while `offeringId` is in the URL), a Score facet over 0 to 100, a Process facet over the distinct process values of the coffee catalog as a single choice, and a City facet as free text of at most 90 characters with help text. There SHALL be no Status facet. Applying or changing any facet SHALL write the URL without `page` and reload the list without scrolling, keeping the sort keys. Applied filters SHALL show removable chips named after their facet and value, "Clear all" SHALL remove every facet key and keep the sort keys, and removing a chip SHALL return focus predictably to the panel. From `md` the sidebar is a column beside the content; below `md` the facets open as a full-screen panel with the sidebar's styling. Facet rows, legends and controls SHALL follow the facet-control contracts of the `filtering` capability.

#### Scenario: Applying a facet value
- **WHEN** the visitor chooses a facet value or commits a City text
- **THEN** the URL gains that facet key without any `page` key, the list reloads with the new filter and the viewport does not scroll

#### Scenario: Offering facet
- **WHEN** the list is opened with `offeringId` in the URL
- **THEN** the Offering facet shows the values "Any" and the active offering labelled with "{coffee name} · {coffeeshop}", with the active offering selected and its chip applied as "Offering: {coffee name}"

#### Scenario: Offering facet hidden without an active offering
- **WHEN** the list is opened with no `offeringId` in the URL
- **THEN** the Offering facet renders no control and no chip

#### Scenario: The active offering cannot be loaded
- **WHEN** the offering request for the active `offeringId` fails
- **THEN** the Offering facet option and its chip show the selected-offering fallback label instead of the coffee name

#### Scenario: Process options unavailable
- **WHEN** the coffee catalog request fails
- **THEN** the Process facet renders disabled with the options-unavailable message and the other facets stay usable

#### Scenario: Removing one chip
- **WHEN** the visitor removes an applied chip
- **THEN** that facet key leaves the URL together with `page`, the list reloads without it, the other facet values and the sort keys are kept, and the focus moves away from the removed chip predictably

#### Scenario: Clear all keeps the sort
- **WHEN** the visitor activates "Clear all"
- **THEN** every facet key leaves the URL together with `page`, the sort keys stay, and the list reloads unfiltered

#### Scenario: Facets on a small screen
- **WHEN** the viewport is below `md` and the visitor opens the filters
- **THEN** the facets render in a full-screen panel with the sidebar's styling and no horizontal scrolling appears

### Requirement: Public evaluations sort
The list body SHALL offer a sort choice labelled for assistive technology, whose default order is `created_at` descending (newest first). The chosen order SHALL be written to the URL, kept across facet changes and "Clear all", and applied on every page of the list.

#### Scenario: Default order
- **WHEN** the list is opened with no sort keys in the URL
- **THEN** the rows come newest first and the request orders by `created_at` descending

#### Scenario: Choosing a sort order
- **WHEN** the visitor chooses another sort order
- **THEN** the sort keys replace the previous ones in the URL without `page`, and the list reloads in the chosen order with the facet values kept

#### Scenario: Unknown sort value in the URL
- **WHEN** the URL carries a sort value the control does not offer
- **THEN** the list falls back to the default order

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

### Requirement: Read-only evaluation presentation
One read-only presentation SHALL render an evaluation's results for the evaluation view and for the provisional evaluation tab. It SHALL show: a summary card with the score and its rating word and a definition list of "Closed on" (`closedAt`, omitted when null), "Extraction method" (`extractionMethod`, labelled from the catalog of the nine values and shown raw otherwise) and "Defective cup" (`isDefective`, Yes/No text); an intensity card with the seven `descriptive.*.score` values as read-only meters over 0 to 15 whose value text reads "{v}/15" and whose accessible value reads "{v} de 15" over the labels LOW, MEDIUM and HIGH, a null score rendering as 0; a preference card with the eight `affective.*.score` values as read-only bean scales over 1 to 9 whose value text reads "{v}/9" and whose accessible value reads "{v} de 9", a null or 0 score omitting its scale; a descriptors card with five blocks (Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects) built from `tastes[]` by `type` (`fragrance`/`aroma`, `flavor`/`aftertaste`, `main_tastes`, `mouthfeel`, `defects`) with the taxonomy names resolved from `GET /taxonomies` at levels 0, 1 and 2 in the route's locale, shown as a read-only descriptor cascade, and an empty text when a block has nothing; a notes list of the non-null `descriptive.*.note` and `affective.*.note` values headed "{Intensity or Preference} · {axis}"; and an extrinsic-attributes list of the non-null `extrinsics.*` fields with their labels. Scores, notes and descriptors SHALL never be conveyed by color alone: every meter also carries its value as text and every descriptor carries its name.

#### Scenario: Summary values
- **WHEN** a presentation renders an evaluation with `cuppingScore`, `closedAt`, `extractionMethod` and `isDefective`
- **THEN** the summary shows the score once with its rating word and the three definition rows with the values `closedAt` formatted as a date in the route's locale, the extraction label of the catalog and the Yes/No text

#### Scenario: Intensity and preference values
- **WHEN** a presentation renders scores in `descriptive` and `affective`
- **THEN** each descriptive axis shows its read-only meter with its "{v}/15" text and each affective axis with a score from 1 to 9 shows its read-only bean scale with its "{v}/9" text, and an affective axis with a null or 0 score renders no scale

#### Scenario: Descriptor blocks
- **WHEN** a presentation renders `tastes[]` with resolvable references
- **THEN** the five blocks group the references by their `type`, each chip shows the taxonomy name in the route's locale under its parent's title, a level-2 reference included, and each empty block shows the empty text

#### Scenario: An unresolved descriptor reference
- **WHEN** a `tastes[]` reference does not resolve in the taxonomy catalog
- **THEN** its row renders no chip and no badge and the rest of the block renders normally

#### Scenario: Conditional blocks
- **WHEN** every note is null and every extrinsic field is null
- **THEN** the notes and extrinsic-attributes blocks render nothing at all, and each renders only the entries whose value is not null when some are

### Requirement: Offerings of an evaluations page

"My evaluations" and the public evaluations list SHALL read the offerings of a page of evaluations the same way: one offering request per distinct non-null `offeringId` of the page, made in parallel after the page arrives. An evaluation without an `offeringId` SHALL request nothing and show its offering-missing row; an evaluation whose offering read is not found or fails SHALL show its offering-unavailable row. The rows keep the order of the page.

#### Scenario: Shared offering on one page

- **WHEN** a page of either list holds several evaluations of the same offering
- **THEN** that offering is requested once and every one of those rows shows it

#### Scenario: Evaluation without an offering

- **WHEN** an evaluation of the page has a `null` `offeringId`
- **THEN** no offering request is sent for it and its row is the offering-missing row

#### Scenario: Offering read not found or failed

- **WHEN** the offering read of an evaluation of the page is not found or fails
- **THEN** its row is the offering-unavailable row and the other rows still show their offerings

### Requirement: Evaluation routes as protected views

Every `/manage/evaluations` route SHALL be a protected view of the application's protected content gate: its loading presentation SHALL be empty, its signed-out message SHALL be the evaluations access message with the "Sign in" action, and the specialist role SHALL be the only role it allows. The signed-out block of these routes SHALL look and behave the same as the signed-out block of every other protected view.

#### Scenario: Session resolving on an evaluation route

- **WHEN** an evaluation route opens while the session is still resolving
- **THEN** nothing renders in place of the content and no signed-out message shows

#### Scenario: Signed-out block of an evaluation route

- **WHEN** an anonymous visitor opens an evaluation route
- **THEN** the evaluations access message and a primary "Sign in" button render in a column 1rem apart, with the button at its own width, and activating it starts sign in for that route inside the click

### Requirement: One row per evaluation-row variant

The "My evaluations" row and the public evaluations row SHALL each be rendered as their own row, with only the elements of their variant: the "My evaluations" row shows the status badge, the level-2 heading, the ISO date and the specialist's actions, and never the public row's View offering action; the public row shows the level-2 heading, the localized closed date and the View and View offering actions, and never a status badge. Both rows show the score row, the coffee name and the coffeeshop and roaster captions the same way, as stated in "My evaluations list" and "Public evaluations list".

#### Scenario: My evaluations row

- **WHEN** a row of "My evaluations" is shown
- **THEN** it has the status badge, a level-2 heading and the specialist's actions, and no View offering action

#### Scenario: Public evaluations row

- **WHEN** a row of the public evaluations list is shown
- **THEN** it has a level-2 heading and the View and View offering actions, and no status badge

### Requirement: Evaluation form kept as one form
The evaluation form SHALL present, for the same offering, evaluation, taxonomy tree and locale, the same header, context fields, groups with their controls, notes, descriptor blocks and completeness indicators, the same 1–9 legend and the same actions or read-only status, with the same texts, accessible names, initial open states and validation messages, and SHALL send the same draft-save and close requests with the same bodies and in the same order, however the form keeps its state internally. This requirement adds no behaviour: every part of the form keeps what the other requirements of this capability state.

#### Scenario: Editable form renders and saves as before
- **WHEN** the form opens for a new evaluation of an existing offering, the user changes a score and saves the draft
- **THEN** the header, the context fields, the eight collapsed groups and the 1–9 legend render as the "Evaluation form" requirement states, the create request carries the changed score and the saved message shows

#### Scenario: Refused close renders as before
- **WHEN** the user closes a draft and the API answers `409`
- **THEN** the incomplete groups expand and are highlighted and the incomplete message shows, as the "Closing an evaluation" requirement states

#### Scenario: Closed evaluation renders as before
- **WHEN** the form opens for a closed evaluation
- **THEN** every group and the 1–9 legend start expanded, every control is read-only and no action renders

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

### Requirement: Evaluation route headings
The "My evaluations" list heading SHALL be the page's level-1 heading, and on every evaluation route the signed-out view SHALL expose the evaluations access message as the page's level-1 heading, both keeping their present type style.

#### Scenario: My evaluations heading
- **WHEN** a signed-in specialist opens "My evaluations"
- **THEN** "My evaluations" is the page's level-1 heading

#### Scenario: Signed-out evaluation route
- **WHEN** an anonymous visitor opens an evaluation route
- **THEN** the evaluations access message is the page's level-1 heading, in the body type style, followed by the "Sign in" button
