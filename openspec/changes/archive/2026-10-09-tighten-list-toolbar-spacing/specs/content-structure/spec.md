## MODIFIED Requirements

### Requirement: Page sections
A page SHALL be built from sections that span the full width of the page content area, each on either the page background or the section background. Each section's content SHALL sit in a horizontally centered container at most 72rem wide, with side padding of 1rem below the medium breakpoint (768px) and 2rem from it. Each section SHALL have vertical padding of 3rem below 768px and 4rem from it. A section SHALL contribute no content of its own: the consuming capability fills it. A feature view SHALL use one section on the page background and hang its content from that background: inside the container, its top-level blocks (the header block, the group of section cards, the actions row when it has one) SHALL be 2rem apart, its section cards SHALL be 1rem apart with the page background showing between them, and no wrapper SHALL paint a surface between the page background and the section cards. The offerings catalog and the coffee shop directory SHALL each render their heading block, toolbar and results in that one section, the toolbar 1.5rem above the results at every viewport width. The section background SHALL be used only by the landing and About pages.

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

#### Scenario: Catalog toolbar close to its results
- **WHEN** the offerings catalog renders at any viewport width
- **THEN** its heading block, toolbar and results sit in one section on the page background, and the results start 1.5rem below the toolbar

#### Scenario: Directory toolbar close to its results
- **WHEN** the coffee shop directory renders at any viewport width
- **THEN** its heading block, toolbar and results sit in one section on the page background, and the results start 1.5rem below the toolbar
