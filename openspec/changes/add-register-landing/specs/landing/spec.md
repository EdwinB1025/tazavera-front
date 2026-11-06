# Spec Delta

## ADDED Requirements

### Requirement: Entry page Register button
Below the large breakpoint (1024px), while the session is anonymous, the entry page SHALL show a "Register" action button above the hero, before its eyebrow, that opens the registration landing of the active locale (`/{locale}/join`). It SHALL NOT render while the session is resolving or authenticated, nor from 1024px, where the header offers the action; then the hero starts where it does without the button.

#### Scenario: Register button for an anonymous visitor on a small viewport
- **WHEN** an anonymous visitor opens the entry page in the `es` locale
- **THEN** a "Register" action button renders before the hero heading, only below 1024px, and activating it opens `/es/join`

#### Scenario: No Register button while resolving or signed in
- **WHEN** the entry page renders while the session is still resolving, or with an authenticated session
- **THEN** no "Register" action button renders on the page

## MODIFIED Requirements

### Requirement: Page layout
Both public pages SHALL be built from full-width sections. Each section's content SHALL sit in a horizontally centered container at most 72rem wide, with side padding (1rem below the medium breakpoint of 768px, 2rem from it). Each section SHALL have vertical padding (3rem below 768px, 4rem from it). On the entry page, the hero and the verified offerings list SHALL be separate sections, the hero on the page background and the list on the section background. A single text link of a section SHALL keep its own width, aligned to the start of its column.

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
- **WHEN** the hero's About us link or the about page's registration-landing link renders
- **THEN** it is aligned to the start of its column at its own width and does not span the row

### Requirement: Entry page hero
The entry page SHALL render, in the main content area, an eyebrow label, the entry heading with exactly one emphasized word in the accent text color (in Spanish the settled copy `Tu café, el que merece cada sorbo`), an introduction paragraph, an action that opens the coffee shop directory of the active locale (`/{locale}/coffeeshops`), and below it one text link, for every visitor, that opens the About us page of the active locale (`/{locale}/about`) and sits in no navigation landmark; this link is an exception to base-controls "Navigation controls by position". The coffee-beans photograph SHALL accompany the hero from the medium breakpoint (768px) up and be hidden below it.

#### Scenario: Hero presentation
- **WHEN** a visitor opens the entry route in a supported locale
- **THEN** the eyebrow, the heading with one emphasized word, the paragraph, the explore action and the About us link render with the texts of that locale

#### Scenario: Explore scrolls to the offerings
- **WHEN** a visitor views the hero in the `es` locale
- **THEN** the explore action is a link, named by its label, addressing `/es/coffeeshops`

#### Scenario: Registration destinations
- **WHEN** a visitor views the hero in the `es` locale
- **THEN** the About us link is a link, named by its label, addressing `/es/about`, and it is not inside a navigation landmark

#### Scenario: Specialist registration destination
- **WHEN** a visitor views the hero in the `es` locale
- **THEN** no link of the hero addresses `/es/register` or `/es/register/coffeeshop`; registration is reached through the registration landing

#### Scenario: Responsive hero
- **WHEN** the viewport is below 768px
- **THEN** the hero renders in one column with the photograph hidden, and from 768px up it renders in two equal columns, vertically centered, with the photograph beside the text

### Requirement: About us page
The about route SHALL render five sections with alternating page and section backgrounds, in this order: a brief hero with an eyebrow label and a heading with one emphasized word in the accent text color; the story of the gap between a coffee label and what is in the cup and why the guide is built on objective evaluations; how we evaluate as three cards — the coffeeshop registers its offering as provisional, specialists cup it with the SCA method, and the consensus verifies it; who it is for, naming coffeeshops and specialists with one text link, for every visitor, to the registration landing of the active locale (`/{locale}/join`) that sits in no navigation landmark and is an exception to base-controls "Navigation controls by position"; and a closing action that opens the entry page of the active locale.

#### Scenario: Sections and order
- **WHEN** a visitor opens the about route in a supported locale
- **THEN** the five sections render in order with alternating page and section backgrounds

#### Scenario: How we evaluate
- **WHEN** the evaluation section renders
- **THEN** three cards present the provisional registration, the SCA cupping by specialists and the consensus verification, sharing the container width equally from the medium breakpoint (768px) up

#### Scenario: Registration links
- **WHEN** a visitor views the "who it is for" section of the about page in the `es` locale
- **THEN** it shows one link, named by its label, addressing `/es/join`, that is not inside a navigation landmark, and no link addresses a registration route

#### Scenario: Closing action
- **WHEN** the visitor activates the closing action
- **THEN** the entry page of the active locale opens
