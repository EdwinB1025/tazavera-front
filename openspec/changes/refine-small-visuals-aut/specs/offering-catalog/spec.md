## MODIFIED Requirements

### Requirement: Coffee shop card
Each coffee shop card SHALL show, from the API's data: a "With verified offerings" badge when the coffee shop has at least one verified offering; the coffee shop name as a heading; its number of locations; the cities of its locations, each once, in the API's order; its number of offerings and of verified offerings; a "View offerings" action button to the coffee shop detail; and, when at least one of its locations has coordinates, a named action that shows it on the map.

#### Scenario: Card content
- **WHEN** a coffee shop with two locations in one city, four offerings and one verified offering renders
- **THEN** the card shows the badge, the name, the two locations, the city once, the four offerings, the one verified offering and the "View offerings" action

#### Scenario: No verified offering
- **WHEN** a coffee shop has no verified offering
- **THEN** its card shows no badge

#### Scenario: View link
- **WHEN** the visitor activates a card's "View offerings" action, an action button and not a link
- **THEN** the detail route of that coffee shop opens in the active locale with its Offerings tab selected

#### Scenario: Map action only with coordinates
- **WHEN** none of a coffee shop's locations has both coordinates
- **THEN** its card shows no map action; otherwise the action renders, named "Show {name} on the map"
