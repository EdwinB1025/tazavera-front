## ADDED Requirements

### Requirement: Evaluation route headings
The "My evaluations" list heading SHALL be the page's level-1 heading, and on every evaluation route the signed-out view SHALL expose the evaluations access message as the page's level-1 heading, both keeping their present type style.

#### Scenario: My evaluations heading
- **WHEN** a signed-in specialist opens "My evaluations"
- **THEN** "My evaluations" is the page's level-1 heading

#### Scenario: Signed-out evaluation route
- **WHEN** an anonymous visitor opens an evaluation route
- **THEN** the evaluations access message is the page's level-1 heading, in the body type style, followed by the "Sign in" button

## MODIFIED Requirements

### Requirement: One row per evaluation-row variant

The "My evaluations" row and the public evaluations row SHALL each be rendered as their own row, with only the elements of their variant: the "My evaluations" row shows the status badge, the level-2 heading, the ISO date and the specialist's actions, and never the public row's View offering action; the public row shows the level-2 heading, the localized closed date and the View and View offering actions, and never a status badge. Both rows show the score row, the coffee name and the coffeeshop and roaster captions the same way, as stated in "My evaluations list" and "Public evaluations list".

#### Scenario: My evaluations row

- **WHEN** a row of "My evaluations" is shown
- **THEN** it has the status badge, a level-2 heading and the specialist's actions, and no View offering action

#### Scenario: Public evaluations row

- **WHEN** a row of the public evaluations list is shown
- **THEN** it has a level-2 heading and the View and View offering actions, and no status badge
