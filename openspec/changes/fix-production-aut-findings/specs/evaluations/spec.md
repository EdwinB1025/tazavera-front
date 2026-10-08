## MODIFIED Requirements

### Requirement: Evaluate action on the offering card

The Evaluate action of an offering card SHALL be an action button that renders only for a signed-in specialist and opens `/{locale}/manage/evaluations/new?offering={ulid}` with that offering's `ulid`. The View action SHALL render, as an action button, for every signed-in user and for no anonymous visitor.

#### Scenario: A signed-in specialist

- **WHEN** a signed-in specialist sees an offering card
- **THEN** the card shows the Evaluate action button beside View and activating it opens the new form for that offering

#### Scenario: Any other visitor

- **WHEN** an anonymous visitor or a user with another role sees an offering card
- **THEN** the card shows no Evaluate action, and the View action shows only when the visitor is signed in

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

### Requirement: Read-only evaluation view
The system SHALL show, at `/{locale}/evaluations/{ulid}` to any visitor, one closed specialist evaluation: a header with the offering's identity (coffee name as the page heading, the coffeeshop and roaster captions, the "Closed on" line and a "View offering" link) and the read-only evaluation presentation below. The route SHALL offer a back link to the previous page, whose fallback destination is the plain list with no query. When the offering cannot be loaded, the header SHALL show the offering-unavailable message as the heading with no captions and no "View offering" link while the presentation still renders. When the evaluation's `offeringId` is null, no offering request SHALL be made and the header SHALL show the offering-missing message as the heading with no captions and no "View offering" link while the back link and the presentation still render.

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
- **THEN** the heading shows the offering-unavailable message with no captions and no "View offering" link, and the presentation renders the evaluation's results

#### Scenario: Viewing an evaluation whose offering was deleted
- **WHEN** the evaluation loads with `status` closed and `offeringId` null
- **THEN** no offering request is made, the heading shows the offering-missing message with no captions and no "View offering" link, and the back link and the presentation render as usual

#### Scenario: The evaluation cannot be loaded
- **WHEN** the evaluation request or the taxonomy request fails with any non-2xx status (an unknown ULID included, whose 404 is undocumented) or a transport failure
- **THEN** the first section keeps the back link and the second section shows the error message with a Retry control

#### Scenario: Retrying after a failure
- **WHEN** the visitor activates Retry
- **THEN** the view is requested again and moves through loading to either the evaluation or the same error message
