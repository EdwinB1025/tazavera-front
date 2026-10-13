# landing Specification

## Purpose
Defines Tazavera's public web presence: the entry page with its hero and the verified offerings list, and the About us page that explains the guide, as visitors meet them in every supported locale before and after signing in.

## Requirements

### Requirement: Public access
Both public pages SHALL render completely for an anonymous visitor, in the locale of the route, with no sign-in required.

#### Scenario: Anonymous visit
- **WHEN** an anonymous visitor opens the entry route or the about route in a supported locale
- **THEN** the page renders its full content in that locale with no sign-in prompt

### Requirement: Page layout
Both public pages SHALL be built from full-width sections. Each section's content SHALL sit in a horizontally centered container at most 72rem wide, with side padding (1rem below the medium breakpoint of 768px, 2rem from it). Each section SHALL have vertical padding (3rem below 768px, 4rem from it). On the entry page, the hero and the verified offerings list SHALL be separate sections, the hero on the page background and the list on the section background. Groups of navigation links SHALL keep a visible gap between their links and wrap when there is no room.

#### Scenario: Centered content
- **WHEN** either page renders on a viewport wider than 72rem plus its side padding
- **THEN** the content of every section is centered with equal space on both sides, while the section backgrounds span the full viewport width

#### Scenario: Side and section spacing
- **WHEN** either page renders at any viewport width
- **THEN** no section content touches the viewport's side edges, and consecutive sections are separated by their vertical padding

#### Scenario: Entry page sections
- **WHEN** the entry page renders
- **THEN** the hero renders on the page background and the verified offerings list renders below it, in its own section on the section background

#### Scenario: Link groups
- **WHEN** the two registration links render on either page
- **THEN** a visible gap separates them, and they wrap onto separate lines when the row has no room

### Requirement: Entry page hero
The entry page SHALL render, in the main content area, an eyebrow label, the entry heading with exactly one emphasized word in the accent text color (in Spanish the settled copy `Tu café, el que merece cada sorbo`), an introduction paragraph, an action that scrolls the verified offerings list into view on the same page, and two navigation links: one registering a coffeeshop and one registering as a specialist. The coffee-beans photograph SHALL accompany the hero from the medium breakpoint (768px) up and be hidden below it.

#### Scenario: Hero presentation
- **WHEN** a visitor opens the entry route in a supported locale
- **THEN** the eyebrow, the heading with one emphasized word, the paragraph, the explore action and both registration links render with the texts of that locale

#### Scenario: Explore scrolls to the offerings
- **WHEN** the visitor activates the explore action
- **THEN** the verified offerings list scrolls into view on the same page and the route does not change

#### Scenario: Registration destinations
- **WHEN** the visitor activates the coffeeshop registration link
- **THEN** the application opens the coffeeshop registration route of the active locale, owned by a later change

#### Scenario: Specialist registration destination
- **WHEN** the visitor activates the specialist registration link
- **THEN** the application opens the specialist registration route of the active locale, owned by a later change

#### Scenario: Responsive hero
- **WHEN** the viewport is below 768px
- **THEN** the hero renders in one column with the photograph hidden, and from 768px up it renders in two equal columns, vertically centered, with the photograph beside the text

### Requirement: Verified offerings list
The entry page SHALL list the verified offerings of the API, 6 per page at every width, one offering card per offering, in a grid of one column below the medium breakpoint (768px), two from 768px and three from the extra-large breakpoint (1280px), with the numbered pagination driven by the API's current and last page, and SHALL cover loading, empty, success and error states.

#### Scenario: Success
- **WHEN** the verified offerings load and the API returns offerings
- **THEN** one offering card renders per offering of the current page and the pagination reflects the API's current and last page

#### Scenario: Page size
- **WHEN** the list requests a page of verified offerings
- **THEN** it asks the API for 6 offerings per page, at every viewport width, so a full page fills 6, 3 or 2 complete rows at one, two or three columns

#### Scenario: Grid by viewport
- **WHEN** the list renders offering cards
- **THEN** the cards fill one column below 768px, two from 768px and three from 1280px, separated by a gap, and the cards of one row share the same height

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
- **WHEN** the visitor activates Next, Previous or a page number
- **THEN** the list requests that page, 6 offerings per page, and updates its cards and pagination state

#### Scenario: Paging at the boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable, and when it shows the last page Next is unavailable

### Requirement: Offering card content
Each offering card SHALL show the offering's data as mapped from the API: the cupping score out of 100 with a rating badge classifying it — exceptional at 90 or above, excellent at 85 or above and below 90, good at 80 or above and below 85, commercial below 80; the verification state badge (verified or provisional); the coffee name; the coffeeshop name and the roaster name as labeled captions; one origin line joining country, region, process and variety and omitting any null value; the taxonomy badges of the offering; and a footer with the evaluation count, the defective evaluation count, in this order a View action for a signed-in user only, a "View evaluations" action for every viewer and an Evaluate action for a signed-in specialist only, all supplied by the entry-page list as the card's actions and all rendered as action buttons.

