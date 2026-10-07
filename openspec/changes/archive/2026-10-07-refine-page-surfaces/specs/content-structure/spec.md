## MODIFIED Requirements

### Requirement: Card regions
A card SHALL present, in order, an optional side column set apart by a separator border, a main content region and an optional footer region. It SHALL render on the card surface with the container radius and the theme's shadow treatment and, unless it is a section card, an accent border on its leading edge, and SHALL contribute no text or data of its own: the consuming capability fills its regions.

#### Scenario: Full regions
- **WHEN** a card renders with a side column and a footer
- **THEN** the side column comes first and sits beside the main content, its separator border lies on the boundary between them, and the footer renders below both

#### Scenario: Content only
- **WHEN** a card renders without a side column and without a footer
- **THEN** only the main content region renders

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a card
- **THEN** the rendered text and data are exactly what the consumer supplied

### Requirement: Page sections
A page SHALL be built from sections that span the full width of the page content area, each on either the page background or the section background. Each section's content SHALL sit in a horizontally centered container at most 72rem wide, with side padding of 1rem below the medium breakpoint (768px) and 2rem from it. Each section SHALL have vertical padding of 3rem below 768px and 4rem from it. A section SHALL contribute no content of its own: the consuming capability fills it. A feature view SHALL use one section on the page background and hang its content from that background: inside the container, its top-level blocks (the header block, the group of section cards, the actions row when it has one) SHALL be 2rem apart, its section cards SHALL be 1rem apart with the page background showing between them, and no wrapper SHALL paint a surface between the page background and the section cards. The section background SHALL be used only by the landing and About pages.

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

#### Scenario: Feature view hangs from the page background
- **WHEN** a feature view with a header block, several section cards and an actions row renders
- **THEN** it sits in one section on the page background, the header block, the group of section cards and the actions row are 2rem apart, the section cards are 1rem apart, and the page background shows between them and around them

## ADDED Requirements

### Requirement: Section card
A card SHALL offer a section variant that its consumer opts into, for one section of a view. A section card SHALL render on the card surface with a uniform 1px subtle border on all four sides and no accent edge, the container radius on its outer corners and the card's shadow, and SHALL fill the width of its container. Its parts SHALL stack in their order (header band, body, footer) at every viewport width. The side column of a section card SHALL be its header band: it SHALL sit on the section surface across the full width of the card, set apart from the body by a 1px subtle separator, and its content SHALL start at the same inset as the body's content (1rem below 768px, 1.5rem from it). When the header band holds a collapsible header, it SHALL show the section hover surface while the pointer is on it, and while the section is collapsed it SHALL show no separator and be the whole visible card, with the container radius on all four corners; a header band without a collapsible header SHALL keep the section surface under the pointer. The body and the footer SHALL sit on the card surface, padded 1rem at the sides and top and 1.25rem at the bottom below 768px, and 1.5rem on every side from 768px. A section card SHALL contribute no text of its own and SHALL have no accessible name or role of its own: the consumer supplies the heading, the body, the footer and any landmark around it. The default variant of the card SHALL be unchanged.

#### Scenario: Section card surface
- **WHEN** a section card renders in either theme
- **THEN** it shows the card surface with a uniform 1px subtle border, no accent edge, the container radius and the card's shadow, and it fills the width of its container

#### Scenario: Stacked at every width
- **WHEN** a section card with a header band, a body and a footer renders at any viewport width, including 1024px and wider
- **THEN** the header band renders above the body across the full width of the card with the separator between them, and the footer renders below the body

#### Scenario: Static header band
- **WHEN** a section card renders with a heading in its header band and the pointer rests on the band
- **THEN** the band shows the section surface, distinct from the card surface of the body, and does not change under the pointer

#### Scenario: Collapsible header band
- **WHEN** a section card's header band holds a collapsible header and the pointer rests on the band
- **THEN** the band shows the section hover surface, and the header keeps the shared focus indicator when focused from the keyboard

#### Scenario: Collapsed section card
- **WHEN** a section card's collapsible section is collapsed
- **THEN** only the header band is visible, with no separator below it, and the card's four corners keep the container radius; when the section expands, the separator returns between the band and the body

#### Scenario: Aligned insets
- **WHEN** a section card renders with a header band and a body, below 768px and from 768px
- **THEN** the band's title and the body's content start at the same distance from the card's edge: 1rem below 768px and 1.5rem from 768px

#### Scenario: Default variant unchanged
- **WHEN** a card renders without opting into the section variant
- **THEN** it renders exactly as before, with its accent leading edge and its default or stacked layout

#### Scenario: Consumer content only
- **WHEN** a consuming capability fills a section card
- **THEN** the rendered text is exactly what the consumer supplied, and the card adds no visible or accessible text, name or role of its own
