# Spec Delta

## ADDED Requirements

### Requirement: Public evaluations list
The system SHALL show, at `/{locale}/evaluations`, a list of the closed specialist evaluations open to any visitor with or without a session, ordered newest first by default. Each row SHALL show the evaluation's `cuppingScore` with its rating word (absent when the score is null), its `closedAt` as a date in the route's locale under a "Closed on" label (absent when null), and, from the offering, the coffee name as the row heading with the coffeeshop and the roaster as captions. Every listing request SHALL carry `evaluationType=specialist` and `status=closed` regardless of the URL, and any `status` or `evaluationType` value in the URL SHALL be ignored. Each row SHALL link to its evaluation and to its offering, each link's accessible name being its visible text plus a visually hidden coffee name so that the names are unique and start with the visible text. A row without a coffee name (its `offeringId` is null or its offering request failed) SHALL use as hidden suffix its heading text plus its closed date. A row whose `offeringId` is null SHALL show the offering-missing message as its heading with no captions and no "View offering" link, and no offering request SHALL be made for it. The list SHALL paginate with Previous/Next controls that keep every current query key and replace only the page.

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
- **WHEN** rows with an offering render their two links
- **THEN** each link's accessible name is its visible text followed by a visually hidden " {coffee name}", so no two of those rows share a link name and no link name is ambiguous

#### Scenario: Link name on a row without a coffee name
- **WHEN** a row whose `offeringId` is null or whose offering request failed renders its "View" link
- **THEN** the link's accessible name is its visible text followed by a visually hidden " {row heading}, {closed date}"

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
- **THEN** that row shows the offering-unavailable message as its heading with no captions and no "View offering" link, and the other rows are unaffected

#### Scenario: A row whose offering was deleted
- **WHEN** the list returns an evaluation with `offeringId` null
- **THEN** no offering request is made for it, and that row shows the offering-missing message as its heading with no captions and no "View offering" link, keeping its score, closing date and "View" link, and the other rows are unaffected

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
The system SHALL show, at `/{locale}/evaluations/{ulid}` to any visitor, one closed specialist evaluation: a header with the offering's identity (coffee name as the page heading, the coffeeshop and roaster captions, the "Closed on" line and a "View offering" link) and the read-only evaluation presentation below. The route SHALL offer a back link to the plain list with no query. When the offering cannot be loaded, the header SHALL show the offering-unavailable message as the heading with no captions and no "View offering" link while the presentation still renders. When the evaluation's `offeringId` is null, no offering request SHALL be made and the header SHALL show the offering-missing message as the heading with no captions and no "View offering" link while the back link and the presentation still render.

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

### Requirement: Read-only evaluation presentation
One read-only presentation SHALL render an evaluation's results for the evaluation view and for the provisional evaluation tab. It SHALL show: a summary card with the score and its rating word and a definition list of "Closed on" (`closedAt`, omitted when null), "Extraction method" (`extractionMethod`, labelled from the catalog of the nine values and shown raw otherwise) and "Defective cup" (`isDefective`, Yes/No text); an intensity card with the seven `descriptive.*.score` values as read-only meters over 0 to 15 whose value text reads "{v}/15" and whose accessible value reads "{v} de 15" over the labels LOW, MEDIUM and HIGH, a null score rendering as 0; a preference card with the eight `affective.*.score` values as read-only bean scales over 1 to 9 whose value text reads "{v}/9" and whose accessible value reads "{v} de 9", a null or 0 score omitting its scale; a descriptors card with five blocks (Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects) built from `tastes[]` by `type` (`fragrance`/`aroma`, `flavor`/`aftertaste`, `main_tastes`, `mouthfeel`, `defects`) with the taxonomy names resolved from `GET /taxonomies` at levels 0 and 1 in the route's locale and an empty text when a block has nothing; a notes list of the non-null `descriptive.*.note` and `affective.*.note` values headed "{Intensity or Preference} · {axis}"; and an extrinsic-attributes list of the non-null `extrinsics.*` fields with their labels. Scores, notes and descriptors SHALL never be conveyed by color alone: every meter also carries its value as text and every descriptor carries its name.

#### Scenario: Summary values
- **WHEN** a presentation renders an evaluation with `cuppingScore`, `closedAt`, `extractionMethod` and `isDefective`
- **THEN** the summary shows the score once with its rating word and the three definition rows with the values `closedAt` formatted as a date in the route's locale, the extraction label of the catalog and the Yes/No text

#### Scenario: Intensity and preference values
- **WHEN** a presentation renders scores in `descriptive` and `affective`
- **THEN** each descriptive axis shows its read-only meter with its "{v}/15" text and each affective axis with a score from 1 to 9 shows its read-only bean scale with its "{v}/9" text, and an affective axis with a null or 0 score renders no scale

#### Scenario: Descriptor blocks
- **WHEN** a presentation renders `tastes[]` with resolvable references
- **THEN** the five blocks group the references by their `type`, each chip shows the taxonomy name in the route's locale and each empty block shows the empty text

#### Scenario: An unresolved descriptor reference
- **WHEN** a `tastes[]` reference does not resolve in the taxonomy catalog
- **THEN** its row renders no chip and no badge and the rest of the block renders normally

#### Scenario: Conditional blocks
- **WHEN** every note is null and every extrinsic field is null
- **THEN** the notes and extrinsic-attributes blocks render nothing at all, and each renders only the entries whose value is not null when some are