#### Scenario: Score and rating tier
- **WHEN** an offering carries a cupping average
- **THEN** the card shows the score out of 100 with the rating badge of its range — exceptional at 90 or above, excellent from 85 to below 90, good from 80 to below 85, commercial below 80 — and the badge's text is the word of that tier in the active locale (in Spanish Excepcional at 90 or above, Excelente from 85 to below 90, Bueno from 80 to below 85, Comercial below 80), not the score

#### Scenario: Score row above the content
- **WHEN** an offering card renders at any viewport width
- **THEN** the score, the `/100` scale and the rating badge sit on one row above the card's main content

#### Scenario: No score
- **WHEN** an offering carries no cupping average
- **THEN** the card shows no score and no rating badge and the rest of its content renders normally

#### Scenario: Origin line skips null values
- **WHEN** any of country, region, process or variety is null on an offering's coffee
- **THEN** the origin line omits that value and joins the remaining values, keeping the fixed order country, region, process, variety

#### Scenario: Footer counts
- **WHEN** an offering card renders
- **THEN** its footer shows the offering's evaluation count and defective evaluation count, separated by a visible gap, with the card's actions grouped apart from the counts at the end of the footer

#### Scenario: View link for everyone
- **WHEN** a signed-in user, whatever the role, sees an offering card
- **THEN** a View action button renders and activating it opens the offering's detail route in the active locale, built from the offering's identifier

#### Scenario: No View action for anonymous visitors
- **WHEN** an anonymous visitor sees an offering card
- **THEN** no View action renders on the card

#### Scenario: Evaluate link for specialists
- **WHEN** the viewer is signed in with the specialist role
- **THEN** the footer shows an Evaluate action button that opens the new-evaluation route of the active locale with the offering's identifier

#### Scenario: No Evaluate link for other viewers
- **WHEN** the viewer is anonymous or signed in with another role
- **THEN** no Evaluate action renders on the card

#### Scenario: View evaluations action for everyone
- **WHEN** any viewer, anonymous or signed in, sees an offering card
- **THEN** a "View evaluations" action button renders after the View action and before the Evaluate action, with the same text as the offering detail's "View evaluations" link, and activating it opens `/{locale}/evaluations?offeringId={ulid}` in the active locale with the offering's identifier

### Requirement: About us page
The about route SHALL render five sections with alternating page and section backgrounds, in this order: a brief hero with an eyebrow label and a heading with one emphasized word in the accent text color; the story of the gap between a coffee label and what is in the cup and why the guide is built on objective evaluations; how we evaluate as three cards — the coffeeshop registers its offering as provisional, specialists cup it with the SCA method, and the consensus verifies it; who it is for, naming coffeeshops and specialists with their registration links; and a closing action that opens the entry page of the active locale.

#### Scenario: Sections and order
- **WHEN** a visitor opens the about route in a supported locale
- **THEN** the five sections render in order with alternating page and section backgrounds

#### Scenario: How we evaluate
- **WHEN** the evaluation section renders
- **THEN** three cards present the provisional registration, the SCA cupping by specialists and the consensus verification, sharing the container width equally from the medium breakpoint (768px) up

#### Scenario: Registration links
- **WHEN** the visitor activates the coffeeshop or the specialist registration link of the about page
- **THEN** the application opens that registration route of the active locale, owned by a later change

#### Scenario: Closing action
- **WHEN** the visitor activates the closing action
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

### Requirement: Offering card actions
The offering card's footer SHALL render, in its group of actions, the actions its consumer supplies for that card, in the order supplied, every one of them at the same height. The card SHALL render no action of its own, so it renders no action at all when the consumer supplies none. The card SHALL also render, at the end of the row that holds its verification state badge and aligned to that row's right edge, the content its consumer supplies for that row; when the consumer supplies none, the row shows only the badge, as before.

#### Scenario: Consumer actions after View
- **WHEN** a consumer renders offering cards and supplies actions for them
- **THEN** each card renders those actions in the footer's group of actions, in the order supplied

#### Scenario: No consumer actions
- **WHEN** a consumer supplies no actions for a card
- **THEN** no action renders in the footer and the footer shows only the counts

#### Scenario: Consumer content in the badge row
- **WHEN** a consumer supplies content for a card's badge row
- **THEN** that content renders as the last item of the row that holds the verification state badge, after the badge, that row spreads its items to both ends, and the content is not inside the card's footer

#### Scenario: Footer actions share one height
- **WHEN** the entry-page list renders an offering card for a signed-in specialist
- **THEN** the View, "View evaluations" and Evaluate buttons of the card's footer all render at the same height

