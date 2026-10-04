# Spec Delta

## Purpose

Defines Tazavera's public web presence: the entry page with its hero and the verified offerings list, and the About us page that explains the guide, as visitors meet them in every supported locale before and after signing in.

## ADDED Requirements

### Requirement: Public access
Both public pages SHALL render completely for an anonymous visitor, in the locale of the route, with no sign-in required.

#### Scenario: Anonymous visit
- **WHEN** an anonymous visitor opens the entry route or the about route in a supported locale
- **THEN** the page renders its full content in that locale with no sign-in prompt

### Requirement: Entry page hero
The entry page SHALL render, in the main content area, an eyebrow label, the entry heading with exactly one emphasized word in the accent text color (in Spanish the settled copy `Tu café, el que merece cada sorbo`), an introduction paragraph, a primary action that scrolls the verified offerings list into view on the same page, and two navigation links: one registering a coffeeshop and one registering as a specialist. The coffee-beans photograph SHALL accompany the hero from the medium breakpoint (768px) up and be hidden below it.

#### Scenario: Hero presentation
- **WHEN** a visitor opens the entry route in a supported locale
- **THEN** the eyebrow, the heading with one emphasized word, the paragraph, the primary explore action and both registration links render with the texts of that locale

#### Scenario: Explore scrolls to the offerings
- **WHEN** the visitor activates the primary explore action
- **THEN** the verified offerings list scrolls into view on the same page and the route does not change

#### Scenario: Registration destinations
- **WHEN** the visitor activates the coffeeshop registration link
- **THEN** the application opens the coffeeshop registration route of the active locale, owned by a later change

#### Scenario: Specialist registration destination
- **WHEN** the visitor activates the specialist registration link
- **THEN** the application opens the specialist registration route of the active locale, owned by a later change

#### Scenario: Responsive hero
- **WHEN** the viewport is below 768px
- **THEN** the hero renders in one column with the photograph hidden, and from 768px up it renders in two columns with the photograph beside the text

### Requirement: Verified offerings list
The entry page SHALL list the verified offerings of the API, one offering card per offering, with Previous and Next pagination driven by the API's current and last page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the verified offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page and the pagination reflects the API's current and last page

#### Scenario: Loading
- **WHEN** the list is loading its data
- **THEN** skeleton cards render in the list's place and no empty or error message renders

#### Scenario: Empty
- **WHEN** the API holds no verified offerings
- **THEN** a centered message renders and no offering card renders

#### Scenario: Error and retry
- **WHEN** the offerings data cannot be loaded, whether the request fails or returns a non-success status
- **THEN** a message with a retry action renders and no offering card renders

#### Scenario: Retry reloads
- **WHEN** the visitor activates the retry action
- **THEN** the list loads again through its loading state into success, empty or error

#### Scenario: Paging
- **WHEN** the visitor activates Next or Previous
- **THEN** the list requests the following or preceding page and updates its cards and pagination state

#### Scenario: Paging at the boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable, and when it shows the last page Next is unavailable

### Requirement: Offering card content
Each offering card SHALL show the offering's data as mapped from the API: the cupping score out of 100 with a rating badge classifying it — exceptional at 90 or above, excellent at 85 or above and below 90, good at 80 or above and below 85, commercial below 80; the verification state badge (verified or provisional); the coffee name; the coffeeshop name and the roaster name as labeled captions; one origin line joining country, region, process and variety and omitting any null value; the taxonomy badges of the offering; and a footer with the evaluation count, the defective evaluation count, a View link for every viewer and an Evaluate link for a signed-in specialist only.

#### Scenario: Score and rating tier
- **WHEN** an offering carries a cupping average
- **THEN** the card shows the score out of 100 with the rating badge of its range: exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, commercial below 80

#### Scenario: No score
- **WHEN** an offering carries no cupping average
- **THEN** the card shows no score and no rating badge and the rest of its content renders normally

#### Scenario: Origin line skips null values
- **WHEN** any of country, region, process or variety is null on an offering's coffee
- **THEN** the origin line omits that value and joins the remaining values, keeping the fixed order country, region, process, variety

#### Scenario: Footer counts
- **WHEN** an offering card renders
- **THEN** its footer shows the offering's evaluation count and defective evaluation count

#### Scenario: View link for everyone
- **WHEN** any viewer sees an offering card
- **THEN** a View link addresses the offering's detail route in the active locale, built from the offering's identifier

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** the footer shows an Evaluate link addressing the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate link renders on the card

### Requirement: Taxonomy badges on the offering card
Each taxonomy reference of an offering's sensory taxonomy, including nested children, SHALL render as a badge carrying the taxonomy's name in the active locale and the taxonomy's data color, arranged in three rows by level (0, 1, 2), each row wrapping its badges so that no row overflows the card below the medium breakpoint (768px). A reference that resolves to no taxonomy SHALL render no badge.

#### Scenario: Names by locale
- **WHEN** an offering card renders in the active locale
- **THEN** each taxonomy badge shows the taxonomy's name in that locale

#### Scenario: Rows by level
- **WHEN** an offering carries taxonomy references at levels 0, 1 and 2
- **THEN** the badges render in three rows, one per level, each row wrapping its badges rather than overflowing the card

#### Scenario: Unresolved reference
- **WHEN** a taxonomy reference matches no taxonomy
- **THEN** no badge renders for that reference and the remaining badges render normally

### Requirement: About us page
The about route SHALL render five sections with alternating page and section backgrounds, in this order: a brief hero with an eyebrow label and a heading with one emphasized word in the accent text color; the story of the gap between a coffee label and what is in the cup and why the guide is built on objective evaluations; how we evaluate as three cards — the coffeeshop registers its offering as provisional, specialists cup it with the SCA method, and the consensus verifies it; who it is for, naming coffeeshops and specialists with their registration links; and a closing primary action that opens the entry page of the active locale.

#### Scenario: Sections and order
- **WHEN** a visitor opens the about route in a supported locale
- **THEN** the five sections render in order with alternating page and section backgrounds

#### Scenario: How we evaluate
- **WHEN** the evaluation section renders
- **THEN** three cards present the provisional registration, the SCA cupping by specialists and the consensus verification

#### Scenario: Registration links
- **WHEN** the visitor activates the coffeeshop or the specialist registration link of the about page
- **THEN** the application opens that registration route of the active locale, owned by a later change

#### Scenario: Closing action
- **WHEN** the visitor activates the closing primary action
- **THEN** the entry page of the active locale opens

### Requirement: Localized page texts
Every text of both pages — hero, list states, card labels and captions, pagination, and the about sections — SHALL render in the active locale (Spanish, English or Catalan) from the locale's message catalog, and no page text SHALL be hardcoded in the interface.

#### Scenario: Texts follow the locale
- **WHEN** a visitor opens either page in Spanish, English or Catalan
- **THEN** every text renders in that locale and no text renders in another

#### Scenario: Settled Spanish heading
- **WHEN** the entry page renders in Spanish
- **THEN** its heading is exactly `Tu café, el que merece cada sorbo` with exactly one emphasized word

### Requirement: Page metadata
The document metadata of both public pages SHALL carry the title exactly `Tazavera` and a description drawn from the message catalog of the active locale.

#### Scenario: Metadata by locale
- **WHEN** a visitor opens either page in Spanish, English or Catalan
- **THEN** the document title is exactly `Tazavera` and the document description is the metadata description text of that locale's catalog
