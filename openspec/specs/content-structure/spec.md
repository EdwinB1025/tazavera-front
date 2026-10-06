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
