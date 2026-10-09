## MODIFIED Requirements

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
