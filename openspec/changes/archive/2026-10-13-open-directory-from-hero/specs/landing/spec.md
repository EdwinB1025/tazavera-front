## MODIFIED Requirements

### Requirement: Entry page hero
The entry page SHALL render, in the main content area, an eyebrow label, the entry heading with exactly one emphasized word in the accent text color (in Spanish the settled copy `Tu café, el que merece cada sorbo`), an introduction paragraph, an action that opens the coffee shop directory of the active locale (`/{locale}/coffeeshops`), and two navigation links: one registering a coffeeshop and one registering as a specialist. The coffee-beans photograph SHALL accompany the hero from the medium breakpoint (768px) up and be hidden below it.

#### Scenario: Hero presentation
- **WHEN** a visitor opens the entry route in a supported locale
- **THEN** the eyebrow, the heading with one emphasized word, the paragraph, the explore action and both registration links render with the texts of that locale

#### Scenario: Explore scrolls to the offerings
- **WHEN** a visitor views the hero in the `es` locale
- **THEN** the explore action is a link, named by its label, addressing `/es/coffeeshops`

#### Scenario: Registration destinations
- **WHEN** the visitor activates the coffeeshop registration link
- **THEN** the application opens the coffeeshop registration route of the active locale, owned by a later change

#### Scenario: Specialist registration destination
- **WHEN** the visitor activates the specialist registration link
- **THEN** the application opens the specialist registration route of the active locale, owned by a later change

#### Scenario: Responsive hero
- **WHEN** the viewport is below 768px
- **THEN** the hero renders in one column with the photograph hidden, and from 768px up it renders in two equal columns, vertically centered, with the photograph beside the text
