# content-structure Specification

## Purpose
Defines Tazavera's content containers: how a structured content block presents its regions — main content, an optional side column and an optional footer — across viewports and in both themes, for every screen that groups related content.

## Requirements

### Requirement: Card regions
A card SHALL present, in order, an optional side column set apart by a separator border, a main content region and an optional footer region. It SHALL render on the card surface with the container radius, an accent border on its leading edge and the theme's shadow treatment, and SHALL contribute no text or data of its own: the consuming capability fills its regions.

#### Scenario: Full regions
- **WHEN** a card renders with a side column and a footer
- **THEN** the side column comes first and sits beside the main content, its separator border lies on the boundary between them, and the footer renders below both

#### Scenario: Content only
- **WHEN** a card renders without a side column and without a footer
- **THEN** only the main content region renders

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a card
- **THEN** the rendered text and data are exactly what the consumer supplied

### Requirement: Card stacking on narrow viewports
By default, below the large breakpoint (1024px), the card's parts SHALL stack in their order — side column, main content, footer — with the separator border staying on the boundary between the side column and the main content.

#### Scenario: Stacked regions
- **WHEN** the viewport is narrower than 1024px
- **THEN** the side column renders above the main content with their boundary kept between them, and the footer renders below both

#### Scenario: Side-by-side side column
- **WHEN** a card in the default layout renders at a viewport 1024px or wider
- **THEN** the side column renders beside the main content with its separator border between them

### Requirement: Stacked card layout
A card SHALL offer a stacked layout that its consumer opts into. In that layout the parts stack in their order (side column, main content, footer) at every viewport width, with the separator border on the boundary between the side column and the main content, and the card fills the height its container gives it, with the footer at the bottom of the card.

#### Scenario: Stacked at every width
- **WHEN** a card renders in the stacked layout at a viewport 1024px or wider
- **THEN** the side column renders above the main content with the separator border between them, and the footer renders below both

#### Scenario: Footer at the bottom
- **WHEN** a card in the stacked layout is taller than its content, because its container stretches it
- **THEN** its footer renders at the bottom edge of the card

### Requirement: Pagination
A paged list SHALL offer Previous and Next actions driven by its current and last page. Activating one SHALL open the preceding or following page at the list's own address, keeping every other query parameter of that address unchanged. Previous SHALL be unavailable on the first page, and Next on the last. The two actions SHALL sit centred below the list, 1rem apart, and wrap when the container is too narrow for both.

#### Scenario: Next and Previous
- **WHEN** the visitor activates Previous or Next on a page between the first and the last
- **THEN** the preceding or following page opens at the list's own address

#### Scenario: Other query parameters kept
- **WHEN** the list's address carries query parameters other than the page and the visitor activates Previous or Next
- **THEN** only the page changes and every other query parameter keeps its value

#### Scenario: Boundaries
- **WHEN** the list shows the first page
- **THEN** Previous is unavailable and activating it opens nothing; and when the list shows the last page, Next is unavailable and activating it opens nothing

#### Scenario: Paging only with a successful list
- **WHEN** the list is loading, empty or failed
- **THEN** no paging action renders and the host's own loading, empty or error state renders instead; the paging actions render only below a successfully loaded, non-empty list

### Requirement: Page sections
A page SHALL be built from sections that span the full width of the page content area, each on either the page background or the section background. Each section's content SHALL sit in a horizontally centered container at most 72rem wide, with side padding of 1rem below the medium breakpoint (768px) and 2rem from it. Each section SHALL have vertical padding of 3rem below 768px and 4rem from it. A section SHALL contribute no content of its own: the consuming capability fills it.

#### Scenario: Centered content
- **WHEN** a page renders on a viewport wider than 72rem plus its side padding
- **THEN** the content of every section is centered with equal space on both sides, while the section backgrounds span the full width of the page content area

#### Scenario: Side and section spacing
- **WHEN** a page renders at any viewport width
- **THEN** no section content touches the side edges of the page content area, and consecutive sections touch and are separated only by their vertical padding

#### Scenario: Section background
- **WHEN** a section renders
- **THEN** its background covers the full width of the page content area and is either the page background or the section background, as the consuming page decides

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a section
- **THEN** the rendered content is exactly what the consumer supplied, and the section adds no text or data of its own

### Requirement: Collapsible section
A collapsible section SHALL present a header that spans the full width of its container, with the consumer's title at the start and a chevron at the end, and a body that the header shows and hides. The section SHALL start collapsed unless its consumer opens it initially, and activating the header with a pointer or the keyboard SHALL toggle it. The header SHALL expose whether the section is expanded and SHALL reference the body in both states; its accessible name SHALL be the title only, and any extra header content the consumer adds SHALL be exposed as its description. The chevron SHALL point down while collapsed and up while expanded, and SHALL never be the only carrier of the state. While collapsed, the body SHALL show nothing and its content SHALL be out of the tab order and the accessibility tree, while keeping its state for the next opening. Opening and closing SHALL animate the body's height over 0.25s, and SHALL happen instantly when the user prefers reduced motion. The header SHALL show the shared focus indicator when focused from the keyboard, and the section SHALL contribute no text of its own: the consumer supplies the title, the extra header content and the body.

#### Scenario: Collapsed by default
- **WHEN** a collapsible section renders without being opened initially by its consumer
- **THEN** the header reports it collapsed, the chevron points down, the body shows nothing and none of its content can be reached with the keyboard or by assistive technology

#### Scenario: Toggle
- **WHEN** the user activates the header of a collapsed section, by pointer or by keyboard
- **THEN** the header reports it expanded, the chevron points up and the body's content shows and is reachable; activating the header again collapses it

#### Scenario: Initially open
- **WHEN** the consumer opens the section initially
- **THEN** it renders expanded, with the body's content shown and reachable

#### Scenario: Body referenced in both states
- **WHEN** the section is collapsed or expanded
- **THEN** the header references the body, and the referenced body is present

#### Scenario: Content kept while collapsed
- **WHEN** the user changes something inside the body, collapses the section and opens it again
- **THEN** the body's content shows the same state as before it collapsed

#### Scenario: Accessible name and description
- **WHEN** the header renders with a title and extra header content
- **THEN** the header's accessible name is the title only, and the extra content is its description

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion and toggles the section
- **THEN** the body opens or closes and the chevron turns without animation

#### Scenario: Keyboard focus
- **WHEN** the header receives focus from the keyboard
- **THEN** it shows the shared focus indicator

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a collapsible section
- **THEN** the rendered text is exactly what the consumer supplied, and the section adds no visible or accessible text of its own
