## MODIFIED Requirements

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
