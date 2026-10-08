## ADDED Requirements

### Requirement: Heading outline
Every page SHALL expose exactly one level-1 heading once its content or its signed-out view renders, and no heading SHALL sit more than one level below the heading before it in reading order. The title of a card or a map panel shown directly under the page's level-1 heading SHALL be a level-2 heading. A heading's level SHALL NOT change its presentation: each heading keeps the type style its capability gives it.

#### Scenario: Card titles under the page heading
- **WHEN** a page shows offering cards or coffee shop cards under its level-1 heading
- **THEN** each card's title is a level-2 heading in the card heading type style

#### Scenario: Map panel title
- **WHEN** a location's panel opens over a map on a page with a level-1 heading
- **THEN** the panel's title is a level-2 heading in the card heading type style

#### Scenario: One level-1 heading per page
- **WHEN** a page's content, or a protected route's signed-out view, renders
- **THEN** the page exposes exactly one level-1 heading