### Requirement: Taxonomy badge trees on the offering card
The taxonomy badges of an offering card SHALL come from the offering's consensus — every taxonomy reference of its CATA concordance, including nested children, where the notes marked on several aromatic attributes are already condensed into the single `aromatics` group — and never from its per-attribute sensory taxonomy. Each taxonomy value SHALL render once, however many times its reference appears, with the children of every occurrence nested under that single badge. Each badge SHALL carry the taxonomy's name in the active locale and the taxonomy's data color with the treatment of its own level. The badges SHALL render as nested trees following the concordance tree as the API delivers it: each top-level note starts a tree; its children render below it, indented, in one column behind a left connector line; and each child's own children render below that child, further indented, wrapping. The trees SHALL sit side by side and wrap onto further lines, so that no tree overflows the card at any viewport width. A reference that resolves to no taxonomy SHALL render no badge, and an offering without a consensus SHALL render no taxonomy badge. The hierarchy SHALL be exposed to assistive technologies as nested lists.

Every tree SHALL start closed, showing only its top-level notes. A note that has children SHALL show a toggle button inside its own badge, right after the note's name, whose visible text is `+` while the note is closed and `−` while it is open; a note without children SHALL show no toggle. Only the toggle SHALL be interactive: the badge itself SHALL carry no action, no role and no stop in the tab order. Opening a note SHALL show its direct children, each closed; closing a note SHALL close every descendant, so reopening it shows only its direct children, closed. The toggle SHALL expose its expanded state and the child list it controls, SHALL be named from the active locale's message catalog as showing or hiding the notes under the note's label, and its `+` or `−` glyph SHALL be hidden from assistive technologies. The open state SHALL live only on the page: it SHALL NOT be remembered across a reload or a navigation, and opening or closing a note SHALL change neither the address nor any request to the API.

#### Scenario: Names by locale
- **WHEN** an offering card renders in the active locale
- **THEN** each taxonomy badge shows the taxonomy's name in that locale

#### Scenario: Closed at first
- **WHEN** an offering card renders a tree whose top-level note has children
- **THEN** only the top-level notes show and no child of any note shows

#### Scenario: Toggle on notes with children
- **WHEN** an offering card renders a top-level note with children and a top-level note without children
- **THEN** the note with children shows a toggle button inside its own badge, right after the note's name, with the visible text `+`; the badge itself is neither a button nor focusable; and the note without children shows no toggle

#### Scenario: Opening a note
- **WHEN** the visitor activates the toggle of a top-level note whose child has children of its own
- **THEN** the toggle's visible text becomes `−`, the note's children show, and that child shows its own toggle with `+` and none of its children; activating the child's toggle then shows its children

#### Scenario: Closing a note closes its descendants
- **WHEN** the visitor opens a top-level note and one of its children, closes the top-level note and opens it again
- **THEN** the top-level note's children show, and the child's toggle reads `+` and none of the child's children show

#### Scenario: Accessible toggle
- **WHEN** a note with children renders closed, and then open
- **THEN** its toggle is a button whose expanded state is false and then true, that controls the note's child list, whose accessible name is the catalog's "show the notes under" text with the note's label while closed and the "hide the notes under" text with the label while open, and whose `+` or `−` glyph is hidden from assistive technologies

#### Scenario: Open state stays on the page
- **WHEN** the visitor opens a note and the card renders again after a reload or a navigation
- **THEN** the address did not change, no request was sent when the note opened, and the tree renders closed again

#### Scenario: Nested trees
- **WHEN** an offering's concordance carries a top-level note with a child that has a child of its own, and the visitor opens the top-level note and the child
- **THEN** the child renders below the top-level note, indented, in one column behind a left connector line, and the grandchild renders below its parent child, further indented, each level as a list nested in the item of its parent

#### Scenario: Trees side by side
- **WHEN** an offering's concordance carries several top-level notes
- **THEN** each top-level note renders as its own tree, the trees side by side in one list that wraps onto further lines

#### Scenario: Unresolved reference
- **WHEN** a taxonomy reference matches no taxonomy
- **THEN** no badge renders for that reference and the remaining badges render normally

#### Scenario: Values from the consensus
- **WHEN** an offering carries both a per-attribute sensory taxonomy and a CATA concordance
- **THEN** the card's badges are exactly the resolved references of the CATA concordance and no reference found only in the sensory taxonomy renders

#### Scenario: Each value once
- **WHEN** the same taxonomy reference appears more than once in the offering's CATA concordance
- **THEN** its badge renders once

#### Scenario: Repeated reference keeps its children
- **WHEN** a taxonomy reference appears in several places of the concordance, each occurrence with its own children
- **THEN** its single badge renders at its first occurrence and the children of every occurrence render nested under it, each once

#### Scenario: No consensus
- **WHEN** an offering's CATA concordance is empty, whatever its sensory taxonomy holds
- **THEN** the card renders no taxonomy badge and the rest of its content renders normally
